import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { webcrypto } from 'node:crypto';
import { RtdbRulesEvaluator } from './helpers/rtdb-rules.mjs';
import { createBrowserEnv, createFirebaseMock } from './helpers/dom-env.mjs';

const REPO = process.cwd();

function flush(ms = 30) {
  return new Promise(r => setTimeout(r, ms));
}

function extractInlineScript(htmlPath) {
  const html = fs.readFileSync(path.join(REPO, htmlPath), 'utf8');
  const matches = [...html.matchAll(/<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi)];
  const inline = matches.map(m => m[1]).filter(s => s.trim().length > 0);
  return { html, script: inline[inline.length - 1] || '' };
}

async function encryptPayload(plaintext) {
  const rawKey = webcrypto.getRandomValues(new Uint8Array(32));
  const key = await webcrypto.subtle.importKey('raw', rawKey, 'AES-GCM', false, ['encrypt']);
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const cipher = new Uint8Array(await webcrypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plaintext)));
  const bin = new Uint8Array(12 + cipher.length);
  bin.set(iv);
  bin.set(cipher, 12);
  const b64u = Buffer.from(rawKey).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return { bin, b64u };
}

// =====================================================================
// 1. RTDB Rules Adversarial & Hardening Tests
// =====================================================================
test('Tier 5 RTDB rules: anonymous profes self-reg, ev/de spoofing, ev/d bounds, delete ancestor validate, admin update, anonymous claves/dueno', () => {
  const rules = RtdbRulesEvaluator.fromRepo(REPO);
  const anonAuth = { uid: 'anon1', provider: 'anonymous', isAnonymous: true };
  const studentAuth = { uid: 'stu1', provider: 'anonymous', isAnonymous: true };
  const profeAuth = { uid: 'profe1', provider: 'password', isAnonymous: false };
  const adminAuth = { uid: 'admin1', provider: 'password', isAnonymous: false };

  const dbBase = {
    admins: { admin1: true },
    profes: {
      profe1: { nombre: 'Ana', correo: 'ana@x.com', estado: 'aprobado' },
      pend1: { nombre: 'Luis', correo: 'luis@x.com', estado: 'pendiente' }
    },
    salas: {
      s1: {
        dueno: 'profe1',
        d: {
          doc1: { j: '{"a":1}', t: 100 }
        }
      }
    }
  };

  // Anonymous profes/$uid write must be rejected
  assert.equal(
    rules.canWrite('profes/anon1', { nombre: 'Anon', correo: 'a@b.c', estado: 'pendiente' }, anonAuth, dbBase).allowed,
    false,
    'anonymous user must not self-register in profes/$uid'
  );

  // Non-anonymous profes/$uid self-registration with pendiente must succeed
  assert.equal(
    rules.canWrite('profes/profe2', { nombre: 'Eva', correo: 'eva@b.c', estado: 'pendiente' }, { uid: 'profe2', provider: 'password' }, dbBase).allowed,
    true,
    'password user can self-register as pendiente'
  );

  // ev/$u/de spoofing 'P' by student must be rejected
  assert.equal(
    rules.canWrite('salas/s1/ev/stu1', { n: 'ping', de: 'P', k: 1, t: 10 }, studentAuth, dbBase).allowed,
    false,
    'student must not spoof de="P" in ev/$u'
  );
  // ev/$u/de with student's own uid must be allowed
  assert.equal(
    rules.canWrite('salas/s1/ev/stu1', { n: 'ping', de: 'stu1', k: 1, t: 10 }, studentAuth, dbBase).allowed,
    true,
    'student can write ev/$u with de === auth.uid'
  );
  // ev/$u/de === 'P' by room owner (dueno) must be allowed
  assert.equal(
    rules.canWrite('salas/s1/ev/profe1', { n: 'cmd', de: 'P', k: 1, t: 10 }, profeAuth, dbBase).allowed,
    true,
    'room owner can write ev/$u with de="P"'
  );

  // ev/$u/d > 4096-char string rejected, 4096-char string & object payload allowed
  assert.equal(
    rules.canWrite('salas/s1/ev/stu1', { n: 'msg', de: 'stu1', k: 1, t: 10, d: 'a'.repeat(4097) }, studentAuth, dbBase).allowed,
    false,
    'ev/$u/d string > 4096 chars must be rejected'
  );
  assert.equal(
    rules.canWrite('salas/s1/ev/stu1', { n: 'msg', de: 'stu1', k: 1, t: 10, d: 'a'.repeat(4096) }, studentAuth, dbBase).allowed,
    true,
    'ev/$u/d string == 4096 chars must be allowed'
  );
  assert.equal(
    rules.canWrite('salas/s1/ev/stu1', { n: 'msg', de: 'stu1', k: 1, t: 10, d: { nested: [1, 2, 3], ok: true } }, studentAuth, dbBase).allowed,
    true,
    'ev/$u/d object payload must be allowed'
  );

  // Deleting required child 'j' from d/$doc must be rejected by ancestor .validate
  assert.equal(
    rules.canWrite('salas/s1/d/doc1/j', null, profeAuth, dbBase).allowed,
    false,
    'deleting required child j from d/$doc must be rejected'
  );
  // Deleting whole d/$doc is allowed
  assert.equal(
    rules.canWrite('salas/s1/d/doc1', null, profeAuth, dbBase).allowed,
    true,
    'deleting whole d/$doc must be allowed'
  );

  // Admin updating profes/$uid/estado is allowed
  assert.equal(
    rules.canWrite('profes/pend1/estado', 'aprobado', adminAuth, dbBase).allowed,
    true,
    'admin can update profes/$uid/estado'
  );

  // Anonymous denied on claves/$tablero (read & write) and salas/$sala/dueno (write)
  assert.equal(rules.canRead('claves/a1-familia', anonAuth, dbBase).allowed, false, 'anonymous cannot read claves');
  assert.equal(rules.canWrite('claves/a1-familia', 'k'.repeat(43), anonAuth, dbBase).allowed, false, 'anonymous cannot write claves');
  assert.equal(rules.canWrite('salas/s2/dueno', 'anon1', anonAuth, dbBase).allowed, false, 'anonymous cannot claim salas/$sala/dueno');
});

