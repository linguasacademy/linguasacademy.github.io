#!/usr/bin/env python3
"""Prueba de navegador de las tareas con entrega (catálogo → estudiante → panel), Chrome headless.

Uso: python3 tests/e2e/tareas_navegador.py [--capturas /tmp/panel-capturas]
Levanta helpers/rtdb-servidor.mjs (sirve el repositorio y emula Realtime Database con
database.rules.json) y sustituye el SDK de Firebase por helpers/firebase-falso.js.
Recorre: el profe crea la tarea (con etiqueta) y copia el enlace; el panel la muestra;
un estudiante anónimo hace la práctica y entrega; el panel la recibe en vivo, sin recargar;
vuelve a entregar (sobrescribe); un segundo estudiante entrega desde el teléfono; borrar
una entrega, archivar y borrar la tarea con la confirmación propia; entregar a una tarea
borrada (respaldo: copiar el resumen); catálogo sin sesión (enlace sin &tarea); profe
pendiente → entrar.html?volver=panel.html. Capturas a 1366 y 390.
Sale con 0 si todo pasa; 77 si no hay Playwright o Chrome.
"""
from __future__ import annotations

import hashlib
import json
import re
import subprocess
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(Path(__file__).resolve().parent))
TABLERO = "a1-esta-es-mi-familia"

try:
    from playwright.sync_api import sync_playwright, expect
    import practica_navegador as pn  # responder(), fase(), datos()
except Exception:  # pragma: no cover
    print("SKIP: Playwright no está instalado")
    sys.exit(77)

FALSO = (ROOT / "tests/e2e/helpers/firebase-falso.js").read_text(encoding="utf-8")
FOTOS = sorted((ROOT / "assets/img").glob("*-600.jpg"))
PROFE = {"uid": "profe1", "isAnonymous": False, "provider": "password", "email": "ana@ejemplo.co", "displayName": "Ana Profe"}
PENDIENTE = {"uid": "profe3", "isAnonymous": False, "provider": "password", "email": "ceci@ejemplo.co"}
URL_RE = re.compile(r"^https://linguasacademy\.github\.io/estudiantes\.html\?t=" + TABLERO + r"&tarea=([0-9a-z]{10})$")


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


def sin_emojis(page, donde):
    m = re.search("[\U0001F300-\U0001FAFF☀-➿]", page.evaluate("document.body.innerText"))
    assert not m, f"{donde}: emoticón en la página: {m.group(0)!r}"


def botones_proporcionados(page, donde, selector=".btn, .pb"):
    """En escritorio ningún botón va a lo ancho ni pasa de 48 px de alto."""
    malos = page.evaluate("""([sel]) => [...document.querySelectorAll(sel)].filter(b => b.checkVisibility({ visibilityProperty: true }))
        .map(b => { const r = b.getBoundingClientRect(); return { t: b.textContent.trim().slice(0, 30), w: Math.round(r.width), h: Math.round(r.height) }; })
        .filter(x => x.h > 48 || x.w > 420)""", [selector])
    assert not malos, f"{donde}: botones desproporcionados {malos}"


def contexto(browser, base, usuario=None, ancho=1366, alto=860, movil=False):
    ctx = browser.new_context(viewport={"width": ancho, "height": alto}, device_scale_factor=1, is_mobile=movil, has_touch=movil, locale="es-CO")
    ctx.grant_permissions(["clipboard-read", "clipboard-write"], origin=base)

    def sdk(route):
        route.fulfill(status=200, content_type="text/javascript", body=FALSO if "app-compat" in route.request.url else "")

    def foto(route):
        i = int(hashlib.md5(route.request.url.split("?")[0].encode()).hexdigest(), 16) % len(FOTOS)
        route.fulfill(status=200, content_type="image/jpeg", body=FOTOS[i].read_bytes())

    ctx.route("https://www.gstatic.com/firebasejs/**", sdk)
    ctx.route("https://images.unsplash.com/**", foto)
    ctx.route("https://fonts.googleapis.com/**", lambda r: r.fulfill(status=200, content_type="text/css", body=""))
    ctx.route("https://fonts.gstatic.com/**", lambda r: r.abort())
    if usuario:
        ctx.add_init_script("sessionStorage.setItem('__fb_usuario', " + json.dumps(json.dumps(usuario)) + ")")
    return ctx


