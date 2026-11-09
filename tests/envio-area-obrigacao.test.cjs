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

const envio = load('src/components/obrigacoes/modal/envio-area.ts');
const NAO_INICIADO = 12;
const PENDENTE = 13;
const EM_ANDAMENTO = 14;
const ATRASADA = 16;
const EM_VALIDACAO = 15;

test('aviso: obrigação Atrasada continua Atrasada e só é marcada como enviada', () => {
  const aviso = envio.getAvisoStatusEnvioArea(ATRASADA, 'Atrasada');
  assert.match(aviso, /permanecerá Atrasada/);
  assert.match(aviso, /apenas marcada como Enviada para área/);
});

test('aviso: Não Iniciado e Pendente passam para Em andamento', () => {
  assert.match(envio.getAvisoStatusEnvioArea(NAO_INICIADO), /de Não Iniciado para Em andamento/);
  assert.match(envio.getAvisoStatusEnvioArea(PENDENTE), /de Pendente para Em andamento/);
});

test('aviso: outros status são mantidos', () => {
  assert.match(envio.getAvisoStatusEnvioArea(EM_VALIDACAO, 'Em validação'), /status atual \(Em validação\) será mantido/);
});

test('sucesso: mensagem conforme o status antes e depois do envio', () => {
  assert.equal(envio.getMensagemSucessoEnvioArea(ATRASADA, ATRASADA), 'Obrigação enviada para a área. O status permanece Atrasada.');
  assert.equal(envio.getMensagemSucessoEnvioArea(NAO_INICIADO, EM_ANDAMENTO), 'Obrigação enviada para a área. Status alterado para Em andamento.');
  assert.equal(envio.getMensagemSucessoEnvioArea(EM_ANDAMENTO, EM_ANDAMENTO), 'Obrigação enviada para a área com sucesso.');
  assert.equal(envio.getMensagemSucessoEnvioArea(EM_VALIDACAO, EM_VALIDACAO), 'Obrigação enviada para a área com sucesso.');
});
