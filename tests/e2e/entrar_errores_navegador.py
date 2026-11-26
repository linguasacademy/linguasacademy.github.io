#!/usr/bin/env python3
"""Prueba de navegador de entrar.html: errores junto a cada campo y botones con estado de carga
(fase 4, porción 4).

Uso: python3 tests/e2e/entrar_errores_navegador.py
Sustituye LA.entrar, LA.restablecer y LA.conGoogle por promesas que la prueba resuelve.
- Mientras espera, el botón queda deshabilitado con aria-busy="true" y muestra el indicador.
- «Correo o contraseña no coinciden» va bajo la contraseña, con el foco ahí; no en el estado.
- Correo inválido al pedir el enlace va bajo el correo.
- Al escribir en un campo marcado, su error se borra.
- Un fallo de red sigue en el estado del formulario.
- Google: botón ocupado mientras espera y error claro si se cierra la ventana.
- Sin desborde en 390×844 y 1366×800 con los errores a la vista.
Sale con 0 si todo pasa; 77 si no hay Playwright o Chrome.
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from entrar_navegador import servidor, sin_desborde  # noqa: E402

try:
    from playwright.sync_api import sync_playwright, expect
except Exception:  # pragma: no cover
    print("SKIP: Playwright no está instalado")
    sys.exit(77)

ESPERA = """() => {
  window.__p = {};
  for (const f of ['entrar', 'restablecer', 'conGoogle']) {
    LA[f] = () => new Promise((ok, mal) => { window.__p[f] = { ok, mal }; });
  }
}"""


def fallar(page, f, code):
    page.evaluate("([f, c]) => { const e = new Error(c); e.code = c; window.__p[f].mal(e); }", [f, code])


def ocupado(boton):
    expect(boton).to_have_attribute("aria-busy", "true")
    expect(boton).to_be_disabled()
    indicador = boton.evaluate("b => getComputedStyle(b, '::after').content")
    assert indicador not in ("none", "normal"), f"sin indicador de carga: {indicador}"


def libre(boton):
    expect(boton).not_to_have_attribute("aria-busy", "true")
    expect(boton).to_be_enabled()


def recorrer(page, base, ancho, alto):
    page.set_viewport_size({"width": ancho, "height": alto})
    page.goto(base + "/entrar.html?lang=es")
    page.wait_for_function("window.LA && window.Forma")
    page.evaluate(ESPERA)

    # 1 · Entrar: carga y error de credenciales bajo la contraseña
    fe = page.locator("#f-entrar")
    page.fill("#e-correo", "ana@ejemplo.co")
    page.fill("#e-clave", "mala")
    b = fe.locator('button[type="submit"]')
    b.click()
    ocupado(b)
    fallar(page, "entrar", "auth/invalid-credential")
    libre(b)
    expect(page.locator("#e-clave")).to_have_attribute("aria-invalid", "true")
    expect(page.locator("#e-clave-error")).to_have_text("El correo o la contraseña no coinciden. Revísalos e inténtalo otra vez.")
    expect(page.locator("#e-clave")).to_be_focused()
    expect(fe.locator("[data-form-status]")).to_have_text("")
    sin_desborde(page, f"error credenciales {ancho}")

    # 2 · Escribir en el campo marcado borra su error
    page.locator("#e-clave").press_sequentially("x")
    expect(page.locator("#e-clave")).not_to_have_attribute("aria-invalid", "true")
    expect(page.locator("#e-clave-error")).to_have_text("")

    # 3 · Fallo de red: en el estado del formulario, no en un campo
    b.click()
    ocupado(b)
    fallar(page, "entrar", "auth/network-request-failed")
    libre(b)
    expect(fe.locator("[data-form-status]")).to_have_text("No hay conexión con el servidor. Revisa tu internet e inténtalo otra vez.")
    assert fe.locator('[aria-invalid="true"]').count() == 0

    # 4 · Correo inválido al pedir el enlace: bajo el correo
    page.locator('[data-ir="clave"]').click()
    fc = page.locator("#f-clave")
    page.fill("#c-correo", "ana@ejemplo.co")
    bc = fc.locator('button[type="submit"]')
    bc.click()
    ocupado(bc)
    fallar(page, "restablecer", "auth/invalid-email")
    libre(bc)
    expect(page.locator("#c-correo")).to_have_attribute("aria-invalid", "true")
    expect(page.locator("#c-correo-error")).to_have_text("Escribe un correo válido, con @ y dominio.")
    expect(page.locator("#c-correo")).to_be_focused()
    sin_desborde(page, f"error enlace {ancho}")

    # 5 · Google: ocupado mientras espera; error claro si se cierra la ventana
    page.locator('[data-modo="clave"] [data-ir="entrar"]').click()
    bg = page.locator('[data-modo="entrar"] [data-google]')
    bg.click()
    ocupado(bg)
    fallar(page, "conGoogle", "auth/popup-closed-by-user")
    libre(bg)
    expect(page.locator('[data-modo="entrar"] [data-google-status]')).to_have_text("Cerraste la ventana de Google antes de terminar. Inténtalo otra vez.")


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
                for ancho, alto in ((390, 844), (1366, 800)):
                    recorrer(page, base, ancho, alto)
                assert not errores, errores
                ctx.close()
            nav.close()
    finally:
        httpd.shutdown()
    print("OK: entrar_errores_navegador")
    return 0


if __name__ == "__main__":
    sys.exit(main())
