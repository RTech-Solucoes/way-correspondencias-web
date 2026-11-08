const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const ts = require('typescript');

// Os helpers de menção só têm dependência de tipos: basta transpilar o módulo real.
const filename = path.resolve('src/components/obrigacoes/mencoes/mencoes.ts');
const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
});
const mencoesModule = { exports: {} };
new Function('module', 'exports', outputText)(mencoesModule, mencoesModule.exports);
const mencoes = mencoesModule.exports;

const pessoas = [
  { idResponsavel: 1, nmResponsavel: 'Ana', dsVinculo: 'Operação' },
  { idResponsavel: 2, nmResponsavel: 'Ana Souza', dsVinculo: 'Jurídico' },
  { idResponsavel: 3, nmResponsavel: 'João Conceição', dsVinculo: 'Administrador' },
];

test('detecta o @ em digitação, inclusive com espaços no nome', () => {
  assert.deepEqual(mencoes.detectarMencaoAtiva('@', 1), { inicio: 0, termo: '' });
  assert.deepEqual(mencoes.detectarMencaoAtiva('Oi @Ana So', 10), { inicio: 3, termo: 'Ana So' });
});

test('não abre sugestões em e-mail, sem @ ou depois de quebra de linha', () => {
  assert.equal(mencoes.detectarMencaoAtiva('contato@empresa', 15), null);
  assert.equal(mencoes.detectarMencaoAtiva('sem menção', 10), null);
  assert.equal(mencoes.detectarMencaoAtiva('@Ana\nresto', 10), null);
});

test('filtra sem diferenciar acentos e maiúsculas', () => {
  assert.deepEqual(mencoes.filtrarMencionaveis(pessoas, 'conceicao').map((p) => p.idResponsavel), [3]);
  assert.equal(mencoes.filtrarMencionaveis(pessoas, '').length, 3);
});

test('sem termo, lista todas as pessoas, sem limite de quantidade', () => {
  const muitas = Array.from({ length: 30 }, (_, i) => ({ idResponsavel: i, nmResponsavel: `Pessoa ${i}`, dsVinculo: 'Diretores' }));
  assert.equal(mencoes.filtrarMencionaveis(muitas, '').length, 30);
});

test('sugestões fecham depois do nome concluído', () => {
  assert.deepEqual(mencoes.filtrarMencionaveis(pessoas, 'Ana Souza '), []);
  assert.equal(mencoes.detectarMencaoAtiva('@ texto', 2), null);
});

test('insere o nome no lugar do termo e posiciona o cursor depois dele', () => {
  const texto = 'Oi @an tudo bem';
  assert.deepEqual(mencoes.inserirMencao(texto, { inicio: 3, termo: 'an' }, 6, 'Ana Souza'), {
    texto: 'Oi @Ana Souza  tudo bem',
    cursor: 14,
  });
});

test('identifica as pessoas citadas sem confundir nomes parecidos', () => {
  assert.deepEqual(mencoes.extrairIdsMencionados('Veja @Ana Souza, por favor', pessoas), [2]);
  assert.deepEqual(mencoes.extrairIdsMencionados('@Ana e @Ana Souza', pessoas).sort(), [1, 2]);
  assert.deepEqual(mencoes.extrairIdsMencionados('@joão conceição.', pessoas), [3]);
  assert.deepEqual(mencoes.extrairIdsMencionados('@Anabela sem cadastro', pessoas), []);
});