def hacer_practica(page, base, url, fallar=True, capturas=None, n=""):
    """Abre el enlace de la tarea y la resuelve. Devuelve los errores esperados (un ítem fallado por ejercicio)."""
    page.goto(url.replace("https://linguasacademy.github.io", base))
    expect(page.locator(".pr-practica[data-fase='inicio']")).to_be_visible()
    page.locator(".pb--main").click()
    expect(page.locator(".pr-practica[data-fase='repaso']")).to_be_visible()
    page.locator(".pb--main").click()
    d = pn.datos(page)
    vistos, errores = set(), 0
    while pn.fase(page) == "ej":
        ej = page.locator(".pr-fase[data-tipo]").get_attribute("data-ej")
        mal = fallar and ej not in vistos
        errores += 1 if mal else 0
        vistos.add(ej)
        pn.responder(page, d, mal)
        page.locator("[data-accion='siguiente']").click()
    assert pn.fase(page) == "reto"
    page.locator(".pr-chip").first.click()
    page.locator(".pr-texto").type("papá. Se llama Pedro. Tiene cuarenta años. ")
    page.locator(".pb--main").click()
    expect(page.locator(".pr-practica[data-fase='fin']")).to_be_visible()
    assert "&tarea=" in page.url, page.url
    total = sum(len(e.get("items", e.get("pares", []))) for e in d["ejercicios"])
    return errores, total


def entregas(base, cod):
    return (api(base, "arbol").get("tareas", {}).get(cod, {}) or {}).get("entregas", {}) or {}


