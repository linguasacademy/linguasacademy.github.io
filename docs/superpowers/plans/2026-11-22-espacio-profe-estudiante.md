# Espacio del profe y perfil del estudiante · plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Cómo se ejecuta aquí:** lo hace la sesión diaria de Claude, **una tarea por día** (cada tarea es una «porción» de la página de Notion «Espacio del profe y perfil del estudiante»). Rama `claude/trabajo-diario`, un solo pull request «Trabajo diario de Claude», nunca a `main`. Arley publica.

**Goal:** que un profe autónomo pruebe un tablero gratis, entre con Google y trabaje con sus estudiantes (invitación, lista, grupos, agenda, ficha, notas), y que cada estudiante tenga su perfil.

**Architecture:** sitio estático (GitHub Pages) + Firebase Authentication y Realtime Database del proyecto actual. Toda la lógica de datos nueva va en un módulo, `assets/espacio.js` (`window.LA_ESPACIO`), que usan `panel.html` (profe) y `estudiantes.html` (estudiante). La seguridad vive en `database.rules.json`, probada con el evaluador de reglas del repositorio.

**Tech Stack:** HTML/CSS/JS sin compilación, Firebase compat SDK (vía `assets/fb.js`), `node --test` para reglas y lógica, Playwright (Python) con `tests/e2e/helpers/firebase-falso.js` y `rtdb-servidor.mjs` para el navegador.

**Spec:** `docs/superpowers/specs/2026-11-22-espacio-profe-estudiante-design.md`

## Global Constraints

- Nada a `main`. Rama `claude/trabajo-diario`; Arley aprueba y publica.
- `python3 herramientas/verificar.py` termina con «Verificación completada sin errores.» después de cada tarea.
- Textos en es, en y pt en `assets/i18n.js`; cortos, sin relleno; nada de créditos de fotos.
- Interfaz con `assets/tokens.css` y `assets/componentes.css` (ver `estilo.html`); contraste AA; todo lo que se mueve respeta `prefers-reduced-motion`.
- Cambios de reglas: **solo en la Tarea 1** (más las correcciones que una prueba obligue). Al terminarla, la sesión deja en «Informe de Claude» una sola pregunta/aviso: «Pega `database.rules.json` en Firebase → Realtime Database → Reglas» (incluye también la entrada directa de la fase 4, commit 80e2c75).
- Fechas de la agenda: `inicio` en milisegundos UTC y `zona` IANA (p. ej. `America/Bogota`); se muestran con `Intl.DateTimeFormat` en la zona de quien mira.
- Cuentas nuevas solo con Google. Las de correo que ya existen siguen entrando.
- Prueba gratis: solo ver y recorrer un tablero; no abre salas ni crea tareas.

## Review Focus

1. **Un estudiante con dos profes**: ve las clases y tareas de ambos, separadas por profe; quitarlo de uno no lo quita del otro. (Prueba en Tarea 1 y Tarea 7.)
2. **Invitación vieja tras crear una nueva**: el código viejo deja de servir y el mensaje lo explica; los estudiantes ya unidos se quedan. (Tarea 1 y Tarea 3.)
3. **Profe y estudiante en zonas horarias distintas**: una clase creada a las 18:00 en Bogotá se ve a las 20:00 en São Paulo (hora estándar). (Tarea 5.)
4. **Visitante que ya usó su tablero gratis abre otro**: va a `entrar.html?volver=<tablero>.html&motivo=prueba` y el mensaje dice que entre con Google; el tablero de su prueba sigue abriendo. (Tarea 2.)
5. **Nombres largos y listas vacías**: nombre de 80 caracteres, grupo sin estudiantes, profe sin estudiantes, estudiante sin clases: nada se desborda y cada vacío dice qué hacer. (Tareas 3–7.)

---

### Task 1: Reglas de Firebase del espacio

**Files:**
- Modify: `database.rules.json`
- Test: `tests/e2e/espacio-reglas.test.mjs` (nuevo, mismo estilo que `tests/e2e/tareas-reglas.test.mjs`)

