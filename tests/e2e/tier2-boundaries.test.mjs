/**
 * Tier 2: Boundary & Corner Cases
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { webcrypto } from 'node:crypto';
import { RtdbRulesEvaluator } from './helpers/rtdb-rules.mjs';
import { createBrowserEnv, createFirebaseMock } from './helpers/dom-env.mjs';

const REPO = path.resolve(import.meta.dirname, '..', '..');

function flushMicrotasks(ms = 25) {
  return new Promise(r => setTimeout(r, ms));
}

test('Boundary: RTDB exact length limits (65536/65537, 4096/4097, 128/129, 64/65)', () => {
  const rules = RtdbRulesEvaluator.fromRepo(REPO);
  const profeAuth = { uid: 'profe1', provider: 'password' };
  const anonAuth = { uid: 'anon1', provider: 'anonymous' };
  const dbBase = {
    profes: { profe1: { nombre: 'Ana', correo: 'a@b.c', estado: 'aprobado' } },
    salas: { s1: { dueno: 'profe1' } }
  };

  // d/$doc/j: 65536 vs 65537
  assert.equal(rules.canWrite('salas/s1/d/doc1', { j: 'a'.repeat(65536), t: 1 }, profeAuth, dbBase).allowed, true, '65536 chars in d/$doc/j must be allowed');
  assert.equal(rules.canWrite('salas/s1/d/doc1', { j: 'a'.repeat(65537), t: 1 }, profeAuth, dbBase).allowed, false, '65537 chars in d/$doc/j must be rejected');

  // pres/$p/j: 4096 vs 4097
  assert.equal(rules.canWrite('salas/s1/pres/anon1', { j: 'b'.repeat(4096), t: 1 }, anonAuth, dbBase).allowed, true, '4096 chars in pres/$p/j must be allowed');
  assert.equal(rules.canWrite('salas/s1/pres/anon1', { j: 'b'.repeat(4097), t: 1 }, anonAuth, dbBase).allowed, false, '4097 chars in pres/$p/j must be rejected');

  // ev/$u/n: 64 vs 65; ev/$u/de: 128 vs 129
  const uid128 = 'y'.repeat(128);
  const auth128 = { uid: uid128, provider: 'anonymous' };
  assert.equal(rules.canWrite(`salas/s1/ev/${uid128}`, { n: 'x'.repeat(64), de: uid128, k: 1, t: 1 }, auth128, dbBase).allowed, true, '64/128 chars in ev/$u must be allowed');
  assert.equal(rules.canWrite(`salas/s1/ev/${uid128}`, { n: 'x'.repeat(65), de: uid128, k: 1, t: 1 }, auth128, dbBase).allowed, false, '65 chars in ev/$u/n must be rejected');
  assert.equal(rules.canWrite('salas/s1/ev/anon1', { n: 'x'.repeat(64), de: 'y'.repeat(129), k: 1, t: 1 }, anonAuth, dbBase).allowed, false, '129 chars in ev/$u/de must be rejected');

  // dueno: 128 vs 129
  const dbNoRoom = { profes: { ['p'.repeat(128)]: { nombre: 'A', correo: 'a@b.c', estado: 'aprobado' }, ['p'.repeat(129)]: { nombre: 'B', correo: 'b@b.c', estado: 'aprobado' } } };
  assert.equal(rules.canWrite('salas/s2/dueno', 'p'.repeat(128), { uid: 'p'.repeat(128), provider: 'password' }, dbNoRoom).allowed, true, '128-char dueno must be allowed');
  assert.equal(rules.canWrite('salas/s2/dueno', 'p'.repeat(129), { uid: 'p'.repeat(129), provider: 'password' }, dbNoRoom).allowed, false, '129-char dueno must be rejected');
});

test('Boundary: RTDB $other: false and legacy profes/$uid without idioma/creado', () => {
  const rules = RtdbRulesEvaluator.fromRepo(REPO);
  const profeAuth = { uid: 'profe1', provider: 'password' };
  const anonAuth = { uid: 'anon1', provider: 'anonymous' };
  const dbBase = {
    profes: { profe1: { nombre: 'Ana', correo: 'a@b.c', estado: 'aprobado' } },
    salas: { s1: { dueno: 'profe1' } }
  };

  assert.equal(rules.canWrite('salas/s1/d/doc1', { j: '{}', t: 1, extra: 1 }, profeAuth, dbBase).allowed, false);
  assert.equal(rules.canWrite('salas/s1/pres/anon1', { j: '{}', t: 1, extra: 1 }, anonAuth, dbBase).allowed, false);
  assert.equal(rules.canWrite('salas/s1/ev/anon1', { n: 'a', de: 'b', k: 1, t: 1, extra: 1 }, anonAuth, dbBase).allowed, false);
  assert.equal(rules.canWrite('salas/s1/extraNode', 'val', profeAuth, dbBase).allowed, false);

  // Legacy profes/$uid without idioma or creado must still be valid
  const legacyRes = rules.canWrite('profes/legacy1', {
    nombre: 'Profe Antiguo',
    correo: 'antiguo@x.com',
    estado: 'pendiente'
  }, { uid: 'legacy1', provider: 'password' }, {});
  assert.equal(legacyRes.allowed, true, `Legacy profes/$uid without idioma/creado must be allowed: ${legacyRes.reason}`);
});

test('Boundary: XSS and $-replacement payloads in {{TITULO}} (admin.html & cifrar.py)', async () => {
  const payload = `"><img src=x onerror=alert(1)> $& $1 $$ $'`;
  // admin.html check: execute actual #f-proteger submit handler
  const adminHtml = fs.readFileSync(path.join(REPO, 'admin.html'), 'utf8');
  const adminInlineScript = adminHtml.match(/<script>\s*\(\(\) => \{[\s\S]*?<\/script>/g).pop().replace(/^<script>|<\/script>$/g, '');
  const fbMock = createFirebaseMock({
    currentUser: { uid: 'admin1', isAnonymous: false, provider: 'password' },
    dbData: { admins: { admin1: true } }
  });
  const cargadorTpl = fs.readFileSync(path.join(REPO, 'herramientas', 'cargador.html'), 'utf8');
  const adminEnv = createBrowserEnv({
    repoRoot: REPO,
    url: 'https://linguasacademy.github.io/admin.html',
    html: adminHtml,
    firebaseMock: fbMock,
    preloadFirebase: true,
    fetchHandler: async u => ({
      ok: true, status: 200,
      async text() { return String(u).includes('cargador.html') ? cargadorTpl : ''; }
    })
  });
  adminEnv.runFile('assets/site.js');
  adminEnv.window.LA = {
    app: async () => ({ db: fbMock.firebase.initializeApp({}, '[DEFAULT]').database() }),
    estado: async () => ({ usuario: { uid: 'admin1' }, perfil: { admin: true } }),
    solicitudes: async () => [],
    salir: async () => {},
    motivo: e => String(e)
  };
  adminEnv.runScript(adminInlineScript, 'admin-inline.js');

  const adminPayload = `"> & ' $& $1 $$ $'`;
  const fp = adminEnv.document.getElementById('f-proteger');
  fp.elements.archivo.files = [{
    name: 'a1-xss-boundary.html',
    async arrayBuffer() { return new TextEncoder().encode(`<!doctype html><html><head><title>${adminPayload}</title></head><body></body></html>`).buffer; }
  }];
  fp.dispatchEvent(new adminEnv.window.Event('submit', { bubbles: true, cancelable: true }));
  await flushMicrotasks(60);

  const htmlBlob = Array.from(adminEnv.createdBlobs.values()).find(b => b.type === 'text/html');
  assert.ok(htmlBlob, 'admin.html #f-proteger must generate a text/html Blob');
  const rendered = await htmlBlob.text();
  assert.ok(!rendered.includes('{{TITULO}}'), 'placeholder must be replaced');
  assert.ok(rendered.includes('&quot;&gt; &amp; &#39; $&amp; $1 $$ $&#39;'), 'quotes, &, and $ sequences must be escaped safely');

  // cifrar.py check with $-payload
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'la-cifrar-b-'));
  try {
    const origen = path.join(tmpDir, 'origen');
    const repoTmp = path.join(tmpDir, 'repo');
    fs.mkdirSync(origen, { recursive: true });
    fs.mkdirSync(path.join(repoTmp, 'herramientas'), { recursive: true });
    fs.copyFileSync(path.join(REPO, 'herramientas', 'cargador.html'), path.join(repoTmp, 'herramientas', 'cargador.html'));
    fs.writeFileSync(path.join(origen, 'no-title.html'), `<!doctype html><html><head><title>${payload}</title></head><body></body></html>`);
    execFileSync('python3', [
      '-c',
      `import sys, types, os
try:
    import cryptography.hazmat.primitives.ciphers.aead
except ImportError:
    m = types.ModuleType('cryptography.hazmat.primitives.ciphers.aead')
    class AESGCM:
        def __init__(self, k): self.k = k
        @staticmethod
        def generate_key(bit_length=256): return os.urandom(bit_length // 8)
        def encrypt(self, iv, data, aad): return data
    m.AESGCM = AESGCM
    for name in ['cryptography', 'cryptography.hazmat', 'cryptography.hazmat.primitives', 'cryptography.hazmat.primitives.ciphers']:
        sys.modules[name] = types.ModuleType(name)
    sys.modules['cryptography.hazmat.primitives.ciphers.aead'] = m
sys.path.insert(0, ${JSON.stringify(path.join(REPO, 'herramientas'))})
import cifrar
cifrar.REPO = ${JSON.stringify(repoTmp)}
cifrar.CARGADOR = ${JSON.stringify(path.join(repoTmp, 'herramientas', 'cargador.html'))}
sys.argv = ['cifrar.py', ${JSON.stringify(origen)}, ${JSON.stringify(path.join(tmpDir, 'c.json'))}, 'no-title.html']
cifrar.main()`
    ], { stdio: 'pipe' });
    const out = fs.readFileSync(path.join(repoTmp, 'no-title.html'), 'utf8');
    assert.ok(!out.includes('onerror=alert(1)>'), 'cifrar.py must escape <img');
    assert.ok(out.includes('&quot;&gt;&lt;img'), 'cifrar.py must HTML-escape payload');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('Boundary: Idempotent unsubscribe in vivo.js does not affect other listeners', async () => {
  const fbMock = createFirebaseMock({
    currentUser: { uid: 'profe1', isAnonymous: false, provider: 'password' },
    dbData: { salas: { s1: { dueno: 'profe1' } } }
  });
  const env = createBrowserEnv({
    repoRoot: REPO,
    url: 'https://linguasacademy.github.io/a1-esta-es-mi-familia.html?sala=s1',
    firebaseMock: fbMock,
    preloadFirebase: true
  });
  env.runFile('vivo.js');
  const room = await env.window.claude.use('room');

  let a = 0, b = 0;
  const unsubA = room.on('ev1', () => { a++; });
  room.on('ev1', () => { b++; });

  // Double-unsubscribe A
  assert.doesNotThrow(() => { unsubA(); unsubA(); });
  await flushMicrotasks(20);

  fbMock.setRaw('salas/s1/ev/est1', { n: 'ev1', de: 'est1', k: 1, t: 100, d: {} });
  await flushMicrotasks(20);
  assert.equal(a, 0, 'unsubscribed listener A must not run');
  assert.equal(b, 1, 'remaining listener B must still run');
});

test('Boundary: Burst of old vs new ev events in vivo.js', async () => {
  const fbMock = createFirebaseMock({
    currentUser: { uid: 'est_new', isAnonymous: true, provider: 'anonymous' },
    dbData: {
      salas: {
        s1: {
          dueno: 'profe1',
          ev: {
            u1: { n: 'msg', de: 'u1', k: 1, t: 10, d: 'old1' },
            u2: { n: 'msg', de: 'u2', k: 1, t: 20, d: 'old2' },
            u3: { n: 'msg', de: 'u3', k: 1, t: 30, d: 'old3' }
          }
        }
      }
    }
  });
  const env = createBrowserEnv({
    repoRoot: REPO,
    url: 'https://linguasacademy.github.io/a1-esta-es-mi-familia.html?sala=s1',
    firebaseMock: fbMock,
    preloadFirebase: true
  });
  env.runFile('vivo.js');
  const room = await env.window.claude.use('room');
  const got = [];
  room.on('msg', ev => got.push(ev.data));
  await flushMicrotasks(30);
  assert.deepEqual(got, [], 'all 3 pre-existing ev events must be filtered');

  fbMock.setRaw('salas/s1/ev/u4', { n: 'msg', de: 'u4', k: 1, t: 40, d: 'new1' });
  fbMock.setRaw('salas/s1/ev/u5', { n: 'msg', de: 'u5', k: 1, t: 50, d: 'new2' });
  await flushMicrotasks(20);
  assert.deepEqual(got, ['new1', 'new2'], 'both new events must be delivered');
});

test('Boundary: sinTildes edge cases (empty, NFC/NFD, punctuation, emojis)', () => {
  const html = fs.readFileSync(path.join(REPO, 'tableros.html'), 'utf8');
  const match = html.match(/const sinTildes\s*=\s*([^;]+);/);
  assert.ok(match, 'sinTildes must exist in tableros.html');
  assert.ok(html.includes('/[\\u0300-\\u036f]/g'), 'sinTildes must use /[\\u0300-\\u036f]/g');
  const env = createBrowserEnv({ repoRoot: REPO });
  const sinTildes = env.runScript(`(${match[1]})`);

  assert.equal(sinTildes(''), '');
  assert.equal(sinTildes('CANCIO\u0301N'), 'cancion'); // NFD decomposed
  assert.equal(sinTildes('Canción'), 'cancion'); // NFC precomposed
  assert.equal(sinTildes('¡Pingüino! 🐧'), '¡pinguino! 🐧');
});