// =====================================================================
// 2. vivo.js Adversarial & Hardening Tests
// =====================================================================
test('Tier 5 vivo.js: null/malformed pres child, throttled presence rejection, separated presErrs/evErrs, late onPeers, sync onAuthStateChanged TDZ', async () => {
  const fbMock = createFirebaseMock({
    currentUser: { uid: 'profe1', isAnonymous: false, provider: 'password' },
    dbData: {
      profes: { profe1: { nombre: 'Ana', correo: 'a@b.c', estado: 'aprobado' } },
      salas: {
        salaT5: {
          dueno: 'profe1',
          pres: {
            p_null: null,
            p_bad: { j: '{malformed', t: 111 },
            p_ok: { j: '{"cursor":5}', t: 222 }
          }
        }
      }
    }
  });

  // Patch onAuthStateChanged to fire synchronously for TDZ safety test
  const origInit = fbMock.firebase.initializeApp.bind(fbMock.firebase);
  fbMock.firebase.initializeApp = (cfg, name) => {
    const app = origInit(cfg, name);
    const auth = app.auth();
    const origOnAuth = auth.onAuthStateChanged.bind(auth);
    auth.onAuthStateChanged = (cb, err) => {
      let unsubCalled = false;
      const unsub = () => { unsubCalled = true; };
      cb(auth.currentUser);
      return unsub;
    };
    return app;
  };

  const env = createBrowserEnv({
    url: 'https://linguasacademy.github.io/a1-esta-es-mi-familia.html?sala=salaT5',
    firebaseMock: fbMock,
    preloadFirebase: true
  });
  env.runFile('assets/fb.js');
  env.runFile('vivo.js');

  const room = await env.window.claude.use('room');
  assert.ok(room, 'room should initialize even with synchronous onAuthStateChanged');

  // Verify null/malformed pres child resilience + late onPeers subscriber
  await flush(30);
  const latePeers = [];
  const unsubLate = room.onPeers(ev => latePeers.push(ev));
  await flush(20);
  assert.equal(latePeers.length, 1, 'late onPeers subscriber must receive cached peers');
  assert.ok(latePeers[0].peers.some(p => p.peer === 'p_ok' && p.presence.cursor === 5));
  assert.ok(latePeers[0].peers.some(p => p.peer === 'p_bad' && typeof p.presence === 'object'));
  unsubLate();

  // Verify separated presErrs and evErrs
  const presErrors = [];
  const evErrors = [];
  room.onPeers(() => {}, e => presErrors.push(e));
  room.on('ping', () => {}, e => evErrors.push(e));

  const presListeners = fbMock.state.listeners.get('salas/salaT5/pres');
  const evListeners = fbMock.state.listeners.get('salas/salaT5/ev');
  for (const entry of presListeners) {
    if (entry.errCb) entry.errCb(new Error('pres-err'));
  }
  assert.equal(presErrors.length, 1);
  assert.equal(evErrors.length, 0, 'pres error must not trigger ev error callbacks');

  for (const entry of evListeners) {
    if (entry.event === 'child_added' && entry.errCb) {
      entry.errCb(new Error('ev-err'));
      break;
    }
  }
  assert.equal(evErrors.length, 1);
  assert.equal(presErrors.length, 1, 'ev error must not trigger pres error callbacks');

  // Verify throttled presence() rejection does not cause unhandledRejection
  let unhandled = null;
  const onUnhandled = err => { unhandled = err; };
  process.on('unhandledRejection', onUnhandled);
  try {
    const refOrig = fbMock.firebase.apps[0].database().ref;
    // Trigger immediate presence, then throttled presence while yo.set rejects
    const presRef = fbMock.state.listeners; // keep reference
    await room.presence({ x: 1 });
    // Monkey-patch db.ref on the app to fail future sets? Instead, wrap set on the room's pres/P path via enforceRules or fail:
    // Actually we can simulate by making dbData/salas/salaT5/pres/P fail via a temporary rules hook or by overriding set on Object.prototype? No, let's use a fresh env with a failing set!
  } finally {
    process.off('unhandledRejection', onUnhandled);
  }
  assert.equal(unhandled, null);
});

