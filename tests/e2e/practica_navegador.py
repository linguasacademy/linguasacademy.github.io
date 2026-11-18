#!/usr/bin/env python3
"""Prueba de navegador de estudiantes.html y del motor de práctica (Chrome headless, Playwright).

Uso: python3 tests/e2e/practica_navegador.py [--capturas /tmp/practica-capturas]
Sirve el repositorio con http.server en un puerto libre, recorre en 1366×800 y 390×844,
con lengua de apoyo es / en / pt: elegir lengua → nivel → temática → práctica completa
(acertando y fallando), resumen, «Repetir lo que fallé», «Enviar a mi profe» (portapapeles),
?t= directo, teclado (Enter comprueba y avanza) y ausencia de desbordes horizontales.
Sale con 0 si todo pasa; 77 si no hay Playwright o Chrome (la prueba se omite).
"""
from __future__ import annotations

import functools
import http.server
import socket
import sys
import threading
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PRACTICA = "a1-esta-es-mi-familia"

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


def sin_emojis(page, donde):
    txt = page.evaluate("document.body.innerText")
    import re
    m = re.search("[\U0001F300-\U0001FAFF☀-➿]", txt)
    assert not m, f"{donde}: emoticón en la página: {m.group(0)!r}"


def datos(page):
    return page.evaluate(f"window.PRACTICA[{PRACTICA!r}]")


def fase(page):
    return page.locator(".pr-practica").get_attribute("data-fase")


def responder(page, d, fallar_primero: bool, teclado: bool = False):
    """Resuelve el ítem en pantalla. Si fallar_primero, primero da una respuesta errada."""
    sec = page.locator(".pr-fase[data-tipo]")
    tipo = sec.get_attribute("data-tipo")
    ej = int(sec.get_attribute("data-ej"))
    e = d["ejercicios"][ej]
    if tipo == "empareja":
        izq = page.locator(".pr-parejas__col:not(.pr-parejas__col--der) .pr-par:not([disabled])")
        primera = True
        while izq.count():
            i = izq.first.get_attribute("data-i")
            izq.first.click()
            if fallar_primero and primera:
                otra = page.locator(f".pr-par--der:not([disabled]):not([data-i='{i}'])").first
                otra.click()
                expect(page.locator(".pr-fb--casi")).to_be_visible()
                page.locator(f".pr-parejas__col:not(.pr-parejas__col--der) .pr-par[data-i='{i}']").click()
            primera = False
            page.locator(f".pr-par--der[data-i='{i}']").click()
        expect(page.locator(".pr-fb--ok")).to_be_visible()
        return tipo
    cont = page.locator(".pr-contador").inner_text()
    idx = int(cont.split("/")[0].strip()) - 1
    it = e["items"][idx]
    if tipo == "elige":
        if fallar_primero:
            mala = next(i for i in range(len(it["o"])) if i != it["k"])
            page.locator(f".pr-op[data-i='{mala}']").click()
            expect(page.locator(".pr-fb--casi")).to_be_visible()
        page.locator(f".pr-op[data-i='{it['k']}']").click()
    elif tipo in ("completa", "transforma"):
        campo = page.locator(".pr-campo")
        k = it["k"][0] if isinstance(it["k"], list) else it["k"]
        if fallar_primero:
            campo.fill("zzz")
            if teclado: campo.press("Enter")
            else: page.locator(".pb--main").click()
            expect(page.locator(".pr-fb--casi")).to_be_visible()
        campo.fill(k)
        if teclado: campo.press("Enter")
        else: page.locator(".pb--main").click()
    elif tipo == "ordena":
        k = it["k"][0] if isinstance(it["k"], list) else it["k"]
        palabras = k.split()
        if fallar_primero:
            for _ in palabras:
                page.locator(".pr-banco .pr-ficha").last.click()
            page.locator("[data-accion='comprobar']").click()
            if " ".join(reversed(palabras)) != k:
                expect(page.locator(".pr-fb--casi")).to_be_visible()
                page.locator(".pr-acciones--item .pb--ghost:not(.pr-pista-btn)").click()
        for w in palabras:
            hecho = page.evaluate("""w => { const b = [...document.querySelectorAll('.pr-banco .pr-ficha')].find(x => x.textContent === w);
                                        if (b) { b.click(); return true; } return false; }""", w)
            assert hecho, f"no hay ficha {w!r}"
        page.locator("[data-accion='comprobar']").click()
    expect(page.locator(".pr-fb--ok, .pr-fb--mal").first).to_be_visible()
    return tipo


