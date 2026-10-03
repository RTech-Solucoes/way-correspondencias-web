import hashlib,json,os,pathlib,re,signal,subprocess,sys,time,urllib.request

ROOT=pathlib.Path('/home/rtech/way-correspondencias-web');BASE=pathlib.Path('/home/rtech/way-deploys')
ENV={**os.environ,'PATH':'/home/rtech/.nvm/versions/node/v20.19.0/bin:'+os.environ['PATH'],'NODE_OPTIONS':'--max-old-space-size=2560','HOME':'/home/rtech','PM2_HOME':'/home/rtech/.pm2'}
NAME='way-web-dev';LOG=BASE/'web-build.log';LOG.touch(mode=0o600,exist_ok=True);LOG.chmod(0o600)
PREPARE_DEADLINE=time.monotonic()+600
ACTIVE_PROCESS=None

def terminate(process):
    os.killpg(process.pid,signal.SIGTERM)
    try:process.communicate(timeout=5)
    except subprocess.TimeoutExpired:os.killpg(process.pid,signal.SIGKILL);process.communicate()

def interrupted(signum,frame):
    signal.signal(signal.SIGTERM,signal.SIG_IGN)
    if ACTIVE_PROCESS and ACTIVE_PROCESS.poll() is None:terminate(ACTIVE_PROCESS)
    raise RuntimeError('Operação interrompida')
signal.signal(signal.SIGTERM,interrupted)

def run(args,cwd=None,capture=False,preparing=False):
    global ACTIVE_PROCESS
    timeout=max(1,int(PREPARE_DEADLINE-time.monotonic())) if preparing else 20
    with LOG.open('ab') as log:
        process=subprocess.Popen(args,cwd=cwd,env=ENV,stdout=subprocess.PIPE if capture else log,stderr=log,start_new_session=True)
        ACTIVE_PROCESS=process
        try:
            output,_=process.communicate(timeout=timeout)
        except subprocess.TimeoutExpired:
            terminate(process);raise RuntimeError('Prazo de operação excedido')
        finally:ACTIVE_PROCESS=None
    if process.returncode:raise RuntimeError('Falha em '+args[0])
    return output if capture else None

def atomic(path,value):
    temporary=path.with_suffix('.pending');temporary.write_text(json.dumps(value));temporary.chmod(0o600);os.replace(temporary,path)

def active():return next((p for p in json.loads(run(['pm2','jlist'],capture=True)) if p['name']==NAME),None)

def remove():
    if active():run(['pm2','delete',NAME])

def start(folder):run(['pm2','start',str(folder/'node_modules/next/dist/bin/next'),'--name',NAME,'--cwd',str(folder),'--','start','-p','3001'])

def healthy():
    deadline=time.monotonic()+60
    while time.monotonic()<deadline:
        try:
            if urllib.request.urlopen('http://127.0.0.1:3001/',timeout=3).status==200:return
        except Exception:pass
        time.sleep(2)
    raise RuntimeError('Frontend não iniciou')

def identity(folder):
    commit=run(['git','rev-parse','HEAD'],folder,capture=True).decode().strip()
    return {'commit':commit,'build_id':(folder/'.next/BUILD_ID').read_text().strip()}

def restore(folder):
    current=active()
    if current and current['pm2_env']['pm_cwd']==str(folder):healthy();run(['pm2','save']);return
    remove();start(folder);healthy();run(['pm2','save'])

def switch(folder,rollback=False):
    current=active();previous=pathlib.Path(current['pm2_env']['pm_cwd']) if current else None
    result={'success':True,'changed':False,'rollback':rollback,**identity(folder)}
    if previous==folder:healthy();return result
    journal=BASE/'web-pm2-transaction.json';atomic(journal,{'previous':str(previous) if previous else None})
    try:
        remove();start(folder);healthy();run(['pm2','save']);result['changed']=True
        record=BASE/'web-release.json'
        if rollback:
            release=json.loads(record.read_text());release.update(active_directory=str(folder),active_commit=result['commit'],active_build_id=result['build_id']);atomic(record,release)
        else:
            result['previous']=str(previous) if previous else None;atomic(record,result)
        journal.unlink();return result
    except Exception:
        signal.signal(signal.SIGTERM,signal.SIG_IGN)
        if previous:restore(previous)
        else:remove()
        journal.unlink(missing_ok=True);raise

journal=BASE/'web-pm2-transaction.json'
if journal.exists():
    pending=json.loads(journal.read_text())
    if pending['previous']:restore(pathlib.Path(pending['previous']))
    else:remove()
    journal.unlink()

if len(sys.argv)>1 and sys.argv[1]=='--recover-only':
    print(json.dumps({'success':True,'recovered':True}));raise SystemExit()

if len(sys.argv)>1 and sys.argv[1]=='--rollback':
    target=pathlib.Path(sys.argv[2]).resolve()
    if target!=ROOT and not target.is_relative_to(BASE/'web-releases'):raise SystemExit('Destino inválido')
    if not (target/'.next/BUILD_ID').exists():raise SystemExit('Build anterior indisponível')
    print(json.dumps(switch(target,True)));raise SystemExit()

commit=sys.argv[1]
if not re.fullmatch('[0-9a-f]{40}',commit):raise SystemExit('Versão inválida')
release=BASE/'web-releases'/commit;marker=release/'way-release.json'
run(['git','fetch','origin','develop'],ROOT,preparing=True);run(['git','merge-base','--is-ancestor',commit,'origin/develop'],ROOT,preparing=True)
if not marker.exists():
    release.parent.mkdir(mode=0o700,exist_ok=True)
    if not release.exists():run(['git','worktree','add','--detach',str(release),commit],ROOT,preparing=True)
    release.chmod(0o700);env_file=release/'.env';env_file.write_bytes((ROOT/'.env').read_bytes());env_file.chmod(0o600)
    run(['yarn','install','--frozen-lockfile','--non-interactive'],release,preparing=True);run(['yarn','build'],release,preparing=True)
    if not (release/'.next/BUILD_ID').exists():raise RuntimeError('Build incompleto')
    atomic(marker,identity(release))
print(json.dumps(switch(release)))
