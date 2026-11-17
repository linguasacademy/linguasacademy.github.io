/**
 * Sala en vivo · el profe oculta o muestra el menú lateral del estudiante.
 * - Por defecto, oculto (el profe conduce). Se guarda en salas/<sala>/ajustes/menuOculto.
 * - Oculto: #app.plegado, body.vivo-sin-menu, y ni el logo (#bMenu) ni la tecla S lo abren.
 * - Solo el dueño de una sala abierta puede cambiarlo (reglas).
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
const ALUMNO = { uid: 'anon1', isAnonymous: true, provider: 'anonymous' };
const SALA = 'salamenu12';
const P = sub => `salas/${SALA}/${sub}`;
const base = (sala = {}) => ({
  profes: { profe1: { nombre: 'Ana', correo: 'a@x.co', estado: 'aprobado' } },
  salas: { [SALA]: { dueno: 'profe1', ...sala } }
});

const TABLERO = '<!doctype html><html><head><title>Tablero</title></head><body>' +
  '<div id="app"><button id="bMenu" aria-controls="lado" title="Menú"><svg><path d="M0 0"/></svg></button>' +
  '<nav id="lado">Mapa</nav><main id="lamina"><input id="campo"></main></div></body></html>';

/* window.addEventListener mínimo para ver las escuchas de captura que registra vivo.js */
function abrir({ store, user, query = `?sala=${SALA}`, profe }) {
  const fb = createFirebaseMock({ store, currentUser: user, rulesEvaluator: rules, enforceRules: true });
  const env = createBrowserEnv({
    repoRoot: REPO,
    url: 'https://linguasacademy.github.io/a2-mesa-para-dos.html' + query,
    html: TABLERO,
    firebaseMock: fb,
    preloadFirebase: true
  });
  const capturas = [];
  env.window.addEventListener = (tipo, fn, opciones) => capturas.push({ tipo, fn, captura: opciones === true || !!(opciones && opciones.capture) });
  if (profe !== undefined) env.window.LA_PROFE = profe;
  env.runFile('vivo.js');
  /* simula un evento real que pasa primero por las escuchas de captura de window */
  const dispara = (tipo, props) => {
    const ev = {
      type: tipo, ctrlKey: false, metaKey: false, altKey: false, ...props,
      frenado: false, prevenido: false,
      preventDefault() { this.prevenido = true; },
      stopPropagation() { this.frenado = true; },
      stopImmediatePropagation() { this.frenado = true; }
    };
    capturas.filter(c => c.tipo === tipo && c.captura).forEach(c => c.fn(ev));
    return ev;
  };
  return { env, fb, dispara, capturas };
}
const app = env => env.document.getElementById('app');
const bloqueado = env => env.document.body.classList.contains('vivo-sin-menu');

/* ------------------------------------------------------------------ reglas */

test('Reglas · solo el dueño de una sala abierta cambia el menú del estudiante', () => {
  const db = base();
  assert.equal(rules.canWrite(P('ajustes/menuOculto'), false, PROFE, db).allowed, true);
  assert.equal(rules.canWrite(P('ajustes/menuOculto'), true, PROFE, db).allowed, true);
  assert.equal(rules.canWrite(P('ajustes'), { menuOculto: true }, PROFE, db).allowed, true);
  assert.equal(rules.canWrite(P('ajustes/menuOculto'), false, ALUMNO, db).allowed, false, 'el estudiante no se abre el menú');
  assert.equal(rules.canWrite(P('ajustes/menuOculto'), null, ALUMNO, db).allowed, false, 'el estudiante no borra el ajuste');
  assert.equal(rules.canWrite(P('ajustes/menuOculto'), 'no', PROFE, db).allowed, false, 'solo booleano');
  assert.equal(rules.canWrite(P('ajustes/otra'), true, PROFE, db).allowed, false, 'no hay otros ajustes');
  assert.equal(rules.canRead(P('ajustes/menuOculto'), ALUMNO, db).allowed, true, 'el estudiante lo lee');
  assert.equal(rules.canWrite(P('ajustes/menuOculto'), false, PROFE, base({ cerrada: true })).allowed, false, 'sala cerrada');
});

/* ------------------------------------------------------------------ lógica */

test('Lógica · por defecto el menú del estudiante está oculto y no se abre con el logo ni con S', async () => {
  const store = createFirebaseStore(base());
  const { env, dispara } = abrir({ store, user: ALUMNO });
  await espera(80);
  assert.equal(bloqueado(env), true, 'body.vivo-sin-menu');
  assert.equal(app(env).classList.contains('plegado'), true, '#app.plegado');
  assert.equal(env.document.getElementById('bMenu').getAttribute('aria-disabled'), 'true');

  const bMenu = env.document.getElementById('bMenu');
  const clic = dispara('click', { target: bMenu.querySelector('path') });
  assert.equal(clic.frenado && clic.prevenido, true, 'el clic en el logo (o su icono) no llega al tablero');
  assert.match(env.document.getElementById('vivoAviso').textContent, /Tu profe tiene el menú cerrado/);
  const otro = dispara('click', { target: env.document.getElementById('lamina') });
  assert.equal(otro.frenado, false, 'los demás clics del estudiante siguen funcionando');

  assert.equal(dispara('keydown', { key: 's', target: env.document.body }).frenado, true, 'tecla s');
  assert.equal(dispara('keydown', { key: 'S', target: env.document.body }).frenado, true, 'tecla S');
  assert.equal(dispara('keydown', { key: 's', target: env.document.getElementById('campo') }).frenado, false, 'escribir una s en un campo no se toca');
  assert.equal(dispara('keydown', { key: 's', ctrlKey: true, target: env.document.body }).frenado, false, 'Ctrl+S no se toca');
  assert.equal(dispara('keydown', { key: 'ArrowRight', target: env.document.body }).frenado, false, 'las flechas no se tocan');
});

