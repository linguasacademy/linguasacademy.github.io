/**
 * M2: index.html Preply-Inspired Visual & Imagery Upgrade E2E Tests
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
  const script = matches.map(m => m[1]).join(';\n'); // «;» evita que dos scripts se peguen (ASI)
  return { html, script };
}

function flush(ms = 40) {
  return new Promise(r => setTimeout(r, ms));
}

/* Portada actual: fotos de Unsplash enlazadas (no copiadas), sin tira de métricas ni números de tableros,
   «Mira una clase por dentro» con vistas previas y cierre hacia la suscripción. */
test('M2: Asset & reference integrity in index.html and assets/site.css (srcset, video, CSS url())', () => {
  const indexHtml = fs.readFileSync(path.join(REPO, 'index.html'), 'utf8');
  const siteCss = fs.readFileSync(path.join(REPO, 'assets', 'site.css'), 'utf8');

  // Deleted legacy filenames must NOT be recreated
  for (const legacy of ['en-linea-600.jpg', 'en-linea-1100.jpg', 'en-linea-v.jpg', 'explicar-600.jpg', 'explicar-1100.jpg']) {
    assert.equal(fs.existsSync(path.join(REPO, 'assets', 'img', legacy)), false, `Legacy file must remain deleted: ${legacy}`);
  }

  // Remote photos only from the Unsplash CDN, over https; local ones must exist
  const comprobar = (url, que) => {
    assert.ok(!url.startsWith('http://'), `Insecure http:// ${que}: ${url}`);
    if (url.startsWith('https://')) {
      assert.ok(url.startsWith('https://images.unsplash.com/'), `Remote ${que} must come from images.unsplash.com: ${url}`);
    } else if (!url.startsWith('data:')) {
      assert.equal(fs.existsSync(path.join(REPO, url.split(/[?#]/)[0])), true, `Missing local ${que}: ${url}`);
    }
  };
  const imgTags = [...indexHtml.matchAll(/<img\b[^>]*>/gi)].map(m => m[0]);
  assert.ok(imgTags.length >= 9, `Expected >= 9 images in index.html, got ${imgTags.length}`);
  for (const tag of imgTags) {
    const src = tag.match(/\bsrc="([^"]+)"/i)?.[1];
    assert.ok(src, `<img> missing src: ${tag}`);
    comprobar(src.replace(/&amp;/g, '&'), 'img src');

    const srcset = tag.match(/\bsrcset="([^"]+)"/i)?.[1];
    if (srcset) {
      for (const candidate of srcset.split(',').map(s => s.trim().split(/\s+/)[0]).filter(Boolean)) comprobar(candidate.replace(/&amp;/g, '&'), 'srcset');
    }

    const altMatch = tag.match(/\balt="([^"]*)"/i);
    assert.ok(altMatch !== null, `<img> missing alt attribute: ${tag}`);
    if (altMatch[1] === '') assert.ok(src.includes('logo.svg'), `Non-logo <img> has empty alt: ${tag}`);
    assert.ok(/\bwidth="\d+"/i.test(tag), `<img> missing width: ${tag}`);
    assert.ok(/\bheight="\d+"/i.test(tag), `<img> missing height: ${tag}`);
  }

  // Every Unsplash photo carries its credit link
  assert.match(indexHtml, /Unsplash<\/p>/);

  // Check <video> src and poster
  const videoMatch = indexHtml.match(/<video\b[^>]*>/i);
  assert.ok(videoMatch, 'Expected <video> element in index.html');
  const vSrc = videoMatch[0].match(/\bsrc="([^"]+)"/i)?.[1];
  const vPoster = videoMatch[0].match(/\bposter="([^"]+)"/i)?.[1];
  assert.equal(fs.existsSync(path.join(REPO, vSrc)), true, `Missing video src: ${vSrc}`);
  assert.equal(fs.existsSync(path.join(REPO, vPoster)), true, `Missing video poster: ${vPoster}`);

  // Check CSS url(...) in index.html and assets/site.css
  for (const [label, css] of [['index.html', indexHtml], ['assets/site.css', siteCss]]) {
    for (const m of css.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi)) {
      const urlVal = m[2];
      assert.ok(!urlVal.startsWith('http://'), `Insecure http:// CSS url() in ${label}: ${urlVal}`);
      if (!urlVal.startsWith('data:') && !urlVal.startsWith('https://')) {
        const baseDir = label === 'assets/site.css' ? path.join(REPO, 'assets') : REPO;
        assert.equal(fs.existsSync(path.join(baseDir, urlVal.split(/[?#]/)[0])), true, `Missing CSS url() target in ${label}: ${urlVal}`);
      }
    }
  }

  // CSS collision guard: assets/site.css must define .flag and must NOT define .idiomas
  assert.match(siteCss, /\.flag\s*\{/, 'assets/site.css should define .flag primitive');
  assert.equal(/\.idiomas\s*\{/.test(siteCss), false, 'assets/site.css must NOT define .idiomas layout rules');
});

test('M2: UI sections in index.html (hero composite with two doors, no board counts, no repeated sections or photos, #muestras, #clase 1-2-3)', () => {
  const { html } = extractInlineScript('index.html');
  const env = createBrowserEnv({ url: 'https://linguasacademy.github.io/index.html', html });
  const doc = env.document;

  // Script order invariant: assets/fb.js before assets/auth.js
  const fbIdx = html.indexOf('assets/fb.js');
  const authIdx = html.indexOf('assets/auth.js');
  assert.ok(fbIdx > -1 && authIdx > fbIdx, 'assets/fb.js must appear before assets/auth.js');

  // Hero composite: two board photos, teacher and student photos, one live chip and the sticky note
  const mesa = doc.querySelector('.hero .mesa');
  assert.ok(mesa, 'Hero .mesa container missing');
  for (const cls of ['.mesa__board--front', '.mesa__board--back', '.mesa__foto--profe', '.mesa__foto--estudiante']) {
    const img = mesa.querySelector(cls);
    assert.ok(img && /^https:\/\/images\.unsplash\.com\//.test(img.getAttribute('src')), `${cls} must be an Unsplash photo`);
    assert.ok(img.getAttribute('alt'), `${cls} needs alt text`);
  }
  assert.ok(mesa.querySelector('.nota--1'), 'Editorial sticky note .nota--1 missing');
  assert.equal(mesa.querySelectorAll('.chip-ui').length, 1, 'Expected 1 focused floating UI chip in .mesa');
  assert.match(mesa.textContent, /En vivo con tu estudiante/);
  assert.equal(doc.querySelector('.hero a.btn--primary').getAttribute('href'), '#muestras');

  // The metrics strip (with board counts) was removed on purpose: the home page shows no number of boards
  const mainChildren = Array.from(doc.querySelector('main').children);
  assert.ok(mainChildren[0].classList.contains('hero'), 'First main section should be .hero');
  assert.equal(doc.querySelectorAll('.metricas').length, 0, 'The metrics strip must stay removed');
  assert.doesNotMatch(doc.querySelector('main').textContent, /\b\d+\s+tableros\b/, 'No board counts on the home page');
  assert.doesNotMatch(html, /\bgratis\b/i, 'Nothing is offered as «gratis»');

  // Two doors in the hero: teachers (sample lesson) and students (estudiantes.html); also in the header and the sheet
  const puertas = doc.querySelectorAll('.hero .puertas .puerta');
  assert.equal(puertas.length, 2, 'Expected two doors in the hero');
  assert.equal(puertas[0].querySelector('a.btn--primary').getAttribute('href'), '#muestras');
  assert.equal(puertas[1].querySelector('a.btn').getAttribute('href'), 'estudiantes.html');
  assert.ok(doc.querySelector('.nav a[href="estudiantes.html"]'), 'Header links to the student door');
  assert.ok(doc.querySelector('#menu a[href="estudiantes.html"]'), 'Mobile sheet links to the student door');

  // #muestras: one section of boards-as-places (the old «lugares» showcase and language cards were merged into it)
  const muestras = doc.querySelectorAll('#muestras .muestra[data-vista]');
  assert.equal(muestras.length, 4, 'Expected 4 preview cards in #muestras');
  for (const m of muestras) {
    const link = m.querySelector('[data-vista-link]');
    assert.equal(link.getAttribute('data-vista-link'), 'vista/' + m.dataset.vista + '.html');
    assert.ok(m.querySelector('[data-vista-pronto]'));
    assert.ok(m.querySelector('.muestra__lugar.mano'), 'Each preview card names its place in handwriting');
    assert.equal(m.querySelector('.muestra__lock'), null, 'No per-card subscription link: the closing section has the only one');
  }
  assert.equal(doc.querySelectorAll('.lugar').length, 0, 'The «lugares» showcase repeated the previews: it stays merged');
  assert.equal(doc.querySelectorAll('.idioma-card').length, 0, 'Language cards repeated the catalog tabs');
  assert.equal(doc.querySelector('#muestras a[href="tableros.html"]') !== null, true, 'One link to the full catalog');

  // No Unsplash photo is used twice on the home page
  const fotos = [...doc.querySelectorAll('main img')].map(i => i.getAttribute('src').split('?')[0]);
  assert.equal(new Set(fotos).size, fotos.length, 'Each photo appears once on the home page');

  // #clase: 3 numbered tactile cards (1, 2, 3) with .momento__ui
  const momentos = doc.querySelectorAll('#clase .momento');
  assert.equal(momentos.length, 3, 'Expected 3 .momento cards in #clase');
  momentos.forEach((card, idx) => {
    const num = card.querySelector('.momento__num');
    assert.ok(num, `Card ${idx + 1} missing .momento__num`);
    assert.equal(num.textContent.trim(), String(idx + 1));
    assert.ok(card.querySelector('.momento__ui'), `Card ${idx + 1} missing .momento__ui`);
  });

  // FAQ keeps only questions no other section answers
  assert.equal(doc.querySelectorAll('#preguntas details').length, 4);

  // Closing call to action goes to the subscription page
  assert.equal(doc.querySelector('[data-cuenta-cierre]').getAttribute('href'), 'suscripcion.html');
});

test('M2: Interactive & Auth behavior in index.html (menu, video toggle, [data-ver] fallback, LA.estado())', async () => {
  const { html, script } = extractInlineScript('index.html');
  const fb = createFirebaseMock({
    currentUser: { uid: 'profe-1', email: 'profe@example.com', isAnonymous: false },
    dbData: { profes: { 'profe-1': { estado: 'aprobado', nombre: 'Profe' } } },
  });

  const env = createBrowserEnv({
    repoRoot: REPO,
    url: 'https://linguasacademy.github.io/index.html',
    html,
    firebaseMock: fb,
  });

  // Remove IntersectionObserver to test fallback marking [data-ver] as .visto
  delete env.window.IntersectionObserver;
  // window.addEventListener('DOMContentLoaded', …) del script de la portada: se delega en document
  const proto = Object.getPrototypeOf(env.document.createElement('div'));
  if (!proto.toggleAttribute) proto.toggleAttribute = function (n, f) { const si = f === undefined ? !this.hasAttribute(n) : !!f; if (si) this.setAttribute(n, ''); else this.removeAttribute(n); return si; };
  if (!env.window.addEventListener) env.window.addEventListener = (tipo, fn) => env.document.addEventListener(tipo, fn);

  // Patch HTMLMediaElement-like methods on <video>
  const vid = env.document.querySelector('[data-video]');
  vid.paused = true;
  vid.play = async () => {
    vid.paused = false;
    vid.dispatchEvent(new env.window.Event('play'));
  };
  vid.pause = () => {
    vid.paused = true;
    vid.dispatchEvent(new env.window.Event('pause'));
  };

  env.runFile('assets/site.js');
  env.runFile('assets/fb.js');
  env.runFile('assets/auth.js');
  env.runScript(script, 'index.html:inline');
  env.triggerDOMContentLoaded();

  await flush(60);

  // 1. [data-ver] fallback marks elements .visto
  const vistos = env.document.querySelectorAll('[data-ver]');
  assert.ok(vistos.length > 0);
  for (const el of vistos) {
    assert.equal(el.classList.contains('visto'), true, 'Expected [data-ver] element to get .visto without IntersectionObserver');
  }

  // 2. Approved teacher: «Entrar» (menu and sheet) and the closing button lead to the catalog
  const shortLinks = env.document.querySelectorAll('[data-cuenta-link]');
  assert.equal(shortLinks.length, 2);
  for (const a of shortLinks) {
    assert.equal(a.getAttribute('href'), 'tableros.html');
    assert.equal(a.textContent, 'Mis tableros');
  }
  const cierre = env.document.querySelector('[data-cuenta-cierre]');
  assert.equal(cierre.getAttribute('href'), 'tableros.html');
  assert.match(cierre.textContent, /Ir a mis tableros/);

  // 3. [data-video-btn] toggles play/pause and aria-label
  const vBtn = env.document.querySelector('[data-video-btn]');
  assert.equal(vBtn.getAttribute('aria-label'), 'Reproducir el video');
  vBtn.click();
  await flush(10);
  assert.equal(vid.paused, false);
  assert.equal(vBtn.textContent, 'Pausar');
  assert.equal(vBtn.getAttribute('aria-label'), 'Pausar el video');
  vBtn.click();
  await flush(10);
  assert.equal(vid.paused, true);
  assert.equal(vBtn.textContent, 'Reproducir');
  assert.equal(vBtn.getAttribute('aria-label'), 'Reproducir el video');

  // 4. .menu-btn opens the sheet (data-abierto, background inert) and Escape closes it
  //    (the sheet is no longer [hidden]: CSS hides it with visibility so it can animate out)
  const menuBtn = env.document.querySelector('.menu-btn');
  const menu = env.document.querySelector('#menu');
  const main = env.document.querySelector('main');
  assert.equal(menu.hasAttribute('data-abierto'), false);
  menuBtn.click();
  assert.equal(menu.hasAttribute('data-abierto'), true);
  assert.equal(menuBtn.getAttribute('aria-expanded'), 'true');
  assert.equal(main.inert, true);
  const esc = new env.window.Event('keydown', { bubbles: true });
  esc.key = 'Escape';
  env.document.dispatchEvent(esc);
  assert.equal(menu.hasAttribute('data-abierto'), false);
  assert.equal(menuBtn.getAttribute('aria-expanded'), 'false');
  assert.equal(main.inert, false);
});
