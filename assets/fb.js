/* =====================================================================
   fb.js · Lingua's Academy
   Configuración y utilidades compartidas de Firebase (auth.js, abrir.js
   y vivo.js).
   ===================================================================== */
(() => {
  'use strict';

  const CFG = {
    apiKey: 'AIzaSyAGz-__ICvH7XJyxJ7co0evyuCEIUBKH4k',
    authDomain: 'linguas-tableros.firebaseapp.com',
    databaseURL: 'https://linguas-tableros-default-rtdb.firebaseio.com',
    projectId: 'linguas-tableros',
    storageBucket: 'linguas-tableros.firebasestorage.app',
    messagingSenderId: '992339561971',
    appId: '1:992339561971:web:37615c68f465fadb565686'
  };
  const SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';

  const yaEsta = src => !!window.firebase && (
    /app-compat/.test(src) ||
    (/auth-compat/.test(src) && !!firebase.auth) ||
    (/database-compat/.test(src) && !!firebase.database)
  );

  const _cargando = Object.create(null);
  function carga(src) {
    if (yaEsta(src)) return Promise.resolve();
    if (_cargando[src]) return _cargando[src];
    const existente = document.querySelector('script[src="' + src + '"]');
    if (existente) {
      if (existente.dataset && existente.dataset.laCargado === '1') return Promise.resolve();
      _cargando[src] = new Promise((ok, ko) => {
        const limpiar = () => {
          existente.removeEventListener('load', onLoad);
          existente.removeEventListener('error', onErr);
        };
        const onLoad = () => { limpiar(); if (existente.dataset) existente.dataset.laCargado = '1'; delete _cargando[src]; ok(); };
        const onErr = () => { limpiar(); delete _cargando[src]; ko(new Error('red')); };
        existente.addEventListener('load', onLoad);
        existente.addEventListener('error', onErr);
      });
      return _cargando[src];
    }
    _cargando[src] = new Promise((ok, ko) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => { if (s.dataset) s.dataset.laCargado = '1'; delete _cargando[src]; ok(); };
      s.onerror = () => { delete _cargando[src]; s.remove(); ko(new Error('red')); };
      document.head.appendChild(s);
    });
    return _cargando[src];
  }

  const conTiempo = (p, ms) => Promise.race([
    p,
    new Promise((_, ko) => setTimeout(() => ko(new Error('tiempo')), ms))
  ]);

  /* Lectura que espera a la conexión (get() falla a los 3 s con internet lento) y reintenta una vez */
  const leer = (ref, ms) => new Promise((ok, ko) => {
    let fin = false;
    const t = setTimeout(() => { if (!fin) { fin = true; ko(new Error('tiempo')); } }, ms || 12000);
    ref.once('value').then(
      s => { if (!fin) { fin = true; clearTimeout(t); ok(s.val()); } },
      e => { if (!fin) { fin = true; clearTimeout(t); ko(e); } }
    );
  });

  const denegado = e => /permission/i.test(typeof e === 'string' ? e : (e && (e.code || e.message)) || '');

  const leer2 = async ref => {
    try { return await leer(ref); }
    catch (e) { if (denegado(e)) throw e; return leer(ref, 20000); }
  };

  window.LA_FB = { CFG, SDK, carga, conTiempo, leer, denegado, leer2 };
})();
