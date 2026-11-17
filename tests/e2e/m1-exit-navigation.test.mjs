/**
 * M1: Board Exit Navigation (← Catálogo, Cerrar sala, student hiding) & Catalog Filter Persistence
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { webcrypto } from 'node:crypto';
import { createBrowserEnv, createFirebaseMock } from './helpers/dom-env.mjs';

const REPO = path.resolve(import.meta.dirname, '..', '..');

function extractInlineScript(relPath) {
  const html = fs.readFileSync(path.join(REPO, relPath), 'utf8');
  const matches = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)];
  const script = matches.map(m => m[1]).join('\n');
  return { html, script };
}

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

function flush(ms = 40) {
  return new Promise(r => setTimeout(r, ms));
}

/* El catálogo usa grupos de radio (nivel) y MutationObserver (repinta al cambiar <html lang>):
   el DOM simulado no los trae, así que se imitan aquí lo justo. */
function marcado(el) { return el.checked !== undefined ? !!el.checked : el.hasAttribute('checked'); }
function patchRadiosYObservador(env) {
  if (!env.window.Image) env.window.Image = class { constructor() { return env.document.createElement('img'); } };
  if (!env.window.MutationObserver) env.window.MutationObserver = class { observe() {} disconnect() {} takeRecords() { return []; } };
  const form = env.document.querySelector('[data-filtros]');
  if (!form) return;
  const base = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(form), 'elements')
    || Object.getOwnPropertyDescriptor(Object.getPrototypeOf(Object.getPrototypeOf(form)), 'elements');
  Object.defineProperty(form, 'elements', {
    configurable: true,
    get() {
      const p = base.get.call(form);
      const radios = [...form.querySelectorAll('input')].filter(el => el.getAttribute('type') === 'radio' && el.name);
      for (const name of new Set(radios.map(r => r.name))) {
        const grupo = radios.filter(r => r.name === name);
        p[name] = {
          get value() { const r = grupo.find(marcado); return r ? r.value || r.getAttribute('value') || '' : ''; },
          set value(v) { grupo.forEach(r => { r.checked = (r.getAttribute('value') || '') === String(v); }); }
        };
      }
      return p;
    }
  });
  const reset0 = form.reset ? form.reset.bind(form) : null;
  form.reset = () => {
    if (reset0) reset0();
    [...form.querySelectorAll('input')].forEach(el => {
      const t = el.getAttribute('type');
      if (t === 'radio' || t === 'checkbox') el.checked = el.hasAttribute('checked');
    });
  };
}

function patchTablerosDom(env) {
  patchRadiosYObservador(env);
  class MockFormData {
    constructor(form) {
      this._entries = [];
      for (const el of form.querySelectorAll('input, select, textarea')) {
        if (!el.name) continue;
        if (el.getAttribute('type') === 'checkbox' && !el.checked) continue;
        if (el.getAttribute('type') === 'radio' && !marcado(el)) continue;
        this._entries.push([el.name, el.value || el.getAttribute('value') || '']);
      }
    }
    [Symbol.iterator]() { return this._entries[Symbol.iterator](); }
  }
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
  const tplVacio = env.document.getElementById('tpl-vacio');
  if (tplVacio && !tplVacio.content) tplVacio.content = tplVacio;
}

test('M1: Teacher on non-vivo board gets #vivoChip with ← Catálogo pointing to saved la-catalogo', async () => {
  const boardHtml = '<!doctype html><html><head><title>Non-Vivo</title></head><body><div id="lado">Menu</div><div id="app">Tablero</div></body></html>';
  const { bin, b64u } = await encryptBoardHtml(boardHtml);

  const fbMock = createFirebaseMock({
    currentUser: { uid: 'profe1', email: 'profe@x.com', isAnonymous: false, provider: 'password' },
    dbData: {
      profes: { profe1: { nombre: 'Ana', correo: 'profe@x.com', estado: 'aprobado' } },
      claves: { 'a1-el-menu-de-chispa': b64u }
    }
  });

  const env = createBrowserEnv({
    repoRoot: REPO,
    url: 'https://linguasacademy.github.io/a1-el-menu-de-chispa.html',
    html: fs.readFileSync(path.join(REPO, 'herramientas', 'cargador.html'), 'utf8'),
    firebaseMock: fbMock,
    sessionStorageData: { 'la-catalogo': 'tableros.html?nivel=A1&vivo=1' },
    fetchHandler: async () => ({
      ok: true,
      status: 200,
      async arrayBuffer() { return bin.buffer.slice(bin.byteOffset, bin.byteOffset + bin.byteLength); }
    })
  });

  env.runFile('assets/fb.js');
  env.runFile('assets/abrir.js');
  await flush(60);

  assert.equal(env.window.LA_PROFE, true);
  assert.equal(env.window.LA_CATALOGO, 'tableros.html?nivel=A1&vivo=1');
  assert.equal(env.document.body.classList.contains('con-sala'), true);

  const chips = env.document.querySelectorAll('#vivoChip');
  assert.equal(chips.length, 1, 'exactly one #vivoChip must exist');
  const volver = env.document.querySelector('#vivoChip a.volver');
  assert.ok(volver, 'a.volver must be injected on non-vivo board');
  assert.equal(volver.getAttribute('href'), 'tableros.html?nivel=A1&vivo=1');
  assert.equal(volver.textContent, '← Catálogo');
  assert.ok(env.document.getElementById('vivoStyle'), '#vivoStyle must be injected for non-vivo board');
});

