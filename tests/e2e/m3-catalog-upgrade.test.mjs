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

function patchTablerosDom(env) {
  const { document, window } = env;
  class MockFormData {
    constructor(form) {
      this._entries = [];
      for (const el of form.querySelectorAll('input, select, textarea')) {
        if (!el.name) continue;
        if (el.getAttribute('type') === 'checkbox' && !el.checked) continue;
        this._entries.push([el.name, el.value || '']);
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

test('M3: Language tabs render 4:3 SVG flags, CEFR range, counts, chevron, and preserve tab/arrow navigation', async () => {
  const env = await bootTableros();
  const { document, window } = env;

  const expectedCounts = { es: '49 tableros', en: 'En preparación', pt: 'En preparación' };
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
    assert.ok(rango && rango.textContent.includes('A1–B2'), `#i-${lang} should show CEFR range`);

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

test('M3: All 49 cards and .nivel sections carry matching data-nivel CEFR attributes', async () => {
  const env = await bootTableros();
  const { document, window } = env;

  const catalog = window.CATALOGO;
  assert.equal(catalog.length, 49);

  const sections = [...document.querySelectorAll('[data-lista] section.nivel')];
  assert.deepEqual(
    sections.map(s => s.dataset.nivel),
    ['A1', 'A2', 'B1', 'B2']
  );

  for (const section of sections) {
    const nivel = section.dataset.nivel;
    const sectionCards = [...section.querySelectorAll('a.t')];
    assert.ok(sectionCards.length > 0);
    for (const card of sectionCards) {
      assert.equal(card.dataset.nivel, nivel);
    }
  }

  const allCards = [...document.querySelectorAll('[data-lista] a.t')];
  assert.equal(allCards.length, 49);
});

test('M3: Board cards render CEFR pill, 5-thumb allowlist only, 4:3 consignas flag, publico icon, and Abrir tablero footer', async () => {
  const env = await bootTableros();
  const { document, window } = env;

  const expectedThumbs = new Set([
    'a1-monstruos-gigantes.html',
    'a2-me-lo-llevo.html',
    'a2-a-como-esta-la-pina.html',
    'b1-que-harias-si.html',
    'b2-radio-chisme.html'
  ]);

  const byFile = new Map(window.CATALOGO.map(item => [item.archivo, item]));
  const cards = [...document.querySelectorAll('[data-lista] a.t')];
  assert.equal(cards.length, 49);

  let thumbCount = 0;
  for (const card of cards) {
    const href = card.getAttribute('href');
    const meta = byFile.get(href);
    assert.ok(meta, `unknown card href: ${href}`);

    // CEFR pill
    const pill = card.querySelector('.t__nivel');
    assert.ok(pill);
    assert.equal(pill.textContent, meta.nivel);

    // Live badge iff t.vivo
    const live = card.querySelector('.tag--live');
    assert.equal(Boolean(live), Boolean(meta.vivo));

    // Thumbnail ONLY for the 5 boards with -960.jpg on disk
    const imgs = card.querySelectorAll('.t__thumb img');
    if (expectedThumbs.has(href)) {
      assert.equal(imgs.length, 1, `expected thumbnail on ${href}`);
      const src = imgs[0].getAttribute('src');
      assert.ok(src.endsWith('-960.jpg'), `thumbnail must use -960.jpg: ${src}`);
      assert.ok(fs.existsSync(path.join(REPO, src)), `missing thumbnail on disk: ${src}`);
      thumbCount++;
    } else {
      assert.equal(imgs.length, 0, `unexpected thumbnail on ${href}`);
    }

    // Title & description
    assert.equal(card.querySelector('h3').textContent, meta.titulo);
    assert.equal(card.querySelector('p').textContent, meta.desc);

    // Consignas tag with 4:3 .flag--sm SVG
    const flagTag = card.querySelector('.tag--flag');
    assert.ok(flagTag, `missing .tag--flag on ${href}`);
    const flagSvg = flagTag.querySelector('svg.flag.flag--sm');
    assert.ok(flagSvg, `missing svg.flag.flag--sm on ${href}`);
    assert.equal(flagSvg.getAttribute('viewBox'), '0 0 32 24');
    assert.ok(flagTag.textContent.includes('Consignas en '));

    // Publico tag with 14x14 icon
    const icoTag = card.querySelector('.tag--ico');
    assert.ok(icoTag, `missing .tag--ico on ${href}`);
    const icoSvg = icoTag.querySelector('svg.tag__ico');
    assert.ok(icoSvg, `missing svg.tag__ico on ${href}`);
    assert.equal(icoTag.textContent.trim(), meta.publico === 'ninos' ? 'Niños' : 'Adultos');

    // Optional prueba tag
    const pruebaTag = card.querySelector('.tag--prueba');
    assert.equal(Boolean(pruebaTag), Boolean(meta.prueba));

    // Footer CTA
    const foot = card.querySelector('.t__foot');
    assert.ok(foot && foot.textContent.includes('Abrir tablero'));
  }

  assert.equal(thumbCount, 5);
});

test('M3: Filtering (sinTildes, nivel, consignas, publico, vivo) & sessionStorage persistence work with upgraded cards', async () => {
  const env = await bootTableros();
  const { document, window } = env;

  const form = document.querySelector('[data-filtros]');
  const origReset = form.reset.bind(form);
  form.reset = () => {
    origReset();
    for (const el of form.querySelectorAll('input[type="checkbox"]')) el.checked = false;
  };

  // Search without accent matches "¿A cómo está la piña?" via sinTildes
  form.elements.texto.value = 'como esta la pina';
  form.elements.nivel.value = 'A2';
  form.elements.consignas.value = 'pt';
  form.dispatchEvent(new window.Event('input'));

  const filtered = [...document.querySelectorAll('[data-lista] a.t')];
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].getAttribute('href'), 'a2-a-como-esta-la-pina.html');
  assert.equal(document.querySelector('[data-resumen]').textContent, '1 tablero');
  assert.ok(window.location.search.includes('texto=como+esta+la+pina'));
  assert.ok(window.sessionStorage.getItem('la-catalogo').includes('texto=como+esta+la+pina'));

  // Clear filters restores all 49 cards
  document.querySelector('[data-limpiar]').click();
  assert.equal(document.querySelectorAll('[data-lista] a.t').length, 49);
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
  assert.ok(tablerosHtml.includes('.t__foot'));
  assert.ok(tablerosHtml.includes('.t__nivel'));
});