test('Tier 5 vivo.js: throttled presence() rejection does not trigger unhandledRejection', async () => {
  const fbMock = createFirebaseMock({
    currentUser: { uid: 'profe1', isAnonymous: false, provider: 'password' },
    dbData: {
      profes: { profe1: { nombre: 'Ana', correo: 'a@b.c', estado: 'aprobado' } },
      salas: { salaThrot: { dueno: 'profe1' } }
    }
  });
  // Make set() on pres/P succeed on 1st call and reject on 2nd call (the throttled retry)
  let setCount = 0;
  const origInit = fbMock.firebase.initializeApp.bind(fbMock.firebase);
  fbMock.firebase.initializeApp = (cfg, name) => {
    const app = origInit(cfg, name);
    const origDb = app.database.bind(app);
    app.database = () => {
      const db = origDb();
      const origRef = db.ref.bind(db);
      const wrapRef = (ref, pathStr) => {
        const origChild = ref.child.bind(ref);
        ref.child = sub => {
          const nextPath = pathStr ? `${pathStr}/${sub}` : String(sub);
          const c = wrapRef(origChild(sub), nextPath);
          if (nextPath.endsWith('/pres/P')) {
            c.set = async () => {
              setCount++;
              if (setCount >= 2) throw new Error('network-fail');
            };
          }
          return c;
        };
        return ref;
      };
      db.ref = p => wrapRef(origRef(p), String(p || ''));
      return db;
    };
    return app;
  };

  let unhandled = null;
  const onUnhandled = err => { unhandled = err; };
  process.on('unhandledRejection', onUnhandled);
  try {
    const env = createBrowserEnv({
      url: 'https://linguasacademy.github.io/a1-esta-es-mi-familia.html?sala=salaThrot',
      firebaseMock: fbMock,
      preloadFirebase: true
    });
    env.runFile('assets/fb.js');
    env.runFile('vivo.js');
    const room = await env.window.claude.use('room');
    await room.presence({ step: 1 });
    await room.presence({ step: 2 }); // throttled -> scheduled in 95ms -> set() rejects
    await flush(140);
    assert.ok(setCount >= 2, 'throttled set should have been attempted');
    assert.equal(unhandled, null, 'throttled presence rejection must be caught internally');
  } finally {
    process.off('unhandledRejection', onUnhandled);
  }
});

// =====================================================================
// 3. assets/fb.js Tests
// =====================================================================
test('Tier 5 assets/fb.js: carga dedup/onerror/retry/existing-unloaded, conTiempo, leer, denegado, leer2', async (t) => {
  /* Los temporizadores del entorno simulado no retienen el proceso (unref): sin este latido, node termina
     el bucle de eventos mientras conTiempo()/leer() esperan su plazo y la prueba queda «pending». */
  const latido = setInterval(() => {}, 25);
  t.after(() => clearInterval(latido));
  const env = createBrowserEnv({
    url: 'https://linguasacademy.github.io/entrar.html'
  });
  env.runFile('assets/fb.js');
  const { carga, conTiempo, leer, denegado, leer2 } = env.window.LA_FB;

  // denegado: object & string
  assert.equal(denegado({ code: 'PERMISSION_DENIED' }), true);
  assert.equal(denegado({ message: 'Client does not have permission' }), true);
  assert.equal(denegado('PERMISSION_DENIED: denied'), true);
  assert.equal(denegado('network error'), false);
  assert.equal(denegado(null), false);

  // conTiempo timeout
  await assert.rejects(() => conTiempo(new Promise(() => {}), 20), /tiempo/);

  // leer timeout
  await assert.rejects(() => leer({ once: () => new Promise(() => {}) }, 20), /tiempo/);

  // leer2: 1 retry on transient error, immediate throw on PERMISSION_DENIED
  let transientCalls = 0;
  const val = await leer2({
    once: async () => {
      transientCalls++;
      if (transientCalls === 1) throw new Error('network');
      return { val: () => 'ok-after-retry' };
    }
  });
  assert.equal(val, 'ok-after-retry');
  assert.equal(transientCalls, 2);

  let deniedCalls = 0;
  await assert.rejects(() => leer2({
    once: async () => {
      deniedCalls++;
      const e = new Error('denied');
      e.code = 'PERMISSION_DENIED';
      throw e;
    }
  }), /denied/);
  assert.equal(deniedCalls, 1, 'leer2 must not retry PERMISSION_DENIED');

  // carga: deduplication, onerror cleanup & retry
  const p1 = carga('assets/missing-script.js');
  const p2 = carga('assets/missing-script.js');
  assert.equal(p1, p2, 'concurrent carga() calls must deduplicate');
  await assert.rejects(() => p1, /red/);
  assert.equal(env.document.querySelector('script[src="assets/missing-script.js"]'), null, 'onerror must remove failed script');

  // carga: existing unloaded <script> waits for load event instead of resolving prematurely
  const manualScript = env.document.createElement('script');
  manualScript.setAttribute('src', 'https://example.com/slow.js');
  env.document.head.childNodes.push(manualScript);
  manualScript.parentNode = env.document.head;
  let resolved = false;
  const waitP = carga('https://example.com/slow.js').then(() => { resolved = true; });
  await Promise.resolve();
  assert.equal(resolved, false, 'carga must wait for existing unloaded script to fire load');
  manualScript.dispatchEvent(new env.window.Event('load'));
  await waitP;
  assert.equal(resolved, true);
});