**Interfaces:**
- Produces (rutas y formas que usan todas las tareas siguientes):
  - `invitaciones/<codigo>`: `{ profe: string, nombreProfe: string (1–80), creada: now }`; `codigo` = 12 caracteres `[0-9a-z]`. `nombreProfe` deja que el estudiante vea a quién se une antes de unirse.
  - `invitacionDe/<uidProfe>`: `<codigo>`.
  - `estudiantes/<uidEst>`: `{ nombre (1–80), creado: now, invitacion: <codigo>, profes: { <uidProfe>: true } }`; `invitacion` es el último código con que se unió.
  - `alumnos/<uidProfe>/<uidEst>`: `{ nombre (1–80), unido: now, idioma?: 'es'|'en'|'pt', nivel?: 'A1'…'C2' }`.
  - `grupos/<uidProfe>/<id>`: `{ nombre (1–60), estudiantes: { <uidEst>: true } }`.
  - `clases/<uidProfe>/<id>`: `{ inicio: number, zona: string ≤ 60, tablero: string ≤ 80, estudiantes: { <uidEst>: true }, grupo?: string, sala?: string ≤ 40, hecha?: true, nota?: string ≤ 600 }`.
  - `clasesDe/<uidEst>/<uidProfe>/<id>`: `true`.
  - `notas/<uidProfe>/<uidEst>`: string ≤ 4000.
  - `prueba/<uid>`: nombre de tablero.
  - `tareas/<c>/para`: `<uidEst>` (opcional).
  - Los `id` de grupos y clases: 10 caracteres `[0-9a-z]` (igual que las tareas).

- [ ] **Step 1: Escribir las pruebas que fallan** en `tests/e2e/espacio-reglas.test.mjs`, con usuarios `PROFE` (password, aprobado), `PROFE_G` (google.com, aprobado), `OTRO_PROFE`, `EST` (google.com, sin ficha de profe), `EST2`, `ANON` (anonymous). Casos, uno por `test(...)`:
  - `Invitación · el profe aprobado crea la suya y la apunta en invitacionDe; nadie más la crea ni la borra`.
  - `Invitación · cualquiera con sesión lee invitaciones/<codigo>; nadie lista invitaciones/`.
  - `Unirse · EST escribe estudiantes/EST y alumnos/PROFE/EST con un código vigente de PROFE` → allowed.
  - `Unirse · falla con código viejo (no es invitacionDe/PROFE), con código de otro profe, siendo anónimo, o escribiendo idioma/nivel` → denied.
  - `Alumnos · lo leen PROFE y EST; EST2 y OTRO_PROFE no; PROFE edita idioma y nivel; EST no`.
  - `Quitar · PROFE borra alumnos/PROFE/EST; EST borra alumnos/PROFE/EST y estudiantes/EST/profes/PROFE`.
  - `Grupos · solo su profe lee y escribe; nombre ≤ 60`.
  - `Clases · solo el profe escribe; la leen el profe y cada estudiante de estudiantes; EST2 no` y `inicio` número, `zona` ≤ 60, `nota` ≤ 600.
  - `ClasesDe · solo el profe de esa rama escribe; lo lee el estudiante`.
  - `Notas · solo su profe lee y escribe; EST no las lee`.
  - `Prueba · ANON escribe prueba/ANON una vez con un tablero que tiene clave; no dos veces, no otro uid, no un tablero inventado`.
  - `Claves · ANON con prueba/ANON === 'a1-mucho-gusto' lee claves/a1-mucho-gusto y no claves/a2-me-lo-llevo`.
  - `Tareas · el campo para es opcional y ≤ 128; lo demás de tareas sigue igual` (correr también `tareas-reglas.test.mjs`).
  - `Rechazado · un profe rechazado no puede ponerse aprobado`.

- [ ] **Step 2: Correr y ver que fallan**
  Run: `node --test tests/e2e/espacio-reglas.test.mjs`
  Expected: FAIL en los casos nuevos.

- [ ] **Step 3: Escribir las reglas en `database.rules.json`** con las rutas de «Produces».
  - Lectura de `clases/$p/$id`: `auth.uid === $p || data.child('estudiantes').child(auth.uid).exists()`.
  - Unirse en dos escrituras: el estudiante escribe primero `estudiantes/<su uid>` con `invitacion: <codigo>`; la regla de escritura de `alumnos/$p/$e` exige `auth.uid === $e`, `root.child('estudiantes').child($e).child('invitacion').val() === root.child('invitacionDe').child($p).val()` y `root.child('invitaciones').child(root.child('invitacionDe').child($p).val()).child('profe').val() === $p`.
  - `estudiantes/$e/profes/$p` solo puede ponerse en `true` si `alumnos/$p/$e` ya existe (segunda escritura del estudiante).

- [ ] **Step 4: Correr todas las pruebas de reglas**
  Run: `node --test tests/e2e/espacio-reglas.test.mjs tests/e2e/tareas-reglas.test.mjs`
  Expected: PASS todo.

