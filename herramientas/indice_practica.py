#!/usr/bin/env python3
"""Genera practica/indice.js y valida practica/datos/*.js contra el contrato.

Uso:
  python3 herramientas/indice_practica.py              valida y escribe practica/indice.js
  python3 herramientas/indice_practica.py --comprobar  solo valida y comprueba que indice.js está al día

Cada archivo se evalúa con node (en una caja aislada con `window`), así que
se valida lo que de verdad verá el navegador. Sale con código 1 si hay errores.
"""
from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATOS = ROOT / "practica" / "datos"
INDICE = ROOT / "practica" / "indice.js"
TEMAS = ROOT / "practica" / "temas.js"
CATALOGO = ROOT / "assets" / "catalogo.js"
NOMBRE_RE = re.compile(r"^(en-|pt-)?[abc][12]-[a-z0-9]+(-[a-z0-9]+)*$")
TIPOS = {"elige", "completa", "ordena", "empareja", "transforma"}
LENGUAS = {"es", "en", "pt"}
EMOJI_RE = re.compile("[\U0001F300-\U0001FAFF☀-➿⭐⬆↔-⇿✅❌]")
ITEMS_POR_NIVEL = {"A1": (6, 8), "A2": (8, 10), "B1": (8, 12), "B2": (8, 12), "C1": (6, 10), "C2": (6, 10)}

EVALUADOR = r"""
const fs = require('fs'), vm = require('vm');
const [temasPath, catPath, ...files] = process.argv.slice(1);
function cargar(p) { const w = {}; vm.runInNewContext(fs.readFileSync(p, 'utf8'), { window: w }, { filename: p, timeout: 2000 }); return w; }
const out = { temas: null, catalogo: null, datos: {} };
try { out.temas = cargar(temasPath).PRACTICA_TEMAS || null; } catch (e) { out.temasError = String(e && e.message || e); }
try { out.catalogo = cargar(catPath).CATALOGO || null; } catch (e) { out.catalogoError = String(e && e.message || e); }
for (const f of files) {
  try { const w = cargar(f); out.datos[f] = { ok: true, practica: w.PRACTICA || null }; }
  catch (e) { out.datos[f] = { ok: false, error: String(e && e.message || e) }; }
}
process.stdout.write(JSON.stringify(out));
"""


def es_texto(v) -> bool:
    """T: string no vacío u objeto {es,en,pt} con al menos una lengua y solo strings no vacíos."""
    if isinstance(v, str):
        return bool(v.strip())
    if isinstance(v, dict):
        if not v or not set(v) <= LENGUAS:
            return False
        return all(isinstance(x, str) and x.strip() for x in v.values())
    return False


def textos(v):
    if isinstance(v, str):
        yield v
    elif isinstance(v, dict):
        for x in v.values():
            if isinstance(x, str):
                yield x
    elif isinstance(v, list):
        for x in v:
            yield from textos(x)


def lista_respuestas(k) -> bool:
    if isinstance(k, str):
        return bool(k.strip())
    return isinstance(k, list) and len(k) > 0 and all(isinstance(x, str) and x.strip() for x in k)