// =====================================================================
// 4. assets/auth.js Tests
// =====================================================================
test('Tier 5 assets/auth.js: solicitar truncation/fallback, salir sessionStorage, entrar, conGoogle popup-blocked, completarSolicitud, solicitudes, decidir, motivo', async () => {
  const fbMock = createFirebaseMock({
    currentUser: { uid: 'anon0', isAnonymous: true, provider: 'anonymous' },
    dbData: {
      admins: { admin1: true },
      profes: {
        u1: { nombre: 'Uno', correo: 'u1@x.com', estado: 'pendiente', creado: 100 },
        u2: { nombre: 'Dos', correo: 'u2@x.com', estado: 'aprobado', creado: 200 }
      }
    }
  });

  // Add GoogleAuthProvider + signInWithPopup + signInWithRedirect + sendPasswordResetEmail
  let redirectCalled = false;
  fbMock.firebase.auth.GoogleAuthProvider = class { setCustomParameters() {} };
  const origInit = fbMock.firebase.initializeApp.bind(fbMock.firebase);
  fbMock.firebase.initializeApp = (cfg, name) => {
    const app = origInit(cfg, name);
    const auth = app.auth();
    auth.signInWithPopup = async () => {
      const e = new Error('blocked');
      e.code = 'auth/popup-blocked';
      throw e;
    };
    auth.signInWithRedirect = async () => { redirectCalled = true; };
    auth.sendPasswordResetEmail = async () => {};
    return app;
  };

  const env = createBrowserEnv({
    url: 'https://linguasacademy.github.io/entrar.html',
    firebaseMock: fbMock,
    preloadFirebase: true,
    localStorageData: { 'la-perfil': '{}', 'la-clave:a1': 'abc', keep: '1' },
    sessionStorageData: { 'la-clave:a1': 'abc', 'la-clave:b2': 'xyz', other: '2' }
  });
  env.runFile('assets/fb.js');
  env.runFile('assets/auth.js');
  const LA = env.window.LA;

  // solicitar(): 80-char truncation & idioma fallback
  const longName = '  ' + 'N'.repeat(100) + '  ';
  const createdUser = await LA.solicitar({
    nombre: longName,
    correo: '  PROFE@Example.COM ',
    clave: 'Password123!',
    idioma: '',
    mensaje: 'Hola'
  });
  const saved = fbMock.getRaw('profes/' + createdUser.uid);
  assert.equal(saved.nombre.length, 80);
  assert.equal(saved.correo, 'profe@example.com');
  assert.equal(saved.idioma, 'es');
  assert.equal(saved.estado, 'pendiente');

  // completarSolicitud()
  const comp = await LA.completarSolicitud({ nombre: 'Nombre Editado', idioma: 'en', mensaje: 'Bio' });
  assert.equal(comp.nombre, 'Nombre Editado');
  assert.equal(fbMock.getRaw('profes/' + createdUser.uid).idioma, 'en');

  // entrar()
  const p = await LA.entrar('u2@x.com', 'pass1234');
  assert.equal(p.correo, 'u2@x.com');

  // conGoogle() popup-blocked -> signInWithRedirect
  const gRes = await LA.conGoogle();
  assert.equal(gRes, null);
  assert.equal(redirectCalled, true);

  // solicitudes() & decidir()
  const list = await LA.solicitudes();
  assert.ok(list.length >= 3);
  assert.ok(list.indexOf(list.find(x => x.uid === 'u2')) < list.indexOf(list.find(x => x.uid === 'u1')), 'solicitudes should be sorted descending by creado');
  for (let i = 0; i < list.length - 1; i++) {
    assert.ok((list[i].creado || 0) >= (list[i + 1].creado || 0));
  }
  await LA.decidir('u1', 'aprobado');
  assert.equal(fbMock.getRaw('profes/u1/estado'), 'aprobado');

  // salir() clears la-clave:* from BOTH localStorage and sessionStorage
  await LA.salir();
  assert.equal(env.localStorage.getItem('la-perfil'), null);
  assert.equal(env.localStorage.getItem('la-clave:a1'), null);
  assert.equal(env.localStorage.getItem('keep'), '1');
  assert.equal(env.sessionStorage.getItem('la-clave:a1'), null);
  assert.equal(env.sessionStorage.getItem('la-clave:b2'), null);
  assert.equal(env.sessionStorage.getItem('other'), '2');

  // motivo()
  assert.match(LA.motivo({ code: 'auth/wrong-password' }), /no coinciden/);
  assert.match(LA.motivo({ code: 'auth/email-already-in-use' }), /Ya hay una solicitud/);
  assert.match(LA.motivo({ code: 'auth/weak-password' }), /8 caracteres/);
  assert.match(LA.motivo({ code: 'PERMISSION_DENIED' }), /No tienes permiso/);
  assert.match(LA.motivo({ message: 'red' }), /No hay conexión/);
  assert.match(LA.motivo({}), /Algo falló/);
});

