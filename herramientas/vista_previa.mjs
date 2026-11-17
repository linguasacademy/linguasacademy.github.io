#!/usr/bin/env node
/* vista_previa.mjs · Lingua's Academy
   Genera la VISTA PREVIA pública de un tablero a partir de su HTML original (descifrado).

   Uso:
     node herramientas/vista_previa.mjs <original.html> <salida.html> [--hasta=<n>] [--raiz=<prefijo>] [--sin-indice]

     --hasta=<n>   cuántas actividades de Contenido se conservan (por defecto 1).
                   Siempre se conservan la Introducción y los Objetivos que vengan antes.
     --sin-indice  no rehace vista/vistas.js (por defecto, si la salida está en una carpeta «vista»,
                   se rehace la lista de vistas previas que leen la portada y el catálogo).
     --raiz=<p>    prefijo para las rutas relativas del tablero (logo.svg, imágenes locales…).
                   Por defecto se calcula: si la salida está en <repo>/vista/, es «../».

   Qué hace:
     1. Analiza los <script> en línea con acorn y encuentra las secciones del arreglo SECS
        (const SECS = [...] y/o SECS.push(...)). Cada sección necesita un campo m literal
        ('intro' | 'obj' | 'cont' | 'res' | 'tarea').
     2. Conserva el principio de la clase (Introducción, Objetivos y las <n> primeras actividades
        de Contenido) y BORRA DEL CÓDIGO FUENTE todas las secciones siguientes.
     3. Borra también las declaraciones que solo usaban las secciones quitadas (textos de la lectura,
        preguntas del juego…) y los elementos HTML a los que solo ellas apuntaban (<template id=…>).
     4. Quita vivo.js y Firebase (la vista previa no tiene sala en vivo), añade noindex,
        una cinta «Vista previa», las secciones bloqueadas con candado en el menú lateral y una
        lámina final «Hasta aquí la vista previa» con el botón a ../suscripcion.html.
   Si no puede analizar el tablero con seguridad, falla con un mensaje claro y NO escribe la salida:
   nunca publica el tablero completo. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { parse as parseHtml } from 'parse5';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(AQUI, '..');

class Fallo extends Error {}
const falla = msg => { throw new Fallo(msg); };

/* ───────────────────────── argumentos ───────────────────────── */
function leerArgs(argv) {
  const pos = [], op = { hasta: 1, raiz: null };
  for (const a of argv) {
    let m;
    if ((m = /^--hasta=(\d+)$/.exec(a))) op.hasta = Number(m[1]);
    else if ((m = /^--raiz=(.*)$/.exec(a))) op.raiz = m[1];
    else if (a === '--sin-indice') op.indice = false;
    else if (a === '-h' || a === '--help') op.ayuda = true;
    else if (a.startsWith('--')) falla(`Opción desconocida: ${a}`);
    else pos.push(a);
  }
  if (op.ayuda) return op;
  if (pos.length !== 2) falla('Uso: node herramientas/vista_previa.mjs <original.html> <salida.html> [--hasta=<n>] [--raiz=<prefijo>] [--sin-indice]');
  if (!(op.hasta >= 1)) falla('--hasta debe ser un número entero mayor o igual que 1.');
  [op.entrada, op.salida] = pos;
  return op;
}