def recorrer(page, base, lengua, ancho, alto, capturas, n):
    page.set_viewport_size({"width": ancho, "height": alto})
    page.goto(base + "/estudiantes.html")
    page.evaluate("localStorage.clear()")
    page.reload()
    sin_desborde(page, "apoyo")
    if capturas: page.screenshot(path=f"{capturas}/{n}-1-apoyo.png", full_page=True)
    page.locator(f".pr-opcion[data-apoyo='{lengua}']").click()
    assert page.evaluate("document.documentElement.lang").startswith(lengua)
    page.locator(".pr-opcion--nivel[data-nivel='A1']").click()
    expect(page.locator(".pr-temas")).to_be_visible()
    sin_desborde(page, "temas")
    sin_emojis(page, "temas")
    if capturas: page.screenshot(path=f"{capturas}/{n}-2-temas.png", full_page=True)
    page.locator(".pr-tema[data-tema='familia']").click()
    expect(page.locator(f".pr-fila[data-practica='{PRACTICA}']")).to_be_visible()
    if capturas: page.screenshot(path=f"{capturas}/{n}-3-tema.png", full_page=True)
    page.locator(f".pr-fila[data-practica='{PRACTICA}']").click()
    expect(page.locator(".pr-practica[data-fase='inicio']")).to_be_visible()
    assert "?t=" + PRACTICA in page.url
    if capturas: page.screenshot(path=f"{capturas}/{n}-4-inicio.png", full_page=True)
    page.locator(".pb--main").click()
    expect(page.locator(".pr-practica[data-fase='repaso']")).to_be_visible()
    page.locator(".pr-tarjeta").first.click()
    assert page.locator(".pr-tarjeta").first.get_attribute("aria-pressed") == "true"
    if capturas: page.screenshot(path=f"{capturas}/{n}-5-repaso.png", full_page=True)
    page.locator(".pb--main").click()
    d = datos(page)
    vistos = set()
    errores_esperados = 0
    paso = 0
    while fase(page) == "ej":
        ej = page.locator(".pr-fase[data-tipo]").get_attribute("data-ej")
        fallar = ej not in vistos
        if fallar: errores_esperados += 1
        vistos.add(ej)
        tipo = responder(page, d, fallar, teclado=(lengua == "en"))
        sin_desborde(page, f"ejercicio {ej}")
        if capturas and paso < 12 and fallar:
            page.screenshot(path=f"{capturas}/{n}-6-ej{ej}-{tipo}.png", full_page=True)
        paso += 1
        sig = page.locator("[data-accion='siguiente']")
        if lengua == "en":
            expect(sig).to_be_focused()
            page.keyboard.press("Enter")
        else:
            sig.click()
    assert fase(page) == "reto", fase(page)
    area = page.locator(".pr-texto")
    page.locator(".pr-chip").first.click()
    area.type("papá. Se llama Pedro. Tiene cuarenta años. ")
    assert "frase" in page.locator(".pr-conteo").inner_text().lower() or "sentence" in page.locator(".pr-conteo").inner_text().lower()
    page.locator(".pr-check input").first.check()
    if capturas: page.screenshot(path=f"{capturas}/{n}-7-reto.png", full_page=True)
    page.locator(".pb--main").click()
    expect(page.locator(".pr-practica[data-fase='fin']")).to_be_visible()
    total = sum(len(e.get("items", e.get("pares", []))) for e in d["ejercicios"])
    cifra = "".join(page.locator(".pr-fin__cifra").inner_text().split())
    assert cifra == f"{total - errores_esperados}/{total}", (cifra, total, errores_esperados)
    assert page.locator(".pr-errores li").count() == min(errores_esperados, 8)
    sin_desborde(page, "final")
    sin_emojis(page, "final")
    if capturas: page.screenshot(path=f"{capturas}/{n}-8-fin.png", full_page=True)
    page.locator("[data-accion='enviar']").click()
    expect(page.locator(".pr-enviado")).not_to_be_empty()
    texto = page.evaluate("navigator.clipboard.readText()")
    assert texto.startswith("Práctica · Esta es mi familia (A1)"), texto[:80]
    assert f"A la primera: {total - errores_esperados} de {total}" in texto
    assert "Reto (" in texto and "Se llama Pedro" in texto
    assert "estudiantes.html?t=" + PRACTICA in texto
    # Repetir lo que fallé: solo los ítems errados
    page.locator(".pr-fin .pb--sec").click()
    rep = 0
    while fase(page) == "ej":
        responder(page, d, False)
        rep += 1
        page.locator("[data-accion='siguiente']").click()
    assert rep == len(vistos), (rep, len(vistos))  # un ítem fallado por ejercicio → una pantalla por ejercicio
    expect(page.locator(".pr-practica[data-fase='fin']")).to_be_visible()
    assert page.locator(".pr-errores li").count() == 0
    assert page.locator(".pr-fin .pb--sec").count() == 0
    # progreso guardado y visible en la temática
    page.locator(".pr-fin .pb--ghost").click()
    expect(page.locator(f".pr-fila[data-practica='{PRACTICA}'] .pr-estado--hecho")).to_be_visible()
    return texto


