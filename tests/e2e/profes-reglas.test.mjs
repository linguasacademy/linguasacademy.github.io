/**
 * Ficha del profe (fase 4) · reglas de Realtime Database (emulador helpers/rtdb-rules.mjs).
 * - Al entrar con Google por primera vez, el profe crea profes/<uid> con su nombre y los idiomas que enseña.
 * - idiomas: { es, en, pt } con valor true; ninguna otra clave.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { RtdbRulesEvaluator } from './helpers/rtdb-rules.mjs';

const REPO = path.resolve(import.meta.dirname, '..', '..');
const rules = RtdbRulesEvaluator.fromRepo(REPO);

const NUEVO = { uid: 'g1', isAnonymous: false, provider: 'google.com' };
const ficha = (extra = {}) => ({ nombre: 'Ana Ruiz', correo: 'ana@x.co', idioma: 'varios', idiomas: { es: true, en: true }, mensaje: '', estado: 'aprobado', creado: 1763460000000, ...extra });

test('Ficha del profe · se crea con los idiomas que enseña', () => {
  assert.equal(rules.canWrite('profes/g1', ficha(), NUEVO, {}).allowed, true, 'dos idiomas');
  assert.equal(rules.canWrite('profes/g1', ficha({ idioma: 'pt', idiomas: { pt: true } }), NUEVO, {}).allowed, true, 'uno');
});

test('Ficha del profe · idiomas solo acepta es, en y pt con valor true', () => {
  assert.equal(rules.canWrite('profes/g1', ficha({ idiomas: { fr: true } }), NUEVO, {}).allowed, false, 'idioma desconocido');
  assert.equal(rules.canWrite('profes/g1', ficha({ idiomas: { es: 'si' } }), NUEVO, {}).allowed, false, 'valor que no es true');
  assert.equal(rules.canWrite('profes/g1', ficha({ idiomas: 'es' }), NUEVO, {}).allowed, false, 'texto en vez de casillas');
});

test('Ficha del profe · no se reescribe una ficha que ya existe', () => {
  const db = { profes: { g1: ficha() } };
  assert.equal(rules.canWrite('profes/g1', ficha({ nombre: 'Otra' }), NUEVO, db).allowed, false);
});
