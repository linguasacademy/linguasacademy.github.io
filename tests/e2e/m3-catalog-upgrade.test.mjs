/**
 * M3: tableros.html Preply-Inspired Catalog & Card Upgrade
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createBrowserEnv, createFirebaseMock } from './helpers/dom-env.mjs';

const REPO = path.resolve(import.meta.dirname, '..', '..');

function extractInlineScript(relPath) {
  const html = fs.readFileSync(path.join(REPO, relPath), 'utf8');
  const matches = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)];
  const script = matches.map(m => m[1]).join('\n');
  return { html, script };
}

function flush(ms = 30) {
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
  const { document, window } = env;
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
  window.FormData = MockFormData;
  const tpl = document.getElementById('tpl-vacio');
  if (tpl && !tpl.content) {
    tpl.content = {
      cloneNode() {
        const w = document.createElement('div');
        w.innerHTML = tpl.innerHTML;
        return w;
      }
    };
  }
  const proto = Object.getPrototypeOf(document.body);
  if (!proto.append) {
    proto.append = function (...nodes) {
      for (const n of nodes) {
        if (typeof n === 'string') this.appendChild(document.createTextNode(n));
        else if (n) this.appendChild(n);
      }
    };
  }
  if (!proto.insertAdjacentHTML) {
    proto.insertAdjacentHTML = function (pos, html) {
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      const kids = [...tmp.childNodes];
      if (pos === 'beforeend') {
        for (const k of kids) this.appendChild(k);
      }
    };
  }
  if (!window.Event) {
    window.Event = class Event {
      constructor(type) { this.type = type; }
    };
  }
}

async function bootTableros(url = 'https://linguasacademy.github.io/tableros.html') {
  const { html, script } = extractInlineScript('tableros.html');
  const fbMock = createFirebaseMock({
    currentUser: { uid: 'profe1', isAnonymous: false, provider: 'password' },
    dbData: {
      profes: { profe1: { nombre: 'Ana García', correo: 'ana@x.com', estado: 'aprobado' } }
    }
  });
  const env = createBrowserEnv({
    url,
    html,
    firebaseMock: fbMock,
    preloadFirebase: true
  });
  patchTablerosDom(env);
  env.runFile('assets/catalogo.js');
  env.runFile('assets/site.js');
  env.runFile('assets/fb.js');
  env.runFile('assets/auth.js');
  env.runScript(script, 'tableros-inline.js');
  await flush(40);
  return env;
}

/* Catálogo actual (rediseño con fotos y suscripción): cada tablero es un <article class="t"> con foto de Unsplash,
   sello de nivel, etiquetas y acciones. Con sesión de profe aprobada: «Abrir»; sin sesión: vista previa y «Desbloquear».
   Los niveles van siempre de A1 a C2; los que aún no tienen tableros se ven como «pronto». */
async function bootPublico(url = 'https://linguasacademy.github.io/tableros.html') {
  const { html, script } = extractInlineScript('tableros.html');
  const fbMock = createFirebaseMock({ currentUser: null, dbData: {} });
  const env = createBrowserEnv({ url, html, firebaseMock: fbMock, preloadFirebase: true });
  patchTablerosDom(env);
  env.runFile('assets/catalogo.js');
  env.runFile('assets/site.js');
  env.runFile('assets/fb.js');
  env.runFile('assets/auth.js');
  env.runScript(script, 'tableros-inline.js');
  await flush(40);
  return env;
}
const tarjetas = document => [...document.querySelectorAll('[data-lista] article.t')];
const archivoDe = card => card.getAttribute('aria-labelledby').replace(/^t-/, '') + '.html';