test('M1: Unsafe la-catalogo value in sessionStorage falls back to tableros.html', async () => {
  const boardHtml = '<!doctype html><html><head><title>Safe</title></head><body><div id="app">Tablero</div></body></html>';
  const { bin, b64u } = await encryptBoardHtml(boardHtml);

  const fbMock = createFirebaseMock({
    currentUser: { uid: 'profe1', email: 'profe@x.com', isAnonymous: false, provider: 'password' },
    dbData: { claves: { 'a1-el-menu-de-chispa': b64u } }
  });

  const env = createBrowserEnv({
    repoRoot: REPO,
    url: 'https://linguasacademy.github.io/a1-el-menu-de-chispa.html',
    html: fs.readFileSync(path.join(REPO, 'herramientas', 'cargador.html'), 'utf8'),
    firebaseMock: fbMock,
    sessionStorageData: { 'la-catalogo': 'javascript:alert(1)' },
    fetchHandler: async () => ({
      ok: true,
      status: 200,
      async arrayBuffer() { return bin.buffer.slice(bin.byteOffset, bin.byteOffset + bin.byteLength); }
    })
  });

  env.runFile('assets/fb.js');
  env.runFile('assets/abrir.js');
  await flush(60);

  assert.equal(env.window.LA_CATALOGO, 'tableros.html');
  assert.equal(env.document.querySelector('#vivoChip a.volver').getAttribute('href'), 'tableros.html');
});

test('M1: Teacher on vivo board (no room) reuses #vivoChip, preserves ← Catálogo across plegar() and expand', async () => {
  const boardHtml = '<!doctype html><html><head><title>Vivo</title></head><body><div id="lado">Menu</div><script src="vivo.js"></script></body></html>';
  const { bin, b64u } = await encryptBoardHtml(boardHtml);

  const fbMock = createFirebaseMock({
    currentUser: { uid: 'profe1', email: 'profe@x.com', isAnonymous: false, provider: 'password' },
    dbData: {
      profes: { profe1: { nombre: 'Ana', correo: 'profe@x.com', estado: 'aprobado' } },
      claves: { 'a1-esta-es-mi-familia': b64u }
    }
  });

  const env = createBrowserEnv({
    repoRoot: REPO,
    url: 'https://linguasacademy.github.io/a1-esta-es-mi-familia.html',
    html: fs.readFileSync(path.join(REPO, 'herramientas', 'cargador.html'), 'utf8'),
    firebaseMock: fbMock,
    sessionStorageData: { 'la-catalogo': 'tableros.html?idioma=en&nivel=B1' },
    fetchHandler: async () => ({
      ok: true,
      status: 200,
      async arrayBuffer() { return bin.buffer.slice(bin.byteOffset, bin.byteOffset + bin.byteLength); }
    })
  });

  env.runFile('assets/fb.js');
  env.runFile('assets/abrir.js');
  await flush(80);

  assert.equal(env.document.querySelectorAll('#vivoChip').length, 1);
  assert.equal(env.document.querySelectorAll('#vivoStyle').length, 1);
  assert.ok(env.document.querySelector('#vivoChip button.abre'), 'Abrir sala en vivo button must be present');
  let volver = env.document.querySelector('#vivoChip a.volver');
  assert.ok(volver);
  assert.equal(volver.getAttribute('href'), 'tableros.html?idioma=en&nivel=B1');

  // Collapse via .x (plegar)
  env.document.querySelector('#vivoChip button.x').click();
  volver = env.document.querySelector('#vivoChip a.volver');
  assert.ok(volver, '← Catálogo must remain visible when collapsed via plegar()');
  assert.equal(volver.getAttribute('href'), 'tableros.html?idioma=en&nivel=B1');
  assert.equal(env.document.querySelector('#vivoChip button.abre'), null, 'room controls should be collapsed');

  // Re-expand via .x
  env.document.querySelector('#vivoChip button.x').click();
  await flush(40);
  assert.ok(env.document.querySelector('#vivoChip a.volver'), '← Catálogo must still be present after re-expanding');
  assert.ok(env.document.querySelector('#vivoChip button.abre'), 'Abrir sala en vivo must reappear after re-expanding');
});

