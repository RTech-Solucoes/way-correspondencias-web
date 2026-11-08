const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const { test } = require('node:test');
const ts = require('typescript');

// Executa os módulos reais (TypeScript) sem servidor Next.
function load(source, cache = new Map()) {
  const filename = path.resolve(source);
  if (cache.has(filename)) return cache.get(filename).exports;
  const module = { exports: {} };
  cache.set(filename, module);
  const localRequire = createRequire(filename);
  const requireModule = (name) => {
    if (name.startsWith('@/') || name.startsWith('.')) {
      const base = name.startsWith('@/') ? path.resolve('src', name.slice(2)) : path.resolve(path.dirname(filename), name);
      const target = [base, `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts')]
        .find((file) => fs.existsSync(file) && fs.statSync(file).isFile());
      if (target) return load(target, cache);
    }
    return localRequire(name);
  };
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    fileName: filename,
  });
  new Function('require', 'module', 'exports', outputText)(requireModule, module, module.exports);
  return module.exports;
}

const status = load('src/components/obrigacoes/list-page/status.ts');
const form = load('src/components/obrigacoes/conclusao/conclusao-form.ts');
const historico = load('src/components/obrigacoes/conclusao/conclusao-historico.ts');
const { statusList } = load('src/api/status-solicitacao/types.ts');
const { Permissoes } = load('src/constants/permissoes.ts');

// concluidaEmAtraso: true/false = concluída pelo fluxo administrativo; undefined = tramitação, importação etc.
const concluida = (concluidaEmAtraso) => ({
  statusSolicitacao: { idStatusSolicitacao: statusList.CONCLUIDO.id, nmStatus: 'Concluído' },
  dtConclusaoTramitacao: '2026-11-06T00:00:00',
  dtLimite: '2026-11-05',
  concluidaEmAtraso,
});

test('permissão da conclusão administrativa existe no front', () => {
  assert.equal(Permissoes.OBRIGACAO_CONCLUSAO_ADMINISTRATIVA, 'OBRIGACAO_CONCLUSAO_ADMINISTRATIVA');
});

test('conclusão administrativa no prazo é apresentada como Concluída', () => {
  assert.equal(status.getObrigacaoStatusDisplay(concluida(false)).label, 'Concluído');
  assert.equal(status.isObrigacaoConcluidaAdministrativamente(concluida(false)), true);
});

test('conclusão administrativa após a data limite é apresentada como Concluída em atraso', () => {
  const display = status.getObrigacaoStatusDisplay(concluida(true));
  assert.equal(display.label, 'Concluída em atraso');
  assert.notEqual(display.style.backgroundColor, status.getObrigacaoStatusStyle(statusList.CONCLUIDO.id).backgroundColor);
});

test('obrigações concluídas por outros fluxos mantêm exatamente o status de antes', () => {
  const pelaTramitacao = concluida(undefined);
  assert.equal(status.getObrigacaoStatusDisplay(pelaTramitacao).label, 'Concluído');
  assert.equal(status.isObrigacaoConcluidaAdministrativamente(pelaTramitacao), false);
  assert.equal(status.isObrigacaoConcluidaEmAtraso({ ...pelaTramitacao, concluidaEmAtraso: null }), false);
  const pendente = { statusSolicitacao: { idStatusSolicitacao: statusList.PENDENTE.id, nmStatus: 'Pendente' }, concluidaEmAtraso: true };
  assert.equal(status.getObrigacaoStatusDisplay(pendente).label, 'Pendente');
  assert.equal(status.getObrigacaoStatusDisplay(null).label, '-');
});

test('formulário exige data efetiva não futura e protocolo', () => {
  assert.deepEqual(form.validarConclusaoForm('2026-11-05', 1, '2026-11-05'), {});
  assert.match(form.validarConclusaoForm('', 1, '2026-11-05').dtConclusao, /Informe a data efetiva/);
  assert.match(form.validarConclusaoForm('2026-11-06', 1, '2026-11-05').dtConclusao, /não pode ser uma data futura/);
  assert.match(form.validarConclusaoForm('2026-11-05', 0, '2026-11-05').protocolos, /protocolo é obrigatório/);
});

test('aviso de atraso no formulário segue a data limite original', () => {
  assert.equal(form.isConclusaoEmAtraso('2026-11-06', '2026-11-05'), true);
  assert.equal(form.isConclusaoEmAtraso('2026-11-05', '2026-11-05'), false);
  assert.equal(form.isConclusaoEmAtraso('2026-11-06', null), false);
});

test('data de hoje usa o fuso local, sem converter para UTC', () => {
  assert.equal(form.dataHojeIso(new Date(2026, 10, 5, 23, 30)), '2026-11-05');
  assert.equal(form.dataHojeIso(new Date(2026, 0, 9, 0, 5)), '2026-01-09');
});

test('classificação gravada na conclusão administrativa prevalece sobre a data limite atual', () => {
  assert.equal(status.getObrigacaoStatusDisplay(concluida(undefined), { concluidaEmAtraso: true }).label, 'Concluída em atraso');
  assert.equal(status.getObrigacaoStatusDisplay(concluida(true), { concluidaEmAtraso: false }).label, 'Concluído');
  const pendente = { statusSolicitacao: { idStatusSolicitacao: statusList.PENDENTE.id, nmStatus: 'Pendente' } };
  assert.equal(status.getObrigacaoStatusDisplay(pendente, { concluidaEmAtraso: true }).label, 'Pendente');
});

test('mensagem de erro prioriza o campo inválido retornado pela API', () => {
  const erroValidacao = Object.assign(new Error('Falha de validação.'), {
    payload: { errors: [{ field: 'protocolos', message: 'O arquivo do protocolo é obrigatório.' }] },
  });
  assert.equal(form.extrairMensagemErro(erroValidacao, 'padrão'), 'O arquivo do protocolo é obrigatório.');
  assert.equal(form.extrairMensagemErro(new Error('Esta obrigação já está concluída.'), 'padrão'), 'Esta obrigação já está concluída.');
  assert.equal(form.extrairMensagemErro('x', 'padrão'), 'padrão');
});

test('soma o tamanho de todas as categorias de arquivos', () => {
  const arquivos = { protocolos: [{ size: 10 }], evidencias: [{ size: 5 }, { size: 5 }], correspondencias: [], outrosAnexos: [{ size: 1 }] };
  assert.equal(form.somarTamanhoArquivos(arquivos), 21);
  assert.equal(form.MAX_TAMANHO_TOTAL_CONCLUSAO, 100 * 1024 * 1024);
});

test('histórico descreve a conclusão administrativa e omite campos vazios', () => {
  const conclusao = {
    dtConclusao: '2026-11-05',
    dtLimiteOriginal: '2026-11-01',
    concluidaEmAtraso: true,
    nmStatusAnterior: 'Pendente',
    nrProcesso: '123',
    nrSei: null,
    dsObservacao: 'Protocolado na ANTT',
  };

  const resumo = historico.getResumoConclusaoHistorico(conclusao);
  assert.match(resumo, /fluxo administrativo/);
  assert.match(resumo, /05\/11\/2026 \(Concluída em atraso\)/);
  assert.match(historico.getResumoConclusaoHistorico({ ...conclusao, concluidaEmAtraso: false }), /\(Concluída\)/);
  assert.deepEqual(historico.getDetalhesConclusaoHistorico(conclusao), [
    { rotulo: 'Data limite original', valor: '01/11/2026' },
    { rotulo: 'Status anterior', valor: 'Pendente' },
    { rotulo: 'Nº do Processo', valor: '123' },
    { rotulo: 'Observações', valor: 'Protocolado na ANTT' },
  ]);
});

test('arquivos acima do limite são recusados', () => {
  const { aceitos, recusados } = form.separarArquivosPorTamanho([{ name: 'a', size: 10 }, { name: 'b', size: 30 }], 20);
  assert.deepEqual(aceitos.map((arquivo) => arquivo.name), ['a']);
  assert.deepEqual(recusados.map((arquivo) => arquivo.name), ['b']);
  assert.equal(form.textoOuNulo('   '), null);
  assert.equal(form.textoOuNulo(' SEI-1 '), 'SEI-1');
});