test('M3: Language tabs render 4:3 SVG flags, CEFR range, counts, chevron, and preserve tab/arrow navigation', async () => {
  const env = await bootTableros();
  const { document, window } = env;

  const expectedCounts = { es: '49 tableros', en: 'En preparación', pt: 'En preparación' };
  const expectedRango = { es: 'A1–C2 (C1 y C2, pronto)', en: 'A1–C2', pt: 'A1–C2' };
  for (const lang of ['es', 'en', 'pt']) {
    const tab = document.getElementById('i-' + lang);
    assert.ok(tab, `missing #i-${lang}`);
    assert.equal(tab.getAttribute('role'), 'tab');
    assert.equal(tab.dataset.idioma, lang);
    assert.equal(tab.dataset.lang, lang);

    const svg = tab.querySelector('svg.flag');
    assert.ok(svg, `#i-${lang} must contain <svg class="flag">`);
    assert.equal(svg.getAttribute('viewBox'), '0 0 32 24');
    assert.equal(tab.querySelectorAll('img').length, 0, `#i-${lang} should not use <img> for flags`);

    const rango = tab.querySelector('.idioma__rango');
    assert.equal(rango && rango.textContent, expectedRango[lang], `#i-${lang} should show the A1–C2 range`);

    const cuenta = tab.querySelector(`[data-cuenta-idioma="${lang}"]`);
    assert.equal(cuenta.textContent, expectedCounts[lang]);

    const chev = tab.querySelector('.idioma__chev');
    assert.ok(chev && chev.textContent.trim() === '›', `#i-${lang} should render chevron`);
  }

  // ArrowRight from #i-es moves to #i-en and persists la-catalogo
  const esTab = document.getElementById('i-es');
  const enTab = document.getElementById('i-en');
  esTab.dispatchEvent({ type: 'keydown', key: 'ArrowRight', preventDefault() {} });
  assert.equal(enTab.getAttribute('aria-selected'), 'true');
  assert.equal(esTab.getAttribute('aria-selected'), 'false');
  assert.equal(window.sessionStorage.getItem('la-catalogo'), 'tableros.html?idioma=en');

  // ArrowLeft returns to #i-es
  enTab.dispatchEvent({ type: 'keydown', key: 'ArrowLeft', preventDefault() {} });
  assert.equal(esTab.getAttribute('aria-selected'), 'true');
  assert.equal(window.sessionStorage.getItem('la-catalogo'), 'tableros.html');
});