test('Lógica · el profe ve «Mostrar menú al estudiante» y su barra no se bloquea', async () => {
  const store = createFirebaseStore(base());
  const { env, dispara } = abrir({ store, user: PROFE, profe: true });
  await espera(80);
  const b = env.document.querySelector('#vivoChip button.menu');
  assert.ok(b, 'botón del menú del estudiante en la barra del profe');
  assert.equal(b.textContent, 'Mostrar menú al estudiante');
  assert.equal(b.getAttribute('aria-pressed'), 'true');
  assert.equal(bloqueado(env), false, 'el menú del profe no se bloquea');
  assert.equal(app(env).classList.contains('plegado'), false);
  assert.equal(dispara('keydown', { key: 's', target: env.document.body }).frenado, false, 'la S del profe funciona');
});

test('Lógica · el profe muestra y vuelve a ocultar el menú; el estudiante lo ve al instante', async () => {
  const store = createFirebaseStore(base());
  const profe = abrir({ store, user: PROFE, profe: true });
  const alumno = abrir({ store, user: ALUMNO });
  await espera(80);
  assert.equal(bloqueado(alumno.env), true);

  const b = () => profe.env.document.querySelector('#vivoChip button.menu');
  b().click();
  await espera(40);
  assert.equal(profe.fb.getRaw(P('ajustes/menuOculto')), false, 'se guarda en la sala');
  assert.equal(b().textContent, 'Ocultar menú al estudiante');
  assert.equal(b().getAttribute('aria-pressed'), 'false');
  assert.equal(bloqueado(alumno.env), false, 'el estudiante ya puede usar el menú');
  assert.equal(app(alumno.env).classList.contains('plegado'), false, 'el menú se le abre una vez');
  assert.equal(alumno.env.document.getElementById('bMenu').getAttribute('aria-disabled'), null);
  assert.equal(alumno.env.document.getElementById('bMenu').getAttribute('title'), 'Menú', 'se devuelve el título original del logo');
  assert.equal(alumno.dispara('keydown', { key: 's', target: alumno.env.document.body }).frenado, false);
  assert.equal(alumno.dispara('click', { target: alumno.env.document.getElementById('bMenu') }).frenado, false);

  b().click();
  await espera(40);
  assert.equal(profe.fb.getRaw(P('ajustes/menuOculto')), true);
  assert.equal(b().textContent, 'Mostrar menú al estudiante');
  assert.equal(bloqueado(alumno.env), true);
  assert.equal(app(alumno.env).classList.contains('plegado'), true, 'se le vuelve a cerrar');
  assert.equal(alumno.dispara('keydown', { key: 's', target: alumno.env.document.body }).frenado, true);
});

test('Lógica · el estado del menú persiste si el estudiante recarga', async () => {
  const visible = abrir({ store: createFirebaseStore(base({ ajustes: { menuOculto: false } })), user: ALUMNO });
  await espera(80);
  assert.equal(bloqueado(visible.env), false, 'si el profe lo dejó visible, sigue visible');
  assert.equal(app(visible.env).classList.contains('plegado'), false, 'al cargar no se fuerza a abrir ni a cerrar');

  const oculto = abrir({ store: createFirebaseStore(base({ ajustes: { menuOculto: true } })), user: ALUMNO });
  await espera(80);
  assert.equal(bloqueado(oculto.env), true);
  assert.equal(app(oculto.env).classList.contains('plegado'), true);
});

test('Lógica · el estudiante que llega por el cargador empieza con el menú cerrado sin esperar a Firebase', () => {
  const store = createFirebaseStore(base({ ajustes: { menuOculto: false } }));
  const { env } = abrir({ store, user: ALUMNO, profe: false });
  assert.equal(bloqueado(env), true, 'bloqueado en cuanto carga vivo.js');
  assert.equal(app(env).classList.contains('plegado'), true);
});

test('Lógica · si la sala no existe, el menú se le devuelve al estudiante', async () => {
  const store = createFirebaseStore({ salas: {} });
  const { env } = abrir({ store, user: ALUMNO, profe: false });
  assert.equal(bloqueado(env), true);
  await espera(80);
  assert.equal(bloqueado(env), false, 'nadie podría soltarlo: se libera');
  assert.match(env.document.getElementById('vivoAviso').textContent, /no existe o ya cerró/);
});

test('Lógica · sin sala (modo local) vivo.js no toca el menú ni registra bloqueos', async () => {
  const store = createFirebaseStore(base());
  const { env, capturas } = abrir({ store, user: ALUMNO, query: '' });
  await espera(40);
  assert.equal(bloqueado(env), false);
  assert.equal(app(env).classList.contains('plegado'), false);
  assert.equal(capturas.length, 0);
});

test('Lógica · el dueño de la sala nunca queda con el menú bloqueado, aunque el cargador no lo marcara como profe', async () => {
  const store = createFirebaseStore(base());
  const { env } = abrir({ store, user: PROFE, profe: false });
  assert.equal(bloqueado(env), true, 'bloqueo previo por precaución');
  await espera(80);
  assert.equal(bloqueado(env), false, 'al saberse dueño se libera');
  assert.equal(app(env).classList.contains('plegado'), false, 'y el menú vuelve a como estaba');
  assert.ok(env.document.querySelector('#vivoChip button.menu'));
});
