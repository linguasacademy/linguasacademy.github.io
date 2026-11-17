# Lingua's Academy · Tableros de clase

Tableros de clase para profesores de idiomas, organizados por idioma y nivel (A1–C2): https://linguasacademy.github.io/

## Páginas

| Archivo | Qué es | Quién la ve |
|---|---|---|
| `index.html` | Portada pública | Cualquiera |
| `entrar.html` | Entrar con Google o con correo, cambiar la contraseña, completar la solicitud y ver su estado | Cualquiera |
| `tableros.html` | Catálogo por idioma (español, inglés, portugués), nivel y filtros | Profesores aprobados |
| `admin.html` | Aprobar o rechazar solicitudes de acceso | Administración |
| `404.html` | Página de error 404 en español con enlaces al inicio y al catálogo | Cualquiera |
| `<nivel>-<tema>.html` | Cargador de cada tablero; el tablero va cifrado en `t/<nivel>-<tema>.bin` | Profesores aprobados y estudiantes con enlace de sala |

- Cada tablero es un solo `.html`, sin nombres de estudiantes, reutilizable por cualquier profesor.
- `vivo.js` conecta los tableros en vivo a una sala de Firebase. Solo un profesor aprobado puede abrir una sala; el estudiante entra con el enlace, sin cuenta.
- `assets/auth.js` maneja el acceso de profesores con el mismo proyecto de Firebase.

## Tableros protegidos

Cada tablero va cifrado (AES-256-GCM, una clave por tablero) en `t/<nombre>.bin`. El `<nombre>.html` de la raíz es solo un cargador (`assets/abrir.js`) que pide la clave a Firebase:

- `claves/<nombre>`: la leen solo los profesores aprobados y la administración.
- `salas/<sala>/clave`: la escribe el profe al abrir la sala; la lee quien entra con el enlace de esa sala.

Sin sesión, el cargador lleva a `entrar.html`. **Nunca subas el `.html` original de un tablero al repositorio.**

## Añadir un tablero

1. En `admin.html`, sección «Proteger un tablero nuevo», elige el `.html` original. La página guarda la clave en Firebase y descarga `<nombre>.bin` y `<nombre>.html`.
2. Sube `<nombre>.bin` a la carpeta `t/` y `<nombre>.html` a la raíz. Nombre de archivo: español `<nivel>-<tema>.html`; inglés `en-<nivel>-<tema>.html`; portugués `pt-<nivel>-<tema>.html`.
3. Añade una línea en `assets/catalogo.js` (las instrucciones están al principio del archivo). La portada y el catálogo cuentan los tableros solos.

## Activar el acceso de profesores (una sola vez, en la consola de Firebase)

Proyecto `linguas-tableros`:

1. **Authentication → Sign-in method:** activa **Correo electrónico/contraseña** y **Google** (en Google, elige tu correo como correo de asistencia y guarda). Deja activado **Anónimo** (lo usan los estudiantes en las salas).
2. **Authentication → Settings → Authorized domains:** comprueba que `linguasacademy.github.io` está en la lista. Sin esto, «Entrar con Google» no funciona.
3. **Realtime Database → Reglas:** pega el contenido de `database.rules.json` y publica.
4. **Date permisos de administración:** crea tu cuenta en Authentication → Users (Agregar usuario). Luego, en **Realtime Database → Datos**:
   - crea `admins/<tu uid>` con el valor `true` (el uid está en Authentication → Users);
   - crea `profes/<tu uid>` con `nombre`, `correo`, `idioma` (`es`) y `estado` (`aprobado`).
5. Desde entonces apruebas a los demás profesores en `admin.html`.

## Verificación

Antes de subir cambios puedes comprobar la paridad 1:1 entre `assets/catalogo.js`, los `<nombre>.html` de la raíz y `t/*.bin`, la validez de `database.rules.json`, la sintaxis de los archivos `.js` y las referencias locales de los HTML principales ejecutando:

```sh
python3 herramientas/verificar.py
```

Para activar el hook local de `pre-push` en tu copia del repositorio:

```sh
git config core.hooksPath .githooks
```

## Límites

Un profesor aprobado puede guardar un tablero abierto en su navegador, y quien tenga el enlace de una sala abierta puede abrir ese tablero. Las salas no caducan solas.

Fotografías de Unsplash bajo la licencia de Unsplash.
