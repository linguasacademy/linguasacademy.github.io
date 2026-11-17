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
NON_BOARD_HTML = {
    "index.html",
    "tableros.html",
    "entrar.html",
    "admin.html",
    "404.html",
}
HTML_FILES_TO_CHECK = [
    "index.html",
    "tableros.html",
    "entrar.html",
    "admin.html",
    "404.html",
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

    js_files = sorted(list(ROOT.glob("*.js")) + list((ROOT / "assets").rglob("*.js")))
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


def main() -> int:
    errors: list[str] = []
    errors.extend(check_catalog_parity())
    errors.extend(check_database_rules())
    errors.extend(check_js_syntax())
    errors.extend(check_html_refs())

    if errors:
        print("\nErrores encontrados:", file=sys.stderr)
        for err in errors:
            print(f"  - {err}", file=sys.stderr)
        return 1

    print("\nVerificación completada sin errores.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
