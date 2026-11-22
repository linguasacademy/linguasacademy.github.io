#!/usr/bin/env python3
"""Verificación de integridad del repositorio Lingua's Academy."""

from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
# Páginas de la raíz que NO son tableros (lista explícita: cualquier otro .html
# de la raíz se trata como el cargador de un tablero).
NON_BOARD_HTML = {
    "index.html",
    "tableros.html",
    "entrar.html",
    "admin.html",
    "404.html",
    "muestra.html",
    "suscripcion.html",
    "estudiantes.html",
    "panel.html",
    "estilo.html",
}
BOARD_NAME_RE = re.compile(r"^(en-|pt-)?[abc][12]-[a-z0-9]+(-[a-z0-9]+)*$")
# Un cargador es pequeño y solo carga assets/abrir.js; un tablero original pesa
# decenas de KB. Si un .html de tablero no es un cargador, es un original en claro.
LOADER_MAX_BYTES = 8000
HTML_FILES_TO_CHECK = [
    "index.html",
    "tableros.html",
    "entrar.html",
    "admin.html",
    "404.html",
    "estudiantes.html",
    "panel.html",
    "herramientas/cargador.html",
]
IGNORED_PREFIXES = ("http://", "https://", "mailto:", "tel:", "data:", "javascript:", "#")


