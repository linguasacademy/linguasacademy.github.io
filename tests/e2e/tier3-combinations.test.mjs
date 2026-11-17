/**
 * Tier 3: Cross-Feature Combinations
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { webcrypto } from 'node:crypto';
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

function flushMicrotasks(ms = 35) {
  return new Promise(r => setTimeout(r, ms));
}

test('Combination: assets/fb.js + assets/auth.js + assets/abrir.js + vivo.js in shared vm context', async () => {
  assert.ok(fs.existsSync(path.join(REPO, 'assets', 'fb.js')), 'assets/fb.js must exist for shared module combination');

  const boardHtml = '<!doctype html><html><head><title>Combo Board</title></head><body><div id="app">Tablero</div><script src="vivo.js"></script></body></html>';
  const { bin, b64u } = await encryptBoardHtml(boardHtml);

  const fbMock = createFirebaseMock({
    currentUser: { uid: 'profe1', email: 'profe@x.com', isAnonymous: false, provider: 'password' },
    dbData: {
      profes: { profe1: { nombre: 'Ana', correo: 'profe@x.com', estado: 'aprobado' } },
      claves: { 'a1-esta-es-mi-familia': b64u },
      salas: { sala1234: { dueno: 'profe1' } }
    }
  });

  const env = createBrowserEnv({
    repoRoot: REPO,
    url: 'https://linguasacademy.github.io/a1-esta-es-mi-familia.html?sala=sala1234',
    html: fs.readFileSync(path.join(REPO, 'herramientas', 'cargador.html'), 'utf8'),
    firebaseMock: fbMock,
    fetchHandler: async () => ({
      ok: true,
      status: 200,
      async arrayBuffer() { return bin.buffer.slice(bin.byteOffset, bin.byteOffset + bin.byteLength); }
    })
  });

  env.runFile('assets/fb.js');
  assert.ok(env.window.LA_FB, 'window.LA_FB must be initialized');

  env.runFile('assets/auth.js');
  assert.ok(env.window.LA, 'window.LA must be initialized using LA_FB');
  const st = await env.window.LA.estado();
  assert.equal(st.perfil.estado, 'aprobado');

  env.runFile('assets/abrir.js');
  await flushMicrotasks(80);

  assert.equal(env.document.documentWriteCalls.length, 0, 'abrir.js must use DOMParser, not document.write');
  assert.ok(env.document.getElementById('app'), 'decrypted board body must be mounted');
  assert.ok(env.window.claude && typeof env.window.claude.use === 'function', 'vivo.js must be re-executed by abrir.js and expose window.claude.use');

  const userCap = await env.window.claude.use('user');
  assert.equal(await userCap.canEdit(), true, 'teacher must have edit capability in room');
});

test('Combination: vivo.js standalone fallback works when window.LA_FB is absent', async () => {
  const fbMock = createFirebaseMock({
    currentUser: { uid: 'est1', isAnonymous: true, provider: 'anonymous' },
    dbData: { salas: { sala1234: { dueno: 'profe1' } } }
  });

  const env = createBrowserEnv({
    repoRoot: REPO,
    url: 'https://linguasacademy.github.io/a1-esta-es-mi-familia.html?sala=sala1234',
    firebaseMock: fbMock
  });

  // Intentionally do NOT load assets/fb.js
  assert.equal(env.window.LA_FB, undefined);
  env.runFile('vivo.js');
  await flushMicrotasks(30);

  const userCap = await env.window.claude.use('user');
  assert.equal(await userCap.canEdit(), false, 'student fallback without LA_FB must still connect and see canEdit=false');
  const dbCap = await env.window.claude.use('db');
  assert.ok(dbCap && typeof dbCap.doc === 'function', 'db capability must work in standalone fallback');
});

test('Combination: All 49 root board HTMLs load assets/fb.js before assets/abrir.js', () => {
  const catalogText = fs.readFileSync(path.join(REPO, 'assets', 'catalogo.js'), 'utf8');
  const files = [...catalogText.matchAll(/"archivo"\s*:\s*"([^"]+)"/g)].map(m => m[1]);
  assert.equal(files.length, 49, 'catalogo.js must have 49 boards');

  for (const f of files) {
    const html = fs.readFileSync(path.join(REPO, f), 'utf8');
    const fbIdx = html.indexOf('assets/fb.js');
    const abrirIdx = html.indexOf('assets/abrir.js');
    assert.ok(fbIdx !== -1, `${f} must include assets/fb.js`);
    assert.ok(abrirIdx !== -1, `${f} must include assets/abrir.js`);
    assert.ok(fbIdx < abrirIdx, `${f} must load assets/fb.js before assets/abrir.js`);
  }
});