test('M1: Teacher in live room (?sala=sala1234) sees ← Catálogo and Cerrar sala (not Salir)', async () => {
  const boardHtml = '<!doctype html><html><head><title>Vivo Sala</title></head><body><div id="lado">Menu</div><script src="vivo.js"></script></body></html>';
  const { bin, b64u } = await encryptBoardHtml(boardHtml);

  const fbMock = createFirebaseMock({
    currentUser: { uid: 'profe1', email: 'profe@x.com', isAnonymous: false, provider: 'password' },
    dbData: {
      profes: { profe1: { nombre: 'Ana', correo: 'profe@x.com', estado: 'aprobado' } },
      claves: { 'a1-esta-es-mi-familia': b64u },
      salas: { sala1234: { dueno: 'profe1', clave: b64u } }
    }
  });

  const env = createBrowserEnv({
    repoRoot: REPO,
    url: 'https://linguasacademy.github.io/a1-esta-es-mi-familia.html?sala=sala1234',
    html: fs.readFileSync(path.join(REPO, 'herramientas', 'cargador.html'), 'utf8'),
    firebaseMock: fbMock,
    sessionStorageData: { 'la-catalogo': 'tableros.html?texto=familia' },
    fetchHandler: async () => ({
      ok: true,
      status: 200,
      async arrayBuffer() { return bin.buffer.slice(bin.byteOffset, bin.byteOffset + bin.byteLength); }
    })
  });

  env.runFile('assets/fb.js');
  env.runFile('assets/abrir.js');
  await flush(80);

  const volver = env.document.querySelector('#vivoChip a.volver');
  assert.ok(volver, '← Catálogo must be present in live room');
  assert.equal(volver.getAttribute('href'), 'tableros.html?texto=familia');

  const saleBtn = env.document.querySelector('#vivoChip button.sale');
  assert.ok(saleBtn, '.sale button must be present');
  assert.equal(saleBtn.textContent, 'Cerrar sala');
  assert.equal(saleBtn.getAttribute('title'), 'Termina la clase: el estudiante sale y el enlace deja de funcionar');
});

test('M1: Anonymous student (?sala=sala1234) and ?como=estudiante hide #vivoChip and a.volver', async () => {
  const boardHtml = '<!doctype html><html><head><title>Student View</title></head><body><div id="lado">Menu</div><script src="vivo.js"></script></body></html>';
  const { bin, b64u } = await encryptBoardHtml(boardHtml);

  for (const query of ['?sala=sala1234', '?sala=sala1234&como=estudiante']) {
    const fbMock = createFirebaseMock({
      currentUser: query.includes('como=estudiante')
        ? { uid: 'profe1', email: 'profe@x.com', isAnonymous: false, provider: 'password' }
        : { uid: 'est1', isAnonymous: true, provider: 'anonymous' },
      dbData: {
        profes: { profe1: { nombre: 'Ana', correo: 'profe@x.com', estado: 'aprobado' } },
        claves: { 'a1-esta-es-mi-familia': b64u },
        salas: { sala1234: { dueno: 'profe1', clave: b64u } }
      }
    });

    const env = createBrowserEnv({
      repoRoot: REPO,
      url: 'https://linguasacademy.github.io/a1-esta-es-mi-familia.html' + query,
      html: fs.readFileSync(path.join(REPO, 'herramientas', 'cargador.html'), 'utf8'),
      firebaseMock: fbMock,
      sessionStorageData: { 'la-catalogo': 'tableros.html?nivel=A1' },
      fetchHandler: async () => ({
        ok: true,
        status: 200,
        async arrayBuffer() { return bin.buffer.slice(bin.byteOffset, bin.byteOffset + bin.byteLength); }
      })
    });

    env.runFile('assets/fb.js');
    env.runFile('assets/abrir.js');
    await flush(80);

    assert.equal(env.window.LA_PROFE, false, `LA_PROFE must be false for ${query}`);
    assert.equal(env.document.getElementById('vivoChip'), null, `#vivoChip must be removed for ${query}`);
    assert.equal(env.document.querySelector('a.volver'), null, `a.volver must not exist for ${query}`);
    assert.equal(env.document.body.classList.contains('con-sala'), false, `con-sala must be removed for ${query}`);
  }
});

