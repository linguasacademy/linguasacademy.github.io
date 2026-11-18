/**
 * Servidor de pruebas: sirve el repositorio y emula Realtime Database en memoria
 * aplicando database.rules.json (helpers/rtdb-rules.mjs). Lo usa tareas_navegador.py
 * junto con helpers/firebase-falso.js (el SDK compat falso que se inyecta en las páginas).
 *
 *   node tests/e2e/helpers/rtdb-servidor.mjs [puerto]   → imprime «LISTO <puerto>»
 *
 *   POST /__rtdb/leer      { ruta, auth }        → { ok, val } (aplica .read)
 *   POST /__rtdb/escribir  { ops:[{ruta,val}], auth } → { ok } (aplica .write/.validate; TIMESTAMP → now)
 *   GET  /__rtdb/eventos   SSE: un mensaje por cada cambio
 *   POST /__rtdb/semilla   { arbol }  ·  GET /__rtdb/arbol  ·  GET /__rtdb/rechazos
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { RtdbRulesEvaluator } from './rtdb-rules.mjs';

const RAIZ = path.resolve(import.meta.dirname, '..', '..', '..');
const reglas = RtdbRulesEvaluator.fromRepo(RAIZ);
let arbol = {};
const rechazos = [];
const clientes = new Set();

const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.json': 'application/json', '.bin': 'application/octet-stream',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.woff2': 'font/woff2' };

const partes = r => String(r || '').split('/').filter(Boolean);
function leerEn(obj, ps) { let o = obj; for (const p of ps) { if (o && typeof o === 'object' && p in o) o = o[p]; else return null; } return o === undefined ? null : o; }
function poner(obj, ps, v) {
  const c = structuredClone(obj || {});
  if (!ps.length) return v == null ? {} : structuredClone(v);
  let o = c;
  for (const p of ps.slice(0, -1)) { if (!o[p] || typeof o[p] !== 'object') o[p] = {}; o = o[p]; }
  if (v == null) delete o[ps.at(-1)]; else o[ps.at(-1)] = structuredClone(v);
  /* como RTDB: los nodos vacíos desaparecen */
  const podar = n => { if (!n || typeof n !== 'object') return n; for (const k of Object.keys(n)) { n[k] = podar(n[k]); if (n[k] == null || (typeof n[k] === 'object' && !Object.keys(n[k]).length)) delete n[k]; } return n; };
  return podar(c);
}
/* RTDB guarda los arreglos como objetos {0:…,1:…} y descarta null */
function normalizar(v, ahora) {
  if (Array.isArray(v)) { const o = {}; v.forEach((x, i) => { const n = normalizar(x, ahora); if (n != null) o[i] = n; }); return Object.keys(o).length ? o : null; }
  if (v && typeof v === 'object') {
    if (v['.sv'] === 'timestamp') return ahora;
    const o = {}; for (const [k, x] of Object.entries(v)) { const n = normalizar(x, ahora); if (n != null) o[k] = n; }
    return Object.keys(o).length ? o : null;
  }
  return v;
}
const conReloj = (t, fn) => { const r = Date.now; Date.now = () => t; try { return fn(); } finally { Date.now = r; } };

function avisar() { const v = String(Date.now()); for (const c of clientes) c.write('data: ' + v + '\n\n'); }
const json = (res, code, o) => { res.writeHead(code, { 'content-type': 'application/json', 'cache-control': 'no-store' }); res.end(JSON.stringify(o)); };
const cuerpo = req => new Promise(ok => { let b = ''; req.on('data', d => { b += d; }); req.on('end', () => { try { ok(JSON.parse(b || '{}')); } catch (e) { ok({}); } }); });

const srv = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/__rtdb/eventos') {
    res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-store', connection: 'keep-alive' });
    res.write('retry: 500\n\n');
    clientes.add(res); req.on('close', () => clientes.delete(res));
    return;
  }
  if (u.pathname === '/__rtdb/leer' && req.method === 'POST') {
    const { ruta, auth } = await cuerpo(req);
    const r = reglas.canRead(ruta, auth || null, arbol);
    if (!r.allowed) { rechazos.push({ op: 'leer', ruta, uid: auth && auth.uid, motivo: r.reason }); return json(res, 200, { ok: false, error: 'permission_denied' }); }
    return json(res, 200, { ok: true, val: leerEn(arbol, partes(ruta)) });
  }
  if (u.pathname === '/__rtdb/escribir' && req.method === 'POST') {
    const { ops, auth } = await cuerpo(req);
    const ahora = Date.now();
    let nuevo = arbol;
    for (const op of ops || []) {
      const val = normalizar(op.val, ahora);
      const r = conReloj(ahora, () => reglas.canWrite(op.ruta, val, auth || null, nuevo));
      if (!r.allowed) { rechazos.push({ op: 'escribir', ruta: op.ruta, uid: auth && auth.uid, motivo: r.reason }); return json(res, 200, { ok: false, error: 'permission_denied', motivo: r.reason }); }
      nuevo = poner(nuevo, partes(op.ruta), val);
    }
    arbol = nuevo; avisar();
    return json(res, 200, { ok: true });
  }
  if (u.pathname === '/__rtdb/semilla' && req.method === 'POST') { arbol = (await cuerpo(req)).arbol || {}; rechazos.length = 0; avisar(); return json(res, 200, { ok: true }); }
  if (u.pathname === '/__rtdb/arbol') return json(res, 200, arbol);
  if (u.pathname === '/__rtdb/rechazos') return json(res, 200, rechazos);

  /* archivos del repositorio */
  let p = decodeURIComponent(u.pathname);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(RAIZ, path.normalize(p));
  if (!f.startsWith(RAIZ) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { res.writeHead(404); return res.end('no'); }
  res.writeHead(200, { 'content-type': TIPOS[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(f).pipe(res);
});
srv.listen(+(process.argv[2] || 0), '127.0.0.1', () => { console.log('LISTO ' + srv.address().port); });
