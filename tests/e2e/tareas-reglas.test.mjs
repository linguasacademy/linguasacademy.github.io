/**
 * Tareas con entrega (fase 2) · reglas de Realtime Database (emulador helpers/rtdb-rules.mjs).
 * - tareas/$c: crea solo un profe aprobado (o admin) a su nombre; lee y borra solo el dueño.
 * - tareas/$c/entregas/$u: escribe solo $u (anónimo vale) si la tarea existe; el dueño lee y borra.
 * - tareasPorProfe/$uid: solo $uid.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { RtdbRulesEvaluator } from './helpers/rtdb-rules.mjs';

const REPO = path.resolve(import.meta.dirname, '..', '..');
const rules = RtdbRulesEvaluator.fromRepo(REPO);

/* `now` de las reglas: fijo durante cada prueba (la app manda ServerValue.TIMESTAMP) */
const AHORA = 1763460000000;
const reloj = Date.now;
test.beforeEach(() => { Date.now = () => AHORA; });
test.afterEach(() => { Date.now = reloj; });

const PROFE = { uid: 'profe1', isAnonymous: false, provider: 'password' };
const OTRO_PROFE = { uid: 'profe2', isAnonymous: false, provider: 'password' };
const PENDIENTE = { uid: 'profe3', isAnonymous: false, provider: 'google.com' };
const ADMIN = { uid: 'admin1', isAnonymous: false, provider: 'google.com' };
const ALUMNO = { uid: 'anon1', isAnonymous: true, provider: 'anonymous' };
const ALUMNO2 = { uid: 'anon2', isAnonymous: true, provider: 'anonymous' };
const COD = 'k3x9a0b7zq';

const base = (extra = {}) => ({
  admins: { admin1: true },
  profes: {
    profe1: { nombre: 'Ana', correo: 'a@x.co', estado: 'aprobado' },
    profe2: { nombre: 'Bea', correo: 'b@x.co', estado: 'aprobado' },
    profe3: { nombre: 'Ceci', correo: 'c@x.co', estado: 'pendiente' }
  },
  ...extra
});
const tarea = (extra = {}) => ({ dueno: 'profe1', tablero: 'a1-esta-es-mi-familia', creada: AHORA - 5000, ...extra });
const conTarea = (t = tarea()) => base({ tareas: { [COD]: t }, tareasPorProfe: { profe1: { [COD]: true } } });
const entrega = (extra = {}) => ({
  nombre: 'Valentina',
  fecha: AHORA,
  puntaje: { aciertos: 30, total: 36 },
  ejercicios: { 0: { tipo: 'elige', aciertos: 7, total: 8 }, 1: { tipo: 'completa', aciertos: 6, total: 7 } },
  errores: { 0: { p: '___ es mi mamá.', escrito: 'Este', correcto: 'Esta' } },
  reto: 'Esta es mi mamá. Se llama Ana.',
  lengua: 'en',
  ...extra
});
const T = sub => `tareas/${COD}${sub ? '/' + sub : ''}`;
const E = (u = 'anon1') => T('entregas/' + u);
const lista = (n, f) => Object.fromEntries(Array.from({ length: n }, (_, i) => [String(i), f(i)]));

/* ------------------------------------------------------------------ crear */

test('Tareas · un profe aprobado crea una tarea a su nombre (con o sin etiqueta)', () => {
  const db = base();
  assert.equal(rules.canWrite(T(), tarea({ creada: AHORA }), PROFE, db).allowed, true);
  assert.equal(rules.canWrite(T(), tarea({ creada: AHORA, etiqueta: 'Grupo martes' }), PROFE, db).allowed, true);
  assert.equal(rules.canWrite(`tareasPorProfe/profe1/${COD}`, true, PROFE, db).allowed, true, 'su índice');
  assert.equal(rules.canWrite(T(), { dueno: 'admin1', tablero: 'b1-yo-que-tu', creada: AHORA }, ADMIN, db).allowed, true, 'la administración también');
});

