/**
 * Tier 1: Feature Coverage for ALL 15 features in PROJECT.md § Feature Inventory.
 * Every test genuinely exercises the requirement and fails cleanly if unimplemented.
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

async function encryptBoardHtml(htmlText) {
  const rawKey = webcrypto.getRandomValues(new Uint8Array(32));
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const key = await webcrypto.subtle.importKey('raw', rawKey, 'AES-GCM', false, ['encrypt']);
  const ct = new Uint8Array(await webcrypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(htmlText)));
  const bin = new Uint8Array(12 + ct.length);
  bin.set(iv, 0);
  bin.set(ct, 12);
  const b64u = Buffer.from(rawKey).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return { bin, b64u };
}

function flushMicrotasks(ms = 25) {
  return new Promise(r => setTimeout(r, ms));
}

test('Feature 1: database.rules.json salas/$sala existence & validation', () => {
  const rules = RtdbRulesEvaluator.fromRepo(REPO);
  const profeAuth = { uid: 'profe1', provider: 'password' };
  const anonAuth = { uid: 'anon1', provider: 'anonymous' };

  // Base DB with approved teacher
  const dbNoRoom = {
    profes: { profe1: { nombre: 'Ana', correo: 'ana@x.com', estado: 'aprobado' } }
  };

  // Cannot write pres/$p or ev/$u if salas/$sala/dueno does not exist
  const presNoRoom = rules.canWrite('salas/sala1234/pres/anon1', { j: '{}', t: 1000 }, anonAuth, dbNoRoom);
  assert.equal(presNoRoom.allowed, false, 'pres/$p write must be denied when salas/$sala/dueno does not exist');

  const evNoRoom = rules.canWrite('salas/sala1234/ev/anon1', { n: 'ping', de: 'anon1', k: 1, t: 1000 }, anonAuth, dbNoRoom);
  assert.equal(evNoRoom.allowed, false, 'ev/$u write must be denied when salas/$sala/dueno does not exist');

  // Teacher creates dueno
  const createDueno = rules.canWrite('salas/sala1234/dueno', 'profe1', profeAuth, dbNoRoom);
  assert.equal(createDueno.allowed, true, createDueno.reason);

  const dbWithRoom = {
    ...dbNoRoom,
    salas: { sala1234: { dueno: 'profe1' } }
  };

  // Valid writes to d/$doc, pres/$p, ev/$u succeed
  assert.equal(rules.canWrite('salas/sala1234/d/doc1', { j: '{"a":1}', t: 123 }, profeAuth, dbWithRoom).allowed, true);
  assert.equal(rules.canWrite('salas/sala1234/pres/anon1', { j: '{"x":1}', t: 123 }, anonAuth, dbWithRoom).allowed, true);
  assert.equal(rules.canWrite('salas/sala1234/pres/P', { j: '{"x":1}', t: 123 }, profeAuth, dbWithRoom).allowed, true);
  assert.equal(rules.canWrite('salas/sala1234/ev/anon1', { n: 'go', de: 'anon1', k: 1, t: 123, d: { page: 2 } }, anonAuth, dbWithRoom).allowed, true);

  // Invalid types / $other rejected
  assert.equal(rules.canWrite('salas/sala1234/d/doc1', { j: 123, t: 123 }, profeAuth, dbWithRoom).allowed, false, 'd/$doc/j must be string');
  assert.equal(rules.canWrite('salas/sala1234/pres/anon1', { j: '{}', t: 'bad' }, anonAuth, dbWithRoom).allowed, false, 'pres/$p/t must be number');
  assert.equal(rules.canWrite('salas/sala1234/ev/anon1', { n: 'go', de: 'anon1', k: 1, t: 123, extra: 1 }, anonAuth, dbWithRoom).allowed, false, 'ev/$u/$other must be false');
  assert.equal(rules.canWrite('salas/sala1234/unknown', 'x', profeAuth, dbWithRoom).allowed, false, 'salas/$sala/$other must be false');
});

test('Feature 2: database.rules.json profes/$uid validation (idioma, creado, $other)', () => {
  const rules = RtdbRulesEvaluator.fromRepo(REPO);
  const auth = { uid: 'u1', provider: 'password' };

  // Valid registration with idioma & creado
  for (const idioma of ['es', 'en', 'pt', 'varios']) {
    const ok = rules.canWrite('profes/u1', {
      nombre: 'Profe', correo: 'p@x.com', estado: 'pendiente', idioma, creado: 1700000000
    }, auth, {});
    assert.equal(ok.allowed, true, `idioma=${idioma} should be allowed: ${ok.reason}`);
  }

  // Invalid idioma
  assert.equal(rules.canWrite('profes/u1', {
    nombre: 'Profe', correo: 'p@x.com', estado: 'pendiente', idioma: 'fr', creado: 1700000000
  }, auth, {}).allowed, false, 'invalid idioma must be rejected');

  // Non-number creado
  assert.equal(rules.canWrite('profes/u1', {
    nombre: 'Profe', correo: 'p@x.com', estado: 'pendiente', idioma: 'es', creado: '2026-01-01'
  }, auth, {}).allowed, false, 'non-number creado must be rejected');

  // Extra field rejected ($other: false)
  assert.equal(rules.canWrite('profes/u1', {
    nombre: 'Profe', correo: 'p@x.com', estado: 'pendiente', admin: true
  }, auth, {}).allowed, false, 'unexpected extra field must be rejected by $other: false');
});

test('Feature 3: {{TITULO}} HTML escaping in admin.html and herramientas/cifrar.py', async () => {
  // 3a: Test herramientas/cifrar.py in isolated temp dir
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'la-cifrar-'));
  try {
    const origen = path.join(tmpDir, 'origen');
    const repoTmp = path.join(tmpDir, 'repo');
    fs.mkdirSync(origen, { recursive: true });
    fs.mkdirSync(path.join(repoTmp, 'herramientas'), { recursive: true });
    fs.copyFileSync(path.join(REPO, 'herramientas', 'cargador.html'), path.join(repoTmp, 'herramientas', 'cargador.html'));

    const maliciousTitle = `Hola <script>alert("xss")</script> & 'comillas' $& $1 $$`;
    fs.writeFileSync(path.join(origen, 'test-tablero.html'), `<!doctype html><html><head><title>${maliciousTitle}</title></head><body>OK</body></html>`);
    const clavesJson = path.join(tmpDir, 'claves.json');

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
sys.argv = ['cifrar.py', ${JSON.stringify(origen)}, ${JSON.stringify(clavesJson)}, 'test-tablero.html']
cifrar.main()`
    ], { stdio: 'pipe' });

    const outHtml = fs.readFileSync(path.join(repoTmp, 'test-tablero.html'), 'utf8');
    assert.ok(!outHtml.includes('<script>alert'), 'cifrar.py must escape <script> in {{TITULO}}');
    assert.ok(outHtml.includes('&lt;script&gt;'), 'cifrar.py must HTML-escape < and >');
    assert.ok(outHtml.includes('&amp;'), 'cifrar.py must HTML-escape &');
    assert.ok(outHtml.includes('$&amp;') && outHtml.includes('$1 $$'), 'cifrar.py must preserve $ sequences safely');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  // 3b: Execute admin.html's actual #f-proteger submit handler in dom-env
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
      ok: true,
      status: 200,
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

  const adminTitle = `Hola & "comillas" 'simples' $& $1 $$`;
  const fp = adminEnv.document.getElementById('f-proteger');
  const boardInput = `<!doctype html><html><head><title>${adminTitle}</title></head><body>OK</body></html>`;
  fp.elements.archivo.files = [{
    name: 'a1-prueba-xss.html',
    async arrayBuffer() { return new TextEncoder().encode(boardInput).buffer; }
  }];
  fp.dispatchEvent(new adminEnv.window.Event('submit', { bubbles: true, cancelable: true }));
  await flushMicrotasks(60);

  const htmlBlob = Array.from(adminEnv.createdBlobs.values()).find(b => b.type === 'text/html');
  assert.ok(htmlBlob, 'admin.html #f-proteger must generate a text/html Blob');
  const generatedLoader = await htmlBlob.text();
  assert.ok(!generatedLoader.includes('{{TITULO}}'), 'generated loader must replace {{TITULO}}');
  assert.ok(generatedLoader.includes('Hola &amp; &quot;comillas&quot; &#39;simples&#39; $&amp; $1 $$'), 'admin.html must HTML-escape quotes, &, and preserve $ sequences safely');
});

test('Feature 4: assets/abrir.js removes localStorage key cache and always verifies Firebase session', async () => {
  const { bin, b64u } = await encryptBoardHtml('<!doctype html><html><head><title>Secreta</title></head><body><div id="secret">OK</div></body></html>');
  const fbMock = createFirebaseMock({ currentUser: null }); // Not logged in

  const env = createBrowserEnv({
    repoRoot: REPO,
    url: 'https://linguasacademy.github.io/a1-esta-es-mi-familia.html',
    html: fs.readFileSync(path.join(REPO, 'herramientas', 'cargador.html'), 'utf8'),
    localStorageData: { 'la-clave:a1-esta-es-mi-familia': b64u }, // Pre-seeded localStorage!
    firebaseMock: fbMock,
    fetchHandler: async () => ({
      ok: true,
      status: 200,
      async arrayBuffer() { return bin.buffer.slice(bin.byteOffset, bin.byteOffset + bin.byteLength); }
    })
  });

  if (fs.existsSync(path.join(REPO, 'assets', 'fb.js'))) {
    env.runFile('assets/fb.js');
  }
  env.runFile('assets/abrir.js');
  await flushMicrotasks(50);

  // Must NOT paint from localStorage without Firebase session
  assert.equal(env.document.getElementById('secret'), null, 'abrir.js must NOT decrypt/paint from pre-seeded localStorage without verifying Firebase session');
  assert.ok(env.navigations.some(n => n.url.includes('entrar.html')), 'unauthenticated user must be redirected to entrar.html');
});

test('Feature 5: assets/abrir.js replaces document.write() with DOMParser + <head>/<body> replacement + <script> re-execution', async () => {
  const boardHtml = '<!doctype html><html><head><title>Tablero DOMParser</title><style>.x{color:red}</style></head><body><main id="tablero">Contenido</main><script>window.__TABLERO_EJECUTADO = 42;</script></body></html>';
  const { bin, b64u } = await encryptBoardHtml(boardHtml);

  const fbMock = createFirebaseMock({
    currentUser: { uid: 'profe1', isAnonymous: false, provider: 'password' },
    dbData: {
      profes: { profe1: { estado: 'aprobado' } },
      claves: { 'a1-esta-es-mi-familia': b64u }
    }
  });

  const env = createBrowserEnv({
    repoRoot: REPO,
    url: 'https://linguasacademy.github.io/a1-esta-es-mi-familia.html',
    html: fs.readFileSync(path.join(REPO, 'herramientas', 'cargador.html'), 'utf8'),
    firebaseMock: fbMock,
    fetchHandler: async () => ({
      ok: true,
      status: 200,
      async arrayBuffer() { return bin.buffer.slice(bin.byteOffset, bin.byteOffset + bin.byteLength); }
    })
  });

  if (fs.existsSync(path.join(REPO, 'assets', 'fb.js'))) {
    env.runFile('assets/fb.js');
  }
  env.runFile('assets/abrir.js');
  await flushMicrotasks(60);

  assert.equal(env.document.documentWriteCalls.length, 0, 'abrir.js must NOT call document.write()');
  assert.equal(env.document.title, 'Tablero DOMParser', 'document.title must be updated from parsed board');
  assert.ok(env.document.getElementById('tablero'), 'parsed body content must be mounted in document.body');
  assert.equal(env.window.__TABLERO_EJECUTADO, 42, 'inline <script> in decrypted board must be re-executed');
  assert.equal(env.localStorage.getItem('la-clave:a1-esta-es-mi-familia'), null, 'key must NOT be saved in localStorage');
  assert.equal(env.sessionStorage.getItem('la-clave:a1-esta-es-mi-familia'), b64u, 'key must be saved in sessionStorage');
});

test('Feature 6: vivo.js resets _fb and _sala on failure so subsequent calls can recover', async () => {
  const fbMock = createFirebaseMock({
    currentUser: { uid: 'profe1', isAnonymous: false, provider: 'password' },
    dbData: { salas: { sala1234: { dueno: 'profe1' } } },
    failScripts: true
  });

  const env = createBrowserEnv({
    repoRoot: REPO,
    url: 'https://linguasacademy.github.io/a1-esta-es-mi-familia.html?sala=sala1234',
    firebaseMock: fbMock
  });

  env.runFile('vivo.js');
  await flushMicrotasks(30);

  // First attempt fails because scripts failed to load
  const firstDb = await env.window.claude.use('db');
  assert.equal(firstDb, null, 'first claude.use("db") should return null when Firebase load fails');

  // Recover network
  fbMock.failScripts = false;
  const secondDb = await env.window.claude.use('db');
  assert.ok(secondDb && typeof secondDb.doc === 'function', 'second claude.use("db") must retry and succeed after _fb/_sala reset');
});

test('Feature 7: vivo.js hacerRoom.onPeers and hacerRoom.on return real unsubscribe functions', async () => {
  const fbMock = createFirebaseMock({
    currentUser: { uid: 'profe1', isAnonymous: false, provider: 'password' },
    dbData: { salas: { sala1234: { dueno: 'profe1' } } }
  });

  const env = createBrowserEnv({
    repoRoot: REPO,
    url: 'https://linguasacademy.github.io/a1-esta-es-mi-familia.html?sala=sala1234',
    firebaseMock: fbMock,
    preloadFirebase: true
  });

  env.runFile('vivo.js');
  const room = await env.window.claude.use('room');
  assert.ok(room, 'room capability should be returned');

  let peerCalls = 0;
  let evCalls = 0;
  const unsubPeers = room.onPeers(() => { peerCalls++; });
  const unsubEv = room.on('salto', () => { evCalls++; });

  await flushMicrotasks(20);
  const initialPeerCalls = peerCalls;

  // Trigger presence and event before unsubscribe
  fbMock.setRaw('salas/sala1234/pres/est1', { j: '{"ok":1}', t: 100 });
  fbMock.setRaw('salas/sala1234/ev/est1', { n: 'salto', de: 'est1', k: 1, t: 100, d: { p: 1 } });
  await flushMicrotasks(20);

  assert.ok(peerCalls > initialPeerCalls, 'onPeers callback must fire before unsubscribe');
  assert.equal(evCalls, 1, 'on() callback must fire before unsubscribe');

  // Unsubscribe both
  unsubPeers();
  unsubEv();

  // Trigger again
  fbMock.setRaw('salas/sala1234/pres/est2', { j: '{"ok":2}', t: 200 });
  fbMock.setRaw('salas/sala1234/ev/est1', { n: 'salto', de: 'est1', k: 2, t: 200, d: { p: 2 } });
  await flushMicrotasks(20);

  assert.equal(peerCalls, initialPeerCalls + 1, 'onPeers callback must NOT fire after unsubscribe');
  assert.equal(evCalls, 1, 'on() callback must NOT fire after unsubscribe');
});

test('Feature 8: vivo.js filters out pre-existing ev events on join using once("value") + listo gate', async () => {
  const fbMock = createFirebaseMock({
    currentUser: { uid: 'est_nuevo', isAnonymous: true, provider: 'anonymous' },
    dbData: {
      salas: {
        sala1234: {
          dueno: 'profe1',
          ev: {
            est_viejo: { n: 'accion', de: 'est_viejo', k: 1, t: 1000, d: { viejo: true } }
          }
        }
      }
    }
  });

  const env = createBrowserEnv({
    repoRoot: REPO,
    url: 'https://linguasacademy.github.io/a1-esta-es-mi-familia.html?sala=sala1234',
    firebaseMock: fbMock,
    preloadFirebase: true
  });

  env.runFile('vivo.js');
  const room = await env.window.claude.use('room');
  const received = [];
  room.on('accion', ev => received.push(ev.data));

  await flushMicrotasks(30);
  assert.equal(received.length, 0, 'pre-existing ev events must NOT be replayed on join');

  // Now emit a new event after joining
  fbMock.setRaw('salas/sala1234/ev/profe1', { n: 'accion', de: 'P', k: 1, t: 2000, d: { nuevo: true } });
  await flushMicrotasks(20);
  assert.deepEqual(received, [{ nuevo: true }], 'new events after listo gate must be delivered');
});

test('Feature 9: assets/site.js Forma.error and Forma.estado handle null/missing elements safely', () => {
  const env = createBrowserEnv({
    repoRoot: REPO,
    html: '<!doctype html><html><head></head><body><form id="f"><input id="correo" name="correo"></form></body></html>'
  });
  env.runFile('assets/site.js');
  const { Forma } = env.window;
  const form = env.document.getElementById('f');

  assert.doesNotThrow(() => Forma.error(null, 'correo', 'err'), 'Forma.error(null, ...) must not throw');
  assert.doesNotThrow(() => Forma.error(form, 'inexistente', 'err'), 'Forma.error with missing field must not throw');
  assert.doesNotThrow(() => Forma.error(form, 'correo', 'err'), 'Forma.error without -error element must not throw');
  assert.doesNotThrow(() => Forma.estado(null, 'ok', 'ok'), 'Forma.estado(null, ...) must not throw');
  assert.doesNotThrow(() => Forma.estado(form, 'ok', 'ok'), 'Forma.estado without [data-form-status] must not throw');
});

test('Feature 10: tableros.html sinTildes uses /[\u0300-\u036f]/g', () => {
  const html = fs.readFileSync(path.join(REPO, 'tableros.html'), 'utf8');
  assert.ok(html.includes('/[\\u0300-\\u036f]/g'), 'tableros.html must use explicit Unicode escape /[\\u0300-\\u036f]/g in sinTildes');
  const match = html.match(/const sinTildes\s*=\s*([^;]+);/);
  assert.ok(match, 'sinTildes definition must exist');
  const env = createBrowserEnv({ repoRoot: REPO });
  const sinTildes = env.runScript(`(${match[1]})`);
  assert.equal(sinTildes('¿Qué está pasando aquí? ÁÉÍÓÚ üñ'), '¿que esta pasando aqui? aeiou un');
});

test('Feature 11: Shared Firebase module assets/fb.js (window.LA_FB) wired across HTMLs and JS', () => {
  const fbPath = path.join(REPO, 'assets', 'fb.js');
  assert.ok(fs.existsSync(fbPath), 'assets/fb.js must exist');

  const env = createBrowserEnv({ repoRoot: REPO });
  env.runFile('assets/fb.js');
  const fb = env.window.LA_FB;
  assert.ok(fb, 'window.LA_FB must be defined');
  assert.equal(typeof fb.CFG, 'object');
  assert.equal(Object.keys(fb.CFG).length, 7);
  assert.equal(fb.SDK, 'https://www.gstatic.com/firebasejs/10.12.2/');
  for (const fn of ['carga', 'conTiempo', 'leer', 'denegado', 'leer2']) {
    assert.equal(typeof fb[fn], 'function', `LA_FB.${fn} must be a function`);
  }

  const scriptOrderChecks = [
    ['index.html', 'assets/auth.js'],
    ['entrar.html', 'assets/auth.js'],
    ['tableros.html', 'assets/auth.js'],
    ['admin.html', 'assets/auth.js'],
    ['herramientas/cargador.html', 'assets/abrir.js']
  ];
  for (const [htmlFile, nextScript] of scriptOrderChecks) {
    const content = fs.readFileSync(path.join(REPO, htmlFile), 'utf8');
    const fbIdx = content.indexOf('assets/fb.js');
    const nextIdx = content.indexOf(nextScript);
    assert.ok(fbIdx !== -1, `${htmlFile} must include assets/fb.js`);
    assert.ok(nextIdx !== -1, `${htmlFile} must include ${nextScript}`);
    assert.ok(fbIdx < nextIdx, `${htmlFile} must load assets/fb.js before ${nextScript}`);
  }
});

test('Feature 12: Orphan board a2-ayer-fue-diferente-v1.html and .bin are deleted', () => {
  assert.equal(fs.existsSync(path.join(REPO, 'a2-ayer-fue-diferente-v1.html')), false, 'orphan HTML must be deleted');
  assert.equal(fs.existsSync(path.join(REPO, 't', 'a2-ayer-fue-diferente-v1.bin')), false, 'orphan .bin must be deleted');
});

test('Feature 13: 15 unused images are deleted', () => {
  const unusedImg = [
    'en-linea-1100.jpg', 'en-linea-600.jpg', 'en-linea-v.jpg',
    'explicar-1100.jpg', 'explicar-600.jpg', 'lisboa-v.jpg',
    'londres-v.jpg', 'madrid-1100.jpg', 'madrid-600.jpg', 'madrid-v.jpg'
  ];
  const unusedTableros = [
    'a1-monstruos-gigantes.jpg', 'a2-a-como-esta-la-pina.jpg',
    'a2-me-lo-llevo.jpg', 'b1-que-harias-si.jpg', 'b2-radio-chisme.jpg'
  ];
  for (const f of unusedImg) {
    assert.equal(fs.existsSync(path.join(REPO, 'assets', 'img', f)), false, `assets/img/${f} must be deleted`);
  }
  for (const f of unusedTableros) {
    assert.equal(fs.existsSync(path.join(REPO, 'assets', 'tableros', f)), false, `assets/tableros/${f} must be deleted`);
  }
});

test('Feature 14: GH Pages .nojekyll and Spanish 404.html', () => {
  const nojekyll = path.join(REPO, '.nojekyll');
  assert.ok(fs.existsSync(nojekyll), '.nojekyll must exist');
  assert.equal(fs.statSync(nojekyll).size, 0, '.nojekyll must be empty');

  const html404 = fs.readFileSync(path.join(REPO, '404.html'), 'utf8');
  assert.ok(html404.includes('lang="es"'), '404.html must be in Spanish');
  assert.ok(html404.includes('/assets/site.css'), '404.html must use /assets/site.css');
  assert.ok(html404.includes('href="/"'), '404.html must link to /');
  assert.ok(html404.includes('href="/tableros.html"'), '404.html must link to /tableros.html');
});

test('Feature 15: Pre-push & CI verification (verificar.py, pre-push, workflow, README)', () => {
  const verificarPy = path.join(REPO, 'herramientas', 'verificar.py');
  const prePush = path.join(REPO, '.githooks', 'pre-push');
  const workflow = path.join(REPO, '.github', 'workflows', 'verificar.yml');
  const readme = path.join(REPO, 'README.md');

  assert.ok(fs.existsSync(verificarPy), 'herramientas/verificar.py must exist');
  assert.ok(fs.existsSync(prePush), '.githooks/pre-push must exist');
  assert.ok((fs.statSync(prePush).mode & 0o111) !== 0, '.githooks/pre-push must be executable');
  assert.ok(fs.readFileSync(prePush, 'utf8').includes('verificar.py'), '.githooks/pre-push must invoke verificar.py');
  assert.ok(fs.existsSync(workflow), '.github/workflows/verificar.yml must exist');
  assert.ok(fs.readFileSync(readme, 'utf8').includes('core.hooksPath'), 'README.md must document core.hooksPath');

  /* core.hooksPath es configuración local de cada copia (el README explica cómo activarlo), no del repositorio:
     si está puesto, debe apuntar a .githooks; si no, no es un fallo del sitio. */
  let hooksPath = '';
  try { hooksPath = execFileSync('git', ['config', '--get', 'core.hooksPath'], { cwd: REPO, encoding: 'utf8' }).trim(); } catch (e) {}
  if (hooksPath) assert.equal(hooksPath, '.githooks', 'git config core.hooksPath, when set, must be .githooks');

  const out = execFileSync('python3', [verificarPy], { cwd: REPO, encoding: 'utf8' });
  assert.ok(out.includes('49 tableros'), 'verificar.py should verify 49 boards');
});
