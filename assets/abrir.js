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

  /* Lectura que espera a la conexión (get() falla a los 3 s con internet lento) y reintenta una vez */
  const leer = (ref, ms) => new Promise((ok, ko) => {
    let fin = false; const t = setTimeout(() => { if (!fin) { fin = true; ko(new Error('tiempo')); } }, ms || 12000);
    ref.once('value').then(s => { if (!fin) { fin = true; clearTimeout(t); ok(s.val()); } }, e => { if (!fin) { fin = true; clearTimeout(t); ko(e); } });
  });
  const denegado = e => /permission/i.test((e && (e.code || e.message)) || '');
  const leer2 = async ref => { try { return await leer(ref); } catch (e) { if (denegado(e)) throw e; return leer(ref, 20000); } };

  /* El archivo cifrado se pide de una vez, mientras se consigue la clave */
  const binP = fetch('t/' + NOMBRE + '.bin').then(r => { if (!r.ok) throw new Error('sin-archivo'); return r.arrayBuffer(); });
  binP.catch(() => {});
  async function descifrar(clave) {
    const buf = new Uint8Array(await binP);
    const k = await crypto.subtle.importKey('raw', unb64u(clave), 'AES-GCM', false, ['decrypt']);
    const plano = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: buf.slice(0, 12) }, k, buf.slice(12));
    return new TextDecoder().decode(plano);
  }
  const CK = 'la-clave:' + NOMBRE;
  function pintar(html, clave) {
    try { sessionStorage.setItem(CK, clave); } catch (e) {}
    window.LA_CLAVE = clave;
    document.open(); document.write(html); document.close();
  }

  async function principal() {
    /* 0 · profe que ya abrió este tablero en este navegador: abre sin esperar al servidor */
    if (!COMO_ALUMNO) {
      let c = null; try { c = localStorage.getItem(CK); } catch (e) {}
      if (c) { try { return pintar(await descifrar(c), c); } catch (e) { try { localStorage.removeItem(CK); } catch (e2) {} } }
    }

    await carga(SDK + 'firebase-app-compat.js');
    await Promise.all([carga(SDK + 'firebase-auth-compat.js'), carga(SDK + 'firebase-database-compat.js')]);
    const app = firebase.apps.find(a => a.name === '[DEFAULT]') || firebase.initializeApp(CFG);
    const auth = app.auth(), db = app.database();
    let u = await new Promise(ok => { const fin = auth.onAuthStateChanged(x => { fin(); ok(x); }); });
    let clave = null, deProfe = false;

    /* 1 · profe con sesión (y no la vista de prueba del estudiante) */
    if (u && !u.isAnonymous && !COMO_ALUMNO) {
      try { clave = await leer2(db.ref('claves/' + NOMBRE)); deProfe = !!clave; }
      catch (e) { if (!denegado(e)) throw e; }
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
      clave = await leer2(dbSala.ref('salas/' + SALA + '/clave'));
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
    if (deProfe) { try { localStorage.setItem(CK, clave); } catch (e) {} }
    pintar(html, clave);
  }

  conTiempo(principal(), 45000).catch(err => {
    console.error(err);
    decir('No se pudo abrir el tablero. Revisa tu conexión y <a href="">vuelve a intentarlo</a>.');
  });
})();
