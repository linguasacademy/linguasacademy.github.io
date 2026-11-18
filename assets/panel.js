/* =====================================================================
   panel.js · Lingua's Academy
   Panel de tareas del profe (panel.html): sus tareas, las entregas de
   sus estudiantes en tiempo real y el detalle de cada entrega.
   Datos: tareasPorProfe/<uid> (índice) y tareas/<código> (ver assets/tareas.js).
   Iconos: Lucide (ISC).
   ===================================================================== */
(() => {
  'use strict';

  const $ = s => document.querySelector(s);
  const T = (k, vars) => {
    const v = window.LAi18n ? LAi18n.t(k) : k;
    return vars ? String(v).replace(/\{(\w+)\}/g, (m, p) => (p in vars ? vars[p] : m)) : String(v);
  };
  const lang = () => document.documentElement.lang || 'es';
  const enlace = h => (window.LAi18n ? LAi18n.enlace(h) : h);
  const conAcceso = p => !!p && (p.estado === 'aprobado' || p.admin === true);
  const CAT = {};
  (window.CATALOGO || []).forEach(c => { CAT[String(c.archivo || '').replace(/\.html$/, '')] = c; });
  const COD_RE = /^[0-9a-z]{10}$/;

  /* ---------- iconos (Lucide, ISC) ---------- */
  const ICO = {
    copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    archive: '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
    'archive-restore': '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h2"/><path d="M20 8v11a2 2 0 0 1-2 2h-2"/><path d="m9 15 3-3 3 3"/><path d="M12 12v9"/>',
    'trash-2': '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'
  };
  function icono(n) {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('class', 'ico'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', 'none');
    s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', '2');
    s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round'); s.setAttribute('aria-hidden', 'true');
    s.innerHTML = ICO[n] || '';
    return s;
  }
  /* h('div.clase', {attr}, ...hijos): el texto siempre como textContent */
  function h(tag, attrs, ...hijos) {
    const [nombre, ...clases] = tag.split('.');
    const e = document.createElement(nombre);
    if (clases.length) e.className = clases.join(' ');
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'text') e.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : String(v));
    }
    for (const c of hijos.flat()) if (c != null && c !== false) e.append(typeof c === 'string' || typeof c === 'number' ? String(c) : c);
    return e;
  }
  const boton = (clase, ico, texto, attrs) => h('button.btn.' + clase.split(' ').join('.'), Object.assign({ type: 'button' }, attrs), ico ? icono(ico) : null, h('span', { text: texto }));

  /* ---------- formato ---------- */
  function fecha(ms, conHora) {
    if (!ms) return '';
    const d = new Date(ms), mismoAnio = d.getFullYear() === new Date().getFullYear();
    const o = { day: 'numeric', month: 'short' };
    if (!mismoAnio) o.year = 'numeric';
    if (conHora) { o.hour = '2-digit'; o.minute = '2-digit'; }
    try { return new Intl.DateTimeFormat(lang(), o).format(d); } catch (e) { return d.toISOString().slice(0, 10); }
  }
  const nEntregas = n => n === 0 ? T('panel.ceroEntregas') : n === 1 ? T('panel.unaEntrega') : T('panel.nEntregas', { n });
  const palabras = s => String(s || '').trim().split(/\s+/).filter(Boolean).length;
  const tono = (a, b) => { const p = b ? a / b : 0; return p >= 0.8 ? 'alto' : p < 0.5 ? 'bajo' : 'medio'; };
  function barra(a, b) {
    const w = b ? Math.round(100 * Math.min(a, b) / b) : 0;
    const i = h('i'); i.style.width = w + '%';
    return h('span.barra', { 'aria-hidden': 'true', 'data-tono': tono(a, b) }, i);
  }
  function miniatura(c, nivel, ancho) {
    const m = h('span.mini', { 'aria-hidden': 'true' }, nivel || '');
    if (c && c.foto) {
      const img = h('img', { alt: '', loading: 'lazy', decoding: 'async', width: ancho, height: ancho });
      img.addEventListener('error', () => img.remove(), { once: true });
      img.src = String(c.foto).split('?')[0] + '?auto=format&fit=crop&w=' + ancho * 2 + '&h=' + ancho * 2 + '&q=60';
      m.append(img);
    }
    return m;
  }

  /* ---------- aviso, portapapeles y confirmación propia ---------- */
  let tAviso = 0;
  function avisar(texto, ok) {
    const a = $('[data-aviso]');
    a.textContent = '';
    if (ok) a.append(icono('check'));
    a.append(texto);
    a.setAttribute('data-on', '');
    clearTimeout(tAviso);
    tAviso = setTimeout(() => a.removeAttribute('data-on'), ok ? 2200 : 6000);
  }
  function copiar(texto) {
    if (navigator.clipboard && window.isSecureContext !== false) return navigator.clipboard.writeText(texto);
    return new Promise((ok, mal) => {
      const ta = h('textarea', { readonly: true }); ta.value = texto; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.append(ta); ta.select();
      let hecho = false; try { hecho = document.execCommand('copy'); } catch (e) {}
      ta.remove(); hecho ? ok() : mal(new Error('copiar'));
    });
  }
  const dlg = $('#dlg-confirmar');
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close('no'); });
  function confirmar(titulo, texto, si) {
    return new Promise(ok => {
      dlg.querySelector('#dlg-confirmar-t').textContent = titulo;
      dlg.querySelector('#dlg-confirmar-d').textContent = texto;
      dlg.querySelector('[data-si]').textContent = si;
      const antes = document.activeElement;
      dlg.returnValue = '';
      dlg.addEventListener('close', () => {
        ok(dlg.returnValue === 'si');
        if (antes && document.contains(antes)) antes.focus();
      }, { once: true });
      dlg.showModal();
      dlg.querySelector('[data-no]').focus();
    });
  }

  /* ---------- estado ---------- */
  let F = null, uid = null;
  let hayIndice = false;
  const subs = new Map();      /* código → callback de 'value' */
  const cargadas = new Set();  /* códigos con primera respuesta */
  const datos = new Map();     /* código → tarea */
  const abiertas = new Set();  /* código/uid de entregas desplegadas */
  let verArchivadas = false;
  let empujado = false;        /* en el teléfono, el detalle se abrió con pushState: «volver» = history.back() */
  const escritorio = matchMedia('(min-width: 1024px)');
  const selDeHash = () => { const m = /^#t=([0-9a-z]{10})$/.exec(location.hash || ''); return m ? m[1] : null; };
  let sel = selDeHash();

  function ponerEstado(texto) {
    const e = $('[data-estado]');
    e.removeAttribute('data-i18n');
    e.textContent = texto; e.hidden = !texto;
  }

  /* ---------- Firebase ---------- */
  function escucharIndice() {
    F.db.ref('tareasPorProfe/' + uid).on('value', s => {
      const v = s.val() || {};
      const nuevos = new Set(Object.keys(v).filter(c => COD_RE.test(c)));
      for (const [c, fn] of subs) if (!nuevos.has(c)) { F.db.ref('tareas/' + c).off('value', fn); subs.delete(c); datos.delete(c); cargadas.delete(c); }
      for (const c of nuevos) if (!subs.has(c)) escucharTarea(c);
      hayIndice = true;
      pedirPintar();
    }, err => { console.warn(err); ponerEstado(T('panel.errorCarga')); });
  }
  function olvidar(c) {
    /* la tarea ya no existe (o no es tuya): fuera del índice */
    subs.delete(c); datos.delete(c); cargadas.add(c);
    F.db.ref('tareasPorProfe/' + uid + '/' + c).remove().catch(() => {});
    pedirPintar();
  }
  function escucharTarea(c) {
    const fn = F.db.ref('tareas/' + c).on('value', s => {
      const v = s.val();
      cargadas.add(c);
      if (!v) { F.db.ref('tareas/' + c).off('value', fn); return olvidar(c); }
      datos.set(c, v);
      pedirPintar();
    }, () => olvidar(c));
    subs.set(c, fn);
  }

  /* ---------- acciones ---------- */
  const fallo = e => { console.warn(e); avisar(T('panel.error'), false); };
  function copiarEnlace(t) {
    const url = LA_TAREAS.url(t.tablero, t.cod);
    copiar(url).then(() => avisar(T('panel.copiado'), true), () => avisar(T('panel.copiarFallo', { url }), false));
  }
  function archivar(t) {
    const ref = F.db.ref('tareas/' + t.cod + '/archivada');
    (t.archivada ? ref.remove() : ref.set(true))
      .then(() => { if (!t.archivada) verArchivadas = verArchivadas || sel === t.cod; avisar(T(t.archivada ? 'panel.desarchivada' : 'panel.archivada'), true); }, fallo);
  }
  async function borrarTarea(t) {
    const n = Object.keys(t.entregas || {}).length;
    if (!await confirmar(T('panel.borrar.titulo'), T('panel.borrar.texto', { n }), T('panel.borrar.si'))) return;
    F.db.ref().update({ ['tareas/' + t.cod]: null, ['tareasPorProfe/' + uid + '/' + t.cod]: null }).then(() => {
      if (sel === t.cod) { sel = null; quitarHash(); }
      avisar(T('panel.borrada'), true);
      pedirPintar(() => { const p = document.querySelector('.tl__btn'); (p || $('h1')).focus({ preventScroll: true }); });
    }, fallo);
  }
  async function borrarEntrega(t, u, e) {
    if (!await confirmar(T('panel.borrarEntrega.titulo', { nombre: e.nombre || '' }), T('panel.borrarEntrega.texto'), T('panel.borrarEntrega.si'))) return;
    F.db.ref('tareas/' + t.cod + '/entregas/' + u).remove().then(() => {
      abiertas.delete(t.cod + '/' + u);
      avisar(T('panel.entregaBorrada'), true);
    }, fallo);
  }

  /* ---------- navegación: #t=<código> ---------- */
  function quitarHash() { try { history.replaceState(history.state, '', location.pathname + location.search); } catch (e) {} empujado = false; }
  function elegir(c) {
    if (c === sel && escritorio.matches) return;
    sel = c;
    const url = location.pathname + location.search + '#t=' + c;
    try {
      if (escritorio.matches) history.replaceState(history.state, '', url);
      else { history.pushState({ panel: c }, '', url); empujado = true; }
    } catch (e) {}
    pedirPintar(() => {
      if (!escritorio.matches) window.scrollTo(0, 0);
      const t = document.querySelector('.td__t'); if (t) t.focus({ preventScroll: escritorio.matches });
    });
  }
  function volverALista() {
    if (empujado) { history.back(); return; }
    sel = null; quitarHash(); pedirPintar(() => { const b = document.querySelector('.tl__btn'); if (b) b.focus(); });
  }
  window.addEventListener('hashchange', () => { sel = selDeHash(); if (!sel) empujado = false; pedirPintar(); });
  window.addEventListener('popstate', () => { sel = selDeHash(); if (!sel) empujado = false; pedirPintar(); });
  escritorio.addEventListener('change', () => pedirPintar());
  document.addEventListener('la:idioma', () => pedirPintar());

  /* ---------- pintar ---------- */
  let pendiente = 0, despues = [];
  function pedirPintar(fn) {
    if (fn) despues.push(fn);
    if (pendiente) return;
    pendiente = requestAnimationFrame(() => {
      pendiente = 0;
      pintar();
      const l = despues; despues = [];
      l.forEach(f => f());
    });
  }

  function lista() {
    return [...datos].map(([cod, t]) => Object.assign({ cod }, t)).sort((a, b) => (b.creada || 0) - (a.creada || 0));
  }

  function pintar() {
    if (!hayIndice) return;
    const todas = lista();
    const grid = $('[data-grid]');
    const faltan = [...subs.keys()].some(c => !cargadas.has(c));
    if (!todas.length && faltan) { ponerEstado(T('panel.cargando')); grid.hidden = true; return; }
    ponerEstado('');
    grid.hidden = false;
    /* el foco vuelve al mismo control después de repintar */
    const foco = document.activeElement && document.activeElement.closest && document.activeElement.closest('[data-foco]');
    const claveFoco = foco ? foco.getAttribute('data-foco') : null;

    const L = $('[data-lista]'), D = $('[data-detalle]');
    L.textContent = ''; D.textContent = '';
    if (!todas.length) {
      grid.dataset.vista = 'vacio';
      L.append(h('div.pv', null,
        h('h2', { text: T('panel.vacio.titulo') }),
        h('p', { text: T('panel.vacio.texto') }),
        h('a.btn.btn--primary', { href: enlace('tableros.html') }, h('span', { text: T('panel.vacio.cta') }))));
      return;
    }
    const activas = todas.filter(t => !t.archivada), archivadas = todas.filter(t => t.archivada);
    if (sel && !datos.has(sel) && (cargadas.has(sel) || !subs.has(sel))) { sel = null; quitarHash(); }
    if (!sel && escritorio.matches) sel = (activas[0] || archivadas[0]).cod;
    const actual = sel ? todas.find(t => t.cod === sel) : null;
    if (actual && actual.archivada) verArchivadas = true;
    grid.dataset.vista = actual ? 'detalle' : 'lista';

    const ul = h('ul.tl', { 'aria-label': T('panel.lista_aria') }, activas.map(item));
    L.append(ul);
    if (archivadas.length) {
      const b = h('button.tl__arch', { type: 'button', 'aria-expanded': String(verArchivadas), 'data-foco': 'archivadas',
        onclick: () => { verArchivadas = !verArchivadas; pedirPintar(); } },
      icono('chevron-right'), h('span', { text: verArchivadas ? T('panel.ocultarArchivadas') : T('panel.archivadas', { n: archivadas.length }) }));
      L.append(b);
      if (verArchivadas) L.append(h('ul.tl', { 'aria-label': T('panel.archivadas', { n: archivadas.length }) }, archivadas.map(item)));
    }
    if (actual) D.append(...detalle(actual));

    if (claveFoco) { const f = document.querySelector('[data-foco="' + CSS.escape(claveFoco) + '"]'); if (f) f.focus({ preventScroll: true }); }
  }

  function item(t) {
    const c = CAT[t.tablero];
    const n = Object.keys(t.entregas || {}).length;
    const nivel = c ? c.nivel : '';
    const b = h('button.tl__btn', { type: 'button', 'data-nivel': nivel || null, 'data-cod': t.cod, 'data-foco': 'tl-' + t.cod,
      'aria-current': t.cod === sel ? 'true' : null, onclick: () => elegir(t.cod) },
    miniatura(c, nivel, 52),
    h('span.tl__txt', null,
      h('span.tl__t', { text: c ? c.titulo : t.tablero }),
      h('span.tl__meta', null,
        t.etiqueta ? h('span.tl__etq', { text: t.etiqueta }) : null,
        h('span', { text: fecha(t.creada) }))),
    h('span.cuenta' + (n ? '.cuenta--hay' : ''), { 'aria-label': nEntregas(n), title: nEntregas(n) }, String(n)));
    return h('li', null, b);
  }

  function detalle(t) {
    const c = CAT[t.tablero];
    const nivel = c ? c.nivel : '';
    const lengua = c ? c.idioma : 'es';
    const entregas = Object.entries(t.entregas || {}).map(([u, e]) => Object.assign({ u }, e)).sort((a, b) => (b.fecha || 0) - (a.fecha || 0));
    const url = LA_TAREAS.url(t.tablero, t.cod);

    const caja = h('section.td', { 'data-nivel': nivel || null, 'aria-labelledby': 'td-t' },
      h('div.td__cab', null,
        miniatura(c, nivel, 96),
        h('div.td__txt', null,
          h('h2.td__t', { id: 'td-t', tabindex: '-1', lang: lengua, text: c ? c.titulo : T('panel.noDisponible') }),
          h('p.td__meta', null,
            nivel ? h('span.niv', { text: nivel }) : null,
            t.etiqueta ? h('span.td__etq', { text: t.etiqueta }) : null,
            h('span', { text: T('panel.creada', { fecha: fecha(t.creada) }) }),
            t.archivada ? h('span', { text: '· ' + T('panel.archivadaTag') }) : null,
            h('span', { text: '· ' + nEntregas(entregas.length) })))),
      h('div.td__enlace', null,
        h('span.td__url', { title: url }, h('span.visually-hidden', { text: T('panel.enlace') + ': ' }), url.replace(/^https:\/\//, '')),
        boton('btn--secondary btn--sm', 'copy', T('panel.copiar'), { 'data-foco': 'copiar', onclick: () => copiarEnlace(t) }),
        h('div.td__acc', null,
          boton('btn--ghost btn--sm', t.archivada ? 'archive-restore' : 'archive', T(t.archivada ? 'panel.desarchivar' : 'panel.archivar'),
            { 'data-foco': 'archivar', onclick: () => archivar(t) }),
          boton('btn--ghost btn--sm btn--peligro-t', 'trash-2', T('panel.borrar'),
            { 'data-foco': 'borrar', 'aria-label': T('panel.borrarTarea_aria'), onclick: () => borrarTarea(t) }))));

    if (!entregas.length) {
      caja.append(h('p.td__vacio', { text: T('panel.esperando') }));
    } else {
      caja.append(h('div.en-cab', { 'aria-hidden': 'true' },
        h('span', { text: T('panel.col.nombre') }), h('span', { text: T('panel.col.fecha') }), h('span', { text: T('panel.col.puntaje') }), h('span')));
      caja.append(h('ul.en', null, entregas.map(e => entrega(t, e, lengua))));
    }
    const vol = h('button.td__volver', { type: 'button', onclick: volverALista }, icono('arrow-left'), h('span', { text: T('panel.volver') }));
    return [vol, caja];
  }

  function entrega(t, e, lengua) {
    const clave = t.cod + '/' + e.u;
    const abierta = abiertas.has(clave);
    const p = e.puntaje || {}, a = +p.aciertos || 0, b = +p.total || 0;
    const idDet = 'en-' + t.cod + '-' + e.u.replace(/[^A-Za-z0-9_-]/g, '');
    const fila = h('button.en__fila', { type: 'button', 'aria-expanded': String(abierta), 'aria-controls': abierta ? idDet : null, 'data-foco': 'en-' + clave,
      onclick: () => { abierta ? abiertas.delete(clave) : abiertas.add(clave); pedirPintar(); } },
    h('span.en__nombre', { text: e.nombre || '—' }),
    h('span.en__fecha', { text: fecha(e.fecha, true) }),
    h('span.en__pt', { 'aria-label': T('panel.puntaje', { a, b }) }, h('span', { 'aria-hidden': 'true', text: a + '/' + b }), barra(a, b)),
    h('span.en__chev', { 'aria-hidden': 'true' }, icono('chevron-right')));
    const li = h('li' + (abierta ? '.abierta' : ''), null, fila);
    if (!abierta) return li;

    const ejs = Array.isArray(e.ejercicios) ? e.ejercicios : Object.values(e.ejercicios || {});
    const errs = Array.isArray(e.errores) ? e.errores : Object.values(e.errores || {});
    const tipo = x => { const k = 'panel.tipo.' + x; const v = T(k); return v === k || v === 'undefined' ? T('panel.tipo.otro') : v; };
    const det = h('div.en__det', { id: idDet },
      h('div.en__cols', null,
        ejs.length ? h('div', null,
          h('h3', { text: T('panel.ejercicios') }),
          h('ol.ejs', null, ejs.map((x, i) => h('li', null,
            h('span', { text: (i + 1) + '. ' + tipo(x.tipo) }), barra(+x.aciertos || 0, +x.total || 0), h('b', { text: (+x.aciertos || 0) + '/' + (+x.total || 0) }))))) : null,
        h('div', null,
          h('h3', { text: T('panel.errores') }),
          errs.length ? h('ul.errs', null, errs.map(x => h('li', null,
            x.p ? h('p.errs__p', { text: x.p }) : null,
            h('p.errs__fila', null,
              h('span.errs__mal', null, icono('x'), h('span.visually-hidden', { text: T('panel.escribio') + ': ' }), h('span', { lang: lengua, text: x.escrito || '—' })),
              h('span.errs__bien', null, icono('check'), h('span.visually-hidden', { text: T('panel.correcto') + ': ' }), h('span', { lang: lengua, text: x.correcto || '' }))))))
            : h('p', { class: 'muted', text: T('panel.sinErrores') }))),
      h('div', null,
        h('h3', null, T('panel.reto'), e.reto ? ' · ' + (palabras(e.reto) === 1 ? T('panel.unaPalabra') : T('panel.palabras', { n: palabras(e.reto) })) : ''),
        e.reto ? h('p.reto', { lang: lengua, text: e.reto }) : h('p', { class: 'muted', text: T('panel.sinReto') })),
      h('div.en__pie', null,
        h('span', { text: e.lengua && e.lengua !== lengua ? T('panel.apoyo', { idioma: T('cat.idioma.' + e.lengua) }) : '' }),
        boton('btn--ghost btn--sm btn--peligro-t', 'trash-2', T('panel.borrarEntrega'), { 'data-foco': 'borrar-' + clave, onclick: () => borrarEntrega(t, e.u, e) })));
    li.append(det);
    return li;
  }

  /* ---------- acceso ---------- */
  document.querySelectorAll('[data-salir]').forEach(b => b.addEventListener('click', async () => { await LA.salir().catch(() => {}); location.replace('./'); }));
  async function iniciar() {
    let r;
    try { r = await LA.estado(); } catch (e) { console.warn(e); ponerEstado(T('panel.errorCarga')); return; }
    if (!r.usuario || !conAcceso(r.perfil)) { location.replace(enlace('entrar.html?volver=panel.html')); return; }
    const nombre = (r.perfil.nombre || r.usuario.displayName || r.usuario.email || '').trim();
    $('[data-nombre]').textContent = nombre;
    document.querySelectorAll('[data-salir]').forEach(el => { el.hidden = false; });
    document.querySelectorAll('[data-solo-admin]').forEach(el => { el.hidden = !r.perfil.admin; });
    try { F = await LA.app(); } catch (e) { console.warn(e); ponerEstado(T('panel.errorCarga')); return; }
    uid = r.usuario.uid;
    ponerEstado(T('panel.cargando'));
    escucharIndice();
  }
  iniciar();
})();
