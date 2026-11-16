/* =====================================================================
   vivo.js · Lingua's Academy
   Sala en vivo SIN CUENTA para los tableros de clase.

   Los tableros (plantilla v6 en adelante) piden a window.claude.use()
   tres capacidades: 'user', 'db' y 'room'. Fuera de claude.ai no existen,
   así que este archivo las imita con Firebase (Realtime Database +
   acceso anónimo). El estudiante no ve ningún inicio de sesión.

   - Sin ?sala= en la dirección → el tablero funciona solo (modo local).
     Si hay un profe con acceso aprobado (entrar.html) aparece el botón
     «Abrir sala en vivo»; si no, un enlace para entrar.
   - Con ?sala=XXXX → quien creó la sala es el PROFE (conduce y guarda);
     cualquier otra persona es el ESTUDIANTE (sigue y resuelve ejercicios).
   ===================================================================== */
(() => {
  'use strict';
  if (window.claude && window.claude.use) return;   // dentro de claude.ai no se toca nada

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
  const SALA = (new URLSearchParams(location.search).get('sala') || '').replace(/[^a-z0-9]/gi, '').slice(0, 24);
  const COMO_ALUMNO = new URLSearchParams(location.search).get('como') === 'estudiante';
  const enlaceAlumno = id => location.origin + location.pathname + '?sala=' + id;

  /* ---------- carga de Firebase y acceso anónimo ---------- */
  /* si el tablero lo abrió el cargador (abrir.js), Firebase ya está cargado */
  const yaEsta = src => !!window.firebase && (/app-compat/.test(src) || (/auth-compat/.test(src) && !!firebase.auth) || (/database-compat/.test(src) && !!firebase.database));
  const carga = src => new Promise((ok, ko) => {
    if (yaEsta(src)) return ok();
    const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = ko; document.head.appendChild(s);
  });
  const conTiempo = (p, ms) => Promise.race([p, new Promise((_, ko) => setTimeout(() => ko(new Error('tiempo')), ms))]);
  /* SDK y app principal, sin abrir ninguna sesión */
  let _base = null;
  function baseLista() {
    if (_base) return _base;
    _base = conTiempo((async () => {
      await carga(SDK + 'firebase-app-compat.js');
      await Promise.all([carga(SDK + 'firebase-auth-compat.js'), carga(SDK + 'firebase-database-compat.js')]);
      return firebase.apps.find(a => a.name === '[DEFAULT]') || firebase.initializeApp(CFG);
    })(), 12000);
    _base.catch(() => { _base = null; });
    return _base;
  }

  /* ¿Hay un profe con acceso aprobado en este navegador? (entra en entrar.html) */
  async function profeAprobado() {
    const app = await baseLista();
    const u = await new Promise(ok => { const fin = app.auth().onAuthStateChanged(x => { fin(); ok(x); }); });
    if (!u || u.isAnonymous) return false;
    const db = app.database();
    const [estado, admin] = await Promise.all([
      db.ref('profes/' + u.uid + '/estado').get().then(s => s.val()).catch(() => null),
      db.ref('admins/' + u.uid).get().then(s => s.val() === true).catch(() => false)
    ]);
    return estado === 'aprobado' || admin;
  }

  let _fb = null;
  function firebaseListo() {
    if (_fb) return _fb;
    _fb = conTiempo((async () => {
      await baseLista();
      /* ?como=estudiante: vista de prueba del estudiante en el mismo navegador del profe
         (otra identidad anónima que dura solo lo que dura la pestaña) */
      const app = COMO_ALUMNO ? (firebase.apps.find(a => a.name === 'vista-estudiante') || firebase.initializeApp(CFG, 'vista-estudiante')) : await baseLista();
      const auth = app.auth();
      if (COMO_ALUMNO) await auth.setPersistence(firebase.auth.Auth.Persistence.NONE);
      const user = await new Promise((ok, ko) => {
        const fin = auth.onAuthStateChanged(async u => {
          fin();
          try { ok(u || (await auth.signInAnonymously()).user); } catch (e) { ko(e); }
        }, ko);
      });
      return { uid: user.uid, db: app.database(), TS: firebase.database.ServerValue.TIMESTAMP };
    })(), 12000);
    return _fb;
  }

  /* ---------- la sala: quién es quién ---------- */
  let _sala = null;
  function sala() {
    if (_sala) return _sala;
    _sala = (async () => {
      const F = await firebaseListo();
      const raiz = F.db.ref('salas/' + SALA);
      const dueno = (await raiz.child('dueno').get()).val();
      return Object.assign({ raiz, profe: !!dueno && dueno === F.uid, existe: !!dueno }, F);
    })();
    return _sala;
  }

  /* Los datos se guardan como texto JSON: así las claves con «/», los arreglos vacíos
     y los valores raros llegan intactos, igual que con la base de datos de Claude. */
  const clave = p => String(p).replace(/[.#$\[\]\/]/g, '~');
  const foto = s => ({
    exists: s.exists(),
    data: () => { if (!s.exists()) return undefined; try { return JSON.parse(s.val().j); } catch (e) { return undefined; } },
    metadata: { hasPendingWrites: false }
  });

  function hacerDb(S) {
    return {
      doc(ruta) {
        const r = S.raiz.child('d').child(clave(ruta));
        return {
          set: data => r.set({ j: JSON.stringify(data === undefined ? null : data), t: S.TS }),
          get: () => r.get().then(foto),
          onSnapshot(cb, err) {
            const h = s => cb(foto(s));
            r.on('value', h, e => err && err(e));
            return () => r.off('value', h);
          }
        };
      }
    };
  }

  function hacerRoom(S) {
    const pres = S.raiz.child('pres'), ev = S.raiz.child('ev');
    const mia = S.profe ? 'P' : S.uid;
    const yo = pres.child(mia), miEv = ev.child(S.uid);
    let lista = [], previos = new Map(), actual = {}, ultimo = null, tEnvio = 0, pendiente = false, nEv = 0;
    const subs = [], errs = [], oyentes = {};
    const empaqueta = () => ({ j: JSON.stringify(actual), t: S.TS });
    /* presencia acumulativa: cada llamada mezcla sus campos con los anteriores (null borra un campo) */
    function envia() {
      const ahora = Date.now();
      if (ahora - tEnvio < 90) { if (!pendiente) { pendiente = true; setTimeout(() => { pendiente = false; envia(); }, 95); } return Promise.resolve(); }
      tEnvio = ahora; ultimo = empaqueta(); return yo.set(ultimo);
    }
    pres.on('value', s => {
      const l = [];
      s.forEach(c => {
        let pr = {}; try { pr = JSON.parse(c.val().j); } catch (e) {}
        l.push({ peer: c.key, isMe: c.key === mia, kind: 'viewer', sameTab: false, presence: pr, updatedAt: c.val().t || Date.now() });
      });
      const ahora = new Map(l.map(x => [x.peer, x]));
      const ch = {
        peers: l,
        joined: l.filter(x => !previos.has(x.peer)),
        left: [...previos.values()].filter(x => !ahora.has(x.peer)),
        updated: l.filter(x => previos.has(x.peer) && previos.get(x.peer).updatedAt !== x.updatedAt)
      };
      lista = l; previos = ahora;
      subs.forEach(f => { try { f(ch); } catch (e) { console.error(e); } });
    }, e => errs.forEach(f => f(e)));
    /* mensajes: cada quien escribe en su propio buzón; los demás lo escuchan */
    const oye = s => {
      if (s.key === S.uid) return;
      const v = s.val(); if (!v || !v.n) return;
      (oyentes[v.n] || []).forEach(f => { try { f({ peer: v.de, kind: 'viewer', data: v.d, sentAt: v.t }); } catch (e) { console.error(e); } });
    };
    ev.on('child_added', oye); ev.on('child_changed', oye);
    S.db.ref('.info/connected').on('value', s => {
      if (!s.val()) return;
      yo.onDisconnect().remove(); miEv.onDisconnect().remove();
      if (ultimo) yo.set(empaqueta()).catch(() => {});
    });
    return {
      presence(d) {
        for (const k in (d || {})) { if (d[k] === null || d[k] === undefined) delete actual[k]; else actual[k] = d[k]; }
        return envia();
      },
      peers: () => lista,
      onPeers(cb, err) { subs.push(cb); if (err) errs.push(err); return () => {}; },
      emit(nombre, data) { return miEv.set({ n: String(nombre), d: data === undefined ? null : JSON.parse(JSON.stringify(data)), de: mia, k: ++nEv, t: S.TS }); },
      on(nombre, cb, err) { (oyentes[nombre] = oyentes[nombre] || []).push(cb); if (err) errs.push(err); return () => {}; }
    };
  }

  /* ---------- lo que el tablero ve como window.claude ---------- */
  let _db = null, _room = null;
  window.claude = {
    use: async nombre => {
      if (!SALA) return null;   // sin sala: modo local, como antes
      let S;
      try { S = await sala(); } catch (e) { console.warn('[vivo] sin conexión:', e); avisar('No se pudo conectar. El tablero funciona solo en esta pantalla.'); return null; }
      if (nombre === 'user') return { canEdit: async () => S.profe };
      if (nombre === 'db') return _db || (_db = hacerDb(S));
      if (nombre === 'room') return _room || (_room = hacerRoom(S));
      return null;
    }
  };

  /* ---------- botón flotante del profe ---------- */
  const CSS = `
  #vivoChip{position:fixed;left:12px;bottom:12px;z-index:19;display:flex;align-items:center;gap:6px;flex-wrap:wrap;
    font:700 14px/1.2 system-ui,'Segoe UI',sans-serif;color:#fff;background:#12303Aee;border-radius:14px;padding:6px;box-shadow:0 6px 20px #0005;max-width:calc(100vw - 24px)}
  #vivoChip button{font:inherit;color:inherit;border:0;cursor:pointer;border-radius:10px;padding:8px 12px;background:#ffffff1f}
  #vivoChip button:hover{background:#ffffff33}
  #vivoChip a{color:inherit;text-decoration:none;border-radius:10px;padding:8px 12px;background:#ffffff1f}
  #vivoChip a:hover{background:#ffffff33}
  #vivoChip a:focus-visible{outline:3px solid #F4B51E;outline-offset:2px}
  #vivoChip button:focus-visible{outline:3px solid #F4B51E;outline-offset:2px}
  #vivoChip .rojo{background:#E0392B}#vivoChip .rojo:hover{background:#c22d20}
  #vivoChip .ok{background:#1B9A55}
  #vivoChip .txt{padding:0 6px;opacity:.9;font-weight:600}
  #vivoChip .x{padding:8px 10px}
  #vivoAviso{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:19;background:#12303A;color:#fff;font:600 15px system-ui,sans-serif;padding:10px 16px;border-radius:12px;box-shadow:0 6px 20px #0005;max-width:90vw}
  /* el menú lateral deja sitio abajo para la barra de la sala */
  body.con-sala #lado{padding-bottom:72px}
  #vivoChip .ok.hecho{background:#F4B51E;color:#12303A}
  @media print{#vivoChip,#vivoAviso{display:none}}`;
  function avisar(t, ms = 4000) {
    let a = document.getElementById('vivoAviso');
    if (!a) { a = document.createElement('div'); a.id = 'vivoAviso'; a.setAttribute('role', 'status'); document.body.appendChild(a); }
    a.textContent = t; a.hidden = false; clearTimeout(a._t); a._t = setTimeout(() => a.hidden = true, ms);
  }
  const idNuevo = () => { const A = 'abcdefghjkmnpqrstuvwxyz23456789'; return [...crypto.getRandomValues(new Uint8Array(10))].map(x => A[x % A.length]).join(''); };
  async function copiar(t) {
    try { await navigator.clipboard.writeText(t); return true; } catch (e) {
      const ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (e2) {} ta.remove(); return ok;
    }
  }

  function chip() {
    const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    const c = document.createElement('div'); c.id = 'vivoChip'; document.body.appendChild(c); document.body.classList.add('con-sala');
    const plegar = () => { c.innerHTML = '<button class="x" title="Sala en vivo" aria-label="Mostrar la sala en vivo">●</button>'; c.firstChild.onclick = pintar; };

    async function pintar() {
      if (!SALA) {
        /* solo un profe con acceso aprobado puede abrir una sala */
        let profe = false;
        try { profe = await profeAprobado(); } catch (e) { console.warn('[vivo] sin conexión:', e); }
        if (!profe) {
          const volver = encodeURIComponent(location.pathname.split('/').pop() || '');
          c.innerHTML = '<a class="entra" href="entrar.html?volver=' + volver + '">● Entrar como profe para abrir una sala</a><button class="x" aria-label="Ocultar">✕</button>';
          c.querySelector('.x').onclick = plegar;
          return;
        }
        c.innerHTML = '<button class="rojo abre">● Abrir sala en vivo</button><button class="x" aria-label="Ocultar">✕</button>';
        c.querySelector('.x').onclick = plegar;
        c.querySelector('.abre').onclick = async e => {
          const b = e.currentTarget; b.disabled = true; b.textContent = 'Creando la sala…';
          try {
            const F = await firebaseListo(), id = idNuevo();
            await F.db.ref('salas/' + id + '/dueno').set(F.uid);
            /* tablero protegido: la sala recibe la clave para que el estudiante pueda abrirlo */
            const nombre = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');
            let k = window.LA_CLAVE || null;
            try { k = k || sessionStorage.getItem('la-clave:' + nombre); } catch (e2) {}
            if (k) await F.db.ref('salas/' + id + '/clave').set(k);
            location.href = location.pathname + '?sala=' + id;
          } catch (err) { console.error(err); b.disabled = false; b.textContent = '● Abrir sala en vivo'; avisar('No se pudo crear la sala. Revisa la conexión e inténtalo otra vez.'); }
        };
        return;
      }
      let S; try { S = await sala(); } catch (e) { c.remove(); return; }
      if (!S.profe) { c.remove(); document.body.classList.remove('con-sala'); if (!S.existe) avisar('Esta sala no existe o ya cerró. Pídele a tu profe un enlace nuevo.', 8000); return; }
      c.innerHTML = `<span class="txt">Sala <b>${SALA}</b></span><button class="ok cp">⧉ Copiar enlace del estudiante</button><button class="prueba" title="Abre en otra pestaña lo que ve el estudiante">Ver como estudiante</button><button class="sale" title="Volver al tablero sin sala">Salir</button><button class="x" aria-label="Ocultar">✕</button>`;
      c.querySelector('.cp').onclick = async e => {
        const b = e.currentTarget, ok = await copiar(enlaceAlumno(SALA));
        b.textContent = ok ? '✓ ¡Copiado!' : enlaceAlumno(SALA); b.classList.toggle('hecho', ok);
        avisar(ok ? 'Enlace copiado. Pégalo en el chat de la clase.' : 'No se pudo copiar solo. Copia este enlace a mano: ' + enlaceAlumno(SALA), ok ? 3000 : 10000);
        clearTimeout(b._t); b._t = setTimeout(() => { b.textContent = '⧉ Copiar enlace del estudiante'; b.classList.remove('hecho'); }, 3000);
      };
      c.querySelector('.prueba').onclick = () => window.open(enlaceAlumno(SALA) + '&como=estudiante', '_blank');
      c.querySelector('.sale').onclick = () => { location.href = location.pathname; };
      c.querySelector('.x').onclick = plegar;
    }
    pintar();
    if (SALA) sala().then(S => { if (S.profe) avisar('Sala abierta. Toca «Copiar enlace del estudiante» y pégalo en el chat de la clase.', 6000); }).catch(() => {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', chip); else chip();
})();