test('Tareas · no crean: profe pendiente, anónimo, sin sesión, ni a nombre de otro', () => {
  const db = base();
  assert.equal(rules.canWrite(T(), { ...tarea({ creada: AHORA }), dueno: 'profe3' }, PENDIENTE, db).allowed, false, 'profe pendiente');
  assert.equal(rules.canWrite(T(), { ...tarea({ creada: AHORA }), dueno: 'anon1' }, ALUMNO, db).allowed, false, 'anónimo');
  assert.equal(rules.canWrite(T(), tarea({ creada: AHORA }), null, db).allowed, false, 'sin sesión');
  assert.equal(rules.canWrite(T(), tarea({ creada: AHORA }), OTRO_PROFE, db).allowed, false, 'dueño ajeno');
  /* un anónimo que se hiciera pasar por aprobado (uid con ficha aprobada) sigue sin poder: provider anonymous */
  const trampa = base({ profes: { anon1: { nombre: 'x', correo: 'x', estado: 'aprobado' } } });
  assert.equal(rules.canWrite(T(), { ...tarea({ creada: AHORA }), dueno: 'anon1' }, ALUMNO, trampa).allowed, false, 'anónimo con ficha');
});

test('Tareas · forma y tamaños al crear', () => {
  const db = base();
  const ok = tarea({ creada: AHORA });
  assert.equal(rules.canWrite(T(), { ...ok, creada: AHORA - 1 }, PROFE, db).allowed, false, 'creada = now');
  assert.equal(rules.canWrite(T(), { ...ok, tablero: 'x'.repeat(81) }, PROFE, db).allowed, false, 'tablero ≤ 80');
  assert.equal(rules.canWrite(T(), { ...ok, tablero: 'x'.repeat(80) }, PROFE, db).allowed, true, 'tablero = 80');
  assert.equal(rules.canWrite(T(), { ...ok, tablero: '' }, PROFE, db).allowed, false, 'tablero vacío');
  assert.equal(rules.canWrite(T(), { ...ok, tablero: 12 }, PROFE, db).allowed, false, 'tablero string');
  assert.equal(rules.canWrite(T(), { ...ok, etiqueta: 'e'.repeat(61) }, PROFE, db).allowed, false, 'etiqueta ≤ 60');
  assert.equal(rules.canWrite(T(), { ...ok, etiqueta: 'e'.repeat(60) }, PROFE, db).allowed, true, 'etiqueta = 60');
  assert.equal(rules.canWrite(T(), { dueno: 'profe1', creada: AHORA }, PROFE, db).allowed, false, 'falta tablero');
  assert.equal(rules.canWrite(T(), { ...ok, otra: 1 }, PROFE, db).allowed, false, 'campos extra');
  assert.equal(rules.canWrite(T(), { ...ok, entregas: { anon1: entrega() } }, PROFE, db).allowed, true, 'una entrega válida no estorba');
  assert.equal(rules.canWrite('tareas/CORTO', ok, PROFE, db).allowed, false, 'código: 10 caracteres base36');
  assert.equal(rules.canWrite('tareas/ABCDEFGHIJ', ok, PROFE, db).allowed, false, 'código en minúsculas');
  assert.equal(rules.canWrite('tareas/abcdefghi', ok, PROFE, db).allowed, false, 'código de 9');
  assert.equal(rules.canWrite('tareas/abcdefghijk', ok, PROFE, db).allowed, false, 'código de 11');
  assert.equal(rules.canWrite(`tareasPorProfe/profe1/${COD}`, 'si', PROFE, db).allowed, false, 'índice: solo true');
  assert.equal(rules.canWrite('tareasPorProfe/profe1/corto', true, PROFE, db).allowed, false, 'índice: código válido');
});