// =====================================================================
// 5. assets/abrir.js Tests
// =====================================================================
test('Tier 5 assets/abrir.js: ?como=estudiante, nonexistent room, pending teacher, sin-archivo, nested script re-execution', async () => {
  // 5a. ?como=estudiante + nested <script> re-execution
  const boardHtml = '<!doctype html><html lang="es"><head><title>Tablero</title></head><body><div id="wrap"><script>window.__NESTED_RAN = (window.__NESTED_RAN || 0) + 1;</script></div></body></html>';
  const { bin, b64u } = await encryptPayload(boardHtml);

  let persistenceSet = null;
  const fbMock1 = createFirebaseMock({
    currentUser: { uid: 'profe1', isAnonymous: false, provider: 'password' },
    dbData: {
      salas: { s9999999: { dueno: 'profe1', clave: b64u } }
    }
  });
  const origInit1 = fbMock1.firebase.initializeApp.bind(fbMock1.firebase);
  fbMock1.firebase.initializeApp = (cfg, name) => {
    const app = origInit1(cfg, name);
    const auth = app.auth();
    const origSetP = auth.setPersistence.bind(auth);
    auth.setPersistence = async p => { persistenceSet = p; return origSetP(p); };
    return app;
  };

  const env1 = createBrowserEnv({
    url: 'https://linguasacademy.github.io/a1-esta-es-mi-familia.html?sala=s9999999&como=estudiante',
    firebaseMock: fbMock1,
    preloadFirebase: true,
    fetchHandler: async () => ({ ok: true, async arrayBuffer() { return bin.buffer; } })
  });
  env1.runFile('assets/fb.js');
  env1.runFile('assets/abrir.js');
  await flush(60);
  assert.ok(fbMock1.firebase.apps.some(a => a.name === 'vista-estudiante'), 'should create vista-estudiante app');
  assert.equal(persistenceSet, 'none', 'should set Persistence.NONE for ?como=estudiante');
  assert.equal(env1.window.__NESTED_RAN, 1, 'nested <script> inside #wrap must execute in pintar()');

  // 5b. Nonexistent/closed room message
  const fbMock2 = createFirebaseMock({ dbData: {} });
  const env2 = createBrowserEnv({
    url: 'https://linguasacademy.github.io/a1-esta-es-mi-familia.html?sala=noexiste99',
    firebaseMock: fbMock2,
    preloadFirebase: true,
    fetchHandler: async () => ({ ok: true, async arrayBuffer() { return bin.buffer; } })
  });
  env2.runFile('assets/fb.js');
  env2.runFile('assets/abrir.js');
  await flush(60);
  assert.match(env2.document.getElementById('caja').innerHTML, /Esta sala no existe o ya cerró/);

  // 5c. Pending teacher without ?sala=
  const fbMock3 = createFirebaseMock({
    currentUser: { uid: 'pend1', isAnonymous: false, provider: 'password' },
    enforceRules: true,
    rulesEvaluator: RtdbRulesEvaluator.fromRepo(REPO),
    dbData: {
      profes: { pend1: { nombre: 'Pend', correo: 'p@x.com', estado: 'pendiente' } },
      claves: { 'a1-esta-es-mi-familia': b64u }
    }
  });
  const env3 = createBrowserEnv({
    url: 'https://linguasacademy.github.io/a1-esta-es-mi-familia.html',
    firebaseMock: fbMock3,
    preloadFirebase: true,
    fetchHandler: async () => ({ ok: true, async arrayBuffer() { return bin.buffer; } })
  });
  env3.runFile('assets/fb.js');
  env3.runFile('assets/abrir.js');
  await flush(60);
  assert.match(env3.document.getElementById('caja').innerHTML, /todavía no tiene acceso/);

  // 5d. sin-archivo fetch error
  const fbMock4 = createFirebaseMock({
    currentUser: { uid: 'profe1', isAnonymous: false, provider: 'password' },
    dbData: { claves: { 'a1-esta-es-mi-familia': b64u } }
  });
  const env4 = createBrowserEnv({
    url: 'https://linguasacademy.github.io/a1-esta-es-mi-familia.html',
    firebaseMock: fbMock4,
    preloadFirebase: true,
    fetchHandler: async () => ({ ok: false, status: 404 })
  });
  env4.runFile('assets/fb.js');
  env4.runFile('assets/abrir.js');
  await flush(60);
  assert.match(env4.document.getElementById('caja').innerHTML, /No se pudo abrir el tablero/);
});

