const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const { test } = require('node:test');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

// Executa os módulos reais sem um servidor Next ou acesso à API de produção.
function load(source, mocks = {}, cache = new Map()) {
  const filename = path.resolve(source);
  if (cache.has(filename)) return cache.get(filename).exports;
  const module = { exports: {} };
  cache.set(filename, module);
  const localRequire = createRequire(filename);
  const requireModule = (name) => {
    if (name in mocks) return mocks[name];
    if (name.startsWith('@/') || name.startsWith('.')) {
      const base = name.startsWith('@/') ? path.resolve('src', name.slice(2)) : path.resolve(path.dirname(filename), name);
      const target = [base, `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts')].find(f => fs.existsSync(f) && fs.statSync(f).isFile());
      if (target) return load(target, mocks, cache);
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

const access = load('src/constants/pages/route-access.ts');
const permissions = load('src/constants/permissoes.ts').Permissoes;

test('todas as rotas preservam a permissão de acesso, inclusive rotas filhas', () => {
  assert.equal(access.ROUTE_ACCESS_DEF.length, 10);
  for (const route of access.ROUTE_ACCESS_DEF) {
    for (const pathname of [route.path, `${route.path}/123/editar`]) {
      assert.equal(access.canAccessRoute(pathname, []), !route.permission, pathname);
      assert.equal(access.canAccessRoute(pathname, Object.values(permissions)), true, pathname);
      if (route.permission) assert.equal(access.canAccessRoute(pathname, ['PERMISSAO_INEXISTENTE']), false, pathname);
    }
  }
  assert.equal(access.canAccessRoute('/faq', []), true);
  assert.equal(access.canAccessRoute('/concessionarias', [permissions.CONCESSIONARIA_LISTAR]), true);
});

test('cookies de permissões válidos, codificados e inválidos', () => {
  const raw = JSON.stringify({ state: { permissoes: [' AREA_LISTAR ', '', 'TEMA_LISTAR'] } });
  for (const value of [raw, encodeURIComponent(raw)]) {
    assert.deepEqual(access.parsePermissoesCookie(value), ['AREA_LISTAR', 'TEMA_LISTAR']);
  }
  for (const value of [undefined, '', '%invalid', '{}', '{']) assert.deepEqual(access.parsePermissoesCookie(value), []);
});

test('menus mantêm todos os módulos e filtram somente pelas permissões', () => {
  let granted = Object.values(permissions);
  const { usePermittedPages } = load('src/hooks/use-permitted-pages.ts', {
    '@/stores/permissoes-store': { usePermissoesState: () => granted },
    '@phosphor-icons/react': {},
  });
  assert.deepEqual(usePermittedPages().map(page => page.path).sort(), access.ROUTE_ACCESS_DEF.map(route => route.path).sort());
  granted = [permissions.TEMA_LISTAR];
  assert.deepEqual(usePermittedPages().map(page => page.path).sort(), ['/faq', '/temas']);
  granted = [];
  assert.deepEqual(usePermittedPages(), []);
});

test('middleware mantém login obrigatório e bloqueio por permissão', () => {
  const { middleware } = load('middleware.ts', {
    'next/server': { NextResponse: {
      redirect: url => ({ type: 'redirect', path: url.pathname }),
      rewrite: url => ({ type: 'rewrite', path: url.pathname }),
      next: () => ({ type: 'next' }),
    } },
  });
  function request(pathname, token, granted) {
    const nextUrl = new URL(pathname, 'http://localhost:3000');
    nextUrl.clone = () => new URL(nextUrl);
    const values = { authToken: token, 'permissoes-storage': granted && JSON.stringify({ state: { permissoes: granted } }) };
    return { nextUrl, url: nextUrl.href, cookies: { get: key => values[key] ? { value: values[key] } : undefined } };
  }
  assert.deepEqual(middleware(request('/faq')), { type: 'redirect', path: '/' });
  assert.deepEqual(middleware(request('/', 'token')), { type: 'redirect', path: '/dashboard-correspondencia' });
  assert.deepEqual(middleware(request('/concessionarias', 'token', [permissions.TEMA_LISTAR])), { type: 'rewrite', path: '/nao-encontrado' });
  assert.deepEqual(middleware(request('/concessionarias', 'token', [permissions.CONCESSIONARIA_LISTAR])), { type: 'next' });
  assert.deepEqual(middleware(request('/faq', 'token', [permissions.TEMA_LISTAR])), { type: 'next' });
});

const bars = [
  ['areas/AreasSelectionBar', 'AreasSelectionBar', 'canDeletarArea'],
  ['temas/TemasSelectionBar', 'TemasSelectionBar', 'canDeletarTema'],
  ['responsaveis/ResponsaveisSelectionBar', 'ResponsaveisSelectionBar', 'canDeletarResponsavel'],
  ['obrigacoes/list-page/ObrigacoesSelectionBar', 'ObrigacoesSelectionBar', 'canDeletarObrigacao'],
  ['solicitacoes/content/SolicitacoesSelectionBar', 'SolicitacoesSelectionBar', 'canDeletarSolicitacao'],
];
for (const [file, exported, permission] of bars) {
  test(`${exported}: seleção disponível e exclusão respeita permissão e estado ocupado`, () => {
    const Component = load(`src/components/${file}.tsx`, {
      '@phosphor-icons/react': { SpinnerIcon: () => null, TrashIcon: () => null },
      '@/components/ui/button': { Button: ({ children, disabled }) => React.createElement('button', { disabled }, children) },
    })[exported];
    const props = { selectedCount: 2, onClearSelection() {}, onDeleteSelected() {} };
    const render = extra => renderToStaticMarkup(React.createElement(Component, { ...props, ...extra }));
    assert.equal(render({ selectedCount: 0 }), '');
    assert.match(render({ [permission]: false }), /2 itens selecionados/);
    assert.doesNotMatch(render({ [permission]: false }), /Excluir selecionados/);
    assert.match(render({ [permission]: true }), /Excluir selecionados/);
    assert.equal((render({ [permission]: true, isSelectingAll: true }).match(/disabled=""/g) || []).length, 2);
    assert.match(render({ [permission]: true, isDeleting: true }), /Excluindo/);
  });
}

test('selecionar todo o filtro percorre páginas e preserva exclusões de negócio', async () => {
  const { coletarIdsDoFiltro } = load('src/utils/selecao-em-lote.ts');
  const calls = [];
  const records = Array.from({ length: 1201 }, (_, id) => ({ id, protected: id === 0 }));
  const ids = await coletarIdsDoFiltro({
    total: records.length,
    buscarPagina: async (page, size) => { calls.push([page, size]); return records.slice(page * size, (page + 1) * size); },
    obterId: item => item.id,
    podeSelecionar: item => !item.protected,
  });
  assert.equal(ids.length, 1200);
  assert.equal(ids.includes(0), false);
  assert.equal(ids.includes(1200), true);
  assert.deepEqual(calls.sort((a, b) => a[0] - b[0]), [[0, 500], [1, 500], [2, 500]]);
  assert.deepEqual(await coletarIdsDoFiltro({ total: 0, buscarPagina: () => assert.fail('Não deveria buscar'), obterId: item => item.id }), []);
});

test('identidade usa recursos locais existentes e PNG compatível com os PDFs', () => {
  const brand = load('src/lib/branding.ts');
  assert.equal(brand.SOFTWARE_NAME, 'Software Regulatório');
  for (const asset of [brand.LOGO_PATH, brand.FAVICON_PATH, brand.LOGIN_BACKGROUND_PATH]) assert.ok(fs.existsSync(path.join('public', asset)));
  assert.equal(fs.readFileSync(path.join('public', brand.LOGO_PATH)).subarray(1, 4).toString(), 'PNG');
});

test('renderizador PDF incorpora o novo logo e o nome do sistema', async () => {
  const { Document, Page, Image, Text, renderToBuffer } = await import('@react-pdf/renderer');
  const { SOFTWARE_NAME, LOGO_PATH } = load('src/lib/branding.ts');
  const document = React.createElement(Document, null,
    React.createElement(Page, { size: 'A4' },
      React.createElement(Image, { src: fs.readFileSync(path.resolve('public', LOGO_PATH.slice(1))), style: { width: 120, height: 40 } }),
      React.createElement(Text, null, SOFTWARE_NAME)));
  const buffer = await renderToBuffer(document);
  assert.equal(buffer.subarray(0, 5).toString(), '%PDF-');
  assert.match(buffer.toString('latin1'), /\/Subtype \/Image/);
});