test('M3: All 49 cards and .nivel sections carry matching data-nivel CEFR attributes (C1 and C2 shown as «pronto»)', async () => {
  const env = await bootTableros();
  const { document, window } = env;

  const catalog = window.CATALOGO;
  assert.equal(catalog.length, 49);

  const sections = [...document.querySelectorAll('[data-lista] section.nivel')];
  assert.deepEqual(sections.map(s => s.dataset.nivel), ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

  for (const section of sections) {
    const nivel = section.dataset.nivel;
    const sectionCards = [...section.querySelectorAll('article.t')];
    if (nivel === 'C1' || nivel === 'C2') {
      assert.equal(sectionCards.length, 0, `${nivel} has no boards yet`);
      assert.ok(section.querySelector('.pronto'), `${nivel} must show the «pronto» state`);
      continue;
    }
    assert.ok(sectionCards.length > 0);
    for (const card of sectionCards) assert.equal(card.dataset.nivel, nivel);
  }

  assert.equal(tarjetas(document).length, 49);
});

test('M3: Board cards render level seal, photo, 4:3 consignas flag, publico icon and «Abrir» for an approved teacher', async () => {
  const env = await bootTableros();
  const { document, window } = env;

  const byFile = new Map(window.CATALOGO.map(item => [item.archivo, item]));
  const cards = tarjetas(document);
  assert.equal(cards.length, 49);

  for (const card of cards) {
    const archivo = archivoDe(card);
    const meta = byFile.get(archivo);
    assert.ok(meta, `unknown card: ${archivo}`);

    // Level seal (visually hidden «Nivel » + the level)
    const sello = card.querySelector('.t__sello');
    assert.ok(sello && sello.textContent.trim().endsWith(meta.nivel));

    // Live badge iff t.vivo
    assert.equal(Boolean(card.querySelector('.tag--live')), Boolean(meta.vivo));

    // Photo iff t.foto (Unsplash, with srcset); otherwise the fallback cover
    const portada = card.querySelector('.t__portada');
    const img = portada.querySelector('img');
    if (meta.foto) {
      assert.ok(img, `expected photo on ${archivo}`);
      assert.ok(String(img.src).startsWith('https://images.unsplash.com/'), `photo must come from Unsplash: ${img.src}`);
      assert.equal(img.alt, meta.fotoAlt || '');
    } else {
      assert.ok(portada.classList.contains('t__portada--sin'));
    }

    // Title & description
    assert.equal(card.querySelector('h3').textContent, meta.titulo);
    assert.equal(card.querySelector('.t__desc').textContent, meta.desc);

    // Consignas tag with 4:3 .flag--sm SVG
    const flagTag = card.querySelector('.tag--flag');
    assert.ok(flagTag, `missing .tag--flag on ${archivo}`);
    const flagSvg = flagTag.querySelector('svg.flag.flag--sm');
    assert.ok(flagSvg, `missing svg.flag.flag--sm on ${archivo}`);
    assert.equal(flagSvg.getAttribute('viewBox'), '0 0 32 24');
    assert.ok(flagTag.textContent.includes('Consignas en '));

    // Publico tag with icon
    const icoTag = card.querySelector('.tag--ico');
    assert.ok(icoTag && icoTag.querySelector('svg.tag__ico'), `missing publico icon on ${archivo}`);
    assert.equal(icoTag.textContent.trim(), meta.publico === 'ninos' ? 'Niños' : 'Adultos');

    // Optional prueba tag
    assert.equal(Boolean(card.querySelector('.tag--prueba')), Boolean(meta.prueba));

    // Action: approved teacher opens the board
    const abrir = card.querySelector('a.t__accion--abrir');
    assert.ok(abrir && abrir.getAttribute('href') === archivo && abrir.textContent.includes('Abrir'), `missing «Abrir» on ${archivo}`);
    assert.equal(card.querySelectorAll('.t__accion--sec').length, 0, 'no «Desbloquear» for an approved teacher');
  }
});

test('M3: Public catalog (no session) offers the preview or «Vista previa pronto» and «Desbloquear» to the subscription', async () => {
  const env = await bootPublico();
  const { document, window } = env;
  const vistas = new Set(window.VISTAS || []);
  const cards = tarjetas(document);
  assert.equal(cards.length, 49);
  for (const card of cards) {
    const nombre = archivoDe(card).replace(/\.html$/, '');
    assert.equal(card.querySelectorAll(`a[href="${nombre}.html"]`).length, 0, 'the full board is not linked without a subscription');
    if (vistas.has(nombre)) assert.ok(card.querySelector(`a.t__accion--abrir[href="vista/${nombre}.html"]`));
    else assert.ok(card.querySelector('.t__accion--pronto').textContent.includes('Vista previa pronto'));
    const des = card.querySelector('a.t__accion--sec');
    assert.ok(des && des.getAttribute('href') === 'suscripcion.html' && des.textContent.includes('Desbloquear'));
  }
  assert.equal(document.querySelector('[data-solo-publico]').hidden, false, 'public mode shows the subscription link');
});

test('M3: Filtering (sinTildes, nivel, consignas, publico, vivo) & sessionStorage persistence work with upgraded cards', async () => {
  const env = await bootTableros();
  const { document, window } = env;

  const form = document.querySelector('[data-filtros]');

  // Search without accent matches "¿A cómo está la piña?" via sinTildes
  form.elements.texto.value = 'como esta la pina';
  form.elements.nivel.value = 'A2';
  form.elements.consignas.value = 'pt';
  form.dispatchEvent(new window.Event('input'));

  const filtered = tarjetas(document);
  assert.equal(filtered.length, 1);
  assert.equal(archivoDe(filtered[0]), 'a2-a-como-esta-la-pina.html');
  assert.equal(document.querySelector('[data-resumen]').textContent, '1 tablero');
  assert.ok(window.location.search.includes('texto=como+esta+la+pina'));
  assert.ok(window.location.search.includes('nivel=A2'));
  assert.ok(window.sessionStorage.getItem('la-catalogo').includes('texto=como+esta+la+pina'));

  // Clear filters restores all 49 cards
  document.querySelector('[data-limpiar]').click();
  assert.equal(tarjetas(document).length, 49);
  assert.equal(window.sessionStorage.getItem('la-catalogo'), 'tableros.html');
});

test('M3: CSS tokens in assets/site.css and scoped rules in tableros.html are properly configured', () => {
  const siteCss = fs.readFileSync(path.join(REPO, 'assets/site.css'), 'utf8');
  const tablerosHtml = fs.readFileSync(path.join(REPO, 'tableros.html'), 'utf8');

  for (const lvl of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']) {
    assert.ok(siteCss.includes(`[data-nivel="${lvl}"]`), `missing [data-nivel="${lvl}"] in assets/site.css`);
    assert.ok(siteCss.includes(`--lvl-${lvl.toLowerCase()}:`), `missing --lvl-${lvl.toLowerCase()} in assets/site.css`);
  }
  assert.ok(siteCss.includes('.flag {'), 'missing .flag in assets/site.css');
  assert.ok(siteCss.includes('.flag--sm {'), 'missing .flag--sm in assets/site.css');
  assert.ok(!siteCss.includes('.idiomas'), '.idiomas layout rules must stay scoped to tableros.html');

  assert.ok(tablerosHtml.includes('placeholder="Ej. restaurante, pasado, familia, subjuntivo…"'));
  for (const cls of ['.t__portada', '.t__sello', '.t__acciones', '.t__accion--abrir', '.t__accion--pronto']) {
    assert.ok(tablerosHtml.includes(cls), `missing ${cls} in tableros.html`);
  }
});