- [ ] **Step 5: `python3 herramientas/verificar.py`** → sin errores. Commit `Espacio: reglas de Firebase (invitaciones, alumnos, grupos, clases, notas, prueba)`. Escribir en «Informe de Claude» de la tarea el aviso de pegar las reglas.

### Task 2: Prueba gratis de un tablero y fin de las vistas previas

**Files:**
- Modify: `assets/abrir.js` (sin sesión de profe, sin `?sala`, sin `?como`)
- Modify: `tableros.html` (modo público: botón «Probar este tablero» en lugar de «Ver vista previa»)
- Modify: `index.html` (tarjetas de muestra: «Probar este tablero»)
- Modify: `entrar.html` (mensaje para `motivo=prueba`)
- Modify: `.github/workflows/tableros.yml`, `herramientas/tablero.py`, `herramientas/verificar.py` (dejar de generar y de exigir `vista/`)
- Delete: `vista/`, `herramientas/vista_previa.mjs` (`assets/sin-creditos.js` se queda: lo carga `abrir.js` para los tableros)
- Test: `tests/e2e/prueba_navegador.py` (nuevo, mismo esqueleto que `tareas_navegador.py`)

**Interfaces:**
- Consumes: `prueba/<uid>` y la lectura de `claves` de la Task 1.
- Produces: `localStorage['la-prueba']` = nombre del tablero de la prueba (solo para la interfaz; la verdad está en Firebase).

- [ ] **Step 1: Prueba de navegador que falla** (`prueba_navegador.py`): visitante sin sesión en `tableros.html` → pulsa «Probar este tablero» en `a1-mucho-gusto` → el tablero abre completo; vuelve al catálogo → los demás dicen «Entrar para abrir» y la tarjeta de su prueba dice «Abrir»; abre `a2-me-lo-llevo.html` directo → acaba en `entrar.html?volver=a2-me-lo-llevo.html&motivo=prueba` con el texto de `entrar.prueba`; un enlace `a1-mucho-gusto.html?sala=XXXX` sigue el camino de sala de siempre. Sin desborde a 390 y 1366.
- [ ] **Step 2: Correr** `python3 tests/e2e/prueba_navegador.py` → falla.
- [ ] **Step 3: Implementar.** En `abrir.js`, `async function probar(nombre)`: con usuario anónimo, si `prueba/<uid>` no existe lo escribe con `nombre`; si existe y es otro, redirige a `entrar.html?volver=<nombre>.html&motivo=prueba`. Solo se llama cuando el catálogo pasa `?probar=1`; abrir la dirección pelada sin sesión y sin prueba hace lo de hoy (llevar a entrar). Textos nuevos: `cat.probar` («Probar este tablero»), `cat.entrarAbrir` («Entrar para abrir»), `entrar.prueba` («Ya usaste tu tablero de prueba. Entra con Google para abrir todos, gratis.»), en es/en/pt.
- [ ] **Step 4: Quitar vistas previas:** borrar `vista/`, el paso «Regenerar todas las vistas previas» y el `git add vista` de `tableros.yml`, la llamada a `generar_vista` y `regenerar` en `tablero.py`, la comprobación de `vista/` en `verificar.py`, `vista/vistas.js` en `tableros.html` e `index.html`, y `herramientas/vista_previa.mjs`.
- [ ] **Step 5: Correr** `python3 tests/e2e/prueba_navegador.py` → pasa; `node --test tests/e2e/*.test.mjs` → pasa; `verificar.py` → sin errores. Commit.

### Task 3: Invitación y lista de estudiantes (profe)

**Files:**
- Create: `assets/espacio.js` — `window.LA_ESPACIO`
- Modify: `panel.html` (pestañas «Estudiantes», «Agenda», «Tareas»; esta tarea llena «Estudiantes»)
- Modify: `assets/i18n.js`
- Test: `tests/e2e/espacio.test.mjs` (lógica con `createFirebaseMock` de `helpers/dom-env.mjs`) y `tests/e2e/espacio_navegador.py` (crece en cada tarea)

