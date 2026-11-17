/**
 * Tier 4: Real-World Application Scenarios
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { webcrypto } from 'node:crypto';
import { RtdbRulesEvaluator } from './helpers/rtdb-rules.mjs';
import { createBrowserEnv, createFirebaseMock, createFirebaseStore } from './helpers/dom-env.mjs';

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

function flushMicrotasks(ms = 40) {
  return new Promise(r => setTimeout(r, ms));
}

test('Scenario: Full Teacher-to-Student Live Classroom E2E flow with shared RTDB & rules enforced', async () => {
  assert.ok(fs.existsSync(path.join(REPO, 'assets', 'fb.js')), 'assets/fb.js must exist for full scenario');

  const rules = RtdbRulesEvaluator.fromRepo(REPO);
  const boardHtml = '<!doctype html><html lang="es"><head><title>Clase en Vivo</title></head><body class="tablero"><main id="board">Clase</main><script src="vivo.js"></script></body></html>';
  const { bin, b64u } = await encryptBoardHtml(boardHtml);

  const sharedStore = createFirebaseStore({
    profes: { profe1: { nombre: 'Profe Ana', correo: 'ana@linguas.com', estado: 'aprobado', idioma: 'es', creado: 1700000000 } },
    claves: { 'a1-esta-es-mi-familia': b64u }
  });

  // 1. Teacher creates room sala9999 in shared RTDB (rules enforced) and opens board with ?sala=sala9999
  const teacherFb = createFirebaseMock({
    store: sharedStore,
    currentUser: { uid: 'profe1', email: 'ana@linguas.com', isAnonymous: false, provider: 'password' },
    rulesEvaluator: rules,
    enforceRules: true
  });
  const tApp = teacherFb.firebase.initializeApp({}, '[DEFAULT]');
  await tApp.database().ref('salas/sala9999/dueno').set('profe1');
  await tApp.database().ref('salas/sala9999/clave').set(b64u);

  const teacherEnv = createBrowserEnv({
    repoRoot: REPO,
    url: 'https://linguasacademy.github.io/a1-esta-es-mi-familia.html?sala=sala9999',
    html: fs.readFileSync(path.join(REPO, 'herramientas', 'cargador.html'), 'utf8'),
    firebaseMock: teacherFb,
    preloadFirebase: true,
    fetchHandler: async () => ({
      ok: true, status: 200,
      async arrayBuffer() { return bin.buffer.slice(bin.byteOffset, bin.byteOffset + bin.byteLength); }
    })
  });

  teacherEnv.runFile('assets/fb.js');
  teacherEnv.runFile('assets/abrir.js');
  await flushMicrotasks(80);

  assert.equal(teacherEnv.document.documentWriteCalls.length, 0, 'teacher board load must not use document.write');
  assert.equal(teacherEnv.localStorage.getItem('la-clave:a1-esta-es-mi-familia'), null, 'teacher key must not be in localStorage');
  assert.ok(teacherEnv.document.body.classList.contains('tablero'), 'body attributes from parsed board must be preserved');
  assert.ok(teacherEnv.window.claude && typeof teacherEnv.window.claude.use === 'function', 'vivo.js must be active');

  const tUserCap = await teacherEnv.window.claude.use('user');
  assert.equal(await tUserCap.canEdit(), true, 'teacher must have edit capability');
  const tDbCap = await teacherEnv.window.claude.use('db');
  const tRoomCap = await teacherEnv.window.claude.use('room');

  const teacherReceivedEvents = [];
  const unsubTeacherEv = tRoomCap.on('respuesta', ev => teacherReceivedEvents.push(ev));

  // 2. Student connects to the exact same sharedStore with separate anonymous auth
  const studentFb = createFirebaseMock({
    store: sharedStore,
    currentUser: null,
    rulesEvaluator: rules,
    enforceRules: true
  });

  const studentEnv = createBrowserEnv({
    repoRoot: REPO,
    url: 'https://linguasacademy.github.io/a1-esta-es-mi-familia.html?sala=sala9999',
    html: fs.readFileSync(path.join(REPO, 'herramientas', 'cargador.html'), 'utf8'),
    firebaseMock: studentFb,
    fetchHandler: async () => ({
      ok: true, status: 200,
      async arrayBuffer() { return bin.buffer.slice(bin.byteOffset, bin.byteOffset + bin.byteLength); }
    })
  });

  studentEnv.runFile('assets/fb.js');
  studentEnv.runFile('assets/abrir.js');
  await flushMicrotasks(80);

  assert.ok(studentEnv.document.getElementById('board'), 'student must see decrypted board');
  const sUserCap = await studentEnv.window.claude.use('user');
  assert.equal(await sUserCap.canEdit(), false, 'student cannot edit');

  const sDbCap = await studentEnv.window.claude.use('db');
  const sRoomCap = await studentEnv.window.claude.use('room');

  // Unauthorized write to nonexistent room must fail
  const studentAnonUid = studentFb.firebase.apps[0].auth().currentUser.uid;
  await assert.rejects(
    () => studentFb.firebase.apps[0].database().ref('salas/nonexistent/pres/' + studentAnonUid).set({ j: '{}', t: 1 }),
    /PERMISSION_DENIED/,
    'writing presence to nonexistent room must be denied by database.rules.json'
  );

  // 3. Student listens via onSnapshot & onPeers; teacher writes board state
  const snapshots = [];
  const unsubSnap = sDbCap.doc('estado/p1').onSnapshot(snap => {
    if (snap.exists) snapshots.push(JSON.parse(JSON.stringify(snap.data())));
  });
  const peerUpdates = [];
  const unsubPeers = sRoomCap.onPeers(ch => peerUpdates.push(ch.peers.length));

  await tDbCap.doc('estado/p1').set({ paso: 3 });
  await flushMicrotasks(40);

  assert.deepEqual(snapshots[snapshots.length - 1], { paso: 3 }, 'student onSnapshot must receive teacher write');
  const getSnap = await sDbCap.doc('estado/p1').get();
  assert.deepEqual(JSON.parse(JSON.stringify(getSnap.data())), { paso: 3 }, 'student get() must match');

  // 4. Student updates presence & emits event; teacher receives it
  await sRoomCap.presence({ listo: true });
  await sRoomCap.emit('respuesta', { opcion: 'B' });
  await flushMicrotasks(40);

  assert.ok(peerUpdates.some(count => count >= 1), 'student onPeers must receive presence updates');
  assert.equal(teacherReceivedEvents.length, 1, 'teacher room.on("respuesta") must receive student event');
  assert.deepEqual(JSON.parse(JSON.stringify(teacherReceivedEvents[0].data)), { opcion: 'B' });

  unsubSnap();
  unsubPeers();
  unsubTeacherEv();
});

test('Scenario: Full repository & GH Pages & CI verification passes', () => {
  const out = execFileSync('python3', [path.join(REPO, 'herramientas', 'verificar.py')], {
    cwd: REPO,
    encoding: 'utf8'
  });
  assert.ok(out.includes('Verificación completada sin errores.'), 'verificar.py must complete without errors');
  assert.ok(fs.existsSync(path.join(REPO, '.nojekyll')), '.nojekyll must exist');
  assert.ok(fs.existsSync(path.join(REPO, '404.html')), '404.html must exist');
});