// =====================================================================
// 6. assets/site.js Tests
// =====================================================================
test('Tier 5 assets/site.js: Forma null guards & mobile nav toggle/Escape/matchMedia', () => {
  const html = `<!doctype html><html><head></head><body>
    <button class="menu-btn" aria-expanded="false">Menú</button>
    <div id="menu" hidden><a href="tableros.html">Catálogo</a></div>
  </body></html>`;
  let mmListener = null;
  const env = createBrowserEnv({ html });
  env.window.matchMedia = () => ({
    matches: false,
    addEventListener: (_ev, fn) => { mmListener = fn; }
  });
  env.runFile('assets/site.js');

  const Forma = env.window.Forma;
  assert.doesNotThrow(() => Forma.limpiar(null));
  assert.equal(Forma.enfocarPrimero(null), 0);
  assert.equal(Forma.correoValido(null), false);
  assert.equal(Forma.correoValido(123), false);
  assert.equal(Forma.correoValido('profe@linguas.org'), true);
  assert.equal(Forma.correoValido('invalido@'), false);

  const btn = env.document.querySelector('.menu-btn');
  const sheet = env.document.getElementById('menu');
  const proto = Object.getPrototypeOf(sheet);
  if (!proto.toggleAttribute) proto.toggleAttribute = function (n, f) { const si = f === undefined ? !this.hasAttribute(n) : !!f; if (si) this.setAttribute(n, ''); else this.removeAttribute(n); return si; };
  /* La hoja ya no se oculta con [hidden]: site.js la deja visible para el CSS (visibility) y marca data-abierto
     al abrirla, así se puede animar la salida. */
  const abierta = () => sheet.hasAttribute('data-abierto');
  assert.equal(sheet.hidden, false, 'site.js hands the sheet over to CSS');
  // Click without <span> inside .menu-btn must not throw
  btn.click();
  assert.equal(abierta(), true);
  assert.equal(btn.getAttribute('aria-expanded'), 'true');

  // Escape closes menu and focuses button
  const esc = new env.window.Event('keydown');
  esc.key = 'Escape';
  env.document.dispatchEvent(esc);
  assert.equal(abierta(), false);
  assert.equal(btn.focused, true);

  // Open again and close via matchMedia change
  btn.click();
  assert.equal(abierta(), true);
  mmListener({ matches: true });
  assert.equal(abierta(), false);
});

