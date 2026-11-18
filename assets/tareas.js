/* =====================================================================
   tareas.js · Lingua's Academy
   Tareas con entrega: el profe crea la tarea desde el catálogo, el
   estudiante la entrega desde estudiantes.html y el profe la lee en
   panel.html.

   Datos en Realtime Database (reglas en database.rules.json):
     tareas/<codigo>                 { dueno, tablero, creada, etiqueta?, archivada? }
     tareas/<codigo>/entregas/<uid>  { nombre, fecha, puntaje:{aciertos,total},
                                       ejercicios:[{tipo,aciertos,total}],
                                       errores:[{p,escrito,correcto}], reto, lengua }
     tareasPorProfe/<uid>/<codigo>   true

   Necesita assets/fb.js. Para crear, también assets/auth.js (sesión del profe).
   ===================================================================== */
(() => {
  'use strict';

  const BASE = 'https://linguasacademy.github.io/estudiantes.html';
  const COD_RE = /^[0-9a-z]{10}$/;
  const TABLERO_RE = /^(en-|pt-)?[abc][12]-[a-z0-9]+(-[a-z0-9]+)*$/;
  const ABC = '0123456789abcdefghijklmnopqrstuvwxyz';
  const LIM = { nombre: 60, etiqueta: 60, tablero: 80, texto: 300, reto: 3000, errores: 30, ejercicios: 12, tipo: 20, n: 1000 };

  /* Código de 10 caracteres base36 al azar (crypto), sin sesgo: se descartan los bytes ≥ 252 */
  function codigo() {
    let s = '';
    const buf = new Uint8Array(24);
    while (s.length < 10) {
      crypto.getRandomValues(buf);
      for (const b of buf) { if (b < 252 && s.length < 10) s += ABC[b % 36]; }
    }
    return s;
  }
  const url = (tablero, cod) => BASE + '?t=' + encodeURIComponent(tablero) + (cod ? '&tarea=' + cod : '');

  /* El usuario de la sesión, sin crear ninguna */
  const usuarioDe = auth => auth.currentUser ? Promise.resolve(auth.currentUser) : new Promise(ok => {
    let fin = null, ya = false;
    fin = auth.onAuthStateChanged(u => { if (ya) return; ya = true; if (fin) fin(); ok(u); });
    if (ya && fin) fin();
  });

  /* ---------- profe: crear una tarea ---------- */
  async function crear(tablero, etiqueta) {
    if (!window.LA || !TABLERO_RE.test(tablero || '')) throw new Error('tablero');
    const { conTiempo, denegado } = window.LA_FB;
    const F = await window.LA.app();
    const u = await conTiempo(usuarioDe(F.auth), 8000);
    if (!u || u.isAnonymous) throw new Error('sin-sesion');
    const et = String(etiqueta || '').replace(/\s+/g, ' ').trim().slice(0, LIM.etiqueta);
    for (let intento = 0; ; intento++) {
      const cod = codigo();
      const t = { dueno: u.uid, tablero, creada: F.TS };
      if (et) t.etiqueta = et;
      try {
        await conTiempo(F.db.ref().update({ ['tareas/' + cod]: t, ['tareasPorProfe/' + u.uid + '/' + cod]: true }), 12000);
        return { codigo: cod, url: url(tablero, cod) };
      } catch (e) {
        /* un código repetido también se rechaza: se intenta una vez más con otro */
        if (intento || !denegado(e)) throw e;
      }
    }
  }

  /* ---------- estudiante: entregar ---------- */
  const corta = (v, n) => String(v == null ? '' : v).slice(0, n);
  const entero = v => Math.max(0, Math.min(LIM.n, Math.round(+v) || 0));
  function limpiar(d) {
    const total = entero(d.puntaje && d.puntaje.total);
    const e = {
      nombre: String(d.nombre || '').replace(/\s+/g, ' ').trim().slice(0, LIM.nombre),
      puntaje: { aciertos: Math.min(entero(d.puntaje && d.puntaje.aciertos), total), total },
      lengua: ['es', 'en', 'pt'].includes(d.lengua) ? d.lengua : 'es'
    };
    const ej = (Array.isArray(d.ejercicios) ? d.ejercicios : []).slice(0, LIM.ejercicios).map(x => {
      const tot = Math.min(entero(x.total), 200);
      return { tipo: corta(x.tipo, LIM.tipo) || 'otro', aciertos: Math.min(entero(x.aciertos), tot), total: tot };
    });
    if (ej.length) e.ejercicios = ej;
    const er = (Array.isArray(d.errores) ? d.errores : []).slice(0, LIM.errores)
      .map(x => {
        /* sin cadenas vacías en los campos obligatorios (las reglas exigen escrito y correcto) */
        const o = { escrito: corta(x.escrito, LIM.texto) || '—', correcto: corta(x.correcto, LIM.texto) || '—' };
        const p = corta(x.p, LIM.texto);
        if (p) o.p = p;
        return o;
      });
    if (er.length) e.errores = er;
    const reto = corta(String(d.reto || '').trim(), LIM.reto);
    if (reto) e.reto = reto;
    return e;
  }

  async function entregar(cod, datos) {
    if (!COD_RE.test(cod || '')) throw new Error('codigo');
    const v = limpiar(datos || {});
    if (!v.nombre) throw new Error('nombre');
    const { CFG, SDK, carga, conTiempo } = window.LA_FB;
    await conTiempo((async () => {
      await carga(SDK + 'firebase-app-compat.js');
      await Promise.all([carga(SDK + 'firebase-auth-compat.js'), carga(SDK + 'firebase-database-compat.js')]);
    })(), 15000);
    const app = firebase.apps.find(a => a.name === '[DEFAULT]') || firebase.initializeApp(CFG);
    const auth = app.auth();
    let u = await conTiempo(usuarioDe(auth), 8000);
    if (!u) u = (await conTiempo(auth.signInAnonymously(), 15000)).user;
    v.fecha = firebase.database.ServerValue.TIMESTAMP;
    await conTiempo(app.database().ref('tareas/' + cod + '/entregas/' + u.uid).set(v), 15000);
    return u.uid;
  }

  window.LA_TAREAS = { COD_RE, LIM, codigo, url, crear, limpiar, entregar };
})();