/* ───────────────────────── utilidades ───────────────────────── */
const MOMENTO = v => {
  const s = String(v || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (/^intro/.test(s)) return 'intro';
  if (/^obj/.test(s)) return 'obj';
  if (/^cont/.test(s)) return 'cont';
  if (/^res/.test(s)) return 'res';
  if (/^(tarea|task|hw|deberes)/.test(s)) return 'tarea';
  return null;
};
const NOMBRE_MOMENTO = { intro: 'Introducción', obj: 'Objetivos', cont: 'Contenido', res: 'Resumen', tarea: 'Tarea' };

function parseJs(code, donde) {
  const base = { ecmaVersion: 'latest', allowHashBang: true, allowReturnOutsideFunction: true, allowAwaitOutsideFunction: true };
  try { return acorn.parse(code, { ...base, sourceType: 'script' }); }
  catch (e1) {
    try { return acorn.parse(code, { ...base, sourceType: 'module' }); }
    catch (e2) { falla(`No se pudo analizar el JavaScript de ${donde}: ${e1.message}`); }
  }
}

/* aplica cambios {s, e, t} sobre un texto (posiciones del texto original), sin solapes */
function aplicar(texto, cambios) {
  const cs = [...cambios].sort((a, b) => a.s - b.s || a.e - b.e);
  for (let i = 1; i < cs.length; i++) if (cs[i].s < cs[i - 1].e) falla(`Error interno: dos cambios se solapan (${cs[i - 1].s}-${cs[i - 1].e} y ${cs[i].s}-${cs[i].e}).`);
  let out = '', p = 0;
  for (const c of cs) { out += texto.slice(p, c.s) + c.t; p = c.e; }
  return out + texto.slice(p);
}

const esSECS = n => n && ((n.type === 'Identifier' && n.name === 'SECS') ||
  (n.type === 'MemberExpression' && !n.computed && n.property.type === 'Identifier' && n.property.name === 'SECS'));

/* valor literal de una propiedad de un objeto (string, número o plantilla sin expresiones) */
function literal(n) {
  if (!n) return undefined;
  if (n.type === 'Literal' && (typeof n.value === 'string' || typeof n.value === 'number')) return n.value;
  if (n.type === 'TemplateLiteral' && n.expressions.length === 0) return n.quasis.map(q => q.value.cooked).join('');
  return undefined;
}
function prop(obj, nombres) {
  if (!obj || obj.type !== 'ObjectExpression') return undefined;
  for (const p of obj.properties) {
    if (p.type !== 'Property' || p.computed) continue;
    const k = p.key.type === 'Identifier' ? p.key.name : p.key.value;
    if (nombres.includes(k)) { const v = literal(p.value); if (v !== undefined) return v; }
  }
  return undefined;
}
const CLAVES_TITULO = ['t', 'tit', 'titulo', 'title', 'nombre', 'name', 'label', 'etiqueta', 'et'];
const CLAVES_MIN = ['min', 'mins', 'minutos', 'dur', 'duracion'];

/* datos de una sección: {m, id, titulo, min} o null si no se puede saber su momento */
function datosSeccion(n) {
  let obj = null, m = null;
  if (n.type === 'ObjectExpression') obj = n;
  else if (n.type === 'CallExpression' || n.type === 'NewExpression') {
    for (const a of n.arguments) {
      if (!m && literal(a) !== undefined && MOMENTO(literal(a))) m = MOMENTO(literal(a));
      if (!obj && a.type === 'ObjectExpression' && prop(a, ['m', 'momento']) !== undefined) obj = a;
    }
  }
  if (obj && !m) m = MOMENTO(prop(obj, ['m', 'momento']));
  if (!m) return null;
  const titulo = obj ? prop(obj, CLAVES_TITULO) : undefined;
  const min = obj ? prop(obj, CLAVES_MIN) : undefined;
  return { m, id: obj ? prop(obj, ['id']) : undefined, titulo: titulo == null ? '' : String(titulo).replace(/<[^>]*>/g, '').trim(), min: Number.isFinite(+min) && +min > 0 ? +min : null };
}

/* ¿la inicialización de una declaración se puede borrar sin efectos? (literales, funciones, objetos…) */
function pura(n) {
  if (!n) return true;
  switch (n.type) {
    case 'Literal': case 'Identifier': case 'FunctionExpression': case 'ArrowFunctionExpression': case 'ClassExpression': case 'ThisExpression': return true;
    case 'TemplateLiteral': return n.expressions.every(pura);
    case 'ArrayExpression': return n.elements.every(e => !e || (e.type === 'SpreadElement' ? pura(e.argument) : pura(e)));
    case 'ObjectExpression': return n.properties.every(p => p.type === 'SpreadElement' ? pura(p.argument) : (!p.computed || pura(p.key)) && pura(p.value));
    case 'UnaryExpression': return n.operator !== 'delete' && pura(n.argument);
    case 'BinaryExpression': case 'LogicalExpression': return pura(n.left) && pura(n.right);
    case 'ConditionalExpression': return pura(n.test) && pura(n.consequent) && pura(n.alternate);
    case 'MemberExpression': return pura(n.object) && (!n.computed || pura(n.property));
    case 'ParenthesizedExpression': return pura(n.expression);
    default: return false;
  }
}

/* identificadores y cadenas que aparecen dentro de un nodo */
function contenido(n) {
  const ids = new Set(), strs = new Set();
  walk.full(n, x => {
    if (x.type === 'Identifier') ids.add(x.name);
    else if (x.type === 'Literal' && typeof x.value === 'string') strs.add(x.value);
    else if (x.type === 'TemplateElement' && x.value.cooked) strs.add(x.value.cooked);
  });
  return { ids, strs };
}

/* ───────────────────────── HTML ───────────────────────── */
function elementos(doc) {
  const out = [];
  const rec = n => {
    if (n.nodeName && n.tagName) out.push(n);
    for (const c of n.childNodes || []) rec(c);
    if (n.content) rec(n.content);   // <template>
  };
  rec(doc);
  return out;
}
const attr = (el, k) => { const a = (el.attrs || []).find(x => x.name === k); return a ? a.value : null; };
const JS_TIPOS = /^(|text\/javascript|application\/javascript|module|text\/ecmascript|application\/ecmascript)$/i;
const RELATIVA = v => v && !/^(#|\/|[a-z][a-z0-9+.-]*:|\{|\$)/i.test(v.trim());

/* ───────────────────────── núcleo ───────────────────────── */
export function generarVistaPrevia(html, { hasta = 1, raiz = '../', nombre = '' } = {}) {
  const doc = parseHtml(html, { sourceCodeLocationInfo: true });
  const els = elementos(doc);
  const cambiosHtml = [];

  /* 1. scripts en línea */
  const scripts = [];
  for (const el of els) {
    if (el.tagName !== 'script' || attr(el, 'src') != null) continue;
    if (!JS_TIPOS.test((attr(el, 'type') || '').trim())) continue;
    const loc = el.sourceCodeLocation;
    if (!loc || !loc.startTag || !loc.endTag) continue;
    const s = loc.startTag.endOffset, e = loc.endTag.startOffset;
    scripts.push({ el, s, e, code: html.slice(s, e), i: scripts.length });
  }
  if (!scripts.some(x => /\bSECS\b/.test(x.code))) falla('No se encontró el arreglo SECS en ningún <script> del tablero. ¿Es el HTML original (descifrado) de un tablero?');

  /* 2. secciones: elementos de SECS = [...] y argumentos de SECS.push(...) */
  const items = [];      // {sc, nodo, datos, holder}
  const holders = [];    // {sc, tipo:'arr'|'push', nodo, stmt, items:[]}
  for (const sc of scripts) {
    if (!/\bSECS\b/.test(sc.code)) continue;
    sc.ast = parseJs(sc.code, `del <script> n.º ${sc.i + 1}`);
    walk.fullAncestor(sc.ast, (n, _st, anc) => {
      let arr = null;
      if (n.type === 'VariableDeclarator' && n.id.type === 'Identifier' && n.id.name === 'SECS') {
        if (!n.init) return;
        if (n.init.type === 'ArrayExpression') arr = n.init;
        else falla('SECS se inicializa con algo que no es un arreglo literal; no se puede recortar con seguridad.');
      } else if (n.type === 'AssignmentExpression' && esSECS(n.left)) {
        if (n.right.type === 'ArrayExpression' && n.operator === '=') arr = n.right;
        else falla('SECS se reasigna con algo que no es un arreglo literal; no se puede recortar con seguridad.');
      } else if (n.type === 'CallExpression' && n.callee.type === 'MemberExpression' && esSECS(n.callee.object)) {
        const met = n.callee.computed ? literal(n.callee.property) : n.callee.property.name;
        if (met === 'push') {
          const padre = anc[anc.length - 2];
          const h = { sc, tipo: 'push', nodo: n, stmt: padre && padre.type === 'ExpressionStatement' && padre.expression === n ? padre : null, items: [] };
          for (const a of n.arguments) {
            if (a.type === 'SpreadElement') falla('SECS.push(...) usa «...»; no se puede saber qué secciones añade.');
            h.items.push(a);
          }
          holders.push(h);
        } else if (['unshift', 'splice', 'concat', 'fill', 'copyWithin', 'reverse', 'sort'].includes(met)) {
          falla(`El tablero usa SECS.${met}(...); el orden de las secciones no se puede saber con seguridad.`);
        }
      }
      if (arr) {
        const h = { sc, tipo: 'arr', nodo: arr, items: [] };
        for (const a of arr.elements) {
          if (!a) continue;
          if (a.type === 'SpreadElement') falla('El arreglo SECS usa «...»; no se puede saber qué secciones contiene.');
          h.items.push(a);
        }
        holders.push(h);
      }
    });
  }
  for (const h of holders) for (const nodo of h.items) {
    const datos = datosSeccion(nodo);
    if (!datos) {
      const lin = h.sc.code.slice(0, nodo.start).split('\n').length;
      falla(`No se pudo saber el momento (m: 'intro' | 'obj' | 'cont' | 'res' | 'tarea') de una sección de SECS (script n.º ${h.sc.i + 1}, línea ${lin}). No se publica nada.`);
    }
    items.push({ sc: h.sc, nodo, datos, h });
  }
  if (!items.length) falla('SECS no tiene secciones literales que se puedan analizar.');
  items.sort((a, b) => (a.sc.s + a.nodo.start) - (b.sc.s + b.nodo.start));

  /* 3. el corte: hasta la <hasta>-ésima actividad de Contenido */
  let nCont = 0, corte = -1;
  for (let i = 0; i < items.length; i++) if (items[i].datos.m === 'cont' && ++nCont === hasta) { corte = i + 1; break; }
  const totalCont = items.filter(x => x.datos.m === 'cont').length;
  if (corte < 0) falla(`El tablero tiene ${totalCont} actividad(es) de Contenido; con --hasta=${hasta} la vista previa mostraría el tablero completo.`);
  if (corte >= items.length) falla('Después del corte no queda ninguna sección: la vista previa sería el tablero completo.');
  items.forEach((x, i) => { x.queda = i < corte; });
  const quitados = items.filter(x => !x.queda);
  if (!quitados.some(x => x.datos.m === 'res' || x.datos.m === 'tarea') && !quitados.length) falla('No hay nada que bloquear.');

  /* 4. borrar las secciones del código */
  const cambiosJs = new Map(scripts.map(sc => [sc, []]));
  for (const h of holders) {
    const xs = h.items.map(n => items.find(x => x.nodo === n));
    const k = xs.filter(x => x.queda).length;
    if (xs.slice(0, k).some(x => !x.queda) || xs.slice(k).some(x => x.queda)) falla('Error interno: el corte no es un prefijo de las secciones.');
    if (k === xs.length) continue;
    const C = cambiosJs.get(h.sc);
    if (h.tipo === 'arr') {
      const s = k ? xs[k - 1].nodo.end : h.nodo.start + 1;
      C.push({ s, e: h.nodo.end - 1, t: k ? '\n' : '' });
    } else if (k > 0) {
      C.push({ s: xs[k - 1].nodo.end, e: xs[xs.length - 1].nodo.end, t: '' });
    } else if (h.stmt) {
      C.push({ s: h.stmt.start, e: h.stmt.end + (h.sc.code[h.stmt.end] === '\n' ? 1 : 0), t: '' });
    } else {
      C.push({ s: h.nodo.start, e: h.nodo.end, t: 'void 0' });
    }
  }

  /* lo que mencionaban las secciones quitadas */
  const candidatos = new Set(), cadenasQuitadas = new Set();
  for (const x of quitados) { const c = contenido(x.nodo); c.ids.forEach(v => candidatos.add(v)); c.strs.forEach(v => cadenasQuitadas.add(v)); }

  for (const sc of scripts) {
    const C = cambiosJs.get(sc);
    sc.nuevo = C.length ? aplicar(sc.code, C) : sc.code;
  }

  /* 5. borrar declaraciones que solo usaban las secciones quitadas (hasta que no cambie nada) */
  /* el HTML solo nombra variables del script en atributos on…="" y en enlaces javascript: */
  const fueraDeScripts = els.flatMap(el => (el.attrs || []).filter(a => /^on/i.test(a.name) || /^\s*javascript:/i.test(a.value)).map(a => a.value)).join('\n');
  const borradas = [];
  for (let vuelta = 0; vuelta < 50; vuelta++) {
    const asts = scripts.map(sc => ({ sc, ast: parseJs(sc.nuevo, `del <script> n.º ${sc.i + 1} (recortado)`) }));
    const usos = [];   // {sc, nombre, pos}
    const cadenasVivas = new Set();
    for (const { sc, ast } of asts) walk.fullAncestor(ast, (n, _st, anc) => {
      if (n.type === 'Identifier') usos.push({ sc, nombre: n.name, pos: n.start, padre: anc[anc.length - 2] });
      else if (n.type === 'Literal' && typeof n.value === 'string') cadenasVivas.add(n.value);
    });
    let cambio = false;
    for (const { sc, ast } of asts) {
      const bloques = [ast.body];
      for (const st of ast.body) {
        let ex = st.type === 'ExpressionStatement' ? st.expression : null;
        if (ex && ex.type === 'UnaryExpression') ex = ex.argument;
        if (ex && ex.type === 'CallExpression' && /FunctionExpression$/.test(ex.callee.type) && ex.callee.body.type === 'BlockStatement') bloques.push(ex.callee.body.body);
      }
      /* y el cuerpo de la función donde se declara SECS (p. ej. dentro de DOMContentLoaded) */
      walk.fullAncestor(ast, (n, _st, anc) => {
        if (n.type !== 'VariableDeclarator' || n.id.type !== 'Identifier' || n.id.name !== 'SECS') return;
        const f = [...anc].reverse().find(a => /Function/.test(a.type) && a.body && a.body.type === 'BlockStatement');
        if (f && !bloques.includes(f.body.body)) bloques.push(f.body.body);
      });
      const C = [];
      for (const cuerpo of bloques) for (const st of cuerpo) {
        let nombres = null;
        if (st.type === 'VariableDeclaration') {
          if (!st.declarations.every(d => d.id.type === 'Identifier' && pura(d.init))) continue;
          nombres = st.declarations.map(d => d.id.name);
        } else if ((st.type === 'FunctionDeclaration' || st.type === 'ClassDeclaration') && st.id) {
          nombres = [st.id.name];
        } else continue;
        if (!nombres.every(n => candidatos.has(n))) continue;
        const usada = nombres.some(nm =>
          usos.some(u => u.nombre === nm && !(u.sc === sc && u.pos >= st.start && u.pos < st.end)) ||
          cadenasVivas.has(nm) || new RegExp('\\b' + nm.replace(/\$/g, '\\$') + '\\b').test(fueraDeScripts));
        if (usada) {
          /* objeto de datos compartido (const D = {lectura:…, juego:…}): se borran las propiedades que ya nadie lee */
          if (st.type !== 'VariableDeclaration' || st.declarations.length !== 1) continue;
          const d = st.declarations[0], obj = d.init;
          if (!obj || obj.type !== 'ObjectExpression' || fueraDeScripts.includes(d.id.name) || cadenasVivas.has(d.id.name)) continue;
          const fuera = usos.filter(u => u.nombre === d.id.name && !(u.sc === sc && u.pos === d.id.start));   // también las lecturas desde dentro del propio objeto
          const leidas = new Set();
          let estaticas = true;
          for (const u of fuera) {
            const pa = u.padre;
            if (pa && pa.type === 'MemberExpression' && pa.object.start === u.pos) {
              const k = pa.computed ? literal(pa.property) : pa.property.name;
              if (k === undefined) { estaticas = false; break; }
              leidas.add(String(k));
            } else { estaticas = false; break; }
          }
          if (!estaticas) continue;
          const props = obj.properties;
          const claveDe = q => q.type === 'Property' && !q.computed && q.kind === 'init' && !q.method ? String(q.key.type === 'Identifier' ? q.key.name : q.key.value) : null;
          if (props.some(q => claveDe(q) === null)) continue;
          const muertas = props.filter(q => !leidas.has(claveDe(q)) && pura(q.value));
          if (!muertas.length) continue;
          for (const q of muertas) { const c = contenido(q.value); c.ids.forEach(v => candidatos.add(v)); c.strs.forEach(v => cadenasQuitadas.add(v)); }
          const vivas = props.filter(q => !muertas.includes(q));
          borradas.push(d.id.name + '.{' + muertas.map(claveDe).join(', ') + '}');
          C.push({ s: obj.start + 1, e: obj.end - 1, t: vivas.map(q => sc.nuevo.slice(q.start, q.end)).join(', ') });
          continue;
        }
        const c = contenido(st);
        c.ids.forEach(v => candidatos.add(v)); c.strs.forEach(v => cadenasQuitadas.add(v));
        borradas.push(nombres.join(', '));
        C.push({ s: st.start, e: st.end + (sc.nuevo[st.end] === '\n' ? 1 : 0), t: '' });
      }
      if (C.length) { sc.nuevo = aplicar(sc.nuevo, C); cambio = true; }
    }
    if (!cambio) break;
  }
  for (const sc of scripts) {
    parseJs(sc.nuevo, `del <script> n.º ${sc.i + 1} (resultado)`);
    if (sc.nuevo !== sc.code) cambiosHtml.push({ s: sc.s, e: sc.e, t: sc.nuevo });
  }

  /* 6. elementos HTML a los que solo apuntaban las secciones quitadas (<template id>, láminas fijas…) */
  const codigoVivo = scripts.map(sc => sc.nuevo).join('\n');
  const idsQuitados = new Set(quitados.map(x => x.datos.id).filter(Boolean).map(String));
  const elsQuitados = [];
  for (const el of els) {
    if (['html', 'head', 'body', 'script', 'style', 'link', 'meta'].includes(el.tagName)) continue;
    const id = attr(el, 'id'), sec = attr(el, 'data-sec') || attr(el, 'data-seccion');
    const porId = id && (cadenasQuitadas.has(id) || idsQuitados.has(id));
    const porSec = sec && idsQuitados.has(sec);
    if (!porId && !porSec) continue;
    const loc = el.sourceCodeLocation; if (!loc) continue;
    if (scripts.some(sc => sc.s >= loc.startOffset && sc.e <= loc.endOffset)) continue;   // contiene código que se conserva
    const ref = id || sec;
    if (codigoVivo.includes(ref)) continue;
    const resto = (html.slice(0, loc.startOffset) + html.slice(loc.endOffset)).replace(/<script\b[\s\S]*?<\/script>/gi, '');
    if (new RegExp('["\'#]' + ref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '["\'\\s]').test(resto)) continue;
    elsQuitados.push({ s: loc.startOffset, e: loc.endOffset, ref });
  }
  elsQuitados.sort((a, b) => a.s - b.s || b.e - a.e);
  let finUlt = -1;
  for (const r of elsQuitados) { if (r.s < finUlt) continue; cambiosHtml.push({ s: r.s, e: r.e, t: '' }); finUlt = r.e; }

  /* 7. fuera la sala en vivo: vivo.js, Firebase, fb.js/auth.js/abrir.js */
  const quitarSrc = /(^|\/)(vivo\.js|assets\/(fb|auth|abrir)\.js)([?#]|$)|firebase/i;
  for (const el of els) {
    const loc = el.sourceCodeLocation; if (!loc) continue;
    if (el.tagName === 'script' && attr(el, 'src') != null && quitarSrc.test(attr(el, 'src'))) cambiosHtml.push({ s: loc.startOffset, e: loc.endOffset, t: '' });
    if (el.tagName === 'link' && /firebase/i.test(attr(el, 'href') || '')) cambiosHtml.push({ s: loc.startOffset, e: loc.endOffset, t: '' });
  }

  /* 8. rutas relativas → desde vista/ (logo.svg, imágenes locales) */
  if (raiz) for (const el of els) {
    if (el.tagName === 'script' && attr(el, 'src') != null && quitarSrc.test(attr(el, 'src'))) continue;
    const loc = el.sourceCodeLocation; if (!loc || !loc.attrs) continue;
    for (const k of ['src', 'href', 'poster']) {
      const v = attr(el, k), la = loc.attrs[k];
      if (!la || !RELATIVA(v)) continue;
      const crudo = html.slice(la.startOffset, la.endOffset);
      const i = crudo.indexOf(v);
      if (i < 0) continue;
      cambiosHtml.push({ s: la.startOffset + i, e: la.startOffset + i + v.length, t: raiz + v });
    }
  }

  /* 9. cabeza: noindex, título y window.claude sin sala (modo local, sin Firebase) */
  const head = els.find(e => e.tagName === 'head');
  const robots = els.find(e => e.tagName === 'meta' && (attr(e, 'name') || '').toLowerCase() === 'robots');
  if (robots) cambiosHtml.push({ s: robots.sourceCodeLocation.startOffset, e: robots.sourceCodeLocation.endOffset, t: '<meta name="robots" content="noindex, nofollow">' });
  const titulo = els.find(e => e.tagName === 'title');
  let tituloTxt = '';
  if (titulo && titulo.childNodes[0] && titulo.childNodes[0].sourceCodeLocation) {
    const l = titulo.childNodes[0].sourceCodeLocation; tituloTxt = html.slice(l.startOffset, l.endOffset);
    cambiosHtml.push({ s: l.startOffset, e: l.endOffset, t: 'Vista previa · ' + tituloTxt });
  }
  const cabeza = (robots ? '' : '\n<meta name="robots" content="noindex, nofollow">') +
    '\n<script>/* Vista previa: sin sala en vivo. El tablero funciona solo en esta pantalla. */window.claude={use:async function(){return null}};window.LA_VISTA_PREVIA=true;</script>\n';
  if (head && head.sourceCodeLocation && head.sourceCodeLocation.startTag) {
    const p = head.sourceCodeLocation.startTag.endOffset; cambiosHtml.push({ s: p, e: p, t: cabeza });
  } else falla('El tablero no tiene <head>.');

  /* 10. cinta, menú con candados y lámina bloqueada */
  const bloqueadas = quitados.map(x => ({ m: x.datos.m, t: x.datos.titulo, min: x.datos.min }));
  const body = els.find(e => e.tagName === 'body');
  const finBody = body && body.sourceCodeLocation && body.sourceCodeLocation.endTag ? body.sourceCodeLocation.endTag.startOffset : html.length;
  cambiosHtml.push({ s: finBody, e: finBody, t: interfaz({ bloqueadas, suscripcion: raiz + 'suscripcion.html', inicio: raiz || './', nombre }) });

  const salida = aplicar(html, cambiosHtml);
  return {
    html: salida,
    informe: {
      secciones: items.length, conservadas: items.filter(x => x.queda).map(x => `${NOMBRE_MOMENTO[x.datos.m]}${x.datos.titulo ? ' · ' + x.datos.titulo : ''}`),
      bloqueadas: bloqueadas.map(b => `${NOMBRE_MOMENTO[b.m]}${b.t ? ' · ' + b.t : ''}`),
      declaracionesBorradas: borradas, elementosBorrados: elsQuitados.map(r => r.ref),
      cadenasQuitadas: [...cadenasQuitadas], titulosBloqueados: bloqueadas.map(b => b.t).filter(Boolean)
    }
  };
}

/* ───────────────────────── interfaz inyectada ───────────────────────── */
const escAttr = v => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
function interfaz({ bloqueadas, suscripcion, inicio, nombre }) {
  const datos = JSON.stringify({ bloqueadas, suscripcion, inicio, nombre })
    .replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  return `
<!-- ═══ Vista previa · Lingua's Academy (generada por herramientas/vista_previa.mjs) ═══ -->
<style id="vp-estilo">
#vp-cinta{position:fixed;z-index:60;left:50%;transform:translateX(-50%);bottom:max(12px,env(safe-area-inset-bottom));display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:center;
  max-width:calc(100vw - 24px);padding:8px 8px 8px 10px;background:var(--hoja,#FFFDF9);color:var(--tinta,#17223D);border:2.5px solid var(--tinta,#17223D);border-radius:18px;box-shadow:5px 5px 0 var(--tinta,#17223D);
  font:500 15px/1.3 "Instrument Sans",system-ui,sans-serif}
#vp-cinta .vp-et{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:10px;background:var(--mostaza,#D6992A);color:var(--tinta,#17223D);font:500 13px/1 "JetBrains Mono",ui-monospace,monospace;letter-spacing:.02em;text-transform:uppercase;white-space:nowrap}
#vp-cinta .vp-txt{color:var(--tinta2,#2C3A5C)}
.vp-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:8px 16px;border-radius:14px;border:2.5px solid var(--tinta,#17223D);box-shadow:3px 3px 0 var(--tinta,#17223D);
  font:600 15px/1.2 "Instrument Sans",system-ui,sans-serif;text-decoration:none;cursor:pointer;background:var(--hoja,#FFFDF9);color:var(--tinta,#17223D);transition:transform .12s,box-shadow .12s}
.vp-btn:active{transform:translate(3px,3px);box-shadow:0 0 0 var(--tinta,#17223D)}
.vp-btn--pri{background:var(--terra,#C2533A);color:#fff}
.vp-btn:focus-visible,#vp-lado button:focus-visible{outline:3px solid var(--mar,#1B7A88);outline-offset:3px}
.vp-i{width:18px;height:18px;flex:none;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
body.vp-con-cinta{padding-bottom:96px}
#vp-lado{margin-top:14px;padding-top:12px;border-top:2px dashed var(--linea,#D9D2C4)}
#vp-lado h3{display:flex;align-items:center;gap:6px;margin:0 0 8px;font:500 12px/1.2 "JetBrains Mono",ui-monospace,monospace;letter-spacing:.03em;text-transform:uppercase;color:var(--ayuda,#5B6478)}
#vp-lado ol{list-style:none;margin:0;padding:0;display:grid;gap:6px}
#vp-lado button{width:100%;display:flex;align-items:center;gap:8px;text-align:left;font:500 14px/1.3 "Instrument Sans",system-ui,sans-serif;color:var(--ayuda,#5B6478);
  background:var(--papel,#F5F2EC);border:2px dashed var(--linea,#D9D2C4);border-radius:12px;padding:7px 10px;cursor:pointer}
#vp-lado button:hover{border-color:var(--tinta2,#2C3A5C);color:var(--tinta,#17223D)}
#vp-lado .vp-pt{width:9px;height:9px;border-radius:50%;flex:none;background:var(--c)}
#vp-lado .vp-tt{flex:1;min-width:0;overflow-wrap:anywhere}
#vp-lado .vp-min{font:500 12px/1 "JetBrains Mono",ui-monospace,monospace}
#vp-fin{border:0;padding:0;background:transparent;max-width:min(640px,calc(100vw - 24px));width:100%;color:var(--tinta,#17223D)}
#vp-fin::backdrop{background:rgba(23,34,61,.55)}
#vp-fin .vp-lam{background:var(--hoja,#FFFDF9);border:2.5px solid var(--tinta,#17223D);border-radius:26px;box-shadow:5px 5px 0 var(--tinta,#17223D);overflow:hidden}
#vp-fin .vp-cab{display:flex;align-items:center;gap:12px;background:var(--tinta,#17223D);color:var(--hoja,#FFFDF9);padding:16px 22px}
#vp-fin .vp-cab .vp-i{width:28px;height:28px;stroke-width:1.75;color:var(--mostaza,#D6992A)}
#vp-fin h2{margin:0;font:400 clamp(1.3rem,3.6vw,1.7rem)/1.2 "Young Serif",Georgia,serif}
#vp-fin .vp-cuerpo{padding:20px 22px 22px;font:400 17px/1.5 "Instrument Sans",system-ui,sans-serif}
#vp-fin .vp-cuerpo p{margin:0 0 14px}
#vp-fin ol{list-style:none;margin:0 0 18px;padding:0;display:grid;gap:6px;max-height:40vh;overflow:auto}
#vp-fin li{display:flex;align-items:center;gap:10px;padding:8px 12px;border:2px dashed var(--linea,#D9D2C4);border-radius:12px;background:var(--papel,#F5F2EC);color:var(--tinta2,#2C3A5C)}
#vp-fin li .vp-m{font:500 12px/1 "JetBrains Mono",ui-monospace,monospace;padding:4px 8px;border-radius:8px;background:var(--cf);color:var(--tinta,#17223D);white-space:nowrap}
#vp-fin li .vp-tt{flex:1;min-width:0;overflow-wrap:anywhere}
#vp-fin .vp-acc{display:flex;flex-wrap:wrap;gap:10px}
@media (max-width:560px){#vp-cinta{flex-wrap:nowrap;gap:8px;padding:6px}#vp-cinta .vp-txt{display:none}#vp-cinta .vp-btn{padding:6px 12px;font-size:14px;white-space:nowrap}body.vp-con-cinta{padding-bottom:84px}}
@media (prefers-reduced-motion:reduce){.vp-btn{transition:none}}
@media print{#vp-cinta,#vp-fin{display:none}}
</style>
<div id="vp-cinta" role="region" aria-label="Vista previa">
  <span class="vp-et"><svg class="vp-i" viewBox="0 0 24 24" aria-hidden="true"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg><span data-vp="cinta">Vista previa</span></span>
  <span class="vp-txt" data-vp="cintaTxt">Ves el principio de la clase.</span>
  <button type="button" class="vp-btn vp-btn--pri" data-vp-abrir><svg class="vp-i" viewBox="0 0 24 24" aria-hidden="true"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg><span data-vp="verResto">Ver el resto de la clase</span></button>
</div>
<dialog id="vp-fin" aria-labelledby="vp-fin-t">
  <div class="vp-lam">
    <div class="vp-cab"><svg class="vp-i" viewBox="0 0 24 24" aria-hidden="true"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg><h2 id="vp-fin-t" data-vp="finT">Hasta aquí la vista previa</h2></div>
    <div class="vp-cuerpo">
      <p data-vp="finTxt">El resto de la clase (actividades, lectura, juego, resumen y tarea) está disponible con la suscripción.</p>
      <ol id="vp-fin-lista"></ol>
      <div class="vp-acc">
        <a class="vp-btn vp-btn--pri" id="vp-ir" href="${escAttr(suscripcion)}"><span data-vp="suscribir">Desbloquear con la suscripción</span><svg class="vp-i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></a>
        <button type="button" class="vp-btn" data-vp-cerrar><span data-vp="seguir">Seguir en la vista previa</span></button>
      </div>
    </div>
  </div>
</dialog>
<script id="vp-datos" type="application/json">${datos}</script>
<script>
/* Vista previa · Lingua's Academy. Iconos: Lucide, ISC */
(function(){
  "use strict";
  var D = JSON.parse(document.getElementById("vp-datos").textContent);
  var T = {
    es:{cinta:"Vista previa",cintaTxt:"Ves el principio de la clase.",verResto:"Ver el resto de la clase",finT:"Hasta aquí la vista previa",
      finTxt:"El resto de la clase (actividades, lectura, juego, resumen y tarea) está disponible con la suscripción.",suscribir:"Desbloquear con la suscripción",
      seguir:"Seguir en la vista previa",lado:"En la clase completa",bloq:"Bloqueado: ",m:{intro:"Introducción",obj:"Objetivos",cont:"Contenido",res:"Resumen",tarea:"Tarea"}},
    en:{cinta:"Preview",cintaTxt:"You're seeing the start of the lesson.",verResto:"See the rest of the lesson",finT:"This is where the preview ends",
      finTxt:"The rest of the lesson (activities, reading, game, review and homework) is available with a subscription.",suscribir:"Unlock with a subscription",
      seguir:"Keep exploring the preview",lado:"In the full lesson",bloq:"Locked: ",m:{intro:"Warm-up",obj:"Goals",cont:"Content",res:"Review",tarea:"Homework"}},
    pt:{cinta:"Prévia",cintaTxt:"Você está vendo o começo da aula.",verResto:"Ver o resto da aula",finT:"A prévia termina aqui",
      finTxt:"O resto da aula (atividades, leitura, jogo, resumo e tarefa) está disponível com a assinatura.",suscribir:"Desbloquear com a assinatura",
      seguir:"Continuar na prévia",lado:"Na aula completa",bloq:"Bloqueado: ",m:{intro:"Introdução",obj:"Objetivos",cont:"Conteúdo",res:"Resumo",tarea:"Tarefa"}}
  };
  var L = "es";
  try { L = new URLSearchParams(location.search).get("lang") || localStorage.getItem("la-lang") || ""; } catch (e) {}
  if (!T[L]) { var nv = String(navigator.language || "").toLowerCase(); L = nv.indexOf("pt") === 0 ? "pt" : nv.indexOf("en") === 0 ? "en" : "es"; }
  var t = T[L];
  var COL = {intro:["--terra","#C2533A","--terraf","#F8E3DC"],obj:["--mostaza","#D6992A","--mostazaf","#FBEFD6"],cont:["--mar","#1B7A88","--marf","#DDEFF1"],res:["--ciruela","#6D4B80","--ciruelaf","#ECE3F2"],tarea:["--verde","#4A8656","--verdef","#E1F0E3"]};
  var CANDADO = '<svg class="vp-i" viewBox="0 0 24 24" aria-hidden="true"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
  function nombre(b){ return b.t || t.m[b.m]; }
  document.querySelectorAll("[data-vp]").forEach(function(el){ var k = el.getAttribute("data-vp"); if (t[k]) el.textContent = t[k]; });
  var cinta = document.getElementById("vp-cinta"); cinta.setAttribute("aria-label", t.cinta);
  document.body.classList.add("vp-con-cinta");
  var ir = document.getElementById("vp-ir");
  ir.href = D.suscripcion + (L !== "es" ? "?lang=" + L : "");

  /* la lámina final */
  var dlg = document.getElementById("vp-fin"), lista = document.getElementById("vp-fin-lista");
  D.bloqueadas.forEach(function(b){
    var li = document.createElement("li"), c = COL[b.m] || COL.cont;
    li.style.setProperty("--cf", "var(" + c[2] + "," + c[3] + ")");
    li.innerHTML = CANDADO + '<span class="vp-m"></span><span class="vp-tt"></span>';
    li.children[1].textContent = t.m[b.m]; li.children[2].textContent = nombre(b);
    lista.appendChild(li);
  });
  function abrir(){
    if (dlg.open) return;
    if (typeof dlg.showModal === "function") { try { dlg.showModal(); } catch (e) { dlg.setAttribute("open", ""); } } else dlg.setAttribute("open", "");
    ir.focus();
  }
  function cerrar(){ if (typeof dlg.close === "function" && dlg.open) dlg.close(); else dlg.removeAttribute("open"); }
  window.LA_VISTA_PREVIA = { abrir: abrir, cerrar: cerrar };
  cinta.querySelector("[data-vp-abrir]").addEventListener("click", abrir);
  dlg.querySelector("[data-vp-cerrar]").addEventListener("click", cerrar);
  dlg.addEventListener("click", function(e){ if (e.target === dlg) cerrar(); });

  /* el menú lateral: las secciones bloqueadas, con candado */
  function bloqueLado(){
    var d = document.createElement("div"); d.id = "vp-lado";
    d.innerHTML = '<h3>' + CANDADO + '<span></span></h3><ol></ol>';
    d.querySelector("h3 span").textContent = t.lado;
    var ol = d.querySelector("ol");
    D.bloqueadas.forEach(function(b){
      var li = document.createElement("li"), bt = document.createElement("button"), c = COL[b.m] || COL.cont;
      bt.type = "button"; bt.style.setProperty("--c", "var(" + c[0] + "," + c[1] + ")");
      bt.setAttribute("aria-label", t.bloq + t.m[b.m] + " · " + nombre(b));
      bt.innerHTML = '<span class="vp-pt" aria-hidden="true"></span><span class="vp-tt"></span>' + (b.min ? '<span class="vp-min"></span>' : "") + CANDADO;
      bt.querySelector(".vp-tt").textContent = nombre(b);
      if (b.min) bt.querySelector(".vp-min").textContent = b.min + " min";
      bt.addEventListener("click", abrir);
      li.appendChild(bt); ol.appendChild(li);
    });
    return d;
  }
  var lado = document.getElementById("lado") || document.querySelector("aside, nav#mapa, #mapa, .mapa");
  if (lado) {
    var puesto = bloqueLado(); lado.appendChild(puesto);
    new MutationObserver(function(){ if (!lado.contains(puesto)) { puesto = bloqueLado(); lado.appendChild(puesto); } }).observe(lado, { childList: true, subtree: true });
  }

  /* «Siguiente» al final de lo que se ve: en vez de no hacer nada, abre la lámina bloqueada */
  var zona = function(){ return document.getElementById("lamina") || document.querySelector("main") || document.getElementById("app") || document.body; };
  var firma = function(){ var z = zona(); return z ? z.innerHTML.length + ":" + z.innerHTML.slice(0, 4000) + location.hash : ""; };
  function esSiguiente(el){
    if (!el || el.closest("#vp-cinta, #vp-fin, #vp-lado")) return false;
    var b = el.closest("button, a, [role=button]"); if (!b) return false;
    var id = (b.id || "") + " " + (b.getAttribute("data-accion") || "") + " " + (b.getAttribute("aria-label") || "") + " " + (b.getAttribute("title") || "");
    var txt = (b.textContent || "").trim();
    return /(^|\\s)(bSig|bSiguiente|sig|siguiente|next)(\\s|$)/i.test(id) || /^siguiente\\b/i.test(id.trim()) || /^(siguiente|next|próximo)\\b/i.test(txt);
  }
  function vigila(){
    var antes = firma();
    setTimeout(function(){ if (!dlg.open && firma() === antes) abrir(); }, 220);
  }
  document.addEventListener("click", function(e){ if (esSiguiente(e.target)) vigila(); }, true);
  document.addEventListener("keydown", function(e){
    if (e.key !== "ArrowRight" || e.altKey || e.ctrlKey || e.metaKey || dlg.open) return;
    var a = document.activeElement; if (a && (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.isContentEditable)) return;
    vigila();
  }, true);
  /* si el tablero apaga «Siguiente» en la última pantalla, se deja encendido para llegar a la lámina final */
  function encender(){
    document.querySelectorAll("button[disabled], [aria-disabled=true]").forEach(function(b){
      if (esSiguiente(b)) { b.disabled = false; b.removeAttribute("aria-disabled"); }
    });
  }
  new MutationObserver(encender).observe(document.body, { attributes: true, subtree: true, attributeFilter: ["disabled", "aria-disabled"] });
  encender();
})();
</script>
`;
}

/* ───────────────────────── CLI ───────────────────────── */
function raizPorDefecto(salida) {
  const rel = path.relative(path.resolve(path.dirname(salida)), REPO);
  if (rel === '') return '';
  const partes = rel.split(path.sep);
  if (partes.every(p => p === '..')) return partes.join('/') + '/';   // salida dentro del repositorio (vista/ → ../)
  return '../';                                                        // fuera del repositorio: se supone vista/
}

/* vista/vistas.js: la lista de vistas previas que existen, para la portada y el catálogo.
   Se rehace leyendo la carpeta, así que nunca queda desfasada. Solo si la carpeta se llama «vista». */
export function escribirIndice(dir) {
  if (path.basename(dir) !== 'vista') return null;
  const nombres = fs.readdirSync(dir).filter(f => /\.html$/i.test(f) && !f.startsWith('_') && !f.startsWith('.')).map(f => f.replace(/\.html$/i, '')).sort();
  const archivo = path.join(dir, 'vistas.js');
  const txt = '/* Vistas previas públicas de los tableros (vista/<nombre>.html).\n' +
    '   Archivo generado por herramientas/vista_previa.mjs: no lo edites a mano. */\n' +
    'window.VISTAS = ' + JSON.stringify(nombres, null, 0).replace(/","/g, '", "') + ';\n';
  fs.writeFileSync(archivo, txt);
  return { archivo, n: nombres.length };
}

function main() {
  let op;
  try { op = leerArgs(process.argv.slice(2)); }
  catch (e) { console.error('vista_previa: ' + e.message); process.exit(2); }
  if (op.ayuda) { console.log('Uso: node herramientas/vista_previa.mjs <original.html> <salida.html> [--hasta=<n>] [--raiz=<prefijo>] [--sin-indice]'); return; }
  try {
    if (!fs.existsSync(op.entrada)) falla(`No existe el archivo de entrada: ${op.entrada}`);
    const html = fs.readFileSync(op.entrada, 'utf8');
    if (/^\s*$/.test(html)) falla('El archivo de entrada está vacío.');
    const raiz = op.raiz != null ? op.raiz : raizPorDefecto(op.salida);
    const nombre = path.basename(op.salida).replace(/\.html?$/i, '');
    const { html: out, informe } = generarVistaPrevia(html, { hasta: op.hasta, raiz, nombre });

    /* comprobaciones finales antes de escribir */
    if (/<script[^>]+src=["'][^"']*(vivo\.js|firebase)/i.test(out)) falla('La salida todavía carga vivo.js o Firebase.');
    if (!/<meta name="robots" content="noindex/i.test(out)) falla('La salida no tiene noindex.');
    const titulos = new Set(informe.titulosBloqueados);
    const enSalida = informe.cadenasQuitadas.filter(s => s.trim().length >= 12 && !titulos.has(s.trim()) && out.includes(s));
    fs.mkdirSync(path.dirname(path.resolve(op.salida)), { recursive: true });
    const tmp = op.salida + '.tmp-' + process.pid;
    fs.writeFileSync(tmp, out);
    fs.renameSync(tmp, op.salida);

    const indice = op.indice !== false ? escribirIndice(path.dirname(path.resolve(op.salida))) : null;

    console.log(`vista_previa: ${op.salida}`);
    if (indice) console.log(`  índice actualizado: ${path.relative(process.cwd(), indice.archivo) || indice.archivo} (${indice.n} vista(s) previa(s))`);
    console.log(`  se ven (${informe.conservadas.length}): ${informe.conservadas.join(' | ')}`);
    console.log(`  bloqueadas (${informe.bloqueadas.length}): ${informe.bloqueadas.join(' | ')}`);
    if (informe.declaracionesBorradas.length) console.log(`  declaraciones borradas: ${informe.declaracionesBorradas.join(', ')}`);
    if (informe.elementosBorrados.length) console.log(`  elementos HTML borrados: #${informe.elementosBorrados.join(', #')}`);
    if (enSalida.length) console.log(`  aviso: ${enSalida.length} texto(s) de las secciones bloqueadas también los usa la parte visible y siguen en la página (p. ej. «${enSalida[0].slice(0, 60)}»).`);
  } catch (e) {
    if (e instanceof Fallo) { console.error('vista_previa: ERROR: ' + e.message); process.exit(1); }
    throw e;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