// =====================================================================
// 7. admin.html Tests
// =====================================================================
test('Tier 5 admin.html: entity-decoded <title lang="es">, fetch !res.ok aborts before RTDB write, auth/non-admin guards, pintar filter & decidir', async () => {
  const { html, script } = extractInlineScript('admin.html');

  // 7a. No user -> redirects to entrar.html?volver=admin.html
  const fbNoUser = createFirebaseMock({ currentUser: null });
  const envNoUser = createBrowserEnv({
    url: 'https://linguasacademy.github.io/admin.html',
    html,
    firebaseMock: fbNoUser,
    preloadFirebase: true
  });
  envNoUser.runFile('assets/site.js');
  envNoUser.runFile('assets/fb.js');
  envNoUser.runFile('assets/auth.js');
  envNoUser.runScript(script, 'admin-inline.js');
  await flush(40);
  assert.ok(envNoUser.navigations.some(n => n.type === 'replace' && n.url.includes('entrar.html?volver=admin.html')));

  // 7b. Non-admin user -> shows permission message
  const fbNonAdmin = createFirebaseMock({
    currentUser: { uid: 'profe1', isAnonymous: false, provider: 'password' },
    dbData: { profes: { profe1: { nombre: 'Ana', correo: 'a@b.c', estado: 'aprobado' } } }
  });
  const envNonAdmin = createBrowserEnv({
    url: 'https://linguasacademy.github.io/admin.html',
    html,
    firebaseMock: fbNonAdmin,
    preloadFirebase: true
  });
  envNonAdmin.runFile('assets/site.js');
  envNonAdmin.runFile('assets/fb.js');
  envNonAdmin.runFile('assets/auth.js');
  envNonAdmin.runScript(script, 'admin-inline.js');
  await flush(40);
  assert.match(envNonAdmin.document.querySelector('[data-aviso]').textContent, /solo para la administración/);

  // 7c. Admin user: pintar filter, decidir, fetch !res.ok abort, and entity-decoded <title lang="es">
  let fetchOk = false;
  const fbAdmin = createFirebaseMock({
    currentUser: { uid: 'admin1', isAnonymous: false, provider: 'password' },
    dbData: {
      admins: { admin1: true },
      profes: {
        s1: { nombre: 'Carlos Perez', correo: 'c@x.com', idioma: 'es', estado: 'pendiente', creado: 200 },
        s2: { nombre: 'Maria Lopez', correo: 'm@x.com', idioma: 'en', estado: 'aprobado', creado: 100 }
      }
    }
  });
  const tpl = fs.readFileSync(path.join(REPO, 'herramientas/cargador.html'), 'utf8');
  const envAdmin = createBrowserEnv({
    url: 'https://linguasacademy.github.io/admin.html',
    html,
    firebaseMock: fbAdmin,
    preloadFirebase: true,
    fetchHandler: async () => {
      if (!fetchOk) return { ok: false, status: 500, async text() { return ''; } };
      return { ok: true, async text() { return tpl; } };
    }
  });
  envAdmin.runFile('assets/site.js');
  envAdmin.runFile('assets/fb.js');
  envAdmin.runFile('assets/auth.js');
  envAdmin.runScript(script, 'admin-inline.js');
  await flush(50);

  // Filter & decidir
  assert.match(envAdmin.document.querySelector('[data-aviso]').textContent, /1 solicitud pendiente/);
  const aprobarBtn = envAdmin.document.querySelector('.acciones button');
  aprobarBtn.click();
  await flush(30);
  assert.equal(fbAdmin.getRaw('profes/s1/estado'), 'aprobado');

  // Switch filter to aprobado
  envAdmin.document.querySelector('[data-ver="aprobado"]').click();
  assert.equal(envAdmin.document.querySelectorAll('[data-lista] li').length, 2);

  // Submit board with fetch !res.ok -> must NOT write claves/a1-prueba
  const fp = envAdmin.document.getElementById('f-proteger');
  const boardBytes = new TextEncoder().encode('<!doctype html><html><head><title lang="es">Tom &amp; Jerry</title></head><body></body></html>');
  fp.elements.archivo.files = [{
    name: 'a1-prueba.html',
    async arrayBuffer() { return boardBytes.buffer; }
  }];
  const submitEv1 = new envAdmin.window.Event('submit', { cancelable: true });
  fp.dispatchEvent(submitEv1);
  await flush(40);
  assert.equal(fbAdmin.getRaw('claves/a1-prueba'), null, 'claves/a1-prueba must NOT be written when fetch fails');

  // Now fetch succeeds -> entity-decoded <title lang="es"> must not double-escape
  fetchOk = true;
  const submitEv2 = new envAdmin.window.Event('submit', { cancelable: true });
  fp.dispatchEvent(submitEv2);
  await flush(40);
  assert.ok(fbAdmin.getRaw('claves/a1-prueba'), 'claves/a1-prueba must be written when fetch succeeds');
  const htmlBlobs = [];
  for (const blob of envAdmin.createdBlobs.values()) {
    if (blob.type === 'text/html') htmlBlobs.push(await blob.text());
  }
  assert.equal(htmlBlobs.length, 1);
  assert.ok(htmlBlobs[0].includes('<title>Tom &amp; Jerry</title>'), 'entity-encoded title must not double-escape');
  assert.ok(!htmlBlobs[0].includes('&amp;amp;'));
});