test('Tareas · una tarea existente no se pisa ni se edita (salvo archivar)', () => {
  const db = conTarea();
  assert.equal(rules.canWrite(T(), tarea({ creada: AHORA, tablero: 'b1-yo-que-tu' }), PROFE, db).allowed, false, 'el dueño no la reescribe');
  assert.equal(rules.canWrite(T(), { ...tarea({ creada: AHORA }), dueno: 'profe2' }, OTRO_PROFE, db).allowed, false, 'otro profe no la reclama');
  assert.equal(rules.canWrite(T('tablero'), 'b1-yo-que-tu', PROFE, db).allowed, false, 'no cambia de tablero');
  assert.equal(rules.canWrite(T('dueno'), 'profe2', PROFE, db).allowed, false, 'no cambia de dueño');
  assert.equal(rules.canWrite(T('archivada'), true, PROFE, db).allowed, true, 'el dueño archiva');
  assert.equal(rules.canWrite(T('archivada'), null, PROFE, conTarea(tarea({ archivada: true }))).allowed, true, 'y desarchiva');
  assert.equal(rules.canWrite(T('archivada'), 'si', PROFE, db).allowed, false, 'archivada: solo true');
  assert.equal(rules.canWrite(T('archivada'), true, OTRO_PROFE, db).allowed, false, 'otro profe no archiva');
  assert.equal(rules.canWrite(T('archivada'), true, ALUMNO, db).allowed, false, 'el estudiante no archiva');
});

/* ------------------------------------------------------------------ leer */

test('Tareas · leer: solo el dueño; nadie lista tareas', () => {
  const db = conTarea(tarea({ entregas: { anon1: entrega(), anon2: entrega({ nombre: 'Leo' }) } }));
  assert.equal(rules.canRead(T(), PROFE, db).allowed, true, 'el dueño lee la tarea con sus entregas');
  assert.equal(rules.canRead(T('entregas'), PROFE, db).allowed, true);
  assert.equal(rules.canRead(T(), OTRO_PROFE, db).allowed, false, 'otro profe aprobado no');
  assert.equal(rules.canRead(T(), ADMIN, db).allowed, false, 'tampoco la administración');
  assert.equal(rules.canRead(T(), ALUMNO, db).allowed, false, 'el estudiante no lee la tarea');
  assert.equal(rules.canRead(E('anon2'), ALUMNO, db).allowed, false, 'ni la entrega ajena');
  assert.equal(rules.canRead(T('entregas'), ALUMNO, db).allowed, false, 'ni la lista de entregas');
  assert.equal(rules.canRead('tareas', PROFE, db).allowed, false, 'nadie lista tareas/');
  assert.equal(rules.canRead('tareas', ALUMNO, db).allowed, false);
  assert.equal(rules.canRead('tareas', null, db).allowed, false);
  assert.equal(rules.canRead(T(), null, db).allowed, false, 'sin sesión');
});

test('Tareas · índice por profe: solo el propio', () => {
  const db = conTarea();
  assert.equal(rules.canRead('tareasPorProfe/profe1', PROFE, db).allowed, true);
  assert.equal(rules.canRead('tareasPorProfe/profe1', OTRO_PROFE, db).allowed, false);
  assert.equal(rules.canRead('tareasPorProfe/profe1', ALUMNO, db).allowed, false);
  assert.equal(rules.canRead('tareasPorProfe', PROFE, db).allowed, false);
  assert.equal(rules.canWrite(`tareasPorProfe/profe1/${COD}`, true, OTRO_PROFE, db).allowed, false, 'otro no escribe en mi índice');
  assert.equal(rules.canWrite(`tareasPorProfe/anon1/${COD}`, true, ALUMNO, db).allowed, false, 'anónimo sin índice');
  assert.equal(rules.canWrite(`tareasPorProfe/profe1/${COD}`, null, PROFE, db).allowed, true, 'el dueño borra del índice');
});

/* ------------------------------------------------------------------ entregar */

