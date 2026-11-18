/**
 * Práctica autónoma: comparación de respuestas (tildes, mayúsculas, signos), conteo del reto,
 * contrato de practica/datos (indice_practica.py) y recorrido en Chrome (practica_navegador.py).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';

const REPO = path.resolve(import.meta.dirname, '..', '..');

function cargarMotor() {
  const window = { localStorage: { getItem() { return null; }, setItem() {} }, navigator: { language: 'en-US' } };
  const document = { readyState: 'complete', getElementById: () => null, documentElement: {}, addEventListener() {} };
  window.document = document;
  vm.runInNewContext(fs.readFileSync(path.join(REPO, 'assets/practica.js'), 'utf8'), { window, document, URLSearchParams, setTimeout, Promise });
  return window.LinguasPractica;
}

test('comparar: mayúsculas, espacios y signos no cuentan', () => {
  const M = cargarMotor();
  assert.equal(M.comparar('  SE   LLAMA ', ['se llama']).ok, true);
  assert.equal(M.comparar('¿Tengo ocho años?', ['Tengo ocho años.']).ok, true);
  assert.equal(M.comparar('tiene', ['tengo']).ok, false);
  assert.equal(M.comparar('', ['tengo']).vacio, true);
});

test('comparar: solo falta la tilde → correcto con aviso de la palabra', () => {
  const M = cargarMotor();
  const r = M.comparar('Esta es mi mama', ['Esta es mi mamá.']);
  assert.equal(r.ok, true);
  assert.deepEqual([...r.tilde], ['mamá']);
  const r2 = M.comparar('trabajaria', ['trabajaría']);
  assert.deepEqual([r2.ok, [...r2.tilde]], [true, ['trabajaría']]);
  assert.equal(M.comparar('está', ['está']).tilde.length, 0);
});

test('comparar: la ñ no es una tilde', () => {
  const M = cargarMotor();
  assert.equal(M.comparar('ano', ['año']).ok, false);
});

test('comparar: acepta cualquiera de las respuestas de k', () => {
  const M = cargarMotor();
  assert.equal(M.comparar('fuese', ['fuera', 'fuese']).ok, true);
  assert.equal(M.comparar('fuese', ['fuera', 'fuese']).correcta, 'fuese');
});

test('contar: frases y palabras del reto', () => {
  const M = cargarMotor();
  assert.equal(M.contar('Este es mi papá. Se llama Pedro! Tiene años', 'frases'), 3);
  assert.equal(M.contar('  ', 'frases'), 0);
  assert.equal(M.contar('Si tuviera tiempo, viajaría — mucho.', 'palabras'), 5);
});

test('txt: texto T en la lengua de apoyo con caída a es', () => {
  const M = cargarMotor();
  assert.equal(M.txt('hola'), 'hola');
  assert.equal(M.txt({ es: 'a', en: 'b' }, 'pt'), 'a');
  assert.equal(M.txt({ en: 'b', pt: 'c' }, 'pt'), 'c');
});

test('practica/datos cumple el contrato e indice.js está al día', () => {
  const r = spawnSync('python3', [path.join(REPO, 'herramientas/indice_practica.py'), '--comprobar'], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr + r.stdout);
});

test('indice_practica.validar detecta errores del contrato con mensajes claros', () => {
  const py = `
import json, sys
sys.path.insert(0, ${JSON.stringify(path.join(REPO, 'herramientas'))})
from indice_practica import validar
mal = {"tematica": "nada", "objetivo": {"fr": "x"}, "repaso": [],
       "ejercicios": [{"tipo": "elige", "consigna": "x", "items": [{"p": "sin hueco", "o": ["a", "b"], "k": 2, "e": "y"}]},
                      {"tipo": "completa", "consigna": "x", "items": [{"p": "a ___", "k": [], "e": "y"}]},
                      {"tipo": "otro"}],
       "reto": {"consigna": "x", "ruta": ["a"], "lista": ["b"], "min": 4, "max": 2, "unidad": "lineas"}}
err, av = validar("a1-x", mal, {"familia"}, "A1")
print(json.dumps(err, ensure_ascii=False))`;
  const r = spawnSync('python3', ['-c', py], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  const err = JSON.parse(r.stdout).join('\n');
  for (const frag of ['tematica', 'objetivo', 'repaso', '«p» debe ser un string con ___', '«k» = 2 fuera de rango', '«k» debe ser una lista', "tipo 'otro'", 'reto.min', 'reto.unidad']) {
    assert.ok(err.includes(frag), `falta «${frag}» en:\n${err}`);
  }
});

test('estudiantes.html: carga el motor y no es un tablero', () => {
  const html = fs.readFileSync(path.join(REPO, 'estudiantes.html'), 'utf8');
  for (const src of ['assets/catalogo.js', 'practica/temas.js', 'practica/indice.js', 'assets/practica.js', 'assets/practica.css']) assert.ok(html.includes(src), src);
  assert.ok(!html.includes('assets/abrir.js'));
  assert.ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(html + fs.readFileSync(path.join(REPO, 'assets/practica.js'), 'utf8')), 'sin emoticones');
});

test('recorrido en Chrome headless (es/en/pt, 1366×800 y 390×844)', { timeout: 600000 }, (t) => {
  const r = spawnSync('python3', [path.join(REPO, 'tests/e2e/practica_navegador.py')], { encoding: 'utf8', timeout: 590000 });
  if (r.status === 77) { t.skip((r.stdout || '').trim()); return; }
  assert.equal(r.status, 0, (r.stdout || '') + (r.stderr || ''));
});