test('M1: tableros.html persists filters to sessionStorage la-catalogo and restores on empty location.search', async () => {
  const { html, script } = extractInlineScript('tableros.html');
  const fbMock = createFirebaseMock({
    currentUser: { uid: 'profe1', isAnonymous: false, provider: 'password' },
    dbData: {
      profes: { profe1: { nombre: 'Ana García', correo: 'ana@x.com', estado: 'aprobado' } }
    }
  });

  // 1. Save & reset
  const env1 = createBrowserEnv({
    url: 'https://linguasacademy.github.io/tableros.html',
    html,
    firebaseMock: fbMock,
    preloadFirebase: true
  });
  patchTablerosDom(env1);
  env1.runFile('assets/catalogo.js');
  env1.runFile('assets/site.js');
  env1.runFile('assets/fb.js');
  env1.runFile('assets/auth.js');
  env1.runScript(script, 'tableros-inline.js');
  await flush(40);

  assert.equal(env1.window.sessionStorage.getItem('la-catalogo'), 'tableros.html');

  const form1 = env1.document.querySelector('[data-filtros]');
  const origReset = form1.reset.bind(form1);
  form1.reset = () => {
    origReset();
    for (const el of form1.querySelectorAll('input[type="checkbox"]')) el.checked = false;
  };
  form1.elements.nivel.value = 'A1';
  form1.elements.consignas.value = 'en';
  form1.elements.publico.value = 'ninos';
  form1.elements.texto.value = 'familia';
  form1.elements.vivo.checked = true;
  form1.dispatchEvent(new env1.window.Event('input'));

  const saved = env1.window.sessionStorage.getItem('la-catalogo');
  assert.ok(saved.startsWith('tableros.html?'));
  assert.ok(saved.includes('nivel=A1'));
  assert.ok(saved.includes('consignas=en'));
  assert.ok(saved.includes('publico=ninos'));
  assert.ok(saved.includes('texto=familia'));
  assert.ok(saved.includes('vivo=1'));

  env1.document.querySelector('[data-limpiar]').click();
  assert.equal(env1.window.sessionStorage.getItem('la-catalogo'), 'tableros.html');

  env1.document.getElementById('i-en').click();
  assert.equal(env1.window.sessionStorage.getItem('la-catalogo'), 'tableros.html?idioma=en');

  // 2. Restore on empty location.search
  const env2 = createBrowserEnv({
    url: 'https://linguasacademy.github.io/tableros.html',
    html,
    firebaseMock: fbMock,
    preloadFirebase: true,
    sessionStorageData: {
      'la-catalogo': 'tableros.html?idioma=en&nivel=A2&consignas=en&publico=adultos&texto=viaje&vivo=1'
    }
  });
  patchTablerosDom(env2);
  env2.runFile('assets/catalogo.js');
  env2.runFile('assets/site.js');
  env2.runFile('assets/fb.js');
  env2.runFile('assets/auth.js');
  env2.runScript(script, 'tableros-inline.js');
  await flush(40);

  const form2 = env2.document.querySelector('[data-filtros]');
  assert.equal(env2.document.getElementById('i-en').getAttribute('aria-selected'), 'true');
  assert.equal(form2.elements.nivel.value, 'A2');
  assert.equal(form2.elements.consignas.value, 'en');
  assert.equal(form2.elements.publico.value, 'adultos');
  assert.equal(form2.elements.texto.value, 'viaje');
  assert.equal(form2.elements.vivo.checked, true);
  assert.ok(env2.window.location.search.includes('idioma=en'));
  assert.ok(env2.window.location.search.includes('nivel=A2'));

  // 3. Explicit location.search takes precedence over sessionStorage
  const env3 = createBrowserEnv({
    url: 'https://linguasacademy.github.io/tableros.html?nivel=B1',
    html,
    firebaseMock: fbMock,
    preloadFirebase: true,
    sessionStorageData: { 'la-catalogo': 'tableros.html?nivel=A1' }
  });
  patchTablerosDom(env3);
  env3.runFile('assets/catalogo.js');
  env3.runFile('assets/site.js');
  env3.runFile('assets/fb.js');
  env3.runFile('assets/auth.js');
  env3.runScript(script, 'tableros-inline.js');
  await flush(40);

  assert.equal(env3.document.querySelector('[data-filtros]').elements.nivel.value, 'B1');
  assert.equal(env3.window.sessionStorage.getItem('la-catalogo'), 'tableros.html?nivel=B1');
});
