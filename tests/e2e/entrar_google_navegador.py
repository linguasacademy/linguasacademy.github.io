#!/usr/bin/env python3
"""Prueba de navegador: primera entrada con Google (fase 4, porción 3).

Uso: python3 tests/e2e/entrar_google_navegador.py
Levanta helpers/rtdb-servidor.mjs (reglas de database.rules.json) y sustituye el SDK de
Firebase por helpers/firebase-falso.js.
- Un profe que entra con Google por primera vez ve «confirmar»: su nombre de Google ya
  escrito y tres casillas (Español, Inglés, Portugués). Aún no se crea la ficha.
- Sin idiomas o sin nombre: error junto al campo y no se guarda nada.
- Al guardar: profes/<uid> con nombre, idiomas e idioma ('varios' si son varios), estado
  aprobado, y pasa al catálogo.
- Un profe con ficha entra directo, sin ese paso.
- Sin desborde en 390×844 y 1366×800, en es / en / pt.
Sale con 0 si todo pasa; 77 si no hay Playwright o Chrome.
"""
from __future__ import annotations

import json
import subprocess
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

try:
    from playwright.sync_api import sync_playwright, expect
except Exception:  # pragma: no cover
    print("SKIP: Playwright no está instalado")
    sys.exit(77)

FALSO = (ROOT / "tests/e2e/helpers/firebase-falso.js").read_text(encoding="utf-8")
NUEVO = {"uid": "g1", "isAnonymous": False, "provider": "google.com", "email": "Ana@Ejemplo.co", "displayName": "Ana Ruiz"}
VIEJO = {"uid": "p1", "isAnonymous": False, "provider": "google.com", "email": "bea@ejemplo.co", "displayName": "Bea"}
CASILLAS = {"es": ["Español", "Inglés", "Portugués"], "en": ["Spanish", "English", "Portuguese"], "pt": ["Espanhol", "Inglês", "Português"]}


def servidor():
    p = subprocess.Popen(["node", str(ROOT / "tests/e2e/helpers/rtdb-servidor.mjs"), "0"], stdout=subprocess.PIPE, text=True)
    linea = p.stdout.readline().strip()
    assert linea.startswith("LISTO "), linea
    return p, "http://127.0.0.1:" + linea.split()[1]


def api(base, ruta, cuerpo=None):
    req = urllib.request.Request(base + "/__rtdb/" + ruta, data=json.dumps(cuerpo).encode() if cuerpo is not None else None,
                                 headers={"content-type": "application/json"})
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())


def sin_desborde(page, donde):
    ancho = page.evaluate("document.documentElement.scrollWidth - window.innerWidth")
    assert ancho <= 1, f"{donde}: desborde horizontal de {ancho}px"


def contexto(browser, base, usuario, ancho=1366, alto=800):
    ctx = browser.new_context(viewport={"width": ancho, "height": alto}, device_scale_factor=1, locale="es-CO")
    ctx.route("https://www.gstatic.com/firebasejs/**", lambda r: r.fulfill(status=200, content_type="text/javascript", body=FALSO if "app-compat" in r.request.url else ""))
    ctx.route("https://fonts.googleapis.com/**", lambda r: r.fulfill(status=200, content_type="text/css", body=""))
    ctx.route("https://fonts.gstatic.com/**", lambda r: r.abort())
    ctx.add_init_script("sessionStorage.setItem('__fb_usuario', " + json.dumps(json.dumps(usuario)) + ")")
    return ctx


