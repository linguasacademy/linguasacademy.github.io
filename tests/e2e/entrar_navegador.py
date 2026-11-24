#!/usr/bin/env python3
"""Prueba de navegador de entrar.html: «Crear cuenta» y «Entrar» como pantallas hermanas.

Uso: python3 tests/e2e/entrar_navegador.py
- entrar.html#crear muestra «Crear cuenta» solo con «Continuar con Google» (sin correo ni contraseña).
- entrar.html muestra Google arriba y el formulario de correo y contraseña debajo.
- Se pasa de una a otra con un enlace, y el hash (#crear) acompaña el cambio.
- «Registrarse» del menú lleva a entrar.html#crear.
- Sin desborde horizontal en 390×844 y 1366×800, en es / en / pt.
Sale con 0 si todo pasa; 77 si no hay Playwright o Chrome (la prueba se omite).
"""
from __future__ import annotations

import functools
import re
import http.server
import socket
import sys
import threading
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

try:
    from playwright.sync_api import sync_playwright, expect
except Exception:  # pragma: no cover
    print("SKIP: Playwright no está instalado")
    sys.exit(77)


def servidor():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); puerto = s.getsockname()[1]; s.close()
    class Callado(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    handler = functools.partial(Callado, directory=str(ROOT))
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", puerto), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd, f"http://127.0.0.1:{puerto}"


def sin_desborde(page, donde):
    ancho = page.evaluate("document.documentElement.scrollWidth - window.innerWidth")
    assert ancho <= 1, f"{donde}: desborde horizontal de {ancho}px"


GOOGLE_CREAR = {"es": "Continuar con Google", "en": "Continue with Google", "pt": "Continuar com o Google"}


def recorrer(page, base, lengua, ancho, alto):
    page.set_viewport_size({"width": ancho, "height": alto})
    q = f"?lang={lengua}"
    crear = page.locator('[data-modo="crear"]')
    entrar = page.locator('[data-modo="entrar"]')

    # 1 · Crear cuenta: solo Google
    page.goto(base + "/entrar.html" + q + "#crear")
    expect(crear).to_be_visible()
    expect(entrar).to_be_hidden()
    expect(crear.locator("[data-google]")).to_be_visible()
    expect(crear.locator("[data-google]")).to_have_text(GOOGLE_CREAR[lengua])
    assert crear.locator("input").count() == 0, "Crear cuenta no debe pedir correo ni contraseña"
    sin_desborde(page, f"crear {lengua} {ancho}")

    # 2 · De crear a entrar
    crear.locator('[data-ir="entrar"]').click()
    expect(entrar).to_be_visible()
    expect(crear).to_be_hidden()
    assert "#crear" not in page.url, page.url

    # 3 · Entrar: Google arriba, correo y contraseña abajo
    g = entrar.locator("[data-google]").bounding_box()
    f = entrar.locator("#f-entrar").bounding_box()
    assert g["y"] < f["y"], "En Entrar, Google va antes del correo y la contraseña"
    expect(entrar.locator("#e-correo")).to_be_visible()
    expect(entrar.locator("#e-clave")).to_be_visible()
    sin_desborde(page, f"entrar {lengua} {ancho}")

    # 4 · De entrar a crear
    entrar.locator('[data-ir="crear"]').click()
    expect(crear).to_be_visible()
    assert page.url.endswith("#crear"), page.url


def main() -> int:
    httpd, base = servidor()
    try:
        with sync_playwright() as p:
            nav = p.chromium.launch()
            ctx = nav.new_context()
            ctx.route("**/*", lambda r: r.abort() if not r.request.url.startswith(base) else r.continue_())
            page = ctx.new_page()
            errores = []
            page.on("pageerror", lambda e: errores.append(str(e)))
            for lengua in ("es", "en", "pt"):
                for ancho, alto in ((390, 844), (1366, 800)):
                    recorrer(page, base, lengua, ancho, alto)
            # «Registrarse» lleva a la pantalla de crear cuenta
            for pagina in ("index.html", "entrar.html", "suscripcion.html", "404.html"):
                page.goto(base + "/" + pagina)
                hrefs = page.eval_on_selector_all('a[data-i18n="nav.registrarse"]', "as => as.map(a => a.getAttribute('href'))")
                assert hrefs and all(re.search(r"entrar\.html(\?[^#]*)?#crear$", h) for h in hrefs), f"{pagina}: {hrefs}"
            assert not errores, errores
            nav.close()
    finally:
        httpd.shutdown()
    print("OK: entrar_navegador")
    return 0


if __name__ == "__main__":
    sys.exit(main())
