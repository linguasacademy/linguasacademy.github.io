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

## Añadir o quitar tableros (Claude)

Claude añade y quita tableros con `herramientas/tablero.py`, sin pasar por `admin.html` y sin credenciales de Firebase. La clave de cada tablero viaja **sellada** (cifrada con `herramientas/sello_publico.pem`) y un workflow de GitHub, que sí tiene los secretos, la abre y la guarda en Firebase.

```sh
# Añadir (o actualizar) un tablero. El original va FUERA del repositorio.
python3 herramientas/tablero.py agregar ~/original/a2-tema.html --nivel A2 --idioma es \
    --titulo "¿Ya lo has probado?" --tema "Experiencias de viaje" \
    --gramatica "pretérito perfecto, ya / todavía no" --consignas en \
    --nota "Un puesto de fruta" --nota-en "A fruit stand" --nota-pt "Uma barraca de frutas"

# Quitar un tablero
python3 herramientas/tablero.py quitar a2-tema

# Ver lo publicado, por idioma y nivel
python3 herramientas/tablero.py listar
```

Después: `git add -A`, `git commit` y `git push` a `main`.

- **`agregar`** cifra el tablero con una clave nueva y escribe `t/<nombre>.bin`, el cargador `<nombre>.html`, la clave sellada `pendientes/<nombre>.sello` y su línea en `assets/catalogo.js` (dentro de su nivel; si ya existe, la actualiza). Si no das `--foto`, toma la primera foto de Unsplash del tablero. Otras opciones: `--nombre`, `--desc`, `--publico ninos`, `--prueba sí`, `--vivo no`, `--foto-autor`, `--foto-pagina`, `--foto-alt`. `python3 herramientas/tablero.py agregar -h` las muestra todas.
- **`quitar`** borra `t/<nombre>.bin`, `<nombre>.html`, la línea del catálogo y `vista/<nombre>.html`, y apunta el nombre en `pendientes/borrar.txt`.
- Al hacer push, el workflow **Tableros** (`.github/workflows/tableros.yml`) abre los sellos, guarda cada clave en `claves/<nombre>`, borra las claves de `borrar.txt`, genera la vista previa pública en `vista/<nombre>.html` (con `herramientas/vista_previa.mjs`) y hace un commit que vacía `pendientes/`. Tarda uno o dos minutos; hasta entonces el tablero nuevo no abre.
- Si actualizas un tablero que ya existía, cambia de clave: durante esos minutos no abre, y las salas que estaban abiertas con la versión anterior dejan de abrirlo.
- En GitHub, **Actions → Tableros → Run workflow** lo lanza a mano. Marca «Regenerar todas las vistas previas» para rehacer `vista/` de todos los tableros (por ejemplo, cuando cambie `vista_previa.mjs`).
- **Nunca** pongas un original en el repositorio. Si quieres tenerlo a mano dentro de la copia local, usa la carpeta `originales/`, que git ignora. `verificar.py` falla si encuentra un tablero en claro.

### Lo que el dueño hace una sola vez

Son dos secretos. Sin ellos el workflow falla y dice exactamente cuál falta.

**Paso 1 · Crear la cuenta de servicio en Firebase**

1. Entra en https://console.firebase.google.com y abre el proyecto **linguas-tableros**.
2. Toca el engranaje (arriba a la izquierda, junto a «Descripción general del proyecto») → **Configuración del proyecto**.
3. Abre la pestaña **Cuentas de servicio**.
4. Toca **Generar nueva clave privada** y confirma con **Generar clave**. Se descarga un archivo `.json`.
5. Guarda ese archivo en un lugar seguro y **no lo subas nunca al repositorio** (da acceso total a la base de datos).

**Paso 2 · Pegar los dos secretos en GitHub**

1. En GitHub, abre el repositorio `linguasacademy/linguasacademy.github.io`.
2. Ve a **Settings → Secrets and variables → Actions**.
3. Toca **New repository secret**:
   - **Name:** `FIREBASE_SA`
   - **Secret:** abre el `.json` del paso 1 con el Bloc de notas, copia todo (de la primera `{` a la última `}`) y pégalo.
   - Toca **Add secret**.
4. Toca otra vez **New repository secret**:
   - **Name:** `SELLO_PRIVADO`
   - **Secret:** el contenido completo del archivo `SELLO_PRIVADO.pem` que te entregaron, desde `-----BEGIN PRIVATE KEY-----` hasta `-----END PRIVATE KEY-----`, ambas líneas incluidas.
   - Toca **Add secret**.
5. Borra de tu computador la copia de `SELLO_PRIVADO.pem` cuando ya esté pegada (GitHub la guarda; no hace falta tenerla en otro sitio).

Listo. Para comprobarlo: **Actions → Tableros → Run workflow**. Si sale en verde («No hay nada pendiente»), los secretos están bien.

**Si un secreto se filtra:** en Firebase, Cuentas de servicio → administra las claves en Google Cloud y borra la clave vieja; genera una nueva y actualiza `FIREBASE_SA`. Para `SELLO_PRIVADO`, pide a Claude un par nuevo: la pública se sube a `herramientas/sello_publico.pem` y la privada se pega en el secreto.

## Añadir un tablero a mano (admin.html)

Si prefieres hacerlo tú, sin Claude:

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

Antes de subir cambios puedes comprobar la paridad 1:1 entre `assets/catalogo.js`, los `<nombre>.html` de la raíz y `t/*.bin`, que ningún tablero esté en claro, que `pendientes/` y `vista/` estén en orden, la validez de `database.rules.json`, la sintaxis de los archivos `.js` y las referencias locales de los HTML principales ejecutando:

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
