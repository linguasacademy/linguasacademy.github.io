/**
 * Sala en vivo · cierre de la sala por el profe.
 * - Reglas (emulador): solo el dueño cierra, el cierre no se deshace, una sala cerrada
 *   no se reabre ni deja leer su clave, su estado ni su presencia.
 * - Lógica (vivo.js con Firebase simulado y reglas aplicadas): confirmación propia,
 *   aviso en tiempo real al estudiante, borrado del tablero y de la clave, recarga.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { RtdbRulesEvaluator } from './helpers/rtdb-rules.mjs';
import { createBrowserEnv, createFirebaseMock, createFirebaseStore } from './helpers/dom-env.mjs';

const REPO = path.resolve(import.meta.dirname, '..', '..');
const rules = RtdbRulesEvaluator.fromRepo(REPO);
const espera = (ms = 60) => new Promise(r => setTimeout(r, ms));

const PROFE = { uid: 'profe1', isAnonymous: false, provider: 'password' };
const OTRO_PROFE = { uid: 'profe2', isAnonymous: false, provider: 'password' };
const ALUMNO = { uid: 'anon1', isAnonymous: true, provider: 'anonymous' };
const CLAVE = 'k'.repeat(43);
const SALA = 'salaprueba1';

const base = (sala = {}) => ({
  profes: {
    profe1: { nombre: 'Ana', correo: 'a@x.co', estado: 'aprobado' },
    profe2: { nombre: 'Bea', correo: 'b@x.co', estado: 'aprobado' }
  },
  salas: { [SALA]: { dueno: 'profe1', clave: CLAVE, ...sala } }
});
const cerrada = () => base({ cerrada: true });
const P = sub => `salas/${SALA}/${sub}`;

/* ------------------------------------------------------------------ reglas */

test('Reglas · solo el dueño puede cerrar la sala, y solo con true', () => {
  const db = base();
  assert.equal(rules.canWrite(P('cerrada'), true, PROFE, db).allowed, true, 'el dueño cierra');
  assert.equal(rules.canWrite(P('cerrada'), true, ALUMNO, db).allowed, false, 'el estudiante no cierra');
  assert.equal(rules.canWrite(P('cerrada'), true, OTRO_PROFE, db).allowed, false, 'otro profe aprobado no cierra');
  assert.equal(rules.canWrite(P('cerrada'), true, null, db).allowed, false, 'sin sesión no se cierra');
  assert.equal(rules.canWrite(P('cerrada'), false, PROFE, db).allowed, false, 'cerrada solo admite true');
  assert.equal(rules.canWrite(P('cerrada'), 'si', PROFE, db).allowed, false, 'cerrada solo admite true');
  assert.equal(rules.canWrite('salas/noexiste1/cerrada', true, PROFE, base()).allowed, false, 'no se cierra una sala sin dueño');
});

test('Reglas · una sala cerrada no se reabre', () => {
  const db = cerrada();
  assert.equal(rules.canWrite(P('cerrada'), null, PROFE, db).allowed, false, 'el dueño no puede borrar «cerrada»');
  assert.equal(rules.canWrite(P('cerrada'), false, PROFE, db).allowed, false, 'el dueño no puede poner «cerrada» en false');
  assert.equal(rules.canWrite(P('dueno'), 'profe2', OTRO_PROFE, db).allowed, false, 'otro profe no reclama la sala');
  assert.equal(rules.canWrite(P('dueno'), null, PROFE, db).allowed, false, 'el dueño no se puede borrar (la sala no queda libre)');
  assert.equal(rules.canWrite(P('clave'), CLAVE, PROFE, db).allowed, false, 'no se vuelve a escribir la clave');
  assert.equal(rules.canWrite(P('d/sesion~estado'), { j: '{}', t: 1 }, PROFE, db).allowed, false, 'no se guarda estado');
  assert.equal(rules.canWrite(P('ajustes/menuOculto'), false, PROFE, db).allowed, false, 'no se cambian ajustes');
  assert.equal(rules.canWrite(P('pres/P'), { j: '{}', t: 1 }, PROFE, db).allowed, false, 'el profe no publica presencia');
  assert.equal(rules.canWrite(P('pres/anon1'), { j: '{}', t: 1 }, ALUMNO, db).allowed, false, 'el estudiante no publica presencia');
  assert.equal(rules.canWrite(P('ev/anon1'), { n: 'x', de: 'anon1', k: 1, t: 1 }, ALUMNO, db).allowed, false, 'el estudiante no envía mensajes');
});

