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
  const { CFG, SDK, carga, conTiempo, denegado, leer2 } = window.LA_FB;
  const NOMBRE = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');
  const q = new URLSearchParams(location.search);
  const SALA = (q.get('sala') || '').replace(/[^a-z0-9]/gi, '').slice(0, 24);
  const COMO_ALUMNO = q.get('como') === 'estudiante';

  const caja = document.getElementById('caja');
  const decir = (html) => { caja.innerHTML = '<img src="logo.svg" alt=""><p>' + html + '</p>'; };

  const unb64u = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - s.length % 4) % 4)), c => c.charCodeAt(0));

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
    const doc = new DOMParser().parseFromString(html, 'text/html');
    Array.from(document.documentElement.attributes).forEach(a => document.documentElement.removeAttribute(a.name));
    Array.from(doc.documentElement.attributes).forEach(a => document.documentElement.setAttribute(a.name, a.value));
    Array.from(document.body.attributes).forEach(a => document.body.removeAttribute(a.name));
    Array.from(doc.body.attributes).forEach(a => document.body.setAttribute(a.name, a.value));

    const scripts = [];
    const extraerScripts = (origen, destino) => {
      destino.replaceChildren();
      Array.from(origen.childNodes).forEach(nodo => {
        if (nodo.nodeType === 1 && nodo.tagName === 'SCRIPT') {
          scripts.push({ nodo, destino });
        } else {
          const copia = document.importNode(nodo, true);
          if (copia.nodeType === 1) {
            copia.querySelectorAll('script').forEach(s => {
              const marcador = document.createComment('script');
              s.parentNode.replaceChild(marcador, s);
              scripts.push({ nodo: s, destino: marcador.parentNode, antes: marcador });
            });
          }
          destino.appendChild(copia);
        }
      });
    };

    extraerScripts(doc.head, document.head);
    extraerScripts(doc.body, document.body);

    scripts.forEach(({ nodo, destino, antes }) => {
      const s = document.createElement('script');
      Array.from(nodo.attributes).forEach(a => s.setAttribute(a.name, a.value));
      if (s.src) s.async = false;
      else s.textContent = nodo.textContent;
      if (antes && antes.parentNode === destino) destino.replaceChild(s, antes);
      else destino.appendChild(s);
    });
  }

  async function principal() {
    await carga(SDK + 'firebase-app-compat.js');
    await Promise.all([carga(SDK + 'firebase-auth-compat.js'), carga(SDK + 'firebase-database-compat.js')]);
    const app = firebase.apps.find(a => a.name === '[DEFAULT]') || firebase.initializeApp(CFG);
    const auth = app.auth(), db = app.database();
    let u = await new Promise(ok => { let fin; let ya = false; fin = auth.onAuthStateChanged(x => { if (ya) return; ya = true; if (fin) fin(); ok(x); }); if (ya && fin) fin(); });
    let clave = null;

    /* 1 · profe con sesión (y no la vista de prueba del estudiante) */
    if (u && !u.isAnonymous && !COMO_ALUMNO) {
      try { clave = await leer2(db.ref('claves/' + NOMBRE)); }
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
    pintar(html, clave);
  }

  conTiempo(principal(), 45000).catch(err => {
    console.error(err);
    decir('No se pudo abrir el tablero. Revisa tu conexión y <a href="">vuelve a intentarlo</a>.');
  });
})();