class _RefParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.refs: list[tuple[str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        for name, value in attrs:
            if name in ("src", "href") and value is not None:
                self.refs.append((name, value.strip()))


def check_catalog_parity() -> list[str]:
    errors: list[str] = []
    catalog_path = ROOT / "assets" / "catalogo.js"
    if not catalog_path.is_file():
        return [f"No se encontró {catalog_path.relative_to(ROOT)}"]

    catalog_text = catalog_path.read_text(encoding="utf-8")
    catalog_files = re.findall(r'"archivo"\s*:\s*"([^"]+)"', catalog_text)

    seen: set[str] = set()
    duplicates: list[str] = []
    for f in catalog_files:
        if f in seen:
            duplicates.append(f)
        seen.add(f)
    if duplicates:
        errors.append(f"Entradas duplicadas en assets/catalogo.js: {sorted(set(duplicates))}")

    catalog_stems = {Path(f).stem for f in catalog_files}
    root_board_stems = {
        p.stem for p in ROOT.glob("*.html") if p.name not in NON_BOARD_HTML
    }
    bin_stems = {p.stem for p in (ROOT / "t").glob("*.bin")}

    if not (catalog_stems == root_board_stems == bin_stems):
        only_cat_vs_html = sorted(catalog_stems - root_board_stems)
        only_html_vs_cat = sorted(root_board_stems - catalog_stems)
        only_cat_vs_bin = sorted(catalog_stems - bin_stems)
        only_bin_vs_cat = sorted(bin_stems - catalog_stems)
        only_html_vs_bin = sorted(root_board_stems - bin_stems)
        only_bin_vs_html = sorted(bin_stems - root_board_stems)

        if only_cat_vs_html:
            errors.append(f"En catalogo.js pero falta <nombre>.html en raíz: {only_cat_vs_html}")
        if only_html_vs_cat:
            errors.append(f"Tablero .html en raíz pero falta en catalogo.js: {only_html_vs_cat}")
        if only_cat_vs_bin:
            errors.append(f"En catalogo.js pero falta t/<nombre>.bin: {only_cat_vs_bin}")
        if only_bin_vs_cat:
            errors.append(f"Archivo t/<nombre>.bin pero falta en catalogo.js: {only_bin_vs_cat}")
        if only_html_vs_bin:
            errors.append(f"Tablero .html en raíz pero falta t/<nombre>.bin: {only_html_vs_bin}")
        if only_bin_vs_html:
            errors.append(f"Archivo t/<nombre>.bin pero falta <nombre>.html en raíz: {only_bin_vs_html}")
    else:
        print(f"[OK] Paridad 1:1 verificada: {len(catalog_stems)} tableros (catalogo.js, *.html, t/*.bin)")

    return errors


def check_loaders() -> list[str]:
    """Cada <nombre>.html de tablero en la raíz debe ser un cargador, nunca el original."""
    errors: list[str] = []
    boards = [p for p in ROOT.glob("*.html") if p.name not in NON_BOARD_HTML]
    for p in boards:
        text = p.read_text(encoding="utf-8", errors="replace")
        if not BOARD_NAME_RE.match(p.stem):
            errors.append(f"{p.name}: nombre de tablero no válido (o falta en NON_BOARD_HTML de verificar.py si no es un tablero)")
        if "assets/abrir.js" not in text or p.stat().st_size > LOADER_MAX_BYTES:
            errors.append(f"{p.name} no es un cargador: parece un tablero original en claro. No lo subas; usa herramientas/tablero.py agregar")
    if not errors:
        print(f"[OK] {len(boards)} cargadores de tablero (ningún original en claro en la raíz)")
    return errors


def check_pending_and_previews() -> list[str]:
    """pendientes/ (sellos y borrados para el workflow «Tableros») y vista/ (vistas previas públicas)."""
    errors: list[str] = []
    catalog_text = (ROOT / "assets" / "catalogo.js").read_text(encoding="utf-8")
    catalog = {Path(f).stem for f in re.findall(r'"archivo"\s*:\s*"([^"]+)"', catalog_text)}

    pub = ROOT / "herramientas" / "sello_publico.pem"
    if not pub.is_file():
        errors.append("Falta herramientas/sello_publico.pem (clave pública de sellado)")
    elif "PRIVATE KEY" in pub.read_text(encoding="utf-8", errors="replace"):
        errors.append("herramientas/sello_publico.pem contiene una clave PRIVADA. Bórrala del repositorio y cambia el par de claves")

    pend = ROOT / "pendientes"
    n_sellos = 0
    borrar: list[str] = []
    if pend.is_dir():
        for p in sorted(pend.iterdir()):
            if p.name in (".gitkeep", "borrar.txt"):
                continue
            if p.suffix == ".sello":
                n_sellos += 1
                stem = p.name[: -len(".sello")]
                if not BOARD_NAME_RE.match(stem):
                    errors.append(f"pendientes/{p.name}: nombre de tablero no válido")
                elif not (ROOT / "t" / f"{stem}.bin").is_file():
                    errors.append(f"pendientes/{p.name}: falta t/{stem}.bin")
                try:
                    data = json.loads(p.read_text(encoding="utf-8"))
                    if data.get("nombre") != stem or data.get("alg") != "RSA-OAEP-256" or "clave" not in data:
                        errors.append(f"pendientes/{p.name}: formato de sello inesperado")
                except (json.JSONDecodeError, UnicodeDecodeError):
                    errors.append(f"pendientes/{p.name}: no es JSON válido")
            else:
                errors.append(f"pendientes/{p.name}: archivo no permitido (solo <nombre>.sello, borrar.txt y .gitkeep). "
                              "Nunca pongas aquí un original en claro")
        if (pend / "borrar.txt").is_file():
            borrar = [l.strip() for l in (pend / "borrar.txt").read_text(encoding="utf-8").splitlines()
                      if l.strip() and not l.startswith("#")]
            for b in borrar:
                if not BOARD_NAME_RE.match(b):
                    errors.append(f"pendientes/borrar.txt: nombre no válido {b!r}")
                elif b in catalog:
                    errors.append(f"pendientes/borrar.txt: {b} sigue en catalogo.js (no se puede borrar su clave)")

    vista = ROOT / "vista"
    n_vistas = 0
    if vista.is_dir():
        for p in sorted(vista.iterdir()):
            if p.name.startswith("."):
                continue
            if p.suffix != ".html":
                continue  # recursos de las vistas previas (imágenes, css), si el generador los crea
            n_vistas += 1
            if p.stem not in catalog:
                errors.append(f"vista/{p.name}: vista previa de un tablero que no está en catalogo.js")

    if not errors:
        print(f"[OK] pendientes/ ({n_sellos} sellos, {len(borrar)} borrados) y vista/ ({n_vistas} vistas previas)")
    return errors


def check_database_rules() -> list[str]:
    rules_path = ROOT / "database.rules.json"
    if not rules_path.is_file():
        return ["No se encontró database.rules.json"]
    try:
        json.loads(rules_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        return [f"JSON inválido en database.rules.json: {exc}"]
    print("[OK] database.rules.json es JSON válido")
    return []


def check_js_syntax() -> list[str]:
    node = shutil.which("node")
    if not node:
        print("[NOTA] node no encontrado en PATH; se omite comprobación de sintaxis JS")
        return []

    js_files = sorted(list(ROOT.glob("*.js")) + list((ROOT / "assets").rglob("*.js")) + list((ROOT / "practica").rglob("*.js")))
    errors: list[str] = []
    for js_file in js_files:
        proc = subprocess.run(
            [node, "--check", str(js_file)],
            capture_output=True,
            text=True,
        )
        if proc.returncode != 0:
            rel = js_file.relative_to(ROOT)
            detail = (proc.stderr or proc.stdout).strip()
            errors.append(f"Error de sintaxis JS en {rel}: {detail}")

    if not errors:
        print(f"[OK] Sintaxis JS válida en {len(js_files)} archivos")
    return errors


def check_html_refs() -> list[str]:
    errors: list[str] = []
    checked_refs = 0

    for rel_html in HTML_FILES_TO_CHECK:
        html_path = ROOT / rel_html
        if not html_path.is_file():
            errors.append(f"No se encontró {rel_html}")
            continue

        parser = _RefParser()
        parser.feed(html_path.read_text(encoding="utf-8"))

        for attr, ref in parser.refs:
            if not ref or ref.startswith(IGNORED_PREFIXES):
                continue
            path_part = ref.split("#", 1)[0].split("?", 1)[0]
            if not path_part:
                continue

            if path_part == "/" or path_part == "./":
                target = ROOT
            elif path_part.startswith("/"):
                target = ROOT / path_part.lstrip("/")
            else:
                target = ROOT / path_part

            checked_refs += 1
            if not target.exists():
                errors.append(f"Referencia rota en {rel_html} ({attr}={ref!r}): no existe {target.relative_to(ROOT)}")

    if not errors:
        print(f"[OK] {checked_refs} referencias locales en {len(HTML_FILES_TO_CHECK)} HTMLs verificadas")
    return errors


def check_practica() -> list[str]:
    """practica/datos/*.js cumplen el contrato y practica/indice.js está al día (herramientas/indice_practica.py)."""
    if not (ROOT / "practica").is_dir():
        return []
    proc = subprocess.run([sys.executable, str(ROOT / "herramientas" / "indice_practica.py"), "--comprobar"],
                          capture_output=True, text=True)
    out = (proc.stdout or "").strip()
    if out:
        print(out)
    if proc.returncode != 0:
        return [l.strip(" -") for l in (proc.stderr or "").strip().splitlines() if l.strip() and not l.startswith("Errores")]
    return []


def main() -> int:
    errors: list[str] = []
    errors.extend(check_catalog_parity())
    errors.extend(check_loaders())
    errors.extend(check_pending_and_previews())
    errors.extend(check_database_rules())
    errors.extend(check_js_syntax())
    errors.extend(check_html_refs())
    errors.extend(check_practica())

    if errors:
        print("\nErrores encontrados:", file=sys.stderr)
        for err in errors:
            print(f"  - {err}", file=sys.stderr)
        return 1

    print("\nVerificación completada sin errores.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
