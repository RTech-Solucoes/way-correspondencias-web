import { createHash } from 'node:crypto';
import { copyFile, lstat, mkdir, mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const overlayDirectory = path.dirname(fileURLToPath(import.meta.url));
const sourceDirectory = path.resolve(overlayDirectory, '../..');
const versions = {
  next: '15.5.28',
  openNext: '1.20.12',
  wrangler: '4.151.0',
  yarn: '1.22.22',
};
const environments = {
  prd: {
    worker: 'rtech-correspondencias-mvp-web',
    domain: 'correspondencias.rtechsolution.com.br',
    api: 'https://api.correspondencias.rtechsolution.com.br/api',
  },
  dev: {
    worker: 'rtech-correspondencias-mvp-web-dev',
    domain: 'develop.correspondencias.rtechsolution.com.br',
    api: 'https://develop.api.correspondencias.rtechsolution.com.br/api',
  },
};

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

function isReserved(name) {
  return /^(\.env(?:\.|$)|\.dev\.vars(?:\.|$)|\.git$|\.github$|node_modules$|\.next$|\.open-next$|\.wrangler$|\.DS_Store$)/.test(name)
    || /\.(?:pem|key|p12|pfx)$/i.test(name);
}

async function main() {
  const environment = process.argv[2];
  if (process.argv.length !== 3 || !Object.hasOwn(environments, environment)) {
    throw new Error('Uso: node deployment/cloudflare/prepare.mjs prd|dev');
  }
  if (Number(process.versions.node.split('.')[0]) < 22) {
    throw new Error('A preparação requer Node.js 22 ou superior.');
  }

  const selected = environments[environment];
  const revision = process.env.GITHUB_SHA || null;
  if (revision && !/^[a-f0-9]{40}$/i.test(revision)) {
    throw new Error('GITHUB_SHA deve conter o SHA completo de 40 caracteres.');
  }
  const packageContent = await readFile(path.join(sourceDirectory, 'package.json'));
  const sourcePackage = JSON.parse(packageContent);
  const rootEntries = await readdir(sourceDirectory, { withFileTypes: true });
  const configNames = rootEntries
    .filter((entry) => entry.isFile() && (
      /^(?:next|postcss|tailwind)\.config\.(?:js|cjs|mjs|ts|json)$/.test(entry.name)
      || /^(?:tsconfig|jsconfig)(?:\.[\w-]+)?\.json$/.test(entry.name)
      || /^eslint\.config\.(?:js|cjs|mjs|ts)$/.test(entry.name)
      || /^\.eslintrc(?:\.(?:js|cjs|json|yaml|yml))?$/.test(entry.name)
    ))
    .map((entry) => entry.name)
    .sort();
  if (!configNames.some((name) => /^next\.config\./.test(name))) {
    throw new Error('Configuração Next.js não encontrada na raiz da aplicação.');
  }

  const targetDirectory = await mkdtemp(path.join(tmpdir(), 'rtech-mvp-web-'));
  const files = [];

  async function copySource(relativeSource, relativeTarget = relativeSource) {
    const source = path.join(sourceDirectory, relativeSource);
    const target = path.join(targetDirectory, relativeTarget);
    const stat = await lstat(source);
    if (stat.isSymbolicLink()) {
      throw new Error(`Link simbólico não copiado: ${relativeSource}`);
    }
    if (isReserved(path.basename(source))) {
      throw new Error(`Arquivo reservado não copiado: ${relativeSource}`);
    }
    if (stat.isDirectory()) {
      await mkdir(target, { recursive: true });
      const entries = await readdir(source, { withFileTypes: true });
      for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
        await copySource(path.join(relativeSource, entry.name), path.join(relativeTarget, entry.name));
      }
      return;
    }
    if (!stat.isFile()) {
      throw new Error(`Tipo de arquivo não suportado: ${relativeSource}`);
    }
    const content = await readFile(source);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content, { flag: 'wx' });
    files.push({ source: relativeSource, target: relativeTarget, sha256: sha256(content) });
  }

  await copySource('src');
  await copySource('public');
  for (const name of configNames) {
    const targetName = revision && /^next\.config\./.test(name) ? `.mvp-original-${name}` : name;
    await copySource(name, targetName);
  }

  if (revision) {
    const originalConfigName = configNames.find((name) => /^next\.config\./.test(name));
    await writeFile(path.join(targetDirectory, 'next.config.mjs'), [
      `import originalConfig from './.mvp-original-${originalConfigName}';`,
      '',
      'export default async (...args) => {',
      "  const config = typeof originalConfig === 'function' ? await originalConfig(...args) : await originalConfig;",
      '  return {',
      '    ...config,',
      '    async headers(...headerArgs) {',
      "      const inherited = typeof config.headers === 'function' ? await config.headers.apply(config, headerArgs) : [];",
      '      return [...inherited, {',
      "        source: '/:path*',",
      `        headers: [{ key: 'X-App-Revision', value: '${revision}' }],`,
      '      }];',
      '    },',
      '  };',
      '};',
      '',
    ].join('\n'), { flag: 'wx' });
  }

  const rootMiddleware = rootEntries.find((entry) => /^middleware\.(?:ts|js)$/.test(entry.name));
  const hasSourceMiddleware = files.some((file) => /^src[\\/]middleware\.(?:ts|js)$/.test(file.target));
  const hasSourceApp = files.some((file) => /^src[\\/]app[\\/]/.test(file.source));
  if (rootMiddleware && hasSourceApp && !hasSourceMiddleware) {
    await copySource(rootMiddleware.name, path.join('src', rootMiddleware.name));
  }

  const targetPackage = {
    ...sourcePackage,
    scripts: {
      ...sourcePackage.scripts,
      'cf:build': [
        `NEXT_PUBLIC_API_URL=${selected.api}`,
        'NEXT_PUBLIC_LAYOUT_CLIENT=mvp',
        'NEXT_PUBLIC_LDAP_ENABLED=false',
        'NODE_OPTIONS=--require=./build-guard.cjs',
        'opennextjs-cloudflare build --config wrangler.jsonc',
      ].join(' '),
    },
    dependencies: {
      ...sourcePackage.dependencies,
      next: versions.next,
      '@opennextjs/cloudflare': versions.openNext,
    },
    devDependencies: {
      ...sourcePackage.devDependencies,
      'eslint-config-next': versions.next,
      wrangler: versions.wrangler,
    },
    engines: { ...sourcePackage.engines, node: '>=22' },
    packageManager: `yarn@${versions.yarn}`,
  };
  await writeFile(path.join(targetDirectory, 'package.json'), `${JSON.stringify(targetPackage, null, 2)}\n`, { flag: 'wx' });
  for (const name of ['yarn.lock', 'open-next.config.ts', 'build-guard.cjs']) {
    await copyFile(path.join(overlayDirectory, name), path.join(targetDirectory, name));
  }
  await writeFile(path.join(targetDirectory, '.env'), [
    `NEXT_PUBLIC_API_URL=${selected.api}`,
    'NEXT_PUBLIC_LAYOUT_CLIENT=mvp',
    'NEXT_PUBLIC_LDAP_ENABLED=false',
    '',
  ].join('\n'), { mode: 0o600, flag: 'wx' });

  const wrangler = {
    $schema: './node_modules/wrangler/config-schema.json',
    name: selected.worker,
    main: '.open-next/worker.js',
    account_id: '3ca9471dadca9766b3dc5de098577052',
    compatibility_date: '2026-10-15',
    compatibility_flags: ['nodejs_compat', 'global_fetch_strictly_public'],
    assets: { directory: '.open-next/assets', binding: 'ASSETS' },
    workers_dev: false,
    preview_urls: false,
    routes: [{ pattern: selected.domain, custom_domain: true }],
    observability: { enabled: true, head_sampling_rate: 0.1 },
  };
  await writeFile(path.join(targetDirectory, 'wrangler.jsonc'), `${JSON.stringify(wrangler, null, 2)}\n`, { flag: 'wx' });
  await writeFile(path.join(targetDirectory, '.gitignore'), 'node_modules/\n.next/\n.open-next/\n.wrangler/\n.env*\n.dev.vars*\n*.log\n*.ndjson\n.DS_Store\n', { flag: 'wx' });
  await writeFile(path.join(targetDirectory, '.mvp-source-manifest.json'), `${JSON.stringify({
    environment,
    revision,
    sourcePackageSha256: sha256(packageContent),
    versions,
    files,
  }, null, 2)}\n`, { flag: 'wx' });
  process.stdout.write(`${targetDirectory}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
