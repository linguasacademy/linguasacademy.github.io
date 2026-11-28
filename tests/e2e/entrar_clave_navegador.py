#!/usr/bin/env python3
"""Prueba de navegador de entrar.html: recuperar la contraseña con el mismo estilo que Entrar
(fase 4, porción 6).

Uso: python3 tests/e2e/entrar_clave_navegador.py
Sustituye LA.restablecer por una promesa que la prueba resuelve.
- El correo escrito en Entrar pasa al campo de recuperar la contraseña.
- Mientras espera, el botón queda ocupado y, tras un momento, el estado dice «Enviando…».
- Al terminar, la confirmación nombra el correo al que se envió el enlace.
- Sin desborde en 390×844 y 1366×800.
Sale con 0 si todo pasa; 77 si no hay Playwright o Chrome.
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from entrar_navegador import servidor, sin_desborde  # noqa: E402
from entrar_errores_navegador import ocupado, libre  # noqa: E402

try:
    from playwright.sync_api import sync_playwright, expect
except Exception:  # pragma: no cover
    print("SKIP: Playwright no está instalado")
    sys.exit(77)

ESPERA = """() => {
  window.__p = {};
  LA.restablecer = c => new Promise(ok => { window.__p.restablecer = { ok, c }; });
}"""

TEXTOS = {
    "es": ("Enviando…", "Listo: si ana@ejemplo.co tiene cuenta, te llegará el enlace en unos minutos. Revisa también el correo no deseado."),
    "en": ("Sending…", "Done. If ana@ejemplo.co has an account, the link will arrive in a few minutes. Check your spam folder too."),
    "pt": ("Enviando…", "Pronto: se ana@ejemplo.co tiver conta, o link chega em alguns minutos. Dê uma olhada também no spam."),
}


def recorrer(page, base, lengua, ancho, alto):
    enviando, enviado = TEXTOS[lengua]
    page.set_viewport_size({"width": ancho, "height": alto})
    page.goto(base + f"/entrar.html?lang={lengua}")
    page.wait_for_function("window.LA && window.Forma")
    page.evaluate(ESPERA)

    # 1 · El correo escrito en Entrar llega a recuperar la contraseña
    page.fill("#e-correo", "ana@ejemplo.co")
    page.locator('[data-ir="clave"]').click()
    expect(page.locator('[data-modo="clave"] h1')).to_be_focused()
    expect(page.locator("#c-correo")).to_have_value("ana@ejemplo.co")

    # 2 · Envío: botón ocupado y «Enviando…»
    fc = page.locator("#f-clave")
    bc = fc.locator('button[type="submit"]')
    bc.click()
    ocupado(bc)
    expect(fc.locator("[data-form-status]")).to_have_text(enviando)
    assert page.evaluate("window.__p.restablecer.c") == "ana@ejemplo.co"
    sin_desborde(page, f"enviando {lengua} {ancho}")

    # 3 · Confirmación con el correo
    page.evaluate("window.__p.restablecer.ok()")
    libre(bc)
    st = fc.locator("[data-form-status]")
    expect(st).to_have_text(enviado)
    expect(st).to_have_attribute("data-tone", "ok")
    sin_desborde(page, f"enviado {lengua} {ancho}")


def main() -> int:
    httpd, base = servidor()
    try:
        with sync_playwright() as p:
            nav = p.chromium.launch()
            for movimiento in ("no-preference", "reduce"):
                ctx = nav.new_context(reduced_motion=movimiento)
                ctx.route("**/*", lambda r: r.abort() if not r.request.url.startswith(base) else r.continue_())
                page = ctx.new_page()
                errores = []
                page.on("pageerror", lambda e: errores.append(str(e)))
                for lengua in ("es", "en", "pt"):
                    for ancho, alto in ((390, 844), (1366, 800)):
                        recorrer(page, base, lengua, ancho, alto)
                assert not errores, errores
                ctx.close()
            nav.close()
    finally:
        httpd.shutdown()
    print("OK: entrar_clave_navegador")
    return 0


if __name__ == "__main__":
    sys.exit(main())