test('Reglas · una sala cerrada no deja leer su clave ni su contenido', () => {
  const db = cerrada();
  for (const quien of [ALUMNO, PROFE, OTRO_PROFE]) {
    for (const sub of ['clave', 'd', 'd/sesion~estado', 'pres', 'ev', 'ajustes', 'ajustes/menuOculto']) {
      assert.equal(rules.canRead(P(sub), quien, db).allowed, false, `${quien.uid} no lee ${sub} de una sala cerrada`);
    }
    assert.equal(rules.canRead(P('cerrada'), quien, db).allowed, true, `${quien.uid} sí ve que la sala cerró`);
    assert.equal(rules.canRead(P('dueno'), quien, db).allowed, true, `${quien.uid} sí lee el dueño`);
  }
  assert.equal(rules.canRead(`salas/${SALA}`, ALUMNO, db).allowed, false, 'nadie lee la sala entera de una vez');
  assert.equal(rules.canRead(P('cerrada'), null, db).allowed, false, 'sin sesión no se lee nada');
});

test('Reglas · sala abierta: el estudiante lee lo necesario y no toca ajustes ni cierre', () => {
  const db = base({ ajustes: { menuOculto: true } });
  for (const sub of ['dueno', 'clave', 'cerrada', 'd', 'pres', 'ev', 'ajustes/menuOculto']) {
    assert.equal(rules.canRead(P(sub), ALUMNO, db).allowed, true, `el estudiante lee ${sub}`);
  }
  assert.equal(rules.canRead(P('clave'), null, db).allowed, false, 'sin sesión no se lee la clave');
  assert.equal(rules.canWrite(P('pres/anon1'), { j: '{}', t: 1 }, ALUMNO, db).allowed, true, 'presencia del estudiante');
  assert.equal(rules.canWrite(P('ev/anon1'), { n: 'x', de: 'anon1', k: 1, t: 1 }, ALUMNO, db).allowed, true, 'mensajes del estudiante');
  assert.equal(rules.canWrite(P('pres'), null, ALUMNO, db).allowed, false, 'el estudiante no borra la presencia de todos');
  assert.equal(rules.canWrite(P('ev'), null, ALUMNO, db).allowed, false, 'el estudiante no borra los mensajes de todos');
  assert.equal(rules.canWrite(P('clave'), null, ALUMNO, db).allowed, false, 'el estudiante no borra la clave');
});

test('Reglas · al cerrar, el dueño borra clave, estado, ajustes, presencia y mensajes; el estudiante solo su presencia', () => {
  const db = cerrada();
  db.salas[SALA].d = { x: { j: '{}', t: 1 } };
  db.salas[SALA].pres = { P: { j: '{}', t: 1 }, anon1: { j: '{}', t: 1 } };
  db.salas[SALA].ev = { anon1: { n: 'x', de: 'anon1', k: 1, t: 1 } };
  db.salas[SALA].ajustes = { menuOculto: true };
  for (const sub of ['clave', 'd', 'pres', 'ev', 'ajustes']) {
    assert.equal(rules.canWrite(P(sub), null, PROFE, db).allowed, true, `el dueño borra ${sub}`);
    assert.equal(rules.canWrite(P(sub), null, OTRO_PROFE, db).allowed, false, `otro profe no borra ${sub}`);
  }
  assert.equal(rules.canWrite(P('pres/anon1'), null, ALUMNO, db).allowed, true, 'onDisconnect del estudiante sigue limpiando su presencia');
  assert.equal(rules.canWrite(P('ev/anon1'), null, ALUMNO, db).allowed, true, 'onDisconnect del estudiante sigue limpiando su buzón');
});

/* ------------------------------------------------------------------ lógica */

const TABLERO = '<!doctype html><html><head><title>Tablero</title><style>#app{}</style>' +
  '<script>window.SECS_SECRETO = 1</script></head><body class="tablero">' +
  '<div id="app"><button id="bMenu" aria-controls="lado"><svg><path d="M0 0"/></svg></button>' +
  '<nav id="lado">Mapa de la clase</nav><main id="lamina">Contenido descifrado del tablero</main></div>' +
  '</body></html>';

function abrir({ store, user, query = `?sala=${SALA}`, profe = false, clave = CLAVE }) {
  const fb = createFirebaseMock({ store, currentUser: user, rulesEvaluator: rules, enforceRules: true });
  const env = createBrowserEnv({
    repoRoot: REPO,
    url: 'https://linguasacademy.github.io/a1-mucho-gusto.html' + query,
    html: TABLERO,
    firebaseMock: fb,
    preloadFirebase: true,
    sessionStorageData: clave ? { 'la-clave:a1-mucho-gusto': clave } : {}
  });
  env.window.LA_PROFE = profe;
  if (clave) env.window.LA_CLAVE = clave;
  env.runFile('vivo.js');
  return { env, fb };
}
const texto = env => env.document.body.textContent;