**Interfaces:**
- Produces en `LA_ESPACIO`:
  - `invitacion(): Promise<{ codigo: string, enlace: string }>` — la vigente o una nueva (con `nombreProfe` = nombre de la ficha del profe). `enlace` = `<origen>/estudiantes.html?invita=<codigo>`.
  - `nuevaInvitacion(): Promise<{ codigo, enlace }>` — borra la anterior.
  - `alumnos(): Promise<Array<{ uid, nombre, idioma?, nivel?, unido }>>` ordenados por nombre.
  - `actualizarAlumno(uid, { idioma?, nivel? }): Promise<void>`.
  - `quitarAlumno(uid): Promise<void>`.
  - `id10(): string` — 10 caracteres `[0-9a-z]` (lo usan grupos y clases).

- [ ] **Step 1: Pruebas que fallan:** `espacio.test.mjs` → `invitacion() devuelve la misma si ya existe`, `nuevaInvitacion() deja la vieja sin servir`, `alumnos() ordena por nombre con acentos (Ángela antes que Bruno)`, `id10() cumple /^[0-9a-z]{10}$/`. `espacio_navegador.py` → el profe ve su enlace, lo copia (aviso «Enlace copiado»), la lista vacía dice «Comparte tu enlace para que tus estudiantes se unan», y con dos alumnos sembrados se ven con nivel e idioma editables; «Quitar» pide confirmación.
- [ ] **Step 2: Correr y ver que fallan.**
- [ ] **Step 3: Implementar** `espacio.js` y la pestaña. La confirmación de «Quitar» reutiliza el diálogo `dlg-confirmar` que ya existe en `panel.html`.
- [ ] **Step 4: Correr** las dos pruebas + `tareas_navegador.py` (el panel de tareas no se rompe) → pasan. `verificar.py`. Commit.

### Task 4: Unirse y perfil del estudiante (base)

**Files:**
- Modify: `estudiantes.html`, `assets/espacio.js`, `assets/i18n.js`
- Test: `tests/e2e/espacio.test.mjs`, `tests/e2e/espacio_navegador.py`

**Interfaces:**
- Produces en `LA_ESPACIO`:
  - `unirse(codigo): Promise<{ profe: string, nombreProfe: string }>` — exige sesión de Google (usa `LA.conGoogle()` si no hay); lanza `Error('invitacion-vencida')` si el código ya no es el vigente.
  - `miPerfil(): Promise<{ nombre, profes: Array<{ uid, nombre }> }>`.
  - `dejarProfe(uidProfe): Promise<void>`.

- [ ] **Step 1: Pruebas que fallan:** `unirse con código vigente une al estudiante y guarda su nombre de Google`, `unirse con código viejo lanza invitacion-vencida`, `unirse dos veces no duplica`. Navegador: `estudiantes.html?invita=<codigo>` sin sesión → botón «Entrar con Google para unirte a la clase de <nombre del profe>» → tras entrar, perfil con «Tu profe: <nombre>»; código viejo → mensaje claro y nada más; sin `?invita` y sin sesión → la página de repaso de hoy, intacta.
- [ ] **Step 2: Correr y ver que fallan.**
- [ ] **Step 3: Implementar.** El nombre del profe del botón sale de `invitaciones/<codigo>/nombreProfe` (Task 1). Orden de escritura al unirse: `estudiantes/<uid>` (con `invitacion`), luego `alumnos/<profe>/<uid>`, luego `estudiantes/<uid>/profes/<profe>`.
- [ ] **Step 4: Correr** todo + `verificar.py`. Commit.

### Task 5: Agenda de clases (individual, varios o grupo)

**Files:**
- Modify: `panel.html` (pestaña «Agenda»), `assets/espacio.js`, `assets/i18n.js`
- Test: `tests/e2e/espacio.test.mjs`, `tests/e2e/espacio_navegador.py`

**Interfaces:**
- Produces:
  - `grupos(): Promise<Array<{ id, nombre, estudiantes: string[] }>>`, `guardarGrupo(id|null, { nombre, estudiantes: string[] }): Promise<string id>`, `borrarGrupo(id)`.
  - `clases({ desde?: number }): Promise<Array<Clase>>` con `Clase = { id, inicio, zona, tablero, estudiantes: string[], grupo?, sala?, hecha?, nota? }`, ordenadas por `inicio`.
  - `guardarClase(id|null, { inicio, zona, tablero, estudiantes, grupo? }): Promise<string id>` — escribe también `clasesDe/<est>/<profe>/<id>` para cada estudiante y borra los que salieron.
  - `borrarClase(id)`, `marcarHecha(id, nota?)`.
  - `abrirClase(id): Promise<string urlSala>` — abre la sala del tablero como hoy (`vivo.js`) y guarda `sala` en la clase.
  - `fechaLocal(inicio, zona?): string` — `Intl.DateTimeFormat` en la zona de quien mira.

