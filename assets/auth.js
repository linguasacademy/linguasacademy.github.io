/* =====================================================================
   auth.js · Lingua's Academy
   Acceso solo para profesores, con el mismo proyecto de Firebase que
   usan las salas en vivo (vivo.js).

   Datos en Realtime Database:
     profes/<uid>  { nombre, correo, idioma, mensaje, estado, creado }
                   estado: "pendiente" | "aprobado" | "rechazado"
     admins/<uid>  true   (quien puede aprobar solicitudes)

   Las reglas que protegen estos datos están en database.rules.json.
   ===================================================================== */
(() => {
  'use strict';

  const { CFG, SDK, carga, conTiempo, leer2 } = window.LA_FB;

  let _app = null;
  function app() {
    if (_app) return _app;
    _app = conTiempo((async () => {
      await carga(SDK + 'firebase-app-compat.js');
      await Promise.all([carga(SDK + 'firebase-auth-compat.js'), carga(SDK + 'firebase-database-compat.js')]);
      const a = firebase.apps[0] || firebase.initializeApp(CFG);
      return { auth: a.auth(), db: a.database(), TS: firebase.database.ServerValue.TIMESTAMP };
    })(), 15000);
    _app.catch(() => { _app = null; });
    return _app;
  }

  /* El usuario actual, sin crear ninguna sesión anónima */
  async function usuario() {
    const F = await app();
    return new Promise(ok => { let fin; let ya = false; fin = F.auth.onAuthStateChanged(u => { if (ya) return; ya = true; if (fin) fin(); ok(u); }); if (ya && fin) fin(); });
  }


  /* El perfil se guarda en este navegador: las páginas abren al instante y se confirma por detrás */
  const CK = 'la-perfil';
  const conAcceso = p => !!p && (p.estado === 'aprobado' || p.admin === true);
  function guardado(uid) { try { const c = JSON.parse(localStorage.getItem(CK) || 'null'); return c && c.uid === uid ? c : null; } catch (e) { return null; } }
  async function perfilRed(u) {
    const F = await app();
    const [p, adm] = await Promise.all([leer2(F.db.ref('profes/' + u.uid)), leer2(F.db.ref('admins/' + u.uid)).then(v => v === true)]);
    const r = Object.assign({ uid: u.uid, correo: u.email, estado: 'sin-solicitud', nombre: '', nombreGoogle: u.displayName || '' }, p || {}, { admin: adm });
    try { localStorage.setItem(CK, JSON.stringify(r)); } catch (e) {}
    return r;
  }
  async function perfil(u, fresco) {
    if (!u || u.isAnonymous) return null;
    const c = guardado(u.uid);
    if (c && !fresco && conAcceso(c)) {
      perfilRed(u).then(n => { if (!conAcceso(n)) location.reload(); }).catch(() => {});
      return c;
    }
    try { return await perfilRed(u); } catch (e) { if (c) return c; throw e; }
  }

  /* Estado completo para una página: { usuario, perfil } */
  async function estado() {
    const u = await usuario();
    return { usuario: u && !u.isAnonymous ? u : null, perfil: await perfil(u) };
  }

  async function entrar(correo, clave) {
    const F = await app();
    const r = await F.auth.signInWithEmailAndPassword(correo.trim(), clave);
    return perfil(r.user, true);
  }

  async function solicitar({ nombre, correo, clave, idioma, mensaje }) {
    const F = await app();
    const actual = F.auth.currentUser;
    if (actual && actual.isAnonymous) await F.auth.signOut();
    const n = (nombre || '').trim().slice(0, 80);
    const r = await F.auth.createUserWithEmailAndPassword(correo.trim(), clave);
    await r.user.updateProfile({ displayName: n }).catch(() => {});
    try {
      await F.db.ref('profes/' + r.user.uid).set({
        nombre: n, correo: correo.trim().toLowerCase(), idioma: idioma || 'es', mensaje: (mensaje || '').trim().slice(0, 600),
        estado: 'pendiente', creado: F.TS
      });
    } catch (e) {
      if (typeof r.user.delete === 'function') await r.user.delete().catch(() => {});
      throw e;
    }
    return r.user;
  }

  /* Entrar (o pedir acceso) con una cuenta de Google.
     Abre la ventana de Google; si el navegador la bloquea, usa la redirección. */
  async function conGoogle() {
    const F = await app();
    const p = new firebase.auth.GoogleAuthProvider();
    p.setCustomParameters({ prompt: 'select_account' });
    const actual = F.auth.currentUser;
    if (actual && actual.isAnonymous) await F.auth.signOut();
    try {
      const r = await F.auth.signInWithPopup(p);
      return perfil(r.user, true);
    } catch (e) {
      if (/popup-blocked|operation-not-supported-in-this-environment/.test(e.code || '')) {
        await F.auth.signInWithRedirect(p);
        return null;
      }
      throw e;
    }
  }

  /* Solicitud de una cuenta que ya entró (por ejemplo con Google) y aún no tiene ficha */
  async function completarSolicitud({ nombre, idioma, mensaje }) {
    const F = await app();
    const u = F.auth.currentUser;
    if (!u || u.isAnonymous) throw new Error('sin-sesion');
    const n = (nombre || u.displayName || (u.email || '').split('@')[0]).trim().slice(0, 80);
    await F.db.ref('profes/' + u.uid).set({
      nombre: n, correo: (u.email || '').toLowerCase(), idioma: idioma || 'es',
      mensaje: (mensaje || '').trim().slice(0, 600), estado: 'pendiente', creado: F.TS
    });
    return perfil(u, true);
  }

  async function salir() {
    const limpiarClaves = (st, incPerfil) => {
      const borrar = [];
      for (let i = 0; i < st.length; i++) {
        const k = st.key(i);
        if (k && ((incPerfil && k === CK) || k.indexOf('la-clave:') === 0)) borrar.push(k);
      }
      borrar.forEach(k => st.removeItem(k));
    };
    try { limpiarClaves(localStorage, true); } catch (e) {}
    try { limpiarClaves(sessionStorage, false); } catch (e) {}
    const F = await app(); await F.auth.signOut();
  }

  async function restablecer(correo) { const F = await app(); await F.auth.sendPasswordResetEmail(correo.trim()); }

  async function solicitudes() {
    const F = await app();
    const s = await F.db.ref('profes').once('value');
    const l = []; s.forEach(c => { l.push(Object.assign({ uid: c.key }, c.val())); });
    return l.sort((a, b) => (b.creado || 0) - (a.creado || 0));
  }

  async function decidir(uid, nuevo) {
    const F = await app();
    await F.db.ref('profes/' + uid + '/estado').set(nuevo);
  }

  /* Mensajes de error de Firebase en palabras de la página */
  function motivo(e) {
    const c = (e && e.code) || (e && e.message) || '';
    if (/invalid-credential|wrong-password|user-not-found|invalid-login/.test(c)) return 'El correo o la contraseña no coinciden. Revísalos e inténtalo otra vez.';
    if (/email-already-in-use/.test(c)) return 'Ya hay una solicitud con este correo. Entra con tu contraseña o pide una nueva desde Entrar.';
    if (/weak-password/.test(c)) return 'La contraseña necesita al menos 8 caracteres.';
    if (/invalid-email/.test(c)) return 'Escribe un correo válido, con @ y dominio.';
    if (/too-many-requests/.test(c)) return 'Demasiados intentos seguidos. Espera unos minutos e inténtalo otra vez.';
    if (/popup-closed-by-user|cancelled-popup-request|user-cancelled/.test(c)) return 'Cerraste la ventana de Google antes de terminar. Inténtalo otra vez.';
    if (/account-exists-with-different-credential/.test(c)) return 'Ese correo ya tiene cuenta con contraseña. Entra con tu correo y tu contraseña.';
    if (/unauthorized-domain/.test(c)) return 'El acceso con Google aún no está activado para esta página. Avísale a la administración.';
    if (/operation-not-allowed/.test(c)) return 'Ese tipo de acceso todavía no está activado. Avísale a la administración.';
    if (/permission[_-]denied|PERMISSION_DENIED/i.test(c)) return 'No tienes permiso para esta acción.';
    if (/red|tiempo|network/.test(c)) return 'No hay conexión con el servidor. Revisa tu internet e inténtalo otra vez.';
    return 'Algo falló. Inténtalo otra vez en un momento.';
  }

  window.LA = { app, estado, entrar, conGoogle, completarSolicitud, solicitar, salir, restablecer, solicitudes, decidir, motivo };
})();
