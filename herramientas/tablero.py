#!/usr/bin/env python3
"""tablero.py · Lingua's Academy

Añade y quita tableros sin abrir admin.html. Pensado para que Claude (o
cualquiera con permiso de push) publique tableros desde un equipo SIN
credenciales de Firebase: la clave AES de cada tablero se «sella» con la
clave pública del repositorio y un workflow de GitHub (que sí tiene los
secretos) la abre y la guarda en Firebase.

Uso local (Claude o el dueño):

    python3 herramientas/tablero.py agregar ORIGINAL.html --nivel A2 --idioma es \\
        --titulo "¿Ya lo has probado?" --tema "Experiencias de viaje" \\
        --gramatica "pretérito perfecto, ya / todavía no" --consignas en
    python3 herramientas/tablero.py quitar a2-ya-lo-has-probado
    python3 herramientas/tablero.py listar

Uso en el workflow .github/workflows/tableros.yml (necesita secretos):

    python3 herramientas/tablero.py procesar     # abre sellos, escribe/borra claves/<nombre>
    python3 herramientas/tablero.py regenerar    # rehace todas las vistas previas

Qué escribe «agregar»:
    t/<nombre>.bin             el tablero cifrado (AES-256-GCM, mismo formato que cifrar.py y admin.html)
    <nombre>.html              el cargador (herramientas/cargador.html)
    pendientes/<nombre>.sello  la clave AES sellada con herramientas/sello_publico.pem (RSA-OAEP-SHA256)
    assets/catalogo.js         la línea del tablero (se crea o se actualiza)
El original NUNCA se copia al repositorio. La vista previa pública se genera
en el workflow a partir de t/<nombre>.bin descifrado con la clave sellada
(el .bin ya es la copia cifrada del original; no hace falta otra).

Formato de un sello (JSON):
    {"v":1, "nombre":..., "alg":"RSA-OAEP-256", "huella":<sha256 de la clave pública, 16 hex>,
     "clave":<base64 de RSA-OAEP(SHA-256, etiqueta "linguas-tablero:<nombre>")(clave AES de 32 bytes)>,
     "bin_sha256":<sha256 hex de t/<nombre>.bin>}
La etiqueta OAEP ata la clave al nombre: un sello copiado a otro nombre no se abre.
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import html as _html
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

REPO = Path(__file__).resolve().parent.parent
HERR = REPO / "herramientas"
sys.path.insert(0, str(HERR))
import cifrar  # noqa: E402  (b64u / unb64u / ruta del cargador: la misma lógica que cifrar.py)

b64u, unb64u = cifrar.b64u, cifrar.unb64u
CARGADOR = Path(cifrar.CARGADOR)
PUBLICA = HERR / "sello_publico.pem"
CATALOGO = REPO / "assets" / "catalogo.js"
PEND = REPO / "pendientes"
BORRAR = PEND / "borrar.txt"
VISTA = REPO / "vista"
VISTA_SCRIPT = HERR / "vista_previa.mjs"
DB_URL = "https://linguas-tableros-default-rtdb.firebaseio.com"

NOMBRE_RE = re.compile(r"^(en-|pt-)?[abc][12]-[a-z0-9]+(-[a-z0-9]+)*$")
NIVELES = ["A1", "A2", "B1", "B2", "C1", "C2"]
IDIOMAS = ["es", "en", "pt"]
PREFIJO = {"es": "", "en": "en-", "pt": "pt-"}
CAMPOS = ["archivo", "idioma", "nivel", "titulo", "desc", "consignas", "publico", "prueba", "vivo",
          "nota", "notaEn", "notaPt", "foto", "fotoAutor", "fotoPagina", "fotoAlt"]
EN_GHA = os.environ.get("GITHUB_ACTIONS") == "true"


class Fallo(Exception):
    """Error con un mensaje pensado para la persona (sin datos secretos)."""


def aviso(msg: str) -> None:
    print(("::warning::" if EN_GHA else "AVISO: ") + msg)


def error_gha(titulo: str, msg: str) -> None:
    print((f"::error title={titulo}::" if EN_GHA else f"ERROR ({titulo}): ") + msg, file=sys.stderr if not EN_GHA else sys.stdout)


def enmascarar(valor: str) -> None:
    """En GitHub Actions, oculta un valor en los registros aunque algo lo imprimiera."""
    if EN_GHA and valor:
        print(f"::add-mask::{valor}")


def rel(p: Path) -> str:
    try:
        return str(p.relative_to(REPO))
    except ValueError:
        return str(p)


def validar_nombre(nombre: str) -> str:
    if not NOMBRE_RE.match(nombre or ""):
        raise Fallo(f"Nombre de tablero no válido: {nombre!r}. Debe ser como a2-tema, en-a2-tema o pt-a2-tema "
                    "(minúsculas, sin tildes, palabras separadas por guiones).")
    return nombre


def slug(texto: str) -> str:
    import unicodedata
    t = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", t).strip("-")


# ----------------------------------------------------------------- cifrado

def cifrar_tablero(original: bytes, clave: bytes) -> bytes:
    iv = os.urandom(12)
    return iv + AESGCM(clave).encrypt(iv, original, None)


def descifrar_tablero(binario: bytes, clave: bytes) -> bytes:
    return AESGCM(clave).decrypt(binario[:12], binario[12:], None)


def etiqueta(nombre: str) -> bytes:
    return ("linguas-tablero:" + nombre).encode()


def oaep(nombre: str) -> padding.OAEP:
    return padding.OAEP(mgf=padding.MGF1(hashes.SHA256()), algorithm=hashes.SHA256(), label=etiqueta(nombre))


def huella(publica) -> str:
    der = publica.public_bytes(serialization.Encoding.DER, serialization.PublicFormat.SubjectPublicKeyInfo)
    return hashlib.sha256(der).hexdigest()[:16]


def cargar_publica():
    if not PUBLICA.is_file():
        raise Fallo(f"No encuentro {rel(PUBLICA)} (la clave pública de sellado).")
    return serialization.load_pem_public_key(PUBLICA.read_bytes())


def sellar(nombre: str, clave: bytes, binario: bytes) -> str:
    pub = cargar_publica()
    return json.dumps({
        "v": 1,
        "nombre": nombre,
        "alg": "RSA-OAEP-256",
        "huella": huella(pub),
        "clave": base64.b64encode(pub.encrypt(clave, oaep(nombre))).decode(),
        "bin_sha256": hashlib.sha256(binario).hexdigest(),
    }, indent=1) + "\n"


def cargar_privada():
    pem = os.environ.get("SELLO_PRIVADO", "").strip()
    if not pem:
        raise Fallo("FALTA_SELLO")
    try:
        priv = serialization.load_pem_private_key(pem.encode(), password=None)
    except Exception:
        raise Fallo("El secreto SELLO_PRIVADO no es una clave privada PEM válida. Vuelve a pegarlo completo, "
                    "desde «-----BEGIN PRIVATE KEY-----» hasta «-----END PRIVATE KEY-----», en GitHub: "
                    "Settings → Secrets and variables → Actions → SELLO_PRIVADO → Update.")
    if huella(priv.public_key()) != huella(cargar_publica()):
        raise Fallo("El secreto SELLO_PRIVADO no corresponde a herramientas/sello_publico.pem. "
                    "Si generaste un par nuevo, sube su clave pública al repositorio y pega la privada en el secreto.")
    return priv


def abrir_sello(texto: str, nombre: str, priv) -> tuple[bytes, dict]:
    try:
        s = json.loads(texto)
    except json.JSONDecodeError:
        raise Fallo(f"pendientes/{nombre}.sello no es JSON válido.")
    if s.get("v") != 1 or s.get("alg") != "RSA-OAEP-256" or s.get("nombre") != nombre:
        raise Fallo(f"pendientes/{nombre}.sello tiene un formato inesperado o es de otro tablero.")
    if s.get("huella") != huella(priv.public_key()):
        raise Fallo(f"pendientes/{nombre}.sello se selló con otra clave pública. Vuelve a ejecutar «agregar».")
    try:
        clave = priv.decrypt(base64.b64decode(s["clave"]), oaep(nombre))
    except Exception:
        raise Fallo(f"No se pudo abrir pendientes/{nombre}.sello (¿copiado de otro tablero o dañado?).")
    if len(clave) != 32:
        raise Fallo(f"La clave de pendientes/{nombre}.sello no mide 32 bytes.")
    return clave, s


# ----------------------------------------------------------------- catálogo

def leer_catalogo() -> tuple[list[str], list[dict], list[str]]:
    lineas = CATALOGO.read_text(encoding="utf-8").split("\n")
    ini = next(i for i, l in enumerate(lineas) if l.startswith("window.CATALOGO = ["))
    fin = next(i for i in range(ini + 1, len(lineas)) if lineas[i].startswith("];"))
    entradas = []
    for l in lineas[ini + 1:fin]:
        s = l.strip()
        if not s:
            continue
        if not s.startswith("{"):
            raise Fallo(f"Línea inesperada en assets/catalogo.js: {s[:60]!r}. Corrígela a mano antes de seguir.")
        entradas.append(json.loads(s.rstrip(",")))
    return lineas[:ini + 1], entradas, lineas[fin:]


def escribir_catalogo(cabeza: list[str], entradas: list[dict], cola: list[str]) -> None:
    cuerpo = []
    for i, e in enumerate(entradas):
        orden = {k: e[k] for k in CAMPOS if k in e}
        orden.update({k: v for k, v in e.items() if k not in orden})
        cuerpo.append("  " + json.dumps(orden, ensure_ascii=False, separators=(",", ":"))
                      + ("," if i < len(entradas) - 1 else ""))
    CATALOGO.write_text("\n".join(cabeza + cuerpo + cola), encoding="utf-8")


def nombres_catalogo() -> list[str]:
    return [e["archivo"][:-5] for e in leer_catalogo()[1]]


def posicion(entradas: list[dict], idioma: str, nivel: str) -> int:
    """Tras el último tablero del mismo idioma y nivel; si no hay, tras el último de nivel menor del mismo idioma."""
    clave = (IDIOMAS.index(idioma), NIVELES.index(nivel))
    pos = 0
    for i, e in enumerate(entradas):
        try:
            k = (IDIOMAS.index(e.get("idioma", "es")), NIVELES.index(e.get("nivel", "A1")))
        except ValueError:
            continue
        if k <= clave:
            pos = i + 1
    return pos


# ----------------------------------------------------------------- pendientes

def leer_borrar() -> list[str]:
    if not BORRAR.is_file():
        return []
    return [l.strip() for l in BORRAR.read_text(encoding="utf-8").splitlines() if l.strip() and not l.startswith("#")]


def escribir_borrar(nombres: list[str]) -> None:
    nombres = sorted(set(nombres))
    if nombres:
        PEND.mkdir(exist_ok=True)
        BORRAR.write_text("\n".join(nombres) + "\n", encoding="utf-8")
    elif BORRAR.exists():
        BORRAR.unlink()


# ----------------------------------------------------------------- agregar / quitar / listar

def titulo_de(original: str) -> str | None:
    m = re.search(r"<title[^>]*>([^<]*)</title>", original, re.I)
    return _html.unescape(m.group(1)).strip() if m and m.group(1).strip() else None


def cargador_html(titulo: str) -> str:
    return CARGADOR.read_text(encoding="utf-8").replace("{{TITULO}}", _html.escape(titulo, quote=True))


def foto_de(original: str) -> dict:
    """Intenta sacar del tablero su primera foto de Unsplash, su crédito y su alt."""
    m = re.search(r"https://images\.unsplash\.com/(photo-[A-Za-z0-9_-]+)", original)
    if not m:
        return {}
    datos = {"foto": "https://images.unsplash.com/" + m.group(1)}
    tag = re.search(r"<img\b[^>]*" + re.escape(m.group(0)) + r"[^>]*>", original)
    if tag:
        alt = re.search(r'\balt="([^"]*)"', tag.group(0))
        if alt and alt.group(1).strip():
            datos["fotoAlt"] = _html.unescape(alt.group(1)).strip()
    cred = re.search(r"Foto:\s*(?:<a[^>]*href=\"(https://unsplash\.com/[^\"]+)\"[^>]*>)?\s*([^<·]{2,60}?)\s*(?:</a>)?\s*·\s*(?:<a[^>]*>)?\s*Unsplash",
                     original[m.start():] or original)
    if cred:
        datos["fotoAutor"] = _html.unescape(cred.group(2)).strip()
        if cred.group(1):
            datos["fotoPagina"] = cred.group(1)
    return datos


def cmd_agregar(a) -> None:
    origen = Path(a.original).resolve()
    if not origen.is_file():
        raise Fallo(f"No encuentro el archivo {a.original}.")
    if REPO in origen.parents and (REPO / "originales") not in origen.parents:
        raise Fallo("El original está dentro del repositorio. Muévelo fuera (o a la carpeta originales/, que git ignora) "
                    "para que nunca se suba en claro.")
    crudo = origen.read_bytes()
    try:
        texto = crudo.decode("utf-8")
    except UnicodeDecodeError:
        raise Fallo("El original no está en UTF-8.")
    if "assets/abrir.js" in texto and len(crudo) < 8000:
        raise Fallo("Ese archivo es un cargador (ya protegido), no el tablero original.")
    if not re.search(r"<html|<!doctype html", texto[:2000], re.I):
        raise Fallo("El archivo no parece un documento HTML.")

    idioma, nivel = a.idioma, a.nivel.upper()
    if nivel not in NIVELES:
        raise Fallo(f"Nivel no válido: {a.nivel}. Usa A1, A2, B1, B2, C1 o C2.")
    titulo = a.titulo or titulo_de(texto)
    if not titulo:
        raise Fallo("Falta el título: usa --titulo \"...\".")

    if a.nombre:
        nombre = a.nombre
    elif NOMBRE_RE.match(origen.stem):
        nombre = origen.stem
    else:
        nombre = PREFIJO[idioma] + nivel.lower() + "-" + slug(titulo)
    validar_nombre(nombre)
    pref = PREFIJO[idioma]
    if not nombre.startswith(pref + nivel.lower() + "-") or (idioma == "es" and nombre[:3] in ("en-", "pt-")):
        raise Fallo(f"El nombre {nombre!r} no coincide con --idioma {idioma} y --nivel {nivel}: "
                    f"debería empezar por «{pref}{nivel.lower()}-».")

    cabeza, entradas, cola = leer_catalogo()
    archivo = nombre + ".html"
    previa = next((e for e in entradas if e["archivo"] == archivo), None)

    entrada = dict(previa) if previa else {
        "archivo": archivo, "idioma": idioma, "nivel": nivel, "titulo": titulo, "desc": "",
        "consignas": idioma, "publico": "adultos", "prueba": False, "vivo": "vivo.js" in texto,
        "nota": "", "notaEn": "", "notaPt": "", "foto": "", "fotoAutor": "", "fotoPagina": "", "fotoAlt": "",
    }
    if not previa:
        entrada.update(foto_de(texto))
    entrada.update({"idioma": idioma, "nivel": nivel, "titulo": titulo})
    if a.desc is not None:
        entrada["desc"] = a.desc
    elif a.tema or a.gramatica:
        entrada["desc"] = ": ".join(x for x in (a.tema, a.gramatica) if x)
    for campo, valor in (("consignas", a.consignas), ("publico", a.publico), ("nota", a.nota),
                         ("notaEn", a.nota_en), ("notaPt", a.nota_pt), ("foto", a.foto),
                         ("fotoAutor", a.foto_autor), ("fotoPagina", a.foto_pagina), ("fotoAlt", a.foto_alt)):
        if valor is not None:
            entrada[campo] = valor
    if a.prueba is not None:
        entrada["prueba"] = a.prueba
    if a.vivo is not None:
        entrada["vivo"] = a.vivo
    if entrada.get("foto"):
        entrada["foto"] = entrada["foto"].split("?", 1)[0]
        if not entrada["foto"].startswith("https://images.unsplash.com/"):
            raise Fallo("--foto debe ser una URL de images.unsplash.com.")

    # 1 · cifrar con una clave nueva
    clave = AESGCM.generate_key(256)
    binario = cifrar_tablero(crudo, clave)
    assert descifrar_tablero(binario, clave) == crudo
    (REPO / "t").mkdir(exist_ok=True)
    (REPO / "t" / (nombre + ".bin")).write_bytes(binario)
    (REPO / archivo).write_text(cargador_html(titulo), encoding="utf-8")
    # 2 · sellar la clave para el workflow
    PEND.mkdir(exist_ok=True)
    (PEND / (nombre + ".sello")).write_text(sellar(nombre, clave, binario), encoding="utf-8")
    escribir_borrar([n for n in leer_borrar() if n != nombre])
    # 3 · catálogo
    if previa:
        entradas[entradas.index(previa)] = entrada
    else:
        entradas.insert(posicion(entradas, idioma, nivel), entrada)
    escribir_catalogo(cabeza, entradas, cola)
    del clave

    print(("Actualizado" if previa else "Añadido") + f": {nombre} ({idioma}, {nivel}) «{titulo}»")
    print(f"  t/{nombre}.bin · {archivo} · pendientes/{nombre}.sello · assets/catalogo.js")
    vacios = [c for c in ("desc", "nota", "notaEn", "notaPt", "foto", "fotoAutor", "fotoAlt") if not entrada.get(c)]
    if vacios:
        aviso("campos vacíos en el catálogo: " + ", ".join(vacios) + " (puedes volver a ejecutar «agregar» con las opciones que faltan).")
    if previa:
        aviso("el tablero cambia de clave: hasta que el workflow termine (1–2 minutos) no se podrá abrir, "
              "y las salas abiertas con la versión anterior dejarán de abrirlo.")
    print("Siguiente paso: git add -A && git commit && git push. El workflow «Tableros» guardará la clave en Firebase.")


def cmd_quitar(a) -> None:
    nombre = validar_nombre(a.nombre[:-5] if a.nombre.endswith(".html") else a.nombre)
    cabeza, entradas, cola = leer_catalogo()
    quitados = []
    resto = [e for e in entradas if e["archivo"] != nombre + ".html"]
    if len(resto) != len(entradas):
        escribir_catalogo(cabeza, resto, cola)
        quitados.append("assets/catalogo.js")
    for p in (REPO / "t" / (nombre + ".bin"), REPO / (nombre + ".html"), VISTA / (nombre + ".html"),
              PEND / (nombre + ".sello")):
        if p.exists():
            p.unlink()
            quitados.append(rel(p))
    if not quitados:
        raise Fallo(f"No hay ningún tablero llamado {nombre}.")
    escribir_borrar(leer_borrar() + [nombre])
    print(f"Quitado: {nombre}")
    print("  " + " · ".join(quitados))
    print(f"  pendientes/borrar.txt: el workflow borrará claves/{nombre} en Firebase.")
    print("Siguiente paso: git add -A && git commit && git push.")


def cmd_listar(a) -> None:
    _, entradas, _ = leer_catalogo()
    borrar = set(leer_borrar())
    nombres_idioma = {"es": "Español", "en": "Inglés", "pt": "Portugués"}
    for idioma in IDIOMAS:
        de_idioma = [e for e in entradas if e.get("idioma") == idioma]
        if not de_idioma:
            continue
        print(f"\n{nombres_idioma[idioma]} ({len(de_idioma)})")
        for nivel in NIVELES:
            grupo = [e for e in de_idioma if e.get("nivel") == nivel]
            if not grupo:
                continue
            print(f"  {nivel} · {len(grupo)}")
            for e in grupo:
                n = e["archivo"][:-5]
                marcas = []
                if (PEND / (n + ".sello")).exists():
                    marcas.append("clave pendiente")
                if not (REPO / "t" / (n + ".bin")).exists():
                    marcas.append("FALTA t/.bin")
                if (VISTA / (n + ".html")).exists():
                    marcas.append("vista previa")
                if e.get("vivo"):
                    marcas.append("en vivo")
                print(f"    {n:<40} {e.get('titulo', '')}" + (f"  [{', '.join(marcas)}]" if marcas else ""))
    print(f"\nTotal: {len(entradas)} tableros.")
    if borrar:
        print("Claves por borrar en Firebase: " + ", ".join(sorted(borrar)))


# ----------------------------------------------------------------- Firebase (solo workflow)

class Firebase:
    """Realtime Database por REST con un token OAuth de la cuenta de servicio (sin dependencias extra).

    La cuenta de servicio entra como administrador (se salta las reglas), así que esta clase
    solo permite tocar claves/<nombre>."""

    ALCANCES = "https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/userinfo.email"

    def __init__(self, sa: dict, db_url: str):
        for campo in ("client_email", "private_key", "token_uri"):
            if not sa.get(campo):
                raise Fallo(f"El secreto FIREBASE_SA no tiene el campo «{campo}». Pega el archivo JSON completo "
                            "que descargaste de Firebase (Configuración del proyecto → Cuentas de servicio).")
        self.sa = sa
        self.db_url = db_url.rstrip("/")
        for url in (self.db_url, sa["token_uri"]):
            u = urllib.parse.urlparse(url)
            if not (u.scheme == "https" or (u.scheme == "http" and u.hostname in ("127.0.0.1", "localhost"))):
                raise Fallo(f"URL no permitida: {url}")
        self._token = None
        self._vence = 0

    @classmethod
    def desde_entorno(cls) -> "Firebase":
        crudo = os.environ.get("FIREBASE_SA", "").strip()
        if not crudo:
            raise Fallo("FALTA_FIREBASE")
        try:
            sa = json.loads(crudo)
        except json.JSONDecodeError:
            raise Fallo("El secreto FIREBASE_SA no es JSON válido. Pega el contenido completo del archivo .json "
                        "descargado (empieza por «{» y termina por «}»).")
        if sa.get("type") != "service_account":
            raise Fallo("El secreto FIREBASE_SA no es una cuenta de servicio (falta \"type\": \"service_account\").")
        if sa.get("project_id") and sa["project_id"] != "linguas-tableros" and not os.environ.get("FIREBASE_DB_URL"):
            raise Fallo(f"La cuenta de servicio es del proyecto {sa['project_id']!r}, no de «linguas-tableros».")
        return cls(sa, os.environ.get("FIREBASE_DB_URL") or DB_URL)

    def token(self) -> str:
        if self._token and time.time() < self._vence - 60:
            return self._token
        ahora = int(time.time())
        cab = b64u(json.dumps({"alg": "RS256", "typ": "JWT"}).encode())
        cuerpo = b64u(json.dumps({"iss": self.sa["client_email"], "scope": self.ALCANCES,
                                  "aud": self.sa["token_uri"], "iat": ahora, "exp": ahora + 3600}).encode())
        try:
            pk = serialization.load_pem_private_key(self.sa["private_key"].encode(), password=None)
        except Exception:
            raise Fallo("La clave privada dentro de FIREBASE_SA no es válida. Genera una nueva en Firebase y vuelve a pegarla.")
        firma = b64u(pk.sign(f"{cab}.{cuerpo}".encode(), padding.PKCS1v15(), hashes.SHA256()))
        datos = urllib.parse.urlencode({"grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
                                        "assertion": f"{cab}.{cuerpo}.{firma}"}).encode()
        try:
            with urllib.request.urlopen(urllib.request.Request(self.sa["token_uri"], data=datos), timeout=30) as r:
                resp = json.load(r)
        except urllib.error.HTTPError as e:
            raise Fallo(f"Google rechazó la cuenta de servicio de FIREBASE_SA (HTTP {e.code}). "
                        "¿La borraste o la revocaste? Genera una clave nueva y actualiza el secreto.")
        self._token = resp["access_token"]
        enmascarar(self._token)
        self._vence = ahora + int(resp.get("expires_in", 3600))
        return self._token

    def _ruta(self, nombre: str) -> str:
        return f"{self.db_url}/claves/{validar_nombre(nombre)}.json"

    def _pedir(self, metodo: str, nombre: str, cuerpo=None):
        req = urllib.request.Request(self._ruta(nombre), method=metodo,
                                     data=None if cuerpo is None else json.dumps(cuerpo).encode(),
                                     headers={"Authorization": "Bearer " + self.token(),
                                              "Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code in (401, 403):
                raise Fallo(f"Firebase no dejó escribir claves/{nombre} (HTTP {e.code}). La cuenta de servicio "
                            "debe ser la de «linguas-tableros» (Firebase Admin SDK).")
            raise Fallo(f"Firebase respondió HTTP {e.code} en claves/{nombre}.")

    def leer(self, nombre: str):
        return self._pedir("GET", nombre)

    def escribir(self, nombre: str, clave_b64u: str) -> None:
        self._pedir("PUT", nombre, clave_b64u)
        if self.leer(nombre) != clave_b64u:
            raise Fallo(f"claves/{nombre} no quedó guardada en Firebase.")

    def borrar(self, nombre: str) -> None:
        self._pedir("DELETE", nombre)


MSG_FALTA = {
    "FALTA_SELLO": ("Falta el secreto SELLO_PRIVADO",
                    "Falta el secreto SELLO_PRIVADO (la clave privada que abre los sellos). Ponlo en GitHub: "
                    "Settings → Secrets and variables → Actions → New repository secret. Nombre: SELLO_PRIVADO. "
                    "Valor: todo el contenido del archivo SELLO_PRIVADO.pem, desde «-----BEGIN PRIVATE KEY-----» "
                    "hasta «-----END PRIVATE KEY-----». Después vuelve a ejecutar este workflow (Actions → Tableros → Re-run)."),
    "FALTA_FIREBASE": ("Falta el secreto FIREBASE_SA",
                       "Falta el secreto FIREBASE_SA (la cuenta de servicio de Firebase). Genérala en la consola de "
                       "Firebase: proyecto linguas-tableros → engranaje → Configuración del proyecto → Cuentas de servicio "
                       "→ Generar nueva clave privada. Luego, en GitHub: Settings → Secrets and variables → Actions → "
                       "New repository secret. Nombre: FIREBASE_SA. Valor: todo el contenido del archivo .json descargado. "
                       "Después vuelve a ejecutar este workflow (Actions → Tableros → Re-run)."),
}


def generar_vista(nombre: str, original: bytes) -> bool:
    """Llama a herramientas/vista_previa.mjs con el original en un archivo temporal fuera del repositorio."""
    if not VISTA_SCRIPT.is_file():
        aviso(f"No existe {rel(VISTA_SCRIPT)}; se omite la vista previa de {nombre}.")
        return False
    if not shutil.which("node"):
        aviso(f"node no está instalado; se omite la vista previa de {nombre}.")
        return False
    VISTA.mkdir(exist_ok=True)
    tmp = Path(tempfile.mkdtemp(prefix="la-tablero-"))
    try:
        os.chmod(tmp, 0o700)
        fuente = tmp / (nombre + ".html")
        fd = os.open(fuente, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(fd, "wb") as f:
            f.write(original)
        destino = VISTA / (nombre + ".html")
        p = subprocess.run(["node", str(VISTA_SCRIPT), str(fuente), str(destino)], cwd=REPO,
                           capture_output=True, text=True, timeout=300)
        if p.returncode != 0 or not destino.is_file():
            # No se reenvía la salida completa: podría citar fragmentos del original.
            ultima = (p.stderr or "").strip().splitlines()[-1:] or ["(sin mensaje)"]
            aviso(f"vista_previa.mjs falló con {nombre} (código {p.returncode}): {ultima[0][:200]}")
            return False
        print(f"  vista previa: vista/{nombre}.html")
        return True
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def preparar(necesita_sello: bool):
    """Carga los secretos que hacen falta; si falta alguno, explica exactamente cuál y dónde ponerlo."""
    faltan, priv, fb = [], None, None
    if necesita_sello:
        try:
            priv = cargar_privada()
        except Fallo as e:
            if str(e) != "FALTA_SELLO":
                raise
            faltan.append("FALTA_SELLO")
    try:
        fb = Firebase.desde_entorno()
    except Fallo as e:
        if str(e) != "FALTA_FIREBASE":
            raise
        faltan.append("FALTA_FIREBASE")
    if faltan:
        for f in faltan:
            error_gha(*MSG_FALTA[f])
        raise SystemExit(1)
    return priv, fb


def cmd_procesar(a) -> None:
    sellos = sorted(PEND.glob("*.sello")) if PEND.is_dir() else []
    borrar = leer_borrar()
    if not sellos and not borrar:
        print("No hay nada pendiente.")
        return
    priv, fb = preparar(necesita_sello=bool(sellos))
    catalogo = set(nombres_catalogo())
    errores, borrados = [], []

    for nombre in borrar:
        try:
            validar_nombre(nombre)
            if nombre in catalogo:
                raise Fallo(f"{nombre} está en borrar.txt pero sigue en el catálogo; no se borra su clave. "
                            f"Quítalo con «tablero.py quitar {nombre}» o sácalo de borrar.txt.")
            fb.borrar(nombre)
            borrados.append(nombre)
            print(f"Clave borrada: claves/{nombre}")
        except Fallo as e:
            errores.append(str(e))
    escribir_borrar([n for n in borrar if n not in borrados])

    for sello in sellos:
        nombre = sello.name[:-len(".sello")]
        try:
            validar_nombre(nombre)
            clave, datos = abrir_sello(sello.read_text(encoding="utf-8"), nombre, priv)
            k = b64u(clave)
            enmascarar(k)
            bin_path = REPO / "t" / (nombre + ".bin")
            if not bin_path.is_file():
                raise Fallo(f"Hay sello para {nombre} pero falta t/{nombre}.bin.")
            binario = bin_path.read_bytes()
            if hashlib.sha256(binario).hexdigest() != datos.get("bin_sha256"):
                raise Fallo(f"t/{nombre}.bin no es el que se selló (¿se cifró otra vez sin sello nuevo?). "
                            "Vuelve a ejecutar «agregar».")
            try:
                original = descifrar_tablero(binario, clave)
            except Exception:
                raise Fallo(f"La clave sellada no abre t/{nombre}.bin.")
            if nombre not in catalogo:
                aviso(f"{nombre} no está en assets/catalogo.js (se guarda la clave igualmente).")
            fb.escribir(nombre, k)
            print(f"Clave guardada: claves/{nombre}")
            generar_vista(nombre, original)
            del original
            sello.unlink()
        except Fallo as e:
            errores.append(str(e))

    if errores:
        for e in errores:
            error_gha("Tableros", e)
        raise SystemExit(1)
    print("Listo: pendientes procesados.")


def cmd_regenerar(a) -> None:
    _, fb = preparar(necesita_sello=False)
    errores, hechos = [], 0
    nombres = nombres_catalogo()
    for nombre in nombres:
        bin_path = REPO / "t" / (nombre + ".bin")
        if not bin_path.is_file():
            continue
        if (PEND / (nombre + ".sello")).exists():
            aviso(f"{nombre} tiene un sello pendiente; ejecuta primero «procesar».")
            continue
        try:
            k = fb.leer(nombre)
            if not isinstance(k, str):
                raise Fallo(f"No hay clave en Firebase para {nombre} (claves/{nombre}).")
            enmascarar(k)
            try:
                original = descifrar_tablero(bin_path.read_bytes(), unb64u(k))
            except Exception:
                raise Fallo(f"La clave de Firebase no abre t/{nombre}.bin.")
            if generar_vista(nombre, original):
                hechos += 1
            del original
        except Fallo as e:
            errores.append(str(e))
    if VISTA.is_dir():
        for v in VISTA.glob("*.html"):
            if v.stem not in nombres:
                v.unlink()
                print(f"  vista huérfana borrada: vista/{v.name}")
    print(f"Vistas previas regeneradas: {hechos} de {len(nombres)}.")
    if errores:
        for e in errores:
            error_gha("Tableros", e)
        raise SystemExit(1)


# ----------------------------------------------------------------- CLI

def si_no(v: str) -> bool:
    v = v.lower()
    if v in ("si", "sí", "true", "1", "yes"):
        return True
    if v in ("no", "false", "0"):
        return False
    raise argparse.ArgumentTypeError("usa sí o no")


def main(argv=None) -> int:
    p = argparse.ArgumentParser(prog="tablero.py", description="Añadir, quitar y listar tableros de Lingua's Academy.")
    sub = p.add_subparsers(dest="cmd", required=True)

    g = sub.add_parser("agregar", help="cifra un tablero original y lo publica (o lo actualiza)")
    g.add_argument("original", help="el .html original, FUERA del repositorio")
    g.add_argument("--nivel", required=True, help="A1, A2, B1, B2, C1 o C2")
    g.add_argument("--idioma", required=True, choices=IDIOMAS, help="idioma que se enseña")
    g.add_argument("--titulo", help="título (por defecto, el <title> del original)")
    g.add_argument("--nombre", help="nombre del archivo sin .html (por defecto, el del original o <nivel>-<título>)")
    g.add_argument("--tema", help="tema de la clase (va en la descripción del catálogo)")
    g.add_argument("--gramatica", help="gramática (va en la descripción, tras el tema)")
    g.add_argument("--desc", help="descripción completa (sustituye a --tema/--gramatica)")
    g.add_argument("--consignas", choices=["es", "en", "pt"], help="idioma de las instrucciones")
    g.add_argument("--publico", choices=["adultos", "ninos"])
    g.add_argument("--prueba", type=si_no, metavar="sí|no", help="¿clase de prueba?")
    g.add_argument("--vivo", type=si_no, metavar="sí|no", help="¿funciona en sala en vivo? (por defecto, si carga vivo.js)")
    g.add_argument("--nota"); g.add_argument("--nota-en"); g.add_argument("--nota-pt")
    g.add_argument("--foto", help="URL base de images.unsplash.com (por defecto, la primera del tablero)")
    g.add_argument("--foto-autor"); g.add_argument("--foto-pagina"); g.add_argument("--foto-alt")
    g.set_defaults(fn=cmd_agregar)

    q = sub.add_parser("quitar", help="quita un tablero y programa el borrado de su clave")
    q.add_argument("nombre")
    q.set_defaults(fn=cmd_quitar)

    sub.add_parser("listar", help="lo publicado, por idioma y nivel").set_defaults(fn=cmd_listar)
    sub.add_parser("procesar", help="(workflow) abre los sellos y actualiza Firebase").set_defaults(fn=cmd_procesar)
    sub.add_parser("regenerar", help="(workflow) rehace todas las vistas previas").set_defaults(fn=cmd_regenerar)

    a = p.parse_args(argv)
    try:
        a.fn(a)
    except Fallo as e:
        error_gha("Tableros", str(e))
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
