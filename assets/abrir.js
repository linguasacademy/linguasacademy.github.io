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
  /* avisos para el estudiante: en español y, si su navegador está en inglés o portugués, también en su lengua */
  const LENGUA = ((navigator.language || 'es').slice(0, 2)).toLowerCase();
  const TRAD = {
    cerrada: { en: 'This room is closed. To join again, ask your teacher for a new link.', pt: 'Esta sala já fechou. Para entrar de novo, peça um link novo ao seu professor.' },
    noexiste: { en: 'This room does not exist or is already closed. Ask your teacher for a new link.', pt: 'Esta sala não existe ou já fechou. Peça um link novo ao seu professor.' },
    error: { en: 'The board could not open. Check your connection and try again.', pt: 'Não foi possível abrir o quadro. Verifique a conexão e tente de novo.' }
  };
  const bi = (es, k) => (TRAD[k] && TRAD[k][LENGUA]) ? es + '<br><small lang="' + LENGUA + '">' + TRAD[k][LENGUA] + '</small>' : es;

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
  function pintar(html, clave, esProfe) {
    try { sessionStorage.setItem(CK, clave); } catch (e) {}
    window.LA_CLAVE = clave;
    window.LA_PROFE = !!esProfe;
    let cat = 'tableros.html';
    try {
      const g = sessionStorage.getItem('la-catalogo');
      if (g && /^tableros\.html(\?.*)?$/.test(g)) cat = g;
    } catch (e) {}
    window.LA_CATALOGO = cat;

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

    if (esProfe) {
      const st = document.createElement('style');
      st.id = 'vivoStyle';
      st.textContent =
        '#vivoChip{position:fixed;left:12px;bottom:12px;z-index:19;display:flex;align-items:center;gap:6px;flex-wrap:wrap;' +
        'font:700 14px/1.2 system-ui,\'Segoe UI\',sans-serif;color:#fff;background:#12303Aee;border-radius:14px;padding:6px;box-shadow:0 6px 20px #0005;max-width:calc(100vw - 24px)}' +
        '#vivoChip:empty{display:none}' +
        '#vivoChip a{color:inherit;text-decoration:none;border-radius:10px;padding:8px 12px;background:#ffffff1f;white-space:nowrap}' +
        '#vivoChip a:hover{background:#ffffff33}' +
        '#vivoChip a:focus-visible{outline:3px solid #F4B51E;outline-offset:2px}' +
        'body.con-sala #lado{padding-bottom:72px}' +
        '@media print{#vivoChip{display:none}}';
      document.head.appendChild(st);
      const chip = document.createElement('div');
      chip.id = 'vivoChip';
      const volver = document.createElement('a');
      volver.className = 'volver';
      volver.setAttribute('href', cat);
      volver.title = 'Volver al catálogo de tableros';
      volver.textContent = '← Catálogo';
      chip.appendChild(volver);
      document.body.appendChild(chip);
      document.body.classList.add('con-sala');
    }

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
    let clave = null, esProfe = false;

    /* 1 · profe con sesión (y no la vista de prueba del estudiante) */
    if (u && !u.isAnonymous && !COMO_ALUMNO) {
      try {
        clave = await leer2(db.ref('claves/' + NOMBRE));
        if (clave) esProfe = true;
      }
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
      const cerrada = await leer2(dbSala.ref('salas/' + SALA + '/cerrada')).catch(() => null);
      if (cerrada === true) { decir(bi('Esta sala ya cerró. Si quieres volver a entrar, pídele a tu profe un enlace nuevo.', 'cerrada')); return; }
      try { clave = await leer2(dbSala.ref('salas/' + SALA + '/clave')); }
      catch (e) { if (!denegado(e)) throw e; clave = null; }
      if (!clave) {
        decir(bi('Esta sala no existe o ya cerró. Pídele a tu profe un enlace nuevo.', 'noexiste'));
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
    pintar(html, clave, esProfe);
  }

  conTiempo(principal(), 45000).catch(err => {
    console.error(err);
    decir(bi('No se pudo abrir el tablero. Revisa tu conexión y <a href="">vuelve a intentarlo</a>.', 'error'));
  });
})();
