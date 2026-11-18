/* SDK compat de Firebase falso para las pruebas de navegador (tareas_navegador.py).
   Se sirve en lugar de firebase-app-compat.js; auth y database van incluidos.
   La base de datos vive en helpers/rtdb-servidor.mjs (mismo origen), que aplica las reglas.
   Usuario: sessionStorage «__fb_usuario» (lo pone la prueba para el profe); si no hay,
   signInAnonymously crea uno y lo guarda en localStorage «__fb_anon» (como la persistencia LOCAL). */
(function () {
  'use strict';
  if (window.firebase && window.firebase.__falso) return;
  var API = location.origin + '/__rtdb/';
  function post(p, b) {
    return fetch(API + p, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b) }).then(function (r) { return r.json(); });
  }
  function leerJSON(st, k) { try { return JSON.parse(st.getItem(k) || 'null'); } catch (e) { return null; } }
  var usuario = leerJSON(sessionStorage, '__fb_usuario') || leerJSON(localStorage, '__fb_anon');
  var oyentesAuth = [];
  function authReglas() { return usuario ? { uid: usuario.uid, isAnonymous: !!usuario.isAnonymous, provider: usuario.isAnonymous ? 'anonymous' : (usuario.provider || 'password') } : null; }
  function objUsuario() {
    if (!usuario) return null;
    return { uid: usuario.uid, isAnonymous: !!usuario.isAnonymous, email: usuario.email || null, displayName: usuario.displayName || null,
      updateProfile: function () { return Promise.resolve(); }, delete: function () { return Promise.resolve(); } };
  }
  function avisarAuth() { oyentesAuth.slice().forEach(function (f) { f(objUsuario()); }); }
  var auth = {
    get currentUser() { return objUsuario(); },
    onAuthStateChanged: function (f) { setTimeout(function () { f(objUsuario()); }, 0); oyentesAuth.push(f); return function () { var i = oyentesAuth.indexOf(f); if (i >= 0) oyentesAuth.splice(i, 1); }; },
    signInAnonymously: function () {
      usuario = { uid: 'anon' + Math.random().toString(36).slice(2, 12), isAnonymous: true };
      localStorage.setItem('__fb_anon', JSON.stringify(usuario));
      avisarAuth();
      return Promise.resolve({ user: objUsuario() });
    },
    signOut: function () { usuario = null; sessionStorage.removeItem('__fb_usuario'); localStorage.removeItem('__fb_anon'); avisarAuth(); return Promise.resolve(); },
    setPersistence: function () { return Promise.resolve(); }
  };

  function denegado() { var e = new Error('PERMISSION_DENIED: Permission denied'); e.code = 'PERMISSION_DENIED'; return e; }
  function norm(r) { return String(r || '').split('/').filter(Boolean).join('/'); }
  function copia(v) { return v == null ? null : JSON.parse(JSON.stringify(v)); }
  function snap(ruta, val) {
    var ps = ruta.split('/').filter(Boolean);
    return {
      key: ps.length ? ps[ps.length - 1] : null,
      val: function () { return copia(val); },
      exists: function () { return val != null; },
      child: function (c) { return snap(ruta + '/' + c, val && typeof val === 'object' ? val[c] : null); },
      forEach: function (f) { if (val && typeof val === 'object') { var ks = Object.keys(val); for (var i = 0; i < ks.length; i++) if (f(snap(ruta + '/' + ks[i], val[ks[i]])) === true) return true; } return false; }
    };
  }
  var oyentes = [];
  function refrescar(o) {
    return post('leer', { ruta: o.ruta, auth: authReglas() }).then(function (r) {
      if (oyentes.indexOf(o) < 0) return;
      if (!r.ok) { oyentes.splice(oyentes.indexOf(o), 1); if (o.fnErr) o.fnErr(denegado()); return; }
      var j = JSON.stringify(r.val == null ? null : r.val);
      if (j !== o.ultimo) { o.ultimo = j; o.fn(snap(o.ruta, r.val)); }
    });
  }
  function escribir(ops) {
    return post('escribir', { ops: ops, auth: authReglas() }).then(function (r) { if (!r.ok) throw denegado(); });
  }
  function ref(ruta) {
    ruta = norm(ruta);
    return {
      key: ruta ? ruta.split('/').pop() : null,
      child: function (c) { return ref(ruta + '/' + c); },
      once: function (ev, fn) {
        return post('leer', { ruta: ruta, auth: authReglas() }).then(function (r) { if (!r.ok) throw denegado(); var s = snap(ruta, r.val); if (fn) fn(s); return s; });
      },
      on: function (ev, fn, fnErr) { var o = { ruta: ruta, fn: fn, fnErr: fnErr, ultimo: undefined }; oyentes.push(o); refrescar(o); return fn; },
      off: function (ev, fn) { for (var i = oyentes.length - 1; i >= 0; i--) if (oyentes[i].ruta === ruta && (!fn || oyentes[i].fn === fn)) oyentes.splice(i, 1); },
      set: function (v) { return escribir([{ ruta: ruta, val: v }]); },
      remove: function () { return escribir([{ ruta: ruta, val: null }]); },
      update: function (o) { return escribir(Object.keys(o).map(function (k) { return { ruta: norm(ruta + '/' + k), val: o[k] }; })); },
      onDisconnect: function () { var nada = function () { return Promise.resolve(); }; return { remove: nada, set: nada, cancel: nada }; }
    };
  }
  var es = new EventSource(API + 'eventos');
  es.onmessage = function () { oyentes.slice().forEach(refrescar); };

  var db = { ref: ref, goOnline: function () {}, goOffline: function () {} };
  function App(nombre) { this.name = nombre || '[DEFAULT]'; this.options = {}; }
  App.prototype.auth = function () { return auth; };
  App.prototype.database = function () { return db; };
  var fb = {
    __falso: true,
    apps: [],
    initializeApp: function (cfg, nombre) { var a = new App(nombre); fb.apps.push(a); return a; },
    auth: Object.assign(function () { return auth; }, {
      GoogleAuthProvider: function () { this.setCustomParameters = function () {}; },
      Auth: { Persistence: { LOCAL: 'local', SESSION: 'session', NONE: 'none' } }
    }),
    database: Object.assign(function () { return db; }, { ServerValue: { TIMESTAMP: { '.sv': 'timestamp' } } })
  };
  window.firebase = fb;
})();