def main() -> int:
    proc, base = servidor()
    try:
        with sync_playwright() as p:
            nav = p.chromium.launch()
            errores = []

            # 1 · Primera vez con Google: confirmar nombre e idiomas
            api(base, "semilla", {"arbol": {}})
            ctx = contexto(nav, base, NUEVO)
            page = ctx.new_page(); page.on("pageerror", lambda e: errores.append(str(e)))
            page.goto(base + "/entrar.html")
            conf = page.locator('[data-modo="confirmar"]')
            expect(conf).to_be_visible()
            expect(page.locator('[data-modo="entrar"]')).to_be_hidden()
            f = page.locator("#f-confirmar")
            expect(f.locator("#p-nombre")).to_have_value("Ana Ruiz")
            expect(f.locator('input[type="checkbox"]')).to_have_count(3)
            for i, t in enumerate(CASILLAS["es"]):
                expect(f.locator(".opcion").nth(i)).to_have_text(t)
            assert not api(base, "arbol").get("profes"), "la ficha no debe existir antes de confirmar"
            sin_desborde(page, "confirmar es 1366")

            # 1a · Sin idiomas: error junto a las casillas
            f.locator('button[type="submit"]').click()
            expect(f.locator("#p-idiomas-error")).not_to_be_empty()
            assert not api(base, "arbol").get("profes")

            # 1b · Sin nombre: error junto al nombre
            f.locator("#p-nombre").fill("   ")
            f.locator('input[value="es"]').check()
            f.locator('button[type="submit"]').click()
            expect(f.locator("#p-nombre-error")).not_to_be_empty()
            expect(f.locator("#p-idiomas-error")).to_be_empty()
            expect(f.locator("#p-nombre")).to_be_focused()
            assert not api(base, "arbol").get("profes")

            # 1c · Guardar: ficha creada y al catálogo
            f.locator("#p-nombre").fill("Ana María Ruiz")
            f.locator('input[value="pt"]').check()
            f.locator('button[type="submit"]').click()
            page.wait_for_url("**/tableros.html")
            ficha = api(base, "arbol")["profes"]["g1"]
            assert ficha["nombre"] == "Ana María Ruiz", ficha
            assert ficha["idiomas"] == {"es": True, "pt": True}, ficha
            assert ficha["idioma"] == "varios" and ficha["estado"] == "aprobado" and ficha["correo"] == "ana@ejemplo.co", ficha
            ctx.close()

            # 1d · Un solo idioma: idioma = ese idioma
            api(base, "semilla", {"arbol": {}})
            ctx = contexto(nav, base, NUEVO, 390, 844)
            page = ctx.new_page(); page.on("pageerror", lambda e: errores.append(str(e)))
            page.goto(base + "/entrar.html")
            f = page.locator("#f-confirmar")
            expect(f).to_be_visible()
            sin_desborde(page, "confirmar es 390")
            f.locator('input[value="en"]').check()
            f.locator('button[type="submit"]').click()
            page.wait_for_url("**/tableros.html")
            ficha = api(base, "arbol")["profes"]["g1"]
            assert ficha["idioma"] == "en" and ficha["idiomas"] == {"en": True} and ficha["nombre"] == "Ana Ruiz", ficha
            ctx.close()

            # 2 · Textos en en / pt, sin desborde
            for lengua in ("en", "pt"):
                for ancho, alto in ((390, 844), (1366, 800)):
                    api(base, "semilla", {"arbol": {}})
                    ctx = contexto(nav, base, NUEVO, ancho, alto)
                    page = ctx.new_page(); page.on("pageerror", lambda e: errores.append(str(e)))
                    page.goto(base + "/entrar.html?lang=" + lengua)
                    f = page.locator("#f-confirmar")
                    expect(f).to_be_visible()
                    for i, t in enumerate(CASILLAS[lengua]):
                        expect(f.locator(".opcion").nth(i)).to_have_text(t)
                    sin_desborde(page, f"confirmar {lengua} {ancho}")
                    ctx.close()

            # 3 · Con ficha: entra directo
            api(base, "semilla", {"arbol": {"profes": {"p1": {"nombre": "Bea", "correo": "bea@ejemplo.co", "estado": "aprobado"}}}})
            ctx = contexto(nav, base, VIEJO)
            page = ctx.new_page(); page.on("pageerror", lambda e: errores.append(str(e)))
            page.goto(base + "/entrar.html")
            page.wait_for_url("**/tableros.html")
            ctx.close()

            assert not errores, errores
            nav.close()
    finally:
        proc.terminate()
    print("OK: entrar_google_navegador")
    return 0


if __name__ == "__main__":
    sys.exit(main())