- [ ] **Step 1: Pruebas que fallan:** `guardarClase de grupo copia sus estudiantes en ese momento` (cambiar el grupo después no cambia la clase), `guardarClase escribe y limpia clasesDe`, `fechaLocal(Date.UTC(2026,10,24,23,0), 'America/Bogota')` en `America/Sao_Paulo` → contiene `20:00`. Navegador: crear clase individual, de dos estudiantes y de un grupo; la agenda las ordena por fecha; «Abrir clase» lleva al tablero con `?sala=`; «Marcar como hecha» con nota.
- [ ] **Step 2–4:** correr (falla), implementar, correr todo + `verificar.py`. Commit.

### Task 6: Ficha del estudiante y notas privadas (profe)

**Files:**
- Modify: `panel.html`, `assets/espacio.js`, `assets/tareas.js` (campo `para` al crear tarea), `assets/i18n.js`
- Test: `tests/e2e/espacio.test.mjs`, `tests/e2e/espacio_navegador.py`, `tests/e2e/tareas_navegador.py`

**Interfaces:**
- Produces: `ficha(uidEst): Promise<{ alumno, proximas: Clase[], hechas: Clase[], entregas: Array<{ tarea, tablero, fecha, aciertos, total }> }>`, `nota(uidEst): Promise<string>`, `guardarNota(uidEst, texto): Promise<void>`.
- Las entregas se reconocen por `entregas/<uidEst>` en las tareas del profe (`tareasPorProfe`), dirigidas o no.

- [ ] **Step 1: Pruebas que fallan:** `ficha junta clases hechas y entregas del estudiante y no las de otro`, `guardarNota de 4000 caracteres pasa y 4001 no`. Navegador: abrir ficha desde la lista; ver próximas, hechas (tablero vistos) y entregas con puntaje; escribir nota y que siga al recargar; «Dejar tarea» desde la ficha crea la tarea con `para`.
- [ ] **Step 2–4:** correr (falla), implementar, correr todo + `verificar.py`. Commit.

### Task 7: Perfil completo del estudiante

**Files:**
- Modify: `estudiantes.html`, `assets/espacio.js`, `assets/i18n.js`
- Test: `tests/e2e/espacio.test.mjs`, `tests/e2e/espacio_navegador.py`

**Interfaces:**
- Produces: `miAgenda(): Promise<Array<Clase & { profe, nombreProfe }>>` (lee `clasesDe`), `misTareas(): Promise<Array<{ profe, tarea, tablero, entregada: boolean, aciertos?, total? }>>`.

- [ ] **Step 1: Pruebas que fallan:** `miAgenda junta clases de dos profes ordenadas por inicio`, `miAgenda no incluye clases de un profe que lo quitó`. Navegador: perfil con próxima clase en hora local, botón «Entrar a la clase» solo cuando la clase tiene `sala`, tareas pendientes y hechas, «Tableros vistos» que abren `estudiantes.html?t=<tablero>`; «Dejar a este profe» con confirmación; sin clases → «Tu profe aún no ha agendado clases».
- [ ] **Step 2–4:** correr (falla), implementar, correr todo + `verificar.py`. Commit.

### Task 8: Suscripción fuera, limpieza y verificación final

**Files:**
- Modify: `index.html`, `suscripcion.html` (sin enlaces que lleguen), `tableros.html` (texto del modo público sin suscripción), pie de las páginas, `assets/i18n.js` (quitar claves `sus.*` que ya nadie use), `README.md` (páginas, rutas nuevas de la base, prueba gratis, sin `vista/`)
- Test: todas

- [ ] **Step 1:** `grep -rn "suscripcion.html" --include=*.html .` solo devuelve `suscripcion.html` mismo.
- [ ] **Step 2:** correr `node --test tests/e2e/*.test.mjs`, `python3 tests/e2e/tareas_navegador.py`, `python3 tests/e2e/prueba_navegador.py`, `python3 tests/e2e/espacio_navegador.py`, `python3 herramientas/verificar.py` → todo pasa. Revisión de accesibilidad (axe) de `panel.html` y `estudiantes.html` a 390 y 1366: sin violaciones.
- [ ] **Step 3:** revisión independiente de toda la rama (superpowers:requesting-code-review) antes de pedirle a Arley que publique.
- [ ] **Step 4:** commit; en Notion, la tarea a «Para revisar» con el enlace del pull request.
