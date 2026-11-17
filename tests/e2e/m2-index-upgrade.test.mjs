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
  const script = matches.map(m => m[1]).join('\n');
  return { html, script };
}

function flush(ms = 40) {
  return new Promise(r => setTimeout(r, ms));
}

test('M2: Asset & reference integrity in index.html and assets/site.css (srcset, video, CSS url())', () => {
  const indexHtml = fs.readFileSync(path.join(REPO, 'index.html'), 'utf8');
  const siteCss = fs.readFileSync(path.join(REPO, 'assets', 'site.css'), 'utf8');

  // Deleted legacy filenames must NOT be recreated
  for (const legacy of ['en-linea-600.jpg', 'en-linea-1100.jpg', 'en-linea-v.jpg', 'explicar-600.jpg', 'explicar-1100.jpg']) {
    assert.equal(fs.existsSync(path.join(REPO, 'assets', 'img', legacy)), false, `Legacy file must remain deleted: ${legacy}`);
  }

  // New human photos must exist
  for (const photo of ['hero-profe-600.jpg', 'hero-profe-1100.jpg', 'hero-estudiante-600.jpg', 'hero-estudiante-1100.jpg']) {
    assert.equal(fs.existsSync(path.join(REPO, 'assets', 'img', photo)), true, `Missing hero photo: ${photo}`);
  }

  // Check all <img> tags: src, srcset, alt, width, height
  const imgTags = [...indexHtml.matchAll(/<img\b[^>]*>/gi)].map(m => m[0]);
  assert.ok(imgTags.length >= 9, `Expected >= 9 images in index.html, got ${imgTags.length}`);
  for (const tag of imgTags) {
    const src = tag.match(/\bsrc="([^"]+)"/i)?.[1];
    assert.ok(src, `<img> missing src: ${tag}`);
    assert.ok(!src.startsWith('http://'), `Insecure http:// src: ${src}`);
    if (!src.startsWith('https://') && !src.startsWith('data:')) {
      const target = path.join(REPO, src.split(/[?#]/)[0]);
      assert.equal(fs.existsSync(target), true, `Missing local img src: ${src}`);
    }

    const srcset = tag.match(/\bsrcset="([^"]+)"/i)?.[1];
    if (srcset) {
      for (const candidate of srcset.split(',').map(s => s.trim().split(/\s+/)[0]).filter(Boolean)) {
        assert.ok(!candidate.startsWith('http://'), `Insecure http:// srcset: ${candidate}`);
        const target = path.join(REPO, candidate.split(/[?#]/)[0]);
        assert.equal(fs.existsSync(target), true, `Missing local srcset target: ${candidate}`);
      }
    }

    const altMatch = tag.match(/\balt="([^"]*)"/i);
    assert.ok(altMatch !== null, `<img> missing alt attribute: ${tag}`);
    if (altMatch[1] === '') {
      // Decorative logos are allowed empty alt, content photos should have non-empty alt
      assert.ok(src.includes('logo.svg'), `Non-logo <img> has empty alt: ${tag}`);
    }
    assert.ok(/\bwidth="\d+"/i.test(tag), `<img> missing width: ${tag}`);
    assert.ok(/\bheight="\d+"/i.test(tag), `<img> missing height: ${tag}`);
  }

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

test('M2: Preply-inspired UI sections in index.html (Hero composite, Metrics strip, #clase 1-2-3, .lugar & .idiomas)', () => {
  const { html } = extractInlineScript('index.html');
  const env = createBrowserEnv({ url: 'https://linguasacademy.github.io/index.html', html });
  const doc = env.document;

  // Script order invariant: assets/fb.js before assets/auth.js
  const fbIdx = html.indexOf('assets/fb.js');
  const authIdx = html.indexOf('assets/auth.js');
  assert.ok(fbIdx > -1 && authIdx > fbIdx, 'assets/fb.js must appear before assets/auth.js');

  // Hero composite
  const mesa = doc.querySelector('.hero .mesa');
  assert.ok(mesa, 'Hero .mesa container missing');
  assert.match(mesa.querySelector('.mesa__board--front')?.getAttribute('src') || '', /a2-a-como-esta-la-pina-960\.jpg/, 'Main front board missing');
  assert.match(mesa.querySelector('.mesa__board--back')?.getAttribute('src') || '', /a2-me-lo-llevo-960\.jpg/, 'Secondary back board missing');
  assert.match(mesa.querySelector('.mesa__foto--profe')?.getAttribute('src') || '', /hero-profe-600\.jpg/, 'Teacher photo missing');
  assert.match(mesa.querySelector('.mesa__foto--estudiante')?.getAttribute('src') || '', /hero-estudiante-600\.jpg/, 'Student photo missing');
  assert.ok(mesa.querySelector('.nota--1'), 'Editorial sticky note .nota--1 missing');

  const chips = mesa.querySelectorAll('.chip-ui');
  assert.equal(chips.length, 1, 'Expected 1 focused floating UI chip in .mesa');
  assert.match(mesa.textContent, /En vivo con tu estudiante/);

  // Metrics strip immediately after .hero
  const mainChildren = Array.from(doc.querySelector('main').children);
  assert.ok(mainChildren[0].classList.contains('hero'), 'First main section should be .hero');
  assert.ok(mainChildren[1].classList.contains('metricas'), 'Second main section should be .metricas');
  const metricas = doc.querySelectorAll('.metricas .metrica');
  assert.equal(metricas.length, 4, 'Expected 4 metric items in .metricas');
  const metricasText = doc.querySelector('.metricas').textContent;
  assert.match(metricasText, /49/);
  assert.match(metricasText, /A1–B2/);
  assert.match(metricasText, /50 min/);
  assert.match(metricasText, /Sin cuenta/);

  // #clase: 3 numbered tactile cards (1, 2, 3) with .momento__ui
  const momentos = doc.querySelectorAll('#clase .momento');
  assert.equal(momentos.length, 3, 'Expected 3 .momento cards in #clase');
  momentos.forEach((card, idx) => {
    const num = card.querySelector('.momento__num');
    assert.ok(num, `Card ${idx + 1} missing .momento__num`);
    assert.equal(num.textContent.trim(), String(idx + 1));
    assert.ok(card.querySelector('.momento__ui'), `Card ${idx + 1} missing .momento__ui`);
  });

  // .lugar showcase cards with .tag and .tag--live
  const lugares = doc.querySelectorAll('#tableros .lugar');
  assert.equal(lugares.length, 5, 'Expected 5 .lugar showcase cards');
  assert.equal(doc.querySelectorAll('#tableros .lugar .tag').length >= 5, true);
  assert.equal(doc.querySelectorAll('#tableros .lugar .tag--live').length, 2, 'Expected 2 live showcase badges');

  // .idiomas tactile cards with 4:3 SVG flags
  const idiomaCards = doc.querySelectorAll('#tableros .idiomas .idioma-card');
  assert.equal(idiomaCards.length, 3, 'Expected 3 language cards in .idiomas');
  for (const card of idiomaCards) {
    const svg = card.querySelector('svg.flag');
    assert.ok(svg, 'Language card missing svg.flag');
    assert.equal(svg.getAttribute('viewBox'), '0 0 32 24');
    assert.equal(svg.getAttribute('aria-hidden'), 'true');
  }
  const esCard = doc.querySelector('#tableros .idiomas a.idioma-card[data-lang="es"]');
  assert.ok(esCard, 'Español card must be an <a> link');
  assert.equal(esCard.getAttribute('href'), 'tableros.html?idioma=es');
  assert.match(esCard.textContent, /Español/);
  assert.match(esCard.textContent, /A1–B2 · 49 tableros/);
  assert.match(esCard.textContent, /›/);
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

  await flush(60);

  // 1. [data-ver] fallback marks elements .visto
  const vistos = env.document.querySelectorAll('[data-ver]');
  assert.ok(vistos.length > 0);
  for (const el of vistos) {
    assert.equal(el.classList.contains('visto'), true, 'Expected [data-ver] element to get .visto without IntersectionObserver');
  }

  // 2. Approved teacher rewrites [data-cuenta-link] and [data-cuenta-link-largo]
  const shortLinks = env.document.querySelectorAll('[data-cuenta-link]');
  assert.equal(shortLinks.length, 2);
  for (const a of shortLinks) {
    assert.equal(a.getAttribute('href'), 'tableros.html');
    assert.equal(a.textContent, 'Mis tableros');
  }
  const longLinks = env.document.querySelectorAll('[data-cuenta-link-largo]');
  assert.equal(longLinks.length, 2);
  for (const a of longLinks) {
    assert.equal(a.getAttribute('href'), 'tableros.html');
  }

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

  // 4. .menu-btn toggles #menu.hidden and Escape closes it
  const menuBtn = env.document.querySelector('.menu-btn');
  const menu = env.document.querySelector('#menu');
  assert.equal(menu.hidden, true);
  menuBtn.click();
  assert.equal(menu.hidden, false);
  assert.equal(menuBtn.getAttribute('aria-expanded'), 'true');
  const esc = new env.window.Event('keydown', { bubbles: true });
  esc.key = 'Escape';
  env.document.dispatchEvent(esc);
  assert.equal(menu.hidden, true);
  assert.equal(menuBtn.getAttribute('aria-expanded'), 'false');
});