test('Entregas · el estudiante anónimo entrega en su propia ruta y puede volver a entregar', () => {
  const db = conTarea();
  assert.equal(rules.canWrite(E(), entrega(), ALUMNO, db).allowed, true, 'entrega');
  const ya = conTarea(tarea({ entregas: { anon1: entrega({ fecha: AHORA - 9000 }) } }));
  assert.equal(rules.canWrite(E(), entrega({ reto: 'Otra versión.' }), ALUMNO, ya).allowed, true, 'sobrescribe la suya');
  assert.equal(rules.canWrite(E(), entrega({ ejercicios: null, errores: null, reto: null }), ALUMNO, db).allowed, true, 'sin errores ni reto');
  assert.equal(rules.canWrite(E('profe2'), entrega(), OTRO_PROFE, db).allowed, true, 'un profe con sesión también entrega en su uid');
  assert.equal(rules.canWrite(T('archivada'), true, PROFE, db).allowed, true);
  assert.equal(rules.canWrite(E(), entrega(), ALUMNO, conTarea(tarea({ archivada: true }))).allowed, true, 'archivar no cierra la entrega');
});

test('Entregas · no se entrega en ruta ajena, sin sesión ni en una tarea que no existe', () => {
  const db = conTarea(tarea({ entregas: { anon2: entrega({ nombre: 'Leo' }) } }));
  assert.equal(rules.canWrite(E('anon2'), entrega(), ALUMNO, db).allowed, false, 'pisar la entrega de otro');
  assert.equal(rules.canWrite(E('anon2'), null, ALUMNO, db).allowed, false, 'borrar la de otro');
  assert.equal(rules.canWrite(E('anon1'), entrega(), null, db).allowed, false, 'sin sesión');
  assert.equal(rules.canWrite('tareas/zzzzzzzzzz/entregas/anon1', entrega(), ALUMNO, base()).allowed, false, 'tarea inexistente');
  assert.equal(rules.canWrite(T('entregas'), { anon1: entrega() }, ALUMNO, db).allowed, false, 'no reescribe la lista');
  assert.equal(rules.canWrite(T('tablero'), 'x', ALUMNO, db).allowed, false, 'no toca la tarea');
  assert.equal(rules.canWrite(T(), null, ALUMNO, db).allowed, false, 'no borra la tarea');
});