def main():
    capturas = None
    if "--capturas" in sys.argv:
        capturas = Path(sys.argv[sys.argv.index("--capturas") + 1]); capturas.mkdir(parents=True, exist_ok=True)

    def foto(page, nombre, completa=True):
        if capturas: page.screenshot(path=str(capturas / f"{nombre}.png"), full_page=completa)

    proc, base = servidor()
    api(base, "semilla", {"arbol": {
        "admins": {},
        "profes": {"profe1": {"nombre": "Ana Profe", "correo": "ana@ejemplo.co", "estado": "aprobado"},
                   "profe3": {"nombre": "Ceci", "correo": "ceci@ejemplo.co", "estado": "pendiente"}}}})
    try:
        with sync_playwright() as p:
            try:
                browser = p.chromium.launch(channel="chrome")
            except Exception as e:  # pragma: no cover
                print("SKIP: no hay Chrome:", e); sys.exit(77)

            # ---------- 1. El profe crea la tarea desde el catálogo ----------
            cp = contexto(browser, base, PROFE)
            cat = cp.new_page()
            cat.goto(base + "/tableros.html")
            expect(cat.locator(f".t__accion--abrir[href='{TABLERO}.html']")).to_be_visible()
            expect(cat.locator(".nav__links a[href^='panel.html']")).to_be_visible()
            btn = cat.locator(f"[data-tarea='{TABLERO}']")
            assert "Crear una tarea" in btn.get_attribute("title")
            btn.click()
            dlg = cat.locator("#dlg-tarea")
            expect(dlg).to_be_visible()
            expect(dlg.locator("#tarea-etiqueta")).to_be_focused()
            botones_proporcionados(cat, "diálogo de tarea", "#dlg-tarea .btn")
            dlg.locator("#tarea-etiqueta").fill("Grupo del martes")
            cat.wait_for_timeout(300)
            foto(cat, "1366-1-catalogo-dialogo", False)
            # Escape cierra sin crear
            cat.keyboard.press("Escape")
            expect(dlg).to_be_hidden()
            assert not api(base, "arbol").get("tareas"), "Escape no debe crear nada"
            btn.click()
            dlg.locator("#tarea-etiqueta").fill("Grupo del martes")
            dlg.locator("[data-crear]").click()
            expect(cat.locator("[data-aviso]")).to_have_text(re.compile("Enlace de la tarea copiado"))
            expect(dlg).to_be_hidden()
            url = cat.evaluate("navigator.clipboard.readText()")
            m = URL_RE.match(url)
            assert m, url
            cod = m.group(1)
            t = api(base, "arbol")["tareas"][cod]
            assert t["dueno"] == "profe1" and t["tablero"] == TABLERO and t["etiqueta"] == "Grupo del martes" and isinstance(t["creada"], int), t
            assert api(base, "arbol")["tareasPorProfe"]["profe1"][cod] is True
            sin_emojis(cat, "catálogo")

            # ---------- 2. El panel la muestra, sin entregas ----------
            panel = cp.new_page()
            panel.goto(base + "/panel.html")
            fila = panel.locator(f".tl__btn[data-cod='{cod}']")
            expect(fila).to_be_visible()
            expect(fila.locator(".cuenta")).to_have_text("0")
            expect(fila).to_contain_text("Grupo del martes")
            expect(panel.locator(".td__t")).to_have_text("Esta es mi familia")
            expect(panel.locator(".td__vacio")).to_be_visible()
            assert panel.locator("meta[name='robots'][content='noindex']").count() == 1
            sin_desborde(panel, "panel vacío"); sin_emojis(panel, "panel vacío")
            botones_proporcionados(panel, "panel")
            foto(panel, "1366-2-panel-sin-entregas")
            panel.locator(".td__enlace .btn--secondary").click()
            expect(panel.locator("[data-aviso]")).to_have_text(re.compile("Enlace copiado"))
            assert panel.evaluate("navigator.clipboard.readText()") == url

            # ---------- 3. Un estudiante hace la tarea y la entrega ----------
            ce = contexto(browser, base)
            est = ce.new_page()
            errores, total = hacer_practica(est, base, url)
            assert est.locator("[data-accion='enviar']").count() == 0, "con &tarea, «Entregar» reemplaza a «Enviar a mi profe»"
            entregar = est.locator("[data-accion='entregar']")
            expect(entregar).to_be_visible()
            expect(est.locator("[data-accion='copiar']")).to_be_hidden()
            sin_desborde(est, "fin con tarea"); sin_emojis(est, "fin con tarea")
            botones_proporcionados(est, "fin con tarea")
            foto(est, "1366-3-estudiante-fin")
            entregar.click()  # sin nombre
            expect(est.locator("#pr-ent-error")).to_be_visible()
            assert est.locator("#pr-ent-nombre").get_attribute("aria-invalid") == "true"
            assert not entregas(base, cod), "sin nombre no se entrega"
            est.locator("#pr-ent-nombre").fill("Valentina")
            est.locator("#pr-ent-nombre").press("Enter")
            expect(est.locator(".pr-enviado")).to_contain_text("Entregada")
            expect(entregar).to_contain_text("Volver a entregar")
            foto(est, "1366-4-estudiante-entregada")
            ents = entregas(base, cod)
            assert len(ents) == 1, ents
            uid_est, e = next(iter(ents.items()))
            assert uid_est.startswith("anon"), uid_est
            assert e["nombre"] == "Valentina" and e["puntaje"] == {"aciertos": total - errores, "total": total}, e
            assert len(e["errores"]) == errores and len(e["ejercicios"]) == len(pn.datos(est)["ejercicios"]), e
            assert "Se llama Pedro" in e["reto"] and e["lengua"] in ("es", "en", "pt") and isinstance(e["fecha"], int)
            assert est.evaluate("JSON.parse(localStorage.getItem('la-practica')).nombre") == "Valentina"

            # ---------- 4. El panel la recibe en vivo ----------
            expect(fila.locator(".cuenta")).to_have_text("1")
            row = panel.locator(".en__fila").first
            expect(row).to_contain_text("Valentina")
            expect(row).to_contain_text(f"{total - errores}/{total}")
            row.click()
            expect(row).to_have_attribute("aria-expanded", "true")
            expect(panel.locator(".errs li")).to_have_count(errores)
            expect(panel.locator(".reto")).to_contain_text("Se llama Pedro")
            expect(panel.locator(".ejs li")).to_have_count(len(e["ejercicios"]))
            sin_desborde(panel, "panel con entrega"); sin_emojis(panel, "panel con entrega")
            foto(panel, "1366-5-panel-entrega-abierta")

            # ---------- 5. Vuelve a entregar: sobrescribe la suya ----------
            antes = e["fecha"]
            est.wait_for_timeout(20)
            entregar.click()
            expect(est.locator(".pr-enviado")).to_contain_text("Entregada")
            ents = entregas(base, cod)
            assert len(ents) == 1 and ents[uid_est]["fecha"] >= antes, ents

            # ---------- 6. Un segundo estudiante, desde el teléfono, todo a la primera ----------
            cm = contexto(browser, base, ancho=390, alto=844, movil=True)
            mov = cm.new_page()
            _, total2 = hacer_practica(mov, base, url, fallar=False)
            mov.locator("#pr-ent-nombre").fill("Tomás")
            sin_desborde(mov, "fin móvil")
            foto(mov, "390-1-estudiante-fin")
            mov.locator("[data-accion='entregar']").click()
            expect(mov.locator(".pr-enviado")).to_contain_text("Entregada")
            foto(mov, "390-2-estudiante-entregada")
            expect(fila.locator(".cuenta")).to_have_text("2")
            expect(panel.locator(".en__fila").first).to_contain_text("Tomás")  # la más reciente arriba
            # la entrega que estaba abierta sigue abierta tras el repintado
            expect(panel.locator(".en__fila[aria-expanded='true']")).to_contain_text("Valentina")

            # ---------- 7. Panel en el teléfono ----------
            pm = contexto(browser, base, PROFE, ancho=390, alto=844, movil=True).new_page()
            pm.goto(base + "/panel.html")
            expect(pm.locator(f".tl__btn[data-cod='{cod}']")).to_be_visible()
            expect(pm.locator(".td__t")).to_be_hidden()
            sin_desborde(pm, "panel móvil lista")
            foto(pm, "390-3-panel-lista")
            pm.locator(f".tl__btn[data-cod='{cod}']").click()
            expect(pm.locator(".td__t")).to_be_visible()
            expect(pm.locator(".tl__btn")).to_be_hidden()
            pm.locator(".en__fila", has_text="Valentina").click()
            expect(pm.locator(".reto")).to_be_visible()
            sin_desborde(pm, "panel móvil detalle")
            foto(pm, "390-4-panel-detalle")
            pm.go_back()
            expect(pm.locator(".tl__btn").first).to_be_visible()
            pm.locator(f".tl__btn[data-cod='{cod}']").click()
            pm.locator(".td__volver").click()
            expect(pm.locator(".tl__btn").first).to_be_visible()

            # ---------- 8. Borrar una entrega (Cancelar no borra) ----------
            panel.locator(".en__fila", has_text="Valentina").locator("xpath=..").locator(".btn--peligro-t").click()
            conf = panel.locator("#dlg-confirmar")
            expect(conf).to_be_visible()
            expect(conf.locator("#dlg-confirmar-t")).to_contain_text("Valentina")
            panel.wait_for_timeout(300)
            foto(panel, "1366-6-confirmar-borrar-entrega", False)
            conf.locator("[data-no]").click()
            expect(conf).to_be_hidden()
            assert len(entregas(base, cod)) == 2
            panel.locator(".en__fila", has_text="Valentina").locator("xpath=..").locator(".btn--peligro-t").click()
            conf.locator("[data-si]").click()
            expect(fila.locator(".cuenta")).to_have_text("1")
            assert list(entregas(base, cod).values())[0]["nombre"] == "Tomás"

            # ---------- 9. Archivar, ver archivadas y sacar del archivo ----------
            panel.locator(".td__acc .btn--ghost").first.click()
            expect(panel.locator("[data-aviso]")).to_have_text(re.compile("archivada"))
            expect(panel.locator(".tl__arch")).to_be_visible()
            assert api(base, "arbol")["tareas"][cod]["archivada"] is True
            foto(panel, "1366-7-panel-archivada")
            panel.locator(".td__acc .btn--ghost").first.click()
            expect(panel.locator(".tl__arch")).to_have_count(0)
            assert "archivada" not in api(base, "arbol")["tareas"][cod]

            # ---------- 10. Cambiar el idioma del panel ----------
            panel.locator(".idioma-sel button[data-poner-idioma='en']").first.click()
            expect(panel.locator("h1")).to_have_text("What your students handed in")
            expect(panel.locator(".td__enlace .btn--secondary")).to_contain_text("Copy link")
            panel.locator(".idioma-sel button[data-poner-idioma='pt']").first.click()
            expect(panel.locator(".td__enlace .btn--secondary")).to_contain_text("Copiar link")
            panel.locator(".idioma-sel button[data-poner-idioma='es']").first.click()

            # ---------- 11. Borrar la tarea; la entrega tardía cae al respaldo ----------
            panel.locator(".td__acc .btn--peligro-t").click()
            expect(conf.locator("#dlg-confirmar-d")).to_contain_text("(1)")
            conf.locator("[data-si]").click()
            expect(panel.locator(".pv")).to_be_visible()
            arbol = api(base, "arbol")
            assert cod not in (arbol.get("tareas") or {}) and cod not in ((arbol.get("tareasPorProfe") or {}).get("profe1") or {}), arbol
            foto(panel, "1366-8-panel-vacio")
            entregar.click()
            expect(est.locator(".pr-enviado")).to_contain_text("ya no recibe entregas")
            expect(est.locator("[data-accion='copiar']")).to_be_visible()
            est.locator("[data-accion='copiar']").click()
            assert "&tarea=" + cod in est.evaluate("navigator.clipboard.readText()")

            # ---------- 12. Catálogo sin sesión: enlace de siempre ----------
            pub = contexto(browser, base).new_page()
            pub.goto(base + "/tableros.html")
            b = pub.locator(f"[data-tarea='{TABLERO}']")
            expect(b).to_be_visible()
            expect(pub.locator(".nav__links a[href^='panel.html']")).to_be_hidden()
            b.click()
            expect(pub.locator("#dlg-tarea")).to_be_hidden()
            expect(pub.locator("[data-aviso]")).to_contain_text("Entra con tu cuenta")
            assert pub.evaluate("navigator.clipboard.readText()") == f"https://linguasacademy.github.io/estudiantes.html?t={TABLERO}"

            # ---------- 13. Sin práctica en curso, estudiantes.html no cambia ----------
            limpio = contexto(browser, base).new_page()
            limpio.goto(base + f"/estudiantes.html?t={TABLERO}")
            expect(limpio.locator(".pr-practica[data-fase='inicio']")).to_be_visible()
            assert limpio.locator("a[href*='panel.html']").count() == 0

            # ---------- 14. Profe pendiente o sin sesión → entrar ----------
            pend = contexto(browser, base, PENDIENTE).new_page()
            pend.goto(base + "/panel.html")
            pend.wait_for_url(re.compile(r"/entrar\.html\?volver=panel\.html"))
            nadie = contexto(browser, base).new_page()
            nadie.goto(base + "/panel.html")
            nadie.wait_for_url(re.compile(r"/entrar\.html\?volver=panel\.html"))

            # Rechazos de las reglas: solo los esperados (la entrega tardía y la lectura de la tarea borrada)
            raros = [r for r in api(base, "rechazos")
                     if not (r["ruta"].startswith(f"tareas/{cod}") and (r["op"] == "leer" or r["uid"] == uid_est))
                     and not r["ruta"].startswith("tareasPorProfe/profe3") and not (r["op"] == "leer" and r["uid"] is None)]
            assert not raros, raros
            browser.close()
    finally:
        proc.terminate()
    print("OK · tareas con entrega: catálogo → estudiante → panel en vivo" + (f" · capturas en {capturas}" if capturas else ""))


if __name__ == "__main__":
    main()