test('Lógica · «Cerrar sala» pide confirmación propia y «Cancelar» no cierra nada', async () => {
  const store = createFirebaseStore(base());
  const { env, fb } = abrir({ store, user: PROFE, profe: true });
  await espera(80);
  let usoConfirm = false;
  env.window.confirm = () => { usoConfirm = true; return true; };
  env.window.alert = () => { usoConfirm = true; };

  const sale = env.document.querySelector('#vivoChip button.sale');
  assert.ok(sale, 'el profe ve «Cerrar sala»');
  assert.equal(sale.textContent, 'Cerrar sala');
  sale.click();
  await espera(20);
  assert.equal(usoConfirm, false, 'no se usan confirm()/alert() nativos');
  assert.ok(env.document.querySelector('#vivoChip button.si'), 'aparece «Sí, cerrar la sala»');
  assert.ok(env.document.querySelector('#vivoChip button.no'), 'aparece «Cancelar»');
  assert.equal(env.document.getElementById('vivoChip').getAttribute('role'), 'alertdialog');
  assert.match(texto(env), /¿Cerrar la sala\?/);
  assert.equal(fb.getRaw(P('cerrada')), null, 'el primer toque no cierra');

  env.document.querySelector('#vivoChip button.no').click();
  await espera(20);
  assert.ok(env.document.querySelector('#vivoChip button.sale'), 'vuelve la barra normal');
  assert.equal(env.document.querySelector('#vivoChip button.si'), null);
  assert.equal(fb.getRaw(P('cerrada')), null, 'cancelar no cierra');
  assert.equal(fb.getRaw(P('clave')), CLAVE, 'cancelar no borra la clave');
});

test('Lógica · al cerrar, el estudiante sale en tiempo real: aviso, tablero borrado y clave fuera', async () => {
  const store = createFirebaseStore(base());
  const profe = abrir({ store, user: PROFE, profe: true });
  const alumno = abrir({ store, user: ALUMNO });
  await espera(80);

  /* el estudiante está conectado y trabajando */
  const room = await alumno.env.window.claude.use('room');
  const db = await alumno.env.window.claude.use('db');
  assert.ok(room && db, 'el estudiante tiene sala');
  await room.presence({ seccion: 2 });
  await espera(30);
  assert.ok(profe.fb.getRaw(P('pres/anon1')), 'la presencia del estudiante llegó');
  const roomProfe = await profe.env.window.claude.use('room');
  await roomProfe.emit('ir', { s: 3 });
  const dbProfe = await profe.env.window.claude.use('db');
  await dbProfe.doc('sesion/estado').set({ s: 3 });
  assert.equal(texto(alumno.env).includes('Contenido descifrado del tablero'), true);

  /* el profe cierra con dos toques */
  profe.env.document.querySelector('#vivoChip button.sale').click();
  await espera(10);
  profe.env.document.querySelector('#vivoChip button.si').click();
  await espera(80);

  /* Firebase: cerrada y limpia */
  assert.equal(profe.fb.getRaw(P('cerrada')), true, 'la sala queda marcada como cerrada');
  for (const sub of ['clave', 'd', 'pres', 'ev', 'ajustes']) {
    assert.equal(profe.fb.getRaw(P(sub)), null, `se borró ${sub}`);
  }
  assert.equal(profe.fb.getRaw(P('dueno')), 'profe1', 'el dueño se conserva para que nadie reclame la sala');

  /* el profe vuelve al tablero sin sala y verá el aviso allí */
  assert.equal(profe.env.window.location.href, '/a1-mucho-gusto.html');
  assert.match(profe.env.sessionStorage.getItem('la-vivo-aviso') || '', /Sala cerrada/);

  /* el estudiante */
  const fin = alumno.env.document.getElementById('vivoFin');
  assert.ok(fin, 'el estudiante ve la pantalla de fin');
  assert.equal(fin.getAttribute('role'), 'alert');
  assert.match(texto(alumno.env), /Tu profe cerró la clase\. ¡Hasta la próxima!/);
  assert.equal(texto(alumno.env).includes('Contenido descifrado del tablero'), false, 'se borró el tablero');
  assert.equal(texto(alumno.env).includes('Mapa de la clase'), false, 'se borró el menú');
  assert.equal(alumno.env.document.getElementById('app'), null);
  assert.equal(alumno.env.document.head.querySelectorAll('script').length, 0, 'no quedan scripts del tablero en la cabeza');
  assert.equal(alumno.env.document.body.classList.contains('tablero'), false, 'se quitan los atributos del cuerpo');
  assert.equal(alumno.env.sessionStorage.getItem('la-clave:a1-mucho-gusto'), null, 'la clave sale de sessionStorage');
  assert.equal(alumno.env.window.LA_CLAVE, undefined, 'la clave sale de window');
  assert.equal(await alumno.env.window.claude.use('db'), null, 'ya no hay sala para el tablero');
  assert.equal(await alumno.env.window.claude.use('room'), null);
  /* sus escuchas de la sala quedaron apagadas */
  assert.equal(alumno.fb.listenerCount(P('pres')) <= 1, true, 'solo queda (como mucho) la escucha del profe');
  await room.presence({ seccion: 9 });
  assert.equal(alumno.fb.getRaw(P('pres/anon1')), null, 'tras el cierre ya no publica presencia');
});

