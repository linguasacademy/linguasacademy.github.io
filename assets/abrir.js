/* =====================================================================
   abrir.js · Lingua's Academy
   Abre un tablero protegido. El tablero está cifrado en t/<nombre>.bin y
   la clave vive en Firebase:
     claves/<nombre>        la leen los profesores aprobados
     salas/<sala>/clave     la escribe el profe al abrir la sala; la lee
                            quien entra con el enlace de esa sala
   Sin clave: el profe va a entrar.html; el estudiante ve un aviso.
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
  const NOMBRE = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');
  const q = new URLSearchParams(location.search);
  const SALA = (q.get('sala') || '').replace(/[^a-z0-9]/gi, '').slice(0, 24);
  const COMO_ALUMNO = q.get('como') === 'estudiante';

  const caja = document.getElementById('caja');
  const decir = (html) => { caja.innerHTML = '<img src="logo.svg" alt=""><p>' + html + '</p>'; };

  const carga = src => new Promise((ok, ko) => {
    const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => ko(new Error('red')); document.head.appendChild(s);
  });
  const conTiempo = (p, ms) => Promise.race([p, new Promise((_, ko) => setTimeout(() => ko(new Error('tiempo')), ms))]);
  const unb64u = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - s.length % 4) % 4)), c => c.charCodeAt(0));

  async function descifrar(clave) {
    const r = await fetch('t/' + NOMBRE + '.bin', { cache: 'no-cache' });
    if (!r.ok) throw new Error('sin-archivo');
    const buf = new Uint8Array(await r.arrayBuffer());
    const k = await crypto.subtle.importKey('raw', unb64u(clave), 'AES-GCM', false, ['decrypt']);
    const plano = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: buf.slice(0, 12) }, k, buf.slice(12));
    return new TextDecoder().decode(plano);
  }

  async function principal() {
    await carga(SDK + 'firebase-app-compat.js');
    await Promise.all([carga(SDK + 'firebase-auth-compat.js'), carga(SDK + 'firebase-database-compat.js')]);
    const app = firebase.apps.find(a => a.name === '[DEFAULT]') || firebase.initializeApp(CFG);
    const auth = app.auth(), db = app.database();
    let u = await new Promise(ok => { const fin = auth.onAuthStateChanged(x => { fin(); ok(x); }); });
    let clave = null;

    /* 1 · profe con sesión (y no la vista de prueba del estudiante) */
    if (u && !u.isAnonymous && !COMO_ALUMNO) {
      clave = await db.ref('claves/' + NOMBRE).get().then(s => s.val()).catch(() => null);
    }
    /* 2 · enlace de una sala */
    if (!clave && SALA.length >= 8) {
      let dbSala = db;
      if (COMO_ALUMNO) {
        const a2 = firebase.apps.find(a => a.name === 'vista-estudiante') || firebase.initializeApp(CFG, 'vista-estudiante');
        await a2.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
        if (!a2.auth().currentUser) await a2.auth().signInAnonymously();
        dbSala = a2.database();
      } else if (!u) {
        u = (await auth.signInAnonymously()).user;
      }
      clave = await dbSala.ref('salas/' + SALA + '/clave').get().then(s => s.val()).catch(() => null);
      if (!clave) {
        decir('Esta sala no existe o ya cerró. Pídele a tu profe un enlace nuevo.');
        return;
      }
    }
    if (!clave) {
      if (u && !u.isAnonymous) {
        decir('Tu cuenta todavía no tiene acceso a los tableros. <a href="entrar.html">Ver el estado de mi solicitud</a>');
      } else {
        location.replace('entrar.html?volver=' + encodeURIComponent(NOMBRE + '.html'));
      }
      return;
    }

    const html = await descifrar(clave);
    try { sessionStorage.setItem('la-clave:' + NOMBRE, clave); } catch (e) {}
    window.LA_CLAVE = clave;
    document.open(); document.write(html); document.close();
  }

  conTiempo(principal(), 30000).catch(err => {
    console.error(err);
    decir('No se pudo abrir el tablero. Revisa tu conexión y <a href="">vuelve a intentarlo</a>.');
  });
})();