def validar(nombre: str, d, temas: set[str], nivel: str) -> tuple[list[str], list[str]]:
    err: list[str] = []
    avisos: list[str] = []
    if not isinstance(d, dict):
        return [f"window.PRACTICA[{nombre!r}] no es un objeto"], avisos

    if d.get("tematica") not in temas:
        err.append(f"tematica {d.get('tematica')!r} no está en practica/temas.js ({', '.join(sorted(temas))})")
    if not es_texto(d.get("objetivo")):
        err.append("objetivo: falta o no es un texto T (string u objeto {es, en, pt})")

    repaso = d.get("repaso")
    if not isinstance(repaso, list) or not repaso:
        err.append("repaso: debe ser una lista con 3–5 modelos")
    else:
        if not 3 <= len(repaso) <= 5:
            avisos.append(f"repaso tiene {len(repaso)} modelos (se esperan 3–5)")
        for i, r in enumerate(repaso):
            if not isinstance(r, dict) or not isinstance(r.get("es"), str) or not r["es"].strip():
                err.append(f"repaso[{i}]: debe ser {{es, en, pt}} con «es» (la expresión en lengua meta)")
            elif not set(r) <= LENGUAS:
                err.append(f"repaso[{i}]: claves no válidas {sorted(set(r) - LENGUAS)}")

    ejercicios = d.get("ejercicios")
    if not isinstance(ejercicios, list) or not ejercicios:
        err.append("ejercicios: debe ser una lista con 4–5 ejercicios")
        ejercicios = []
    elif not 4 <= len(ejercicios) <= 5:
        avisos.append(f"hay {len(ejercicios)} ejercicios (se esperan 4–5)")
    rango = ITEMS_POR_NIVEL.get(nivel)

    for j, e in enumerate(ejercicios):
        donde = f"ejercicios[{j}]"
        if not isinstance(e, dict):
            err.append(f"{donde}: no es un objeto")
            continue
        tipo = e.get("tipo")
        if tipo not in TIPOS:
            err.append(f"{donde}: tipo {tipo!r} no válido (usa {', '.join(sorted(TIPOS))})")
            continue
        donde = f"{donde} ({tipo})"
        if not es_texto(e.get("consigna")):
            err.append(f"{donde}: consigna falta o no es un texto T")
        if tipo == "empareja":
            pares = e.get("pares")
            if not isinstance(pares, list) or len(pares) < 3:
                err.append(f"{donde}: pares debe ser una lista de al menos 3 [lengua meta, T]")
                continue
            izq = []
            for i, par in enumerate(pares):
                if not (isinstance(par, list) and len(par) == 2 and isinstance(par[0], str) and par[0].strip() and es_texto(par[1])):
                    err.append(f"{donde} pares[{i}]: debe ser [\"palabra\", T]")
                else:
                    izq.append(par[0].strip().lower())
            if len(set(izq)) != len(izq):
                err.append(f"{donde}: hay palabras repetidas a la izquierda")
            continue
        items = e.get("items")
        if not isinstance(items, list) or not items:
            err.append(f"{donde}: items debe ser una lista no vacía")
            continue
        if rango and not rango[0] <= len(items) <= rango[1]:
            avisos.append(f"{donde}: {len(items)} ítems (en {nivel} se esperan {rango[0]}–{rango[1]})")
        for i, it in enumerate(items):
            di = f"{donde} items[{i}]"
            if not isinstance(it, dict):
                err.append(f"{di}: no es un objeto")
                continue
            if not es_texto(it.get("e")):
                err.append(f"{di}: falta la explicación «e» (nunca solo «incorrecto»)")
            for opc in ("g", "h"):
                if opc in it and not es_texto(it[opc]):
                    err.append(f"{di}: «{opc}» debe ser un texto T")
            if tipo == "elige":
                p, o, k = it.get("p"), it.get("o"), it.get("k")
                if not isinstance(p, str) or "___" not in p:
                    err.append(f"{di}: «p» debe ser un string con ___")
                if not isinstance(o, list) or len(o) < 2 or not all(es_texto(x) for x in o):
                    err.append(f"{di}: «o» debe tener al menos 2 opciones")
                elif not isinstance(k, int) or isinstance(k, bool) or not 0 <= k < len(o):
                    err.append(f"{di}: «k» = {k!r} fuera de rango (0–{len(o) - 1})")
                elif len({json.dumps(x, ensure_ascii=False) for x in o}) != len(o):
                    err.append(f"{di}: opciones repetidas")
            elif tipo == "completa":
                if not isinstance(it.get("p"), str) or "___" not in it["p"]:
                    err.append(f"{di}: «p» debe ser un string con ___")
                if not lista_respuestas(it.get("k")):
                    err.append(f"{di}: «k» debe ser una lista de respuestas aceptadas (strings no vacíos)")
            elif tipo == "transforma":
                if not isinstance(it.get("p"), str) or not it["p"].strip():
                    err.append(f"{di}: «p» debe ser la frase de partida")
                if not lista_respuestas(it.get("k")):
                    err.append(f"{di}: «k» debe ser una lista de respuestas aceptadas (strings no vacíos)")
            elif tipo == "ordena":
                k = it.get("k")
                if not lista_respuestas(k):
                    err.append(f"{di}: «k» debe ser la frase ordenada (string)")
                else:
                    frase = k if isinstance(k, str) else k[0]
                    n = len(frase.split())
                    if n < 3:
                        err.append(f"{di}: la frase para ordenar necesita al menos 3 palabras")
                    elif n > 14:
                        avisos.append(f"{di}: {n} palabras para ordenar (muchas para una pantalla)")

    reto = d.get("reto")
    if not isinstance(reto, dict):
        err.append("reto: falta (consigna, ruta, lista, min, max, unidad)")
    else:
        if not es_texto(reto.get("consigna")):
            err.append("reto.consigna: falta o no es un texto T")
        ruta = reto.get("ruta")
        if not isinstance(ruta, list) or not ruta or not all(es_texto(x) for x in ruta):
            err.append("reto.ruta: debe ser una lista de comienzos de frase")
        lista = reto.get("lista")
        if not isinstance(lista, list) or not lista or not all(es_texto(x) for x in lista):
            err.append("reto.lista: debe ser una lista de puntos de verificación (T)")
        mn, mx = reto.get("min"), reto.get("max")
        if not (isinstance(mn, int) and isinstance(mx, int) and not isinstance(mn, bool) and 0 < mn <= mx):
            err.append(f"reto.min / reto.max: enteros con 0 < min <= max (hay {mn!r} y {mx!r})")
        if reto.get("unidad") not in ("frases", "palabras"):
            err.append(f"reto.unidad: «frases» o «palabras» (hay {reto.get('unidad')!r})")

    malos = sorted({t for t in textos(d) if EMOJI_RE.search(t)})
    for t in malos[:3]:
        err.append(f"emoticón o símbolo decorativo en {t[:60]!r}")
    return err, avisos