test('Entregas · tipos y tamaños', () => {
  const db = conTarea();
  const w = v => rules.canWrite(E(), v, ALUMNO, db).allowed;
  assert.equal(w(entrega({ nombre: 'n'.repeat(60) })), true, 'nombre = 60');
  assert.equal(w(entrega({ nombre: 'n'.repeat(61) })), false, 'nombre ≤ 60');
  assert.equal(w(entrega({ nombre: '' })), false, 'nombre vacío');
  assert.equal(w(entrega({ nombre: 5 })), false, 'nombre string');
  assert.equal(w(entrega({ fecha: AHORA - 1 })), false, 'fecha = now');
  assert.equal(w(entrega({ reto: 'r'.repeat(3000) })), true, 'reto = 3000');
  assert.equal(w(entrega({ reto: 'r'.repeat(3001) })), false, 'reto ≤ 3000');
  assert.equal(w(entrega({ lengua: 'fr' })), false, 'lengua es/en/pt');
  assert.equal(w(entrega({ puntaje: { aciertos: 9, total: 8 } })), false, 'aciertos ≤ total');
  assert.equal(w(entrega({ puntaje: { aciertos: -1, total: 8 } })), false, 'puntaje no negativo');
  assert.equal(w(entrega({ puntaje: { aciertos: '3', total: 8 } })), false, 'puntaje numérico');
  assert.equal(w(entrega({ puntaje: { aciertos: 3, total: 8, extra: 1 } })), false, 'puntaje sin extras');
  assert.equal(w(entrega({ puntaje: null })), false, 'falta puntaje');
  assert.equal(w(entrega({ otra: 'x' })), false, 'campos extra');
  assert.equal(w(entrega({ errores: lista(30, () => ({ p: '', escrito: 'a', correcto: 'b' })) })), true, '30 errores');
  assert.equal(w(entrega({ errores: lista(31, () => ({ p: '', escrito: 'a', correcto: 'b' })) })), false, 'errores ≤ 30');
  assert.equal(w(entrega({ errores: { 0: { p: 'x', escrito: 'e'.repeat(301), correcto: 'b' } } })), false, 'escrito ≤ 300');
  assert.equal(w(entrega({ errores: { 0: { p: 'x', escrito: 'a' } } })), false, 'error sin correcto');
  assert.equal(w(entrega({ errores: { 0: { escrito: 'a', correcto: 'b', mas: 1 } } })), false, 'error sin extras');
  assert.equal(w(entrega({ errores: { x: { escrito: 'a', correcto: 'b' } } })), false, 'error con índice no numérico');
  assert.equal(w(entrega({ ejercicios: lista(12, () => ({ tipo: 'elige', aciertos: 1, total: 2 })) })), true, '12 ejercicios');
  assert.equal(w(entrega({ ejercicios: lista(13, () => ({ tipo: 'elige', aciertos: 1, total: 2 })) })), false, 'ejercicios ≤ 12');
  assert.equal(w(entrega({ ejercicios: { 0: { tipo: 't'.repeat(21), aciertos: 1, total: 2 } } })), false, 'tipo ≤ 20');
  assert.equal(w(entrega({ ejercicios: { 0: { tipo: 'elige', aciertos: 1 } } })), false, 'ejercicio sin total');
});

/* ------------------------------------------------------------------ borrar */

test('Borrar · el dueño borra una entrega o la tarea entera; nadie más', () => {
  const db = conTarea(tarea({ entregas: { anon1: entrega(), anon2: entrega({ nombre: 'Leo' }) } }));
  assert.equal(rules.canWrite(E('anon1'), null, PROFE, db).allowed, true, 'el dueño borra una entrega');
  assert.equal(rules.canWrite(E('anon1'), entrega({ nombre: 'Otro' }), PROFE, db).allowed, false, 'pero no la edita');
  assert.equal(rules.canWrite(E('anon1'), null, OTRO_PROFE, db).allowed, false, 'otro profe no borra entregas');
  assert.equal(rules.canWrite(E('anon1'), null, ALUMNO, db).allowed, false, 'el estudiante tampoco (ni la suya)');
  assert.equal(rules.canWrite(T(), null, PROFE, db).allowed, true, 'el dueño borra la tarea');
  assert.equal(rules.canWrite(T(), null, OTRO_PROFE, db).allowed, false, 'otro profe no');
  assert.equal(rules.canWrite(T(), null, ADMIN, db).allowed, false, 'la administración tampoco');
  assert.equal(rules.canWrite(T(), null, ALUMNO2, db).allowed, false, 'ni un estudiante');
});

test('Reglas existentes intactas · salas, claves y profes siguen como antes', () => {
  const db = base({ salas: { sala1: { dueno: 'profe1', clave: 'k'.repeat(43) } }, claves: { a1: 'k'.repeat(43) } });
  assert.equal(rules.canRead('claves/a1', PROFE, db).allowed, true);
  assert.equal(rules.canRead('claves/a1', ALUMNO, db).allowed, false);
  assert.equal(rules.canRead('salas/sala1/clave', ALUMNO, db).allowed, true);
  assert.equal(rules.canWrite('salas/sala2/dueno', 'profe3', PENDIENTE, db).allowed, false);
  assert.equal(rules.canWrite('profes/anon9', { nombre: 'x', correo: 'x', estado: 'pendiente' }, { uid: 'anon9', provider: 'anonymous' }, db).allowed, false);
});
