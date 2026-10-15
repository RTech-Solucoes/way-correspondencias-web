const fs = require('node:fs');
const path = require('node:path');

const allowed = new Set(['fonts.googleapis.com', 'fonts.gstatic.com', 'localhost', '127.0.0.1', '::1']);
const log = path.join(process.cwd(), '.build-egress.ndjson');

function assertHost(hostname, transport) {
  const host = String(hostname || '').replace(/^\[/, '').replace(/\]$/, '').toLowerCase();
  if (!host) return;
  const permitted = allowed.has(host);
  fs.appendFileSync(log, `${JSON.stringify({ hostname: host, transport, permitted })}\n`, { mode: 0o600 });
  if (!permitted) {
    const error = new Error(`Acesso externo bloqueado durante o build: ${host}`);
    error.code = 'BUILD_NETWORK_BLOCKED';
    throw error;
  }
}

function hostFromArgs(args) {
  const first = args[0];
  if (typeof first === 'string' || first instanceof URL) {
    try { return new URL(first).hostname; } catch { return ''; }
  }
  return first && (first.hostname || String(first.host || '').split(':')[0]);
}

const originalFetch = globalThis.fetch;
globalThis.fetch = function (input, options) {
  const address = typeof input === 'string' || input instanceof URL ? input : input.url;
  assertHost(new URL(address).hostname, 'fetch');
  return originalFetch.call(this, input, options);
};

for (const name of ['node:http', 'node:https']) {
  const protocol = require(name);
  for (const method of ['request', 'get']) {
    const original = protocol[method];
    protocol[method] = function (...args) {
      assertHost(hostFromArgs(args), `${name}.${method}`);
      return original.apply(this, args);
    };
  }
}

const dns = require('node:dns');
const originalLookup = dns.lookup;
dns.lookup = function (hostname, ...args) {
  assertHost(hostname, 'dns.lookup');
  return originalLookup.call(this, hostname, ...args);
};