test('Lógica · si el estudiante recarga una sala cerrada ve «Esta sala ya cerró»', async () => {
  const store = createFirebaseStore(cerrada());
  delete store.dbData.salas[SALA].clave;
  const { env } = abrir({ store, user: ALUMNO });
  await espera(80);
  assert.equal(await env.window.claude.use('room'), null, 'el tablero no recibe sala');
  assert.match(texto(env), /Esta sala ya cerró\./);
  assert.equal(texto(env).includes('Contenido descifrado'), false);
  assert.equal(env.sessionStorage.getItem('la-clave:a1-mucho-gusto'), null);
});

test('Lógica · la vista «Ver como estudiante» también se cierra', async () => {
  const store = createFirebaseStore(base());
  const profe = abrir({ store, user: PROFE, profe: true });
  const vista = abrir({ store, user: PROFE, query: `?sala=${SALA}&como=estudiante` });
  await espera(80);
  assert.ok(await vista.env.window.claude.use('room'));
  profe.env.document.querySelector('#vivoChip button.sale').click();
  await espera(10);
  profe.env.document.querySelector('#vivoChip button.si').click();
  await espera(80);
  assert.match(texto(vista.env), /Tu profe cerró la clase/);
});

test('Lógica · el profe que vuelve a una sala cerrada no la reabre', async () => {
  const store = createFirebaseStore(cerrada());
  const { env } = abrir({ store, user: PROFE, profe: true });
  await espera(80);
  assert.equal(await env.window.claude.use('db'), null, 'sin sala: modo local');
  assert.match(env.document.getElementById('vivoChip').textContent, /Esta sala ya cerró/);
  assert.equal(env.document.querySelector('#vivoChip button.sale'), null);
  assert.ok(texto(env).includes('Contenido descifrado'), 'el profe conserva su tablero');
});

test('Lógica · el estudiante no puede cerrar la sala por su cuenta', async () => {
  const store = createFirebaseStore(base());
  const alumno = abrir({ store, user: ALUMNO });
  await espera(80);
  const app = alumno.fb.firebase.apps[0];
  await assert.rejects(app.database().ref(P('cerrada')).set(true), /PERMISSION_DENIED/);
  assert.equal(alumno.env.document.getElementById('vivoChip'), null, 'el estudiante no tiene barra de sala');
});

test('Lógica · otra pestaña del profe en la misma sala vuelve al tablero sin sala', async () => {
  const store = createFirebaseStore(base());
  const a = abrir({ store, user: PROFE, profe: true });
  const b = abrir({ store, user: PROFE, profe: true });
  await espera(80);
  a.env.document.querySelector('#vivoChip button.sale').click();
  await espera(10);
  a.env.document.querySelector('#vivoChip button.si').click();
  await espera(80);
  assert.equal(b.env.window.location.href, '/a1-mucho-gusto.html');
  assert.ok(texto(b.env).includes('Contenido descifrado'), 'el tablero del profe no se borra');
});

test('Lógica · si falla el cierre, la sala sigue abierta y se avisa', async () => {
  const store = createFirebaseStore(base());
  const { env, fb } = abrir({ store, user: PROFE, profe: true });
  await espera(80);
  store.dbData.salas[SALA].dueno = 'profe9';   // las reglas ya no lo reconocen como dueño
  env.document.querySelector('#vivoChip button.sale').click();
  await espera(10);
  env.document.querySelector('#vivoChip button.si').click();
  await espera(60);
  assert.equal(fb.getRaw(P('cerrada')), null);
  assert.ok(env.document.querySelector('#vivoChip button.sale'), 'vuelve la barra normal');
  assert.match(env.document.getElementById('vivoAviso').textContent, /No se pudo cerrar la sala/);
  assert.notEqual(env.window.location.href, '/a1-mucho-gusto.html');
});
