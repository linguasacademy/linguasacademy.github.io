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

   Datos de una sala (salas/<sala>/…, reglas en database.rules.json):
     dueno               uid del profe que la abrió (no se puede cambiar)
     clave               clave del tablero cifrado (se borra al cerrar)
     cerrada             true cuando el profe cierra la sala (no se deshace)
     ajustes/menuOculto  menú lateral del estudiante oculto (por defecto, sí)
     d/…  pres/…  ev/…   estado guardado, presencia y mensajes
   ===================================================================== */
(() => {
  'use strict';
  if (window.claude && window.claude.use) return;   // dentro de claude.ai no se toca nada

  const FB = window.LA_FB || (() => {
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
    const yaEsta = src => !!window.firebase && (/app-compat/.test(src) || (/auth-compat/.test(src) && !!firebase.auth) || (/database-compat/.test(src) && !!firebase.database));
    const carga = src => new Promise((ok, ko) => {
      if (yaEsta(src)) return ok();
      const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => ko(new Error('red')); document.head.appendChild(s);
    });
    const conTiempo = (p, ms) => Promise.race([p, new Promise((_, ko) => setTimeout(() => ko(new Error('tiempo')), ms))]);
    const leer = (ref, ms) => new Promise((ok, ko) => {
      let fin = false; const t = setTimeout(() => { if (!fin) { fin = true; ko(new Error('tiempo')); } }, ms || 12000);
      ref.once('value').then(s => { if (!fin) { fin = true; clearTimeout(t); ok(s.val()); } }, e => { if (!fin) { fin = true; clearTimeout(t); ko(e); } });
    });
    const denegado = e => /permission/i.test((e && (e.code || e.message)) || '');
    const leer2 = async ref => { try { return await leer(ref); } catch (e) { if (denegado(e)) throw e; return leer(ref, 20000); } };
    return { CFG, SDK, carga, conTiempo, leer, denegado, leer2 };
  })();
  const { CFG, SDK, carga, conTiempo, leer2 } = FB;

  const Q = new URLSearchParams(location.search);
  const SALA = (Q.get('sala') || '').replace(/[^a-z0-9]/gi, '').slice(0, 24);
  const COMO_ALUMNO = Q.get('como') === 'estudiante';
  const NOMBRE = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');
  const enlaceAlumno = id => location.origin + location.pathname + '?sala=' + id;
  const ses = {
    get: k => { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} },
    del: k => { try { sessionStorage.removeItem(k); } catch (e) {} }
  };

  /* Textos que ve el ESTUDIANTE: en español y, si su navegador está en inglés o portugués, también en su lengua
     (en A1–A2 las consignas van en su lengua: un aviso solo en español puede no entenderse).
     Los mandos del profe van siempre en español. */
  const LENGUA = (() => {
    let l = '';
    try { l = String((navigator.languages && navigator.languages[0]) || navigator.language || '').toLowerCase(); } catch (e) {}
    return l.startsWith('pt') ? 'pt' : l.startsWith('en') ? 'en' : '';
  })();
  const TRAD = {
    'Tu profe cerró la clase. ¡Hasta la próxima!': ['Your teacher ended the class. See you next time!', 'Seu professor encerrou a aula. Até a próxima!'],
    'Ya puedes cerrar esta pestaña.': ['You can close this tab now.', 'Você já pode fechar esta aba.'],
    'Esta sala ya cerró.': ['This class has ended.', 'Esta aula já terminou.'],
    'Si quieres volver a entrar, pídele a tu profe un enlace nuevo.': ['To join again, ask your teacher for a new link.', 'Para entrar de novo, peça um link novo ao seu professor.'],
    'Tu profe tiene el menú cerrado durante la clase.': ['Your teacher keeps the menu closed during the class.', 'Seu professor deixou o menu fechado durante a aula.'],
    'Esta sala no existe o ya cerró. Pídele a tu profe un enlace nuevo.': ["This class doesn't exist or has ended. Ask your teacher for a new link.", 'Esta aula não existe ou já terminou. Peça um link novo ao seu professor.'],
    'No se pudo conectar con la sala. El tablero funciona solo en esta pantalla.': ["Couldn't connect to the class. The board only works on this screen.", 'Não foi possível conectar à aula. O quadro funciona só nesta tela.'],
    'Reintentar': ['Try again', 'Tentar de novo'],
    'Sin conexión con la sala. Reconectando…': ['No connection to the class. Reconnecting…', 'Sem conexão com a aula. Reconectando…'],
    'Conexión recuperada.': ['Connection restored.', 'Conexão restabelecida.'],
    'Sin conexión con la sala. Reintentar': ['No connection to the class. Try again', 'Sem conexão com a aula. Tentar de novo']
  };
  const trad = es => (LENGUA && TRAD[es] && TRAD[es][LENGUA === 'en' ? 0 : 1]) || '';
  const bi = es => { const t = trad(es); return t ? es + ' / ' + t : es; };

  /* Estado global de la sala en esta pestaña */
  let CERRADA = false;          // la sala se cerró: no se vuelve a tocar nada
  let MENU_BLOQ = false;        // el estudiante no puede abrir el menú lateral
  const escuchas = [];          // [ref, evento, función]: todo lo que se apaga al cerrar
  const escucha = (ref, evento, fn, err) => { ref.on(evento, fn, err); escuchas.push([ref, evento, fn]); return fn; };
  function apagarEscuchas() {
    while (escuchas.length) { const [ref, evento, fn] = escuchas.pop(); try { ref.off(evento, fn); } catch (e) {} }
  }

  /* ---------- carga de Firebase y acceso anónimo ---------- */
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

  /* ¿Hay un profe con acceso aprobado en este navegador? (entra en entrar.html)
     Si la red falla, vale el perfil guardado por auth.js; sin él, el error sube y se ofrece reintentar. */
  async function profeAprobado() {
    const app = await baseLista();
    const u = await new Promise(ok => { let fin; let ya = false; fin = app.auth().onAuthStateChanged(x => { if (ya) return; ya = true; if (fin) fin(); ok(x); }); if (ya && fin) fin(); });
    if (!u || u.isAnonymous) return false;
    const db = app.database();
    try {
      const [estado, admin] = await Promise.all([leer2(db.ref('profes/' + u.uid + '/estado')), leer2(db.ref('admins/' + u.uid)).then(v => v === true)]);
      return estado === 'aprobado' || admin;
    } catch (e) {
      let c = null; try { c = JSON.parse(localStorage.getItem('la-perfil') || 'null'); } catch (e2) {}
      if (c && c.uid === u.uid) return c.estado === 'aprobado' || c.admin === true;
      throw e;
    }
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
        let fin;
        let ya = false;
        fin = auth.onAuthStateChanged(async u => {
          if (ya) return;
          ya = true;
          if (fin) fin();
          try { ok(u || (await auth.signInAnonymously()).user); } catch (e) { ko(e); }
        }, ko);
        if (ya && fin) fin();
      });
      return { uid: user.uid, db: app.database(), TS: firebase.database.ServerValue.TIMESTAMP };
    })(), 12000);
    _fb.catch(() => { _fb = null; });
    return _fb;
  }

  /* ---------- la sala: quién es quién ---------- */
  let _sala = null;
  function sala() {
    if (_sala) return _sala;
    _sala = (async () => {
      const F = await firebaseListo();
      const raiz = F.db.ref('salas/' + SALA);
      const [dueno, cerrada] = await Promise.all([
        leer2(raiz.child('dueno')),
        leer2(raiz.child('cerrada')).catch(() => null)
      ]);
      return Object.assign({ raiz, profe: !!dueno && dueno === F.uid, existe: !!dueno, cerrada: cerrada === true }, F);
    })();
    _sala.catch(() => { _sala = null; });
    return _sala;
  }

  /* Conexión compartida por todas las llamadas de claude.use(): un reintento corto
     antes de rendirse, y un solo aviso (con «Reintentar», que recarga la página
     para que el tablero vuelva a pedir la sala desde el principio). */
  let _conexion = null;
  function conectar() {
    if (_conexion) return _conexion;
    _conexion = (async () => {
      let S;
      try { S = await sala(); } catch (e) { S = await sala(); }   // un reintento inmediato
      vigilar(S);
      return S;
    })();
    _conexion.catch(e => {
      _conexion = null;
      if (CERRADA) return;
      bloquearMenu(false);   // sin sala nadie puede soltar el menú: se devuelve al estudiante
      console.warn('[vivo] sin conexión:', e);
      avisar(bi('No se pudo conectar con la sala. El tablero funciona solo en esta pantalla.'), 0, { texto: bi('Reintentar'), accion: () => location.reload() });
    });
    return _conexion;
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
          set: data => CERRADA ? Promise.resolve() : r.set({ j: JSON.stringify(data === undefined ? null : data), t: S.TS }),
          get: () => r.once('value').then(foto),
          onSnapshot(cb, err) {
            const h = s => { if (!CERRADA) cb(foto(s)); };
            escucha(r, 'value', h, e => { if (!CERRADA && err) err(e); });
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
    let lista = [], cargado = false, previos = new Map(), actual = {}, ultimo = null, tEnvio = 0, pendiente = false, nEv = 0;
    const subs = [], presErrs = [], evErrs = [], oyentes = {};
    const empaqueta = () => ({ j: JSON.stringify(actual), t: S.TS });
    /* presencia acumulativa: cada llamada mezcla sus campos con los anteriores (null borra un campo) */
    function envia() {
      if (CERRADA) return Promise.resolve();
      const ahora = Date.now();
      if (ahora - tEnvio < 90) { if (!pendiente) { pendiente = true; setTimeout(() => { pendiente = false; envia().catch(() => {}); }, 95); } return Promise.resolve(); }
      tEnvio = ahora; ultimo = empaqueta(); return yo.set(ultimo);
    }
    escucha(pres, 'value', s => {
      if (CERRADA) return;
      const l = [];
      s.forEach(c => {
        const v = c.val() || {};
        let pr = {}; try { pr = JSON.parse(v.j); } catch (e) {}
        l.push({ peer: c.key, isMe: c.key === mia, kind: 'viewer', sameTab: false, presence: pr, updatedAt: v.t || Date.now() });
      });
      const ahora = new Map(l.map(x => [x.peer, x]));
      const ch = {
        peers: l,
        joined: l.filter(x => !previos.has(x.peer)),
        left: [...previos.values()].filter(x => !ahora.has(x.peer)),
        updated: l.filter(x => previos.has(x.peer) && previos.get(x.peer).updatedAt !== x.updatedAt)
      };
      lista = l; cargado = true; previos = ahora;
      subs.slice().forEach(f => { try { f(ch); } catch (e) { console.error(e); } });
    }, e => { if (!CERRADA) presErrs.slice().forEach(f => f(e)); });
    /* mensajes: cada quien escribe en su propio buzón; los demás lo escuchan */
    const oye = s => {
      if (CERRADA || s.key === S.uid) return;
      const v = s.val(); if (!v || !v.n) return;
      (oyentes[v.n] || []).slice().forEach(f => { try { f({ peer: v.de, kind: 'viewer', data: v.d, sentAt: v.t }); } catch (e) { console.error(e); } });
    };
    let listo = false;
    const onEvErr = e => { if (!CERRADA) evErrs.slice().forEach(f => f(e)); };
    escucha(ev, 'child_added', s => { if (listo) oye(s); }, onEvErr);
    escucha(ev, 'child_changed', oye, onEvErr);
    ev.once('value', () => { listo = true; }, onEvErr);
    escucha(S.db.ref('.info/connected'), 'value', s => {
      if (!s.val() || CERRADA) return;
      yo.onDisconnect().remove(); miEv.onDisconnect().remove();
      if (ultimo) yo.set(empaqueta()).catch(() => {});
    });
    return {
      presence(d) {
        for (const k in (d || {})) { if (d[k] === null || d[k] === undefined) delete actual[k]; else actual[k] = d[k]; }
        return envia();
      },
      peers: () => lista,
      onPeers(cb, err) {
        subs.push(cb);
        if (err) presErrs.push(err);
        let activo = true;
        if (cargado) {
          Promise.resolve().then(() => {
            if (activo) {
              try { cb({ peers: lista, joined: lista, left: [], updated: [] }); } catch (e) { console.error(e); }
            }
          });
        }
        return () => {
          if (!activo) return;
          activo = false;
          const i = subs.indexOf(cb); if (i !== -1) subs.splice(i, 1);
          if (err) { const j = presErrs.indexOf(err); if (j !== -1) presErrs.splice(j, 1); }
        };
      },
      emit(nombre, data) {
        if (CERRADA) return Promise.resolve();
        return miEv.set({ n: String(nombre), d: data === undefined ? null : JSON.parse(JSON.stringify(data)), de: mia, k: ++nEv, t: S.TS });
      },
      on(nombre, cb, err) {
        const l = oyentes[nombre] = oyentes[nombre] || [];
        l.push(cb);
        if (err) evErrs.push(err);
        let activo = true;
        return () => {
          if (!activo) return;
          activo = false;
          const i = l.indexOf(cb); if (i !== -1) l.splice(i, 1);
          if (err) { const j = evErrs.indexOf(err); if (j !== -1) evErrs.splice(j, 1); }
        };
      }
    };
  }

  /* ---------- lo que el tablero ve como window.claude ---------- */
  let _db = null, _room = null;
  window.claude = {
    use: async nombre => {
      if (!SALA || CERRADA) return null;   // sin sala: modo local, como antes
      let S;
      try { S = await conectar(); } catch (e) { return null; }
      if (S.cerrada || CERRADA) return null;
      if (nombre === 'user') return { canEdit: async () => S.profe };
      if (nombre === 'db') return _db || (_db = hacerDb(S));
      if (nombre === 'room') return _room || (_room = hacerRoom(S));
      return null;
    }
  };

  /* ---------- iconos (Lucide, ISC) ---------- */
  const ICO = {
    radio: '<path d="M16.247 7.761a6 6 0 0 1 0 8.478"/><path d="M19.075 4.933a10 10 0 0 1 0 14.134"/><path d="M4.925 19.067a10 10 0 0 1 0-14.134"/><path d="M7.753 16.239a6 6 0 0 1 0-8.478"/><circle cx="12" cy="12" r="2"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
    power: '<path d="M12 2v10"/><path d="M18.4 6.6a9 9 0 1 1-12.77.04"/>',
    cerrarPanel: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m16 15-3-3 3-3"/>',
    abrirPanel: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m14 9 3 3-3 3"/>',
    recargar: '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>'
  };
  const ico = (n, t = 18) => '<svg class="ico" aria-hidden="true" width="' + t + '" height="' + t + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + ICO[n] + '</svg>';

  /* ---------- estilos de la barra de la sala y de los avisos ---------- */
  const CSS = `
  #vivoChip{position:fixed;left:12px;bottom:12px;z-index:19;display:flex;align-items:center;gap:6px;flex-wrap:wrap;
    font:700 14px/1.2 system-ui,'Segoe UI',sans-serif;color:#fff;background:#12303Aee;border-radius:14px;padding:6px;box-shadow:0 6px 20px #0005;max-width:calc(100vw - 24px)}
  #vivoChip:empty{display:none}
  #vivoChip button{font:inherit;color:inherit;border:0;cursor:pointer;border-radius:10px;padding:8px 12px;background:#ffffff1f;display:inline-flex;align-items:center;gap:6px}
  #vivoChip button:hover{background:#ffffff33}
  #vivoChip button:disabled{opacity:.6;cursor:progress}
  #vivoChip a{color:inherit;text-decoration:none;border-radius:10px;padding:8px 12px;background:#ffffff1f}
  #vivoChip a.volver{white-space:nowrap}
  #vivoChip a:hover{background:#ffffff33}
  #vivoChip a:focus-visible{outline:3px solid #F4B51E;outline-offset:2px}
  #vivoChip button:focus-visible{outline:3px solid #F4B51E;outline-offset:2px}
  #vivoChip .rojo{background:#C0392B}#vivoChip .rojo:hover{background:#A93226}
  #vivoChip .ok{background:#157A43}
  #vivoChip .txt{padding:0 6px;opacity:.95;font-weight:600}
  #vivoChip .x{padding:8px 10px}
  #vivoChip .ico{flex:none}
  #vivoChip button[aria-pressed="true"]{background:#ffffff40}
  #vivoAviso{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:20;display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:#12303A;color:#fff;font:600 15px system-ui,sans-serif;padding:10px 16px;border-radius:12px;box-shadow:0 6px 20px #0005;max-width:90vw}
  #vivoAviso[hidden]{display:none}
  /* con la barra de la sala abajo, el aviso sale arriba para no taparla */
  body.con-sala #vivoAviso{bottom:auto;top:56px}
  #vivoAviso button{font:inherit;color:#12303A;background:#F4B51E;border:0;border-radius:10px;padding:6px 12px;cursor:pointer}
  #vivoAviso button:focus-visible{outline:3px solid #fff;outline-offset:2px}
  /* el menú lateral deja sitio abajo para la barra de la sala */
  body.con-sala #lado{padding-bottom:72px}
  #vivoChip .ok.hecho{background:#F4B51E;color:#12303A}
  /* el profe ocultó el menú al estudiante */
  body.vivo-sin-menu #lado{display:none!important}
  body.vivo-sin-menu #bMenu{cursor:default}
  @media print{#vivoChip,#vivoAviso{display:none}}`;
  function estilos() {
    let st = document.getElementById('vivoStyle');
    if (!st) { st = document.createElement('style'); st.id = 'vivoStyle'; document.head.appendChild(st); }
    st.textContent = CSS;
  }

  /* Aviso flotante. ms = 0 lo deja fijo; boton = { texto, accion } añade un botón. */
  function avisar(t, ms = 4000, boton) {
    let a = document.getElementById('vivoAviso');
    if (!a) { a = document.createElement('div'); a.id = 'vivoAviso'; a.setAttribute('role', 'status'); a.setAttribute('aria-live', 'polite'); document.body.appendChild(a); }
    a.textContent = t;
    if (boton) {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = boton.texto;
      b.onclick = () => { a.hidden = true; boton.accion(); };
      a.appendChild(b);
    }
    a.hidden = false; clearTimeout(a._t);
    if (ms > 0) a._t = setTimeout(() => { a.hidden = true; }, ms);
  }
  const callarAviso = () => { const a = document.getElementById('vivoAviso'); if (a) { clearTimeout(a._t); a.hidden = true; } };
  const idNuevo = () => { const A = 'abcdefghjkmnpqrstuvwxyz23456789'; return [...crypto.getRandomValues(new Uint8Array(10))].map(x => A[x % A.length]).join(''); };
  async function copiar(t) {
    try { await navigator.clipboard.writeText(t); return true; } catch (e) {
      const ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (e2) {} ta.remove(); return ok;
    }
  }

  /* ---------- menú lateral del estudiante ---------- */
  /* Por defecto, oculto: el profe conduce la clase (pestañas, páginas, secciones) y
     el estudiante solo resuelve los ejercicios; además gana pantalla en el celular. */
  const MENU_DEFECTO_OCULTO = true;
  const menuOculto = v => (v === true || v === false) ? v : MENU_DEFECTO_OCULTO;
  let _plegadoPorVivo = false;   // el menú estaba abierto y lo cerró vivo.js
  function plegarLado() {
    const app = document.getElementById('app');
    if (app && !app.classList.contains('plegado')) { app.classList.add('plegado'); _plegadoPorVivo = true; }
    const b = document.getElementById('bMenu');
    if (b && b.getAttribute('aria-expanded') === 'true') b.setAttribute('aria-expanded', 'false');
  }
  let _obs = null;
  function bloquearMenu(on, abrirAlSoltar) {
    const antes = MENU_BLOQ;
    MENU_BLOQ = !!on;
    if (!document.body) return;
    document.body.classList.toggle('vivo-sin-menu', MENU_BLOQ);
    const b = document.getElementById('bMenu');
    if (MENU_BLOQ) {
      plegarLado();
      if (b && b.getAttribute('aria-disabled') !== 'true') {
        b.setAttribute('aria-disabled', 'true');
        b.setAttribute('data-vivo-title', b.getAttribute('title') || '');
        b.setAttribute('title', bi('Tu profe tiene el menú cerrado durante la clase.'));
      }
      /* si el tablero intenta abrirlo por su cuenta (o lo sincroniza), se vuelve a plegar */
      if (!_obs && typeof MutationObserver === 'function') {
        _obs = new MutationObserver(() => {
          if (!MENU_BLOQ) return;
          if (document.body && !document.body.classList.contains('vivo-sin-menu')) document.body.classList.add('vivo-sin-menu');
          plegarLado();
        });
        _obs.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'aria-expanded'] });
      }
    } else {
      if (_obs) { _obs.disconnect(); _obs = null; }
      if (b && b.getAttribute('aria-disabled') === 'true') {
        b.removeAttribute('aria-disabled');
        const t = b.getAttribute('data-vivo-title'); b.removeAttribute('data-vivo-title');
        if (t) b.setAttribute('title', t); else b.removeAttribute('title');
      }
      /* el profe acaba de mostrarlo: se abre una vez y el estudiante lo puede volver a cerrar.
         Al cargar, si vivo.js lo había cerrado por precaución, se deja como estaba. */
      const devolver = antes && (abrirAlSoltar || _plegadoPorVivo);
      _plegadoPorVivo = false;
      if (devolver) {
        const app = document.getElementById('app');
        if (app) app.classList.remove('plegado');
        if (b && b.hasAttribute('aria-expanded')) b.setAttribute('aria-expanded', 'true');
      }
    }
  }
  /* Bloqueo del botón del logo (#bMenu) y de la tecla S, antes que el tablero los vea:
     escuchas en fase de captura sobre window, registradas antes que las del tablero. */
  const esCampo = t => !!t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName || ''));
  const frena = e => { e.preventDefault(); if (e.stopImmediatePropagation) e.stopImmediatePropagation(); e.stopPropagation(); };
  function vigilaMenuAlumno(e) {
    if (!MENU_BLOQ) return;
    const t = e.target;
    const el = t && t.closest ? t.closest('#bMenu, [aria-controls="lado"]') : null;
    if (!el) return;
    frena(e);
    if (e.type === 'click') avisar(bi('Tu profe tiene el menú cerrado durante la clase.'), 2500);
  }
  function teclaMenuAlumno(e) {
    if (!MENU_BLOQ || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key !== 's' && e.key !== 'S') return;
    if (esCampo(e.target)) return;
    frena(e);
  }
  if (SALA && typeof window.addEventListener === 'function') {
    window.addEventListener('click', vigilaMenuAlumno, true);
    window.addEventListener('keydown', teclaMenuAlumno, true);
  }
  /* El estudiante que llega por el cargador (window.LA_PROFE === false) o la vista de prueba
     empiezan con el menú cerrado, sin esperar a Firebase, para que no se vea un instante. */
  const pareceAlumno = () => !!SALA && (COMO_ALUMNO || window.LA_PROFE === false);

  /* ---------- fin de la clase en la pantalla del estudiante ---------- */
  const FIN_AHORA = 'Tu profe cerró la clase. ¡Hasta la próxima!';
  const FIN_YA = 'Esta sala ya cerró.';
  function cerrarPantalla(ahora) {
    if (CERRADA) return;
    CERRADA = true;
    MENU_BLOQ = false;
    if (_obs) { _obs.disconnect(); _obs = null; }
    apagarEscuchas();
    /* la clave del tablero ya no sirve en esta pestaña */
    ses.del('la-clave:' + NOMBRE);
    window.LA_CLAVE = undefined;
    /* se borra el tablero descifrado: cuerpo entero y scripts/estilos de la cabeza */
    if (document.head) document.head.querySelectorAll('script, style, link, template, noscript').forEach(n => n.remove());
    Array.from(document.body.attributes || []).forEach(a => document.body.removeAttribute(a.name));
    document.body.replaceChildren();
    try { document.title = "Clase terminada · Lingua's Academy"; } catch (e) {}
    const st = document.createElement('style'); st.id = 'vivoStyle';
    st.textContent = 'html,body{height:100%;margin:0}' +
      'body{display:grid;place-items:center;background:#F5F2EC;color:#17223D;font:500 18px/1.5 system-ui,\'Segoe UI\',sans-serif;padding:24px;box-sizing:border-box}' +
      '#vivoFin{max-width:460px;text-align:center;display:grid;gap:14px;justify-items:center;background:#FFFDF9;border:2.5px solid #17223D;border-radius:26px;box-shadow:5px 5px 0 #17223D;padding:28px 24px}' +
      '#vivoFin img{width:56px;height:56px}#vivoFin h1{font:400 clamp(22px,4vw,28px)/1.25 \'Young Serif\',Georgia,serif;margin:0}#vivoFin p{margin:0;color:#5B6478}';
    document.head.appendChild(st);
    const fin = document.createElement('main');
    fin.id = 'vivoFin'; fin.setAttribute('role', 'alert');
    const img = document.createElement('img'); img.setAttribute('src', 'logo.svg'); img.setAttribute('alt', '');
    const h = document.createElement('h1'); h.textContent = ahora ? FIN_AHORA : FIN_YA;
    const p = document.createElement('p');
    p.textContent = ahora ? 'Ya puedes cerrar esta pestaña.' : 'Si quieres volver a entrar, pídele a tu profe un enlace nuevo.';
    fin.appendChild(img); fin.appendChild(h); fin.appendChild(p);
    const t1 = trad(h.textContent), t2 = trad(p.textContent);
    if (t1) {
      const pt = document.createElement('p');
      pt.setAttribute('lang', LENGUA === 'pt' ? 'pt-BR' : 'en');
      pt.textContent = t1 + ' ' + t2;
      fin.appendChild(pt);
    }
    document.body.appendChild(fin);
    /* Los scripts del tablero siguen vivos en memoria: sus escuchas de teclado y clic ya no deben
       tocar nada (fallarían sobre elementos borrados), y sus cronómetros se detienen. */
    if (typeof window.addEventListener === 'function') {
      const corta = e => { const t = e.target; if (!(t && t.closest && t.closest('#vivoFin'))) e.stopImmediatePropagation(); };
      ['keydown', 'keyup', 'keypress', 'click', 'input', 'pointerdown'].forEach(tipo => window.addEventListener(tipo, corta, true));
    }
    try {
      const tope = setTimeout(() => {}, 0);
      if (typeof tope === 'number') for (let i = tope; i > 0 && tope - i < 100000; i--) { clearTimeout(i); clearInterval(i); }
    } catch (e) {}
  }

  /* ---------- lo que se escucha de la sala: cierre, menú y conexión ---------- */
  let _vigilando = false;
  const alCambiarMenu = [];
  let MENU_OCULTO = MENU_DEFECTO_OCULTO;
  function vigilar(S) {
    if (_vigilando || CERRADA) return;
    _vigilando = true;
    if (S.profe) bloquearMenu(false);   // el menú del profe nunca se bloquea
    if (S.cerrada) { if (S.profe) return; cerrarPantalla(false); return; }
    if (!S.existe) { bloquearMenu(false); return; }
    /* 1 · cierre en tiempo real */
    escucha(S.raiz.child('cerrada'), 'value', s => {
      if (s.val() !== true || CERRADA) return;
      if (S.profe) {
        /* otra pestaña del profe cerró la sala: esta vuelve al tablero sin sala */
        CERRADA = true; apagarEscuchas();
        ses.set('la-vivo-aviso', 'La sala se cerró.');
        location.href = location.pathname;
      } else {
        cerrarPantalla(true);
      }
    }, () => {});
    /* 2 · menú lateral del estudiante (el valor llega enseguida; mientras, vale el bloqueo previo) */
    let primera = true;
    escucha(S.raiz.child('ajustes').child('menuOculto'), 'value', s => {
      if (CERRADA) return;
      MENU_OCULTO = menuOculto(s.val());
      if (!S.profe) bloquearMenu(MENU_OCULTO, !primera);
      primera = false;
      alCambiarMenu.slice().forEach(f => { try { f(MENU_OCULTO); } catch (e) { console.error(e); } });
    }, () => {});
    /* 3 · conexión: aviso si se cae a mitad de clase y cuando vuelve */
    let estuvo = false, caido = false, tCaida = null;
    escucha(S.db.ref('.info/connected'), 'value', s => {
      if (CERRADA) return;
      if (s.val()) {
        clearTimeout(tCaida);
        if (caido) avisar(bi('Conexión recuperada.'), 3000);
        estuvo = true; caido = false;
      } else if (estuvo && !tCaida) {
        tCaida = setTimeout(() => { tCaida = null; caido = true; if (!CERRADA) avisar(bi('Sin conexión con la sala. Reconectando…'), 0); }, 4000);
      }
    }, () => {});
  }

  /* El profe cierra la sala: un solo cambio atómico marca «cerrada» y borra la clave,
     el estado guardado, la presencia y los mensajes. Las reglas impiden reabrirla. */
  function cerrarSalaEnFirebase(S) {
    const borrar = ['clave', 'ajustes', 'd', 'pres', 'ev'];
    if (typeof S.raiz.update === 'function') {
      const cambios = { cerrada: true };
      borrar.forEach(k => { cambios[k] = null; });
      return S.raiz.update(cambios);
    }
    return S.raiz.child('cerrada').set(true)
      .then(() => Promise.all(borrar.map(k => S.raiz.child(k).remove().catch(() => {}))));
  }

  /* ---------- barra flotante del profe ---------- */
  function chip() {
    estilos();
    if (pareceAlumno()) bloquearMenu(MENU_DEFECTO_OCULTO);
    let c = document.getElementById('vivoChip');
    if (!c) { c = document.createElement('div'); c.id = 'vivoChip'; document.body.appendChild(c); }
    c.setAttribute('role', 'region');
    c.setAttribute('aria-label', 'Sala en vivo');
    document.body.classList.add('con-sala');
    const urlCat = (() => {
      if (window.LA_CATALOGO) return window.LA_CATALOGO;
      return ses.get('la-catalogo') || 'tableros.html';
    })();
    const esc = s => String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
    const volverHtml = '<a class="volver" href="' + esc(urlCat) + '" title="Volver al catálogo de tableros">← Catálogo</a>';
    const cerrarX = '<button class="x" type="button" aria-label="Ocultar la barra de la sala" title="Ocultar">' + ico('x') + '</button>';
    let esProfeChip = window.LA_PROFE === true;
    const plegar = () => {
      c.innerHTML = (esProfeChip ? volverHtml : '') + '<button class="x" type="button" title="Sala en vivo" aria-label="Mostrar la sala en vivo" aria-expanded="false">' + ico('radio') + '</button>';
      c.querySelector('.x').onclick = pintar;
    };
    const quitaChip = () => { c.remove(); document.body.classList.remove('con-sala'); };
    const pide = ses.get('la-vivo-aviso');
    if (pide) { ses.del('la-vivo-aviso'); avisar(pide, 5000); }

    async function pintar() {
      if (CERRADA) { quitaChip(); return; }
      if (!SALA) {
        /* solo un profe con acceso aprobado puede abrir una sala */
        let profe = false;
        try { profe = await profeAprobado(); } catch (e) {
          console.warn('[vivo] sin conexión:', e);
          c.innerHTML = (esProfeChip ? volverHtml : '') + '<button class="reint" type="button">' + ico('recargar') + 'Sala en vivo: sin conexión. Reintentar</button>' + cerrarX;
          c.querySelector('.reint').onclick = () => { c.querySelector('.reint').textContent = 'Conectando…'; pintar(); };
          c.querySelector('.x').onclick = plegar;
          return;
        }
        if (!profe) {
          esProfeChip = false;
          const volver = encodeURIComponent(location.pathname.split('/').pop() || '');
          c.innerHTML = '<a class="entra" href="entrar.html?volver=' + volver + '">Entrar como profe para abrir una sala</a>' + cerrarX;
          c.querySelector('.x').onclick = plegar;
          return;
        }
        esProfeChip = true;
        c.innerHTML = volverHtml + '<button class="rojo abre" type="button">' + ico('radio') + 'Abrir sala en vivo</button>' + cerrarX;
        c.querySelector('.x').onclick = plegar;
        c.querySelector('.abre').onclick = async e => {
          const b = e.currentTarget || c.querySelector('.abre'); b.disabled = true; b.textContent = 'Creando la sala…';
          try {
            const F = await firebaseListo(), id = idNuevo();
            await F.db.ref('salas/' + id + '/dueno').set(F.uid);
            /* tablero protegido: la sala recibe la clave para que el estudiante pueda abrirlo */
            const k = window.LA_CLAVE || ses.get('la-clave:' + NOMBRE);
            if (k) await F.db.ref('salas/' + id + '/clave').set(k);
            location.href = location.pathname + '?sala=' + id;
          } catch (err) { console.error(err); b.disabled = false; b.innerHTML = ico('radio') + 'Abrir sala en vivo'; avisar('No se pudo crear la sala. Revisa la conexión e inténtalo otra vez.'); }
        };
        return;
      }
      let S; try { S = await sala(); } catch (e) {
        console.warn('[vivo] sala sin conexión:', e); _sala = null;
        if (!esProfeChip) bloquearMenu(false);
        /* si el tablero no logró conectarse, solo una recarga lo vuelve a enlazar con la sala */
        c.innerHTML = (esProfeChip ? volverHtml : '') + '<button class="reint" type="button">' + ico('recargar') + esc(esProfeChip ? 'Sin conexión con la sala. Reintentar' : bi('Sin conexión con la sala. Reintentar')) + '</button>';
        c.querySelector('.reint').onclick = () => location.reload();
        return;
      }
      if (!S.profe) {
        quitaChip();
        if (!S.existe) { bloquearMenu(false); avisar(bi('Esta sala no existe o ya cerró. Pídele a tu profe un enlace nuevo.'), 8000); }
        else vigilar(S);
        return;
      }
      esProfeChip = true;
      if (S.cerrada) {
        c.innerHTML = volverHtml + '<span class="txt">Esta sala ya cerró.</span><button class="sinsala" type="button">Volver al tablero sin sala</button>';
        c.querySelector('.sinsala').onclick = () => { location.href = location.pathname; };
        return;
      }
      vigilar(S);
      pintaSala(S);
    }

    function pintaSala(S) {
      c.innerHTML = volverHtml +
        '<span class="txt">Sala <b>' + SALA + '</b></span>' +
        '<button class="ok cp" type="button">' + ico('copy') + 'Copiar enlace del estudiante</button>' +
        '<button class="prueba" type="button" title="Abre en otra pestaña lo que ve el estudiante">' + ico('eye') + 'Ver como estudiante</button>' +
        '<button class="menu" type="button"></button>' +
        '<button class="sale" type="button" title="Termina la clase: el estudiante sale y el enlace deja de funcionar">Cerrar sala</button>' +
        cerrarX;
      c.querySelector('.cp').onclick = async e => {
        const b = e.currentTarget || c.querySelector('.cp'), ok = await copiar(enlaceAlumno(SALA));
        if (ok) b.innerHTML = ico('check') + '¡Copiado!'; else b.textContent = enlaceAlumno(SALA);
        b.classList.toggle('hecho', ok);
        avisar(ok ? 'Enlace copiado. Pégalo en el chat de la clase.' : 'No se pudo copiar solo. Copia este enlace a mano: ' + enlaceAlumno(SALA), ok ? 3000 : 10000);
        clearTimeout(b._t); b._t = setTimeout(() => { b.innerHTML = ico('copy') + 'Copiar enlace del estudiante'; b.classList.remove('hecho'); }, 3000);
      };
      c.querySelector('.prueba').onclick = () => window.open(enlaceAlumno(SALA) + '&como=estudiante', '_blank');
      /* menú del estudiante */
      const bm = c.querySelector('.menu');
      const rotula = oculto => {
        bm.innerHTML = oculto ? ico('abrirPanel') + 'Mostrar menú al estudiante' : ico('cerrarPanel') + 'Ocultar menú al estudiante';
        bm.setAttribute('aria-pressed', oculto ? 'true' : 'false');
        bm.title = oculto ? 'Ahora el estudiante no puede abrir el menú lateral' : 'Ahora el estudiante puede abrir el menú lateral';
      };
      rotula(MENU_OCULTO);
      alCambiarMenu.length = 0; alCambiarMenu.push(rotula);
      bm.onclick = async () => {
        const nuevo = !MENU_OCULTO;
        bm.disabled = true;
        try {
          await conTiempo(S.raiz.child('ajustes').child('menuOculto').set(nuevo), 12000);
          MENU_OCULTO = nuevo; rotula(nuevo);
          avisar(nuevo ? 'Menú oculto para el estudiante.' : 'Menú visible para el estudiante.', 2500);
        } catch (err) {
          console.error(err); avisar('No se pudo cambiar el menú del estudiante. Revisa la conexión.');
        }
        bm.disabled = false;
      };
      c.querySelector('.sale').onclick = () => confirmaCierre(S);
      c.querySelector('.x').onclick = plegar;
    }

    /* Confirmación propia (sin confirm() nativo): «Cancelar» tiene el foco y Escape cancela. */
    function confirmaCierre(S) {
      c.innerHTML = volverHtml +
        '<span class="txt" id="vivoPregunta">¿Cerrar la sala? Tu estudiante saldrá de la clase y el enlace dejará de funcionar.</span>' +
        '<button class="rojo si" type="button">' + ico('power') + 'Sí, cerrar la sala</button>' +
        '<button class="no" type="button">Cancelar</button>';
      c.setAttribute('role', 'alertdialog');
      c.setAttribute('aria-describedby', 'vivoPregunta');
      const no = c.querySelector('.no'), si = c.querySelector('.si');
      const vuelve = () => {
        c.setAttribute('role', 'region'); c.removeAttribute('aria-describedby');
        c.removeEventListener('keydown', tecla);
        pintaSala(S);
        const b = c.querySelector('.sale'); if (b && b.focus) b.focus();
      };
      const tecla = e => { if (e.key === 'Escape') { e.preventDefault(); vuelve(); } };
      c.addEventListener('keydown', tecla);
      no.onclick = vuelve;
      if (no.focus) no.focus();
      si.onclick = async () => {
        c.removeEventListener('keydown', tecla);
        si.disabled = true; no.disabled = true;
        si.textContent = 'Cerrando la sala…';
        const cierre = cerrarSalaEnFirebase(S);
        let hecho = false;
        cierre.then(() => {
          hecho = true;
          CERRADA = true; apagarEscuchas();
          ses.set('la-vivo-aviso', 'Sala cerrada. Tu estudiante ya salió de la clase.');
          location.href = location.pathname;
        }, err => {
          console.error(err);
          c.setAttribute('role', 'region'); c.removeAttribute('aria-describedby');
          pintaSala(S);
          avisar('No se pudo cerrar la sala. Revisa la conexión e inténtalo otra vez.', 8000);
        });
        /* sin conexión, el cambio espera en cola: la pestaña debe seguir abierta */
        setTimeout(() => {
          if (!hecho && !CERRADA) avisar('Sin conexión: la sala se cerrará en cuanto vuelva la conexión. No cierres esta pestaña.', 0);
        }, 8000);
      };
    }

    pintar();
    if (SALA) sala().then(S => { if (S.profe && !S.cerrada) avisar('Sala abierta. Toca «Copiar enlace del estudiante» y pégalo en el chat de la clase.', 6000); }).catch(() => {});
  }

  /* ---------- el estudiante no navega: solo el profe pasa de página ----------
     Defensa propia de vivo.js, además de la que trae el tablero: oculta Anterior, Inicio,
     Siguiente, Añadir y Vaciar, y frena las flechas ← → (salvo dentro de un campo de texto). */
  const NAV_ALUMNO = '#bAnt,#bSig,#bInicio,#bEditar,#bVaciar,.vaciar,#bHecha,.reini,.editbar,.herr';
  if (pareceAlumno() && typeof window.addEventListener === 'function') {
    const st = document.createElement('style');
    st.id = 'vivoAlumnoStyle';
    st.textContent = NAV_ALUMNO.split(',').map(x => 'body ' + x).join(',') + '{display:none!important}' +
      '.tabs button,.it,.flecha,.libro .nav button{pointer-events:none}';
    (document.head || document.documentElement).appendChild(st);
    window.addEventListener('click', e => {
      if (CERRADA) return;
      const t = e.target;
      if (t && t.closest && t.closest(NAV_ALUMNO + ',.tabs button,.it')) frena(e);
    }, true);
    window.addEventListener('keydown', e => {
      if (CERRADA || e.ctrlKey || e.metaKey || e.altKey || esCampo(e.target)) return;
      if (/^(ArrowLeft|ArrowRight|PageUp|PageDown|Home|End)$/.test(e.key)) frena(e);
    }, true);
  }

  /* ---------- señalar en vivo: no se ve el puntero de nadie ----------
     Cuando el PROFE deja el ratón sobre una palabra o una expresión del tablero, esa palabra o
     expresión se subraya en las dos pantallas. Una expresión es una pieza corta del tablero
     (botón, etiqueta, palabra resaltada, ruta, ficha…); si no, se subraya la palabra que hay bajo
     el ratón. Viaja en la presencia de la sala como ruta de nodos dentro de la lámina (o de la
     ventana emergente), así coincide aunque las pantallas tengan tamaños distintos. */
  function punteros() {
    if (!SALA || typeof window.addEventListener !== 'function') return;
    const raiz = r => r === 'V' ? document.getElementById('popC') : (document.getElementById('lamina') || document.querySelector('.lamina') || document.getElementById('escena') || document.querySelector('main'));
    const st = document.createElement('style');
    st.id = 'vivoPunteroStyle';
    st.textContent =
      '.vivoSena{position:fixed;z-index:40;pointer-events:none;height:4px;border-radius:3px;background:#D96C38;box-shadow:0 0 0 1px #FFFFFFcc;animation:vivoSena .18s ease-out}' +
      '@keyframes vivoSena{from{opacity:0;transform:scaleX(.4)}to{opacity:1;transform:none}}' +
      '@media (prefers-reduced-motion:reduce){.vivoSena{animation:none}}';
    (document.head || document.documentElement).appendChild(st);
    const capa = document.createElement('div');
    capa.setAttribute('aria-hidden', 'true');
    const montar = () => { if (!capa.isConnected && document.body) document.body.appendChild(capa); };
    function ruta(el, root) { const a = []; while (el && el !== root) { const pa = el.parentNode; if (!pa) return null; a.unshift([...pa.childNodes].indexOf(el)); el = pa; } return el === root ? a : null; }
    function nodo(r, root) { let el = root; for (const i of r) { el = el && el.childNodes[i]; } return el || null; }
    const CORTO = 'mark,button,.ruta,.chip,.tok,.op,.gl,.tag,.es,b,strong,em,i,small,label,.casilla';
    /* qué hay bajo el ratón: {r, p, w:[ini,fin]} o null */
    function objetivo(x, y) {
      const el = document.elementFromPoint(x, y);
      if (!el || el.closest('.vivoSena,#vivoChip,#vivoAviso')) return null;
      const enPop = el.closest('#popC'), r = enPop ? 'V' : 'L', root = raiz(r);
      if (!root || !root.contains(el)) return null;
      let rango = null;
      if (document.caretRangeFromPoint) rango = document.caretRangeFromPoint(x, y);
      else if (document.caretPositionFromPoint) { const c = document.caretPositionFromPoint(x, y); if (c) { rango = document.createRange(); rango.setStart(c.offsetNode, c.offset); } }
      const tn = rango && rango.startContainer;
      if (!tn || tn.nodeType !== 3 || !root.contains(tn)) return null;
      /* ¿el ratón está de verdad encima del texto? */
      const t = tn.textContent; let k = rango.startOffset;
      const esLetra = ch => /[\p{L}\p{N}'’\-]/u.test(ch || '');
      if (!esLetra(t[k]) && esLetra(t[k - 1])) k--;
      if (!esLetra(t[k])) return null;
      let a = k, b = k + 1; while (a > 0 && esLetra(t[a - 1])) a--; while (b < t.length && esLetra(t[b])) b++;
      const rw = document.createRange(); rw.setStart(tn, a); rw.setEnd(tn, b);
      const caja = rw.getBoundingClientRect();
      if (!(x >= caja.left - 2 && x <= caja.right + 2 && y >= caja.top - 2 && y <= caja.bottom + 2)) return null;
      const corto = tn.parentElement && tn.parentElement.closest(CORTO);
      if (corto && root.contains(corto) && corto !== root) {
        const txt = (corto.textContent || '').trim();
        if (txt && txt.length <= 48 && corto.getBoundingClientRect().height < 90) { const p = ruta(corto, root); if (p) return { r, p }; }
      }
      const p = ruta(tn, root); return p ? { r, p, w: [a, b] } : null;
    }
    function rects(o) {
      const root = raiz(o.r); if (!root) return [];
      const n = nodo(o.p, root); if (!n) return [];
      const rg = document.createRange();
      try { if (o.w) { rg.setStart(n, Math.min(o.w[0], n.length)); rg.setEnd(n, Math.min(o.w[1], n.length)); } else rg.selectNodeContents(n); } catch (e) { return []; }
      return [...rg.getClientRects()].filter(c => c.width > 2 && c.height > 2);
    }
    let actual = null;
    function pintar() {
      montar(); capa.innerHTML = '';
      if (CERRADA || !actual) return;
      rects(actual).forEach(c => {
        const d = document.createElement('div'); d.className = 'vivoSena';
        d.style.left = Math.round(c.left) + 'px'; d.style.top = Math.round(c.bottom - 1) + 'px'; d.style.width = Math.round(c.width) + 'px';
        capa.appendChild(d);
      });
    }
    window.claude.use('room').then(room => {
      if (!room) return;
      let soyProfe = false, firma = '';
      room.onPeers(ch => {
        const yo = ch.peers.find(p => p.isMe); soyProfe = !!(yo && yo.peer === 'P');
        if (soyProfe) return;
        const pf = ch.peers.find(p => !p.isMe && (p.peer === 'P' || (p.presence && p.presence.rol === 'P')));
        const o = pf && pf.presence && pf.presence.sena;
        actual = o && typeof o === 'object' && Array.isArray(o.p) ? o : null;
        pintar();
      });
      const repintar = () => pintar();
      window.addEventListener('resize', repintar);
      document.addEventListener('scroll', repintar, true);
      /* la lámina se vuelve a dibujar al cambiar de pestaña o de sección: la seña se borra */
      const obs = new MutationObserver(() => { if (soyProfe && actual) { const o = actual; actual = null; firma = ''; pintar(); room.presence({ sena: null }).catch(() => {}); } else pintar(); });
      const vigila = () => { const l = raiz('L'); if (l) obs.observe(l, { childList: true }); };
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', vigila); else vigila();
      let tEnvio = null;
      const manda = o => {
        const f = o ? JSON.stringify(o) : '';
        if (f === firma) return;
        firma = f; actual = o; pintar();
        clearTimeout(tEnvio);
        tEnvio = setTimeout(() => room.presence({ sena: o || null }).catch(() => {}), 90);
      };
      let tQuita = null;
      window.addEventListener('pointermove', e => {
        if (CERRADA || !soyProfe || e.pointerType === 'touch') return;
        const o = objetivo(e.clientX, e.clientY);
        clearTimeout(tQuita);
        if (o) manda(o); else tQuita = setTimeout(() => manda(null), 350);
      }, { passive: true });
      document.addEventListener('mouseleave', () => { if (soyProfe) manda(null); });
    }).catch(() => {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', punteros); else punteros();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', chip); else chip();
})();