def contar_items(d) -> int:
    n = 0
    for e in d.get("ejercicios", []):
        n += len(e.get("pares", [])) if e.get("tipo") == "empareja" else len(e.get("items", []))
    return n


def generar(practicas: dict[str, dict], catalogo: dict[str, dict]) -> str:
    nombres = sorted(practicas)
    meta = {
        n: {"tematica": practicas[n]["tematica"], "nivel": catalogo.get(n, {}).get("nivel", ""), "items": contar_items(practicas[n])}
        for n in nombres
    }
    cuerpo = ",\n".join(f"  {json.dumps(n)}: {json.dumps(meta[n], ensure_ascii=False)}" for n in nombres)
    return (
        "/* Generado por herramientas/indice_practica.py a partir de practica/datos/*.js. No lo edites a mano. */\n"
        f"window.PRACTICA_INDICE = {json.dumps(nombres, indent=2)};\n"
        f"window.PRACTICA_META = {{\n{cuerpo}\n}};\n"
    )


def main(argv: list[str]) -> int:
    comprobar = "--comprobar" in argv
    node = shutil.which("node")
    if not node:
        print("ERROR: hace falta node para evaluar practica/datos/*.js", file=sys.stderr)
        return 1
    archivos = sorted(DATOS.glob("*.js")) if DATOS.is_dir() else []
    proc = subprocess.run([node, "-e", EVALUADOR, str(TEMAS), str(CATALOGO), *map(str, archivos)],
                          capture_output=True, text=True)
    if proc.returncode != 0:
        print(f"ERROR al evaluar con node: {proc.stderr.strip()}", file=sys.stderr)
        return 1
    res = json.loads(proc.stdout)
    errores: list[str] = []
    if not isinstance(res.get("temas"), list):
        errores.append(f"practica/temas.js: no define window.PRACTICA_TEMAS ({res.get('temasError', 'vacío')})")
        temas: set[str] = set()
    else:
        temas = {t.get("id") for t in res["temas"] if isinstance(t, dict)}
        for t in res["temas"]:
            if not isinstance(t, dict) or not all(isinstance(t.get(l), str) and t[l].strip() for l in ("id", "es", "en", "pt")):
                errores.append(f"practica/temas.js: entrada incompleta {t!r} (necesita id, es, en, pt)")
    catalogo = {}
    for c in res.get("catalogo") or []:
        catalogo[str(c.get("archivo", "")).removesuffix(".html")] = c

    practicas: dict[str, dict] = {}
    for f in archivos:
        rel = f.relative_to(ROOT)
        nombre = f.stem
        r = res["datos"].get(str(f), {})
        if not r.get("ok"):
            errores.append(f"{rel}: no se pudo evaluar ({r.get('error', '?')})")
            continue
        if not NOMBRE_RE.match(nombre):
            errores.append(f"{rel}: nombre de archivo no válido (debe ser <nivel>-<tema>.js, como el tablero)")
            continue
        p = r.get("practica") or {}
        claves = list(p)
        if claves != [nombre]:
            errores.append(f"{rel}: debe definir solo window.PRACTICA[{nombre!r}] (define {claves})")
            if nombre not in p:
                continue
        if nombre not in catalogo:
            errores.append(f"{rel}: el tablero {nombre} no está en assets/catalogo.js")
        nivel = catalogo.get(nombre, {}).get("nivel", "")
        err, avisos = validar(nombre, p[nombre], temas, nivel)
        errores.extend(f"{rel}: {e}" for e in err)
        for a in avisos:
            print(f"[AVISO] {rel}: {a}")
        if not err:
            practicas[nombre] = p[nombre]

    if errores:
        print("\nErrores en la práctica:", file=sys.stderr)
        for e in errores:
            print(f"  - {e}", file=sys.stderr)
        return 1

    nuevo = generar(practicas, catalogo)
    if comprobar:
        actual = INDICE.read_text(encoding="utf-8") if INDICE.is_file() else ""
        if actual != nuevo:
            print("ERROR: practica/indice.js no está al día. Ejecuta: python3 herramientas/indice_practica.py", file=sys.stderr)
            return 1
        print(f"[OK] practica/: {len(practicas)} prácticas válidas e indice.js al día")
        return 0
    INDICE.write_text(nuevo, encoding="utf-8")
    print(f"[OK] practica/indice.js: {len(practicas)} prácticas")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