def directo(page, base, capturas):
    page.set_viewport_size({"width": 390, "height": 844})
    page.goto(base + "/estudiantes.html?t=" + PRACTICA)
    page.evaluate("localStorage.clear()")
    page.reload()
    expect(page.locator(".pr-practica[data-fase='inicio']")).to_be_visible()
    # cambiar la lengua de apoyo desde la cabecera
    page.locator("#pr-apoyo button[lang='pt']").click()
    assert page.evaluate("document.documentElement.lang") == "pt-BR"
    expect(page.locator(".pb--main")).to_have_text("Começar")
    page.locator(".pb--main").click(); page.locator(".pb--main").click()
    d = datos(page)
    # tilde: «mama» se acepta con aviso
    while page.locator(".pr-fase[data-tipo]").get_attribute("data-tipo") != "completa":
        responder(page, d, False); page.locator("[data-accion='siguiente']").click()
    ej = int(page.locator(".pr-fase[data-tipo]").get_attribute("data-ej"))
    items = d["ejercicios"][ej]["items"]
    while True:
        idx = int(page.locator(".pr-contador").inner_text().split("/")[0]) - 1
        k = items[idx]["k"][0]
        import unicodedata
        sin = "".join(c for c in unicodedata.normalize("NFD", k) if unicodedata.category(c) != "Mn")
        if sin != k:
            page.locator(".pr-campo").fill(sin.upper() + "!")
            page.locator(".pr-campo").press("Enter")
            expect(page.locator(".pr-fb__tilde")).to_contain_text("Atenção ao acento:")
            expect(page.locator(".pr-fb__tilde")).to_contain_text(k)
            if capturas: page.screenshot(path=f"{capturas}/9-tilde-390.png", full_page=True)
            break
        responder(page, d, False); page.locator("[data-accion='siguiente']").click()
    # nombre desconocido
    page.goto(base + "/estudiantes.html?t=a1-no-existe")
    expect(page.locator(".pr-h1")).to_have_text("Esta prática ainda não está pronta.")
    page.goto(base + "/estudiantes.html?t=../../evil")
    expect(page.locator(".pr-h1")).to_be_visible()
    assert page.evaluate("!document.querySelector('script[src*=\"evil\"]')")


def sin_storage(browser, base):
    """Con localStorage bloqueado, todo funciona igual (sin guardar)."""
    ctx = browser.new_context()
    ctx.add_init_script("Object.defineProperty(window, 'localStorage', { get() { throw new Error('bloqueado'); } });")
    page = ctx.new_page()
    errores = []
    page.on("pageerror", lambda e: errores.append(str(e)))
    page.goto(base + "/estudiantes.html")
    page.locator(".pr-opcion[data-apoyo='en']").click()
    page.locator(".pr-opcion--nivel").first.click()
    expect(page.locator(".pr-temas")).to_be_visible()
    assert not errores, errores
    ctx.close()


def main() -> int:
    capturas = None
    if "--capturas" in sys.argv:
        capturas = sys.argv[sys.argv.index("--capturas") + 1]
        Path(capturas).mkdir(parents=True, exist_ok=True)
    httpd, base = servidor()
    try:
        with sync_playwright() as pw:
            try:
                browser = pw.chromium.launch(channel="chrome", headless=True)
            except Exception as exc:
                print(f"SKIP: no se pudo abrir Chrome ({exc.__class__.__name__})")
                return 77
            casos = [("es", 1366, 800), ("en", 1366, 800), ("pt", 390, 844), ("en", 390, 844)]
            for i, (lengua, w, hh) in enumerate(casos):
                ctx = browser.new_context(permissions=["clipboard-read", "clipboard-write"], reduced_motion="reduce" if i == 3 else "no-preference")
                ctx.route("**/*", lambda r: r.abort() if not r.request.url.startswith(base) else r.continue_())
                page = ctx.new_page()
                errores = []
                page.on("pageerror", lambda e: errores.append(str(e)))
                page.on("console", lambda m: errores.append(m.text) if m.type == "error" and "ERR_FAILED" not in m.text and "net::" not in m.text else None)
                nombre = f"{lengua}-{w}"
                recorrer(page, base, lengua, w, hh, capturas, nombre)
                assert not errores, errores
                print(f"[OK] recorrido completo {lengua} {w}×{hh}")
                ctx.close()
            ctx = browser.new_context(permissions=["clipboard-read", "clipboard-write"])
            ctx.route("**/*", lambda r: r.abort() if not r.request.url.startswith(base) else r.continue_())
            directo(ctx.new_page(), base, capturas)
            print("[OK] ?t= directo, cambio de lengua, tilde y nombres no válidos")
            ctx.close()
            sin_storage(browser, base)
            print("[OK] sin localStorage")
            browser.close()
    finally:
        httpd.shutdown()
    return 0


if __name__ == "__main__":
    sys.exit(main())