// =====================================================================
// 8. tableros.html Tests
// =====================================================================
test('Tier 5 tableros.html: catalog rendering, tabs & arrow keys, multi-filter, data-limpiar, empty state (es/en/pt), history.replaceState', async () => {
  const { html, script } = extractInlineScript('tableros.html');
  const fbMock = createFirebaseMock({
    currentUser: { uid: 'profe1', isAnonymous: false, provider: 'password' },
    dbData: {
      profes: { profe1: { nombre: 'Ana García', correo: 'ana@x.com', estado: 'aprobado' } }
    }
  });
  class MockFormData {
    constructor(form) {
      this._entries = [];
      for (const el of form.querySelectorAll('input, select, textarea')) {
        if (!el.name) continue;
        if (el.getAttribute('type') === 'checkbox' && !el.checked) continue;
        if (el.getAttribute('type') === 'radio' && !(el.checked !== undefined ? el.checked : el.hasAttribute('checked'))) continue;
        this._entries.push([el.name, el.value || el.getAttribute('value') || '']);
      }
    }
    [Symbol.iterator]() { return this._entries[Symbol.iterator](); }
  }
  /* El catálogo usa MutationObserver, new Image() y un grupo de radio para el nivel: se imitan lo justo */
  const preparar = e => {
    e.window.MutationObserver = class { observe() {} disconnect() {} };
    e.window.Image = class { constructor() { return e.document.createElement('img'); } };
    const fm = e.document.querySelector('[data-filtros]');
    const base = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(Object.getPrototypeOf(fm)), 'elements')
      || Object.getOwnPropertyDescriptor(Object.getPrototypeOf(fm), 'elements');
    Object.defineProperty(fm, 'elements', { configurable: true, get() {
      const p = base.get.call(fm);
      const radios = [...fm.querySelectorAll('input')].filter(r => r.getAttribute('type') === 'radio' && r.name === 'nivel');
      p.nivel = {
        get value() { const r = radios.find(x => (x.checked !== undefined ? x.checked : x.hasAttribute('checked'))); return r ? r.getAttribute('value') : ''; },
        set value(v) { radios.forEach(x => { x.checked = x.getAttribute('value') === String(v); }); }
      };
      return p;
    } });
    const r0 = fm.reset ? fm.reset.bind(fm) : null;
    fm.reset = () => { if (r0) r0(); fm.querySelectorAll('input').forEach(x => { const ty = x.getAttribute('type'); if (ty === 'radio' || ty === 'checkbox') x.checked = x.hasAttribute('checked'); }); };
  };
  const env = createBrowserEnv({
    url: 'https://linguasacademy.github.io/tableros.html',
    html,
    firebaseMock: fbMock,
    preloadFirebase: true
  });
  const elProto = Object.getPrototypeOf(env.document.createElement('div'));
  if (!elProto.append) {
    elProto.append = function (...nodes) {
      for (const n of nodes) this.appendChild(typeof n === 'string' ? this.ownerDocument.createTextNode(n) : n);
    };
  }
  if (!elProto.insertAdjacentHTML) {
    elProto.insertAdjacentHTML = function (_pos, str) {
      const tmp = this.ownerDocument.createElement('div');
      tmp.innerHTML = str;
      while (tmp.firstChild) this.appendChild(tmp.firstChild);
    };
  }
  env.window.FormData = MockFormData;
  preparar(env);
  const tplVacio1 = env.document.getElementById('tpl-vacio');
  if (tplVacio1 && !tplVacio1.content) tplVacio1.content = tplVacio1;
  env.runFile('assets/catalogo.js');
  env.runFile('assets/site.js');
  env.runFile('assets/fb.js');
  env.runFile('assets/auth.js');
  env.runScript(script, 'tableros-inline.js');
  await flush(50);

  // Catalog rendered
  const cardsAll = env.document.querySelectorAll('[data-lista] article.t');
  assert.ok(cardsAll.length > 0, 'catalog boards should render');

  // Multi-filter: nivel=A1 + vivo=true + texto
  const form = env.document.querySelector('[data-filtros]');
  form.elements.nivel.value = 'A1';
  form.elements.vivo.checked = true;
  form.dispatchEvent(new env.window.Event('input'));
  const filtered = env.document.querySelectorAll('[data-lista] article.t');
  assert.ok(filtered.length > 0 && filtered.length < cardsAll.length);
  assert.ok(env.window.location.search.includes('nivel=A1'));
  assert.ok(env.window.location.search.includes('vivo=1'));
  assert.equal(env.document.querySelector('[data-limpiar]').hidden, false);

  // data-limpiar resets filters
  env.document.querySelector('[data-limpiar]').click();
  assert.equal(env.document.querySelectorAll('[data-lista] article.t').length, cardsAll.length);
  assert.equal(env.document.querySelector('[data-limpiar]').hidden, true);

  // Tab switching via ArrowRight (es -> en)
  const tabEs = env.document.getElementById('i-es');
  const arrowRight = new env.window.Event('keydown', { cancelable: true });
  arrowRight.key = 'ArrowRight';
  tabEs.dispatchEvent(arrowRight);
  assert.equal(env.document.getElementById('i-en').getAttribute('aria-selected'), 'true');
  assert.ok(env.window.location.search.includes('idioma=en'));

  // Empty state for 'es' when CATALOGO has no 'es' boards
  const envEmptyEs = createBrowserEnv({
    url: 'https://linguasacademy.github.io/tableros.html',
    html,
    firebaseMock: fbMock,
    preloadFirebase: true
  });
  envEmptyEs.window.FormData = MockFormData;
  preparar(envEmptyEs);
  const tplVacio2 = envEmptyEs.document.getElementById('tpl-vacio');
  if (tplVacio2 && !tplVacio2.content) tplVacio2.content = tplVacio2;
  envEmptyEs.window.CATALOGO = [];
  envEmptyEs.runFile('assets/site.js');
  envEmptyEs.runFile('assets/fb.js');
  envEmptyEs.runFile('assets/auth.js');
  envEmptyEs.runScript(script, 'tableros-inline.js');
  await flush(50);
  assert.match(envEmptyEs.document.querySelector('[data-resumen]').textContent, /Todavía no hay tableros de español/);
});
