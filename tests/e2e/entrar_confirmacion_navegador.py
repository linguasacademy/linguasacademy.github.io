#!/usr/bin/env python3
"""Prueba de navegador: confirmación final con el nombre de la persona (fase 4, porción 5).

Uso: python3 tests/e2e/entrar_confirmacion_navegador.py
Levanta helpers/rtdb-servidor.mjs y sustituye el SDK de Firebase por helpers/firebase-falso.js.
- Al guardar la primera entrada, el estado del formulario dice «Hola, <nombre>…» antes de
  pasar al catálogo (es / en / pt).
- Cuenta sin acceso: «Sesión abierta como <nombre> (<correo>).»; nunca «como .».
- Sin nombre ni correo, esa línea no aparece.
- Sin desborde en 390×844 y 1366×800.
Sale con 0 si todo pasa; 77 si no hay Playwright o Chrome.
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from entrar_google_navegador import servidor, api, sin_desborde, contexto, NUEVO  # noqa: E402

try:
    from playwright.sync_api import sync_playwright, expect
except Exception:  # pragma: no cover
    print("SKIP: Playwright no está instalado")
    sys.exit(77)

HOLA = {"es": "Hola, Ana María Ruiz", "en": "Hi, Ana María Ruiz", "pt": "Olá, Ana María Ruiz"}
SIN_ACCESO = {"uid": "r1", "isAnonymous": False, "provider": "google.com", "email": "rosa@ejemplo.co", "displayName": "Rosa G."}
ANONIMO = {"uid": "r2", "isAnonymous": False, "provider": "google.com"}


def main() -> int:
    proc, base = servidor()
    try:
        with sync_playwright() as p:
            nav = p.chromium.launch()
            errores = []

            # 1 · Primera entrada: «Hola, <nombre>» antes de ir al catálogo
            for lengua, (ancho, alto) in (("es", (1366, 800)), ("en", (390, 844)), ("pt", (390, 844))):
                api(base, "semilla", {"arbol": {}})
                ctx = contexto(nav, base, NUEVO, ancho, alto)
                page = ctx.new_page(); page.on("pageerror", lambda e: errores.append(str(e)))
                page.goto(base + "/entrar.html" + ("" if lengua == "es" else "?lang=" + lengua))
                f = page.locator("#f-confirmar")
                f.locator("#p-nombre").fill("Ana María Ruiz")
                f.locator('input[value="es"]').check()
                f.locator('button[type="submit"]').click()
                estado = f.locator("[data-form-status]")
                expect(estado).to_contain_text(HOLA[lengua])
                sin_desborde(page, f"hola {lengua} {ancho}")
                page.wait_for_url("**/tableros.html*")
                ctx.close()

            # 2 · Cuenta sin acceso: nombre y correo, nunca «como .»
            for ancho, alto in ((390, 844), (1366, 800)):
                api(base, "semilla", {"arbol": {"profes": {"r1": {"nombre": "Rosa Gómez", "correo": "rosa@ejemplo.co", "estado": "rechazado"}}}})
                ctx = contexto(nav, base, SIN_ACCESO, ancho, alto)
                page = ctx.new_page(); page.on("pageerror", lambda e: errores.append(str(e)))
                page.goto(base + "/entrar.html")
                linea = page.locator('[data-modo="estado"] [data-estado-linea]')
                expect(linea).to_be_visible()
                expect(linea).to_have_text("Sesión abierta como Rosa Gómez (rosa@ejemplo.co).")
                sin_desborde(page, f"estado {ancho}")
                ctx.close()

            # 2a · Solo correo: sin paréntesis vacíos
            api(base, "semilla", {"arbol": {"profes": {"r1": {"correo": "rosa@ejemplo.co", "estado": "rechazado"}}}})
            ctx = contexto(nav, base, {**SIN_ACCESO, "displayName": None})
            page = ctx.new_page(); page.on("pageerror", lambda e: errores.append(str(e)))
            page.goto(base + "/entrar.html")
            expect(page.locator("[data-estado-linea]")).to_have_text("Sesión abierta como rosa@ejemplo.co.")
            ctx.close()

            # 2b · Sin nombre ni correo: la línea no aparece
            api(base, "semilla", {"arbol": {"profes": {"r2": {"estado": "rechazado"}}}})
            ctx = contexto(nav, base, ANONIMO)
            page = ctx.new_page(); page.on("pageerror", lambda e: errores.append(str(e)))
            page.goto(base + "/entrar.html")
            expect(page.locator('[data-modo="estado"] h1')).to_be_visible()
            expect(page.locator("[data-estado-linea]")).to_be_hidden()
            ctx.close()

            assert not errores, errores
            nav.close()
    finally:
        proc.terminate()
    print("OK: entrar_confirmacion_navegador")
    return 0


if __name__ == "__main__":
    sys.exit(main())
