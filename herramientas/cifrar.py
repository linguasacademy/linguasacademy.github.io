"""cifrar.py · Lingua's Academy

Cifra tableros con AES-GCM (una clave distinta por tablero) y deja en su
lugar un cargador que pide la clave a Firebase.

Uso:
    python3 herramientas/cifrar.py ORIGEN_DIR CLAVES_JSON a1-tablero.html [...]

- ORIGEN_DIR: carpeta con los tableros originales (sin cifrar).
- CLAVES_JSON: archivo, FUERA del repositorio, donde se guardan las claves
  ({"a1-tablero": "<clave base64url>"}). Si ya tiene la clave de un tablero,
  se reutiliza (así no hay que volver a subirla).
- Escribe t/<nombre>.bin y <nombre>.html (el cargador) en el repositorio.

Formato de .bin: 12 bytes de IV + texto cifrado AES-256-GCM (con la etiqueta al final).
"""
import base64, html as _html, json, os, sys
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CARGADOR = os.path.join(REPO, 'herramientas', 'cargador.html')


def b64u(b):
    return base64.urlsafe_b64encode(b).decode().rstrip('=')


def unb64u(s):
    return base64.urlsafe_b64decode(s + '=' * (-len(s) % 4))


def main():
    origen, claves_json, *archivos = sys.argv[1:]
    claves = json.load(open(claves_json)) if os.path.exists(claves_json) else {}
    plantilla = open(CARGADOR, encoding='utf-8').read()
    os.makedirs(os.path.join(REPO, 't'), exist_ok=True)
    for a in archivos:
        nombre = os.path.basename(a)[:-5]
        html = open(os.path.join(origen, nombre + '.html'), 'rb').read()
        clave = unb64u(claves[nombre]) if nombre in claves else AESGCM.generate_key(256)
        claves[nombre] = b64u(clave)
        iv = os.urandom(12)
        with open(os.path.join(REPO, 't', nombre + '.bin'), 'wb') as f:
            f.write(iv + AESGCM(clave).encrypt(iv, html, None))
        titulo = html.split(b'<title>', 1)[1].split(b'</title>', 1)[0].decode('utf-8') if b'<title>' in html else nombre
        with open(os.path.join(REPO, nombre + '.html'), 'w', encoding='utf-8') as f:
            f.write(plantilla.replace('{{TITULO}}', _html.escape(_html.unescape(titulo.strip()), quote=True)))
        print('cifrado', nombre)
    json.dump(claves, open(claves_json, 'w'), indent=1, sort_keys=True)


if __name__ == '__main__':
    main()
