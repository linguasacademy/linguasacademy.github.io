# Espacio de trabajo del profe y perfil del estudiante · diseño

Fecha: 22 nov 2026 · Autor: Claude con Arley (dueño de Lingua's Academy)

## Intención y por qué

Arley quiere que **lleguen profes** a Lingua's Academy. El público son profes de idiomas autónomos que ya trabajan en Preply o italki, o que tienen su propia escuela. Inspiración: el espacio del profe y el del estudiante en Preply e italki, pero **sin** conseguirle estudiantes al profe: el profe trae los suyos y Lingua's le da un lugar de trabajo completo.

Es una **prueba** para saber si el espacio atrae profes. Si funciona, después vendrá un perfil público del profe (decidido: no ahora) y quizá un mercado con pagos (otro proyecto).

Éxito: un profe nuevo prueba un tablero sin cuenta, entra con Google, invita a sus estudiantes con su enlace y organiza con ellos clases, tareas y avances desde Lingua's.

## Objetivos

1. **Prueba gratis de un tablero.** Un visitante sin cuenta puede abrir **un solo tablero completo** para verlo y recorrerlo él mismo (sin sala en vivo ni tareas). Para abrir otro, o para usarlo con un estudiante, debe entrar con Google.
2. **Entrada directa del profe.** Quien entra con Google queda aprobado al instante: sin solicitud ni revisión manual. Acceso a todos los tableros, gratis (no hay suscripción por ahora).
3. **Espacio del profe** (`panel.html`):
   - Su **enlace de invitación** para estudiantes (copiar, y crear uno nuevo si el anterior se filtró).
   - **Lista de estudiantes**: nombre, idioma, nivel.
   - **Grupos**: el profe arma grupos con nombre (por ejemplo «B1 martes») a partir de sus estudiantes.
   - **Agenda**: clases con fecha y hora, tablero y quién asiste: un solo estudiante (clase individual), varios estudiantes o un grupo. Desde una clase se abre la sala en vivo de ese tablero, y todos los que asisten ven «Entrar a la clase».
   - **Ficha de cada estudiante**: próximas clases, clases hechas (tableros vistos), tareas con sus resultados y **notas privadas del profe**.
   - Las **tareas** que ya existen siguen ahí, y ahora pueden ir dirigidas a un estudiante.
4. **Perfil del estudiante** (`estudiantes.html`):
   - El estudiante abre el enlace de invitación de su profe, entra con Google y queda unido a ese profe.
   - Ve su perfil: próxima clase (con botón «Entrar a la clase» cuando la sala está abierta), tareas pendientes y hechas, y tableros vistos.
   - Puede tener más de un profe.
5. **Quitar las vistas previas actuales** (`vista/`) del catálogo y de la portada; las reemplaza la prueba gratis.

## Lo que no se hace (no objetivos)

- Pagos, suscripción, comisiones.
- Perfil público del profe, buscador de profes, reseñas, mensajes entre profe y estudiante.
- Sincronizar con Google Calendar o enviar recordatorios por correo.
- Cambiar el contenido de los tableros.
- La idea de Notion sobre el cursor en la clase en vivo (va aparte).

## Lo que haría fracasar esto aunque funcione (anti-objetivos)

- Que se rompan las clases en vivo o las tareas que los profes ya usan.
- Pedirle al estudiante una contraseña o pasos de más: entra con Google y listo.
- Que un estudiante vea las notas privadas del profe o datos de otro estudiante.
- Que un tablero quede abierto a cualquiera sin límite (los tableros son el valor del sitio).

## Restricciones

- **Base actual:** sitio estático en GitHub Pages + Firebase (Authentication y Realtime Database del proyecto que ya existe). Sin servidor propio.
- **Reglas de Firebase:** viven en `database.rules.json` y **Arley las pega a mano** en la consola de Firebase. El plan debe agrupar los cambios de reglas para que sean pocas veces, y decirle exactamente cuándo.
- Tres idiomas de interfaz (es, en, pt) con `assets/i18n.js`.
- Sistema de diseño nuevo: `assets/tokens.css`, `assets/componentes.css`, `estilo.html`, y `site.css` ya con la paleta nueva.
- Accesibilidad AA y «reducir movimiento». Fotos sin créditos. Sin textos de relleno.
- Nada a `main` sin el visto bueno de Arley: se trabaja en la rama `claude/trabajo-diario` y pull request.
- `herramientas/verificar.py` debe seguir pasando (es la prueba del repositorio en GitHub Actions).

## Enfoques considerados

1. **Sobre la base actual (GitHub Pages + Firebase Realtime Database)** — elegido por Arley. Rápido, sin costos, no toca lo que funciona. Costo: Arley pega reglas nuevas a mano; consultas sencillas.
2. Firestore en el mismo proyecto: mejor estructura, pero obliga a migrar salas y tareas o mantener dos bases. Descartado: más riesgo sin ganancia para una prueba.
3. Servidor propio (Supabase o Python): necesario el día que haya pagos. Descartado ahora: varias veces más grande y antes de saber si llegan profes.

## Decisiones de Arley

- Primera opción (espacio de trabajo, sin conseguir estudiantes ni pagos), como prueba.
- El estudiante tiene su propio perfil, al que llega con el enlace de su profe.
- Prueba gratis: un solo tablero sin cuenta, solo para verlo y recorrerlo él mismo (no toca las clases en vivo); después, entrar con Google. Se quitan las vistas previas actuales.
- También hay clases en grupo, además de las individuales.
- Sin suscripción por ahora.
- Enfoque 1 (base actual).

## Decisiones de Claude (Arley puede corregirlas)

- **Un enlace de invitación por profe**, reutilizable (no uno por estudiante): más fácil de compartir en Preply o WhatsApp. El profe puede crear uno nuevo, y el viejo deja de servir.
- **El estudiante entra con Google** al aceptar la invitación, como el profe. Así su perfil es suyo y no depende de guardar un enlace secreto.
- **Cuentas nuevas solo con Google**, como dijo Arley. Las cuentas con correo y contraseña que ya existen siguen entrando.
- **Una cuenta es de profe o de estudiante según por dónde entra**: con la invitación es estudiante; con «Registrarse» o «Entrar» es profe. Si un estudiante entra por «Registrarse», queda como profe; no se bloquea porque no hay nada que cobrar.
- **Los profes que hoy están en «pendiente» pasan a aprobados** la próxima vez que entren.
- **Límite conocido de la prueba gratis:** se guarda qué tablero usó cada visitante anónimo. Quien borre los datos de su navegador puede probar otro. Aceptable para una prueba (Arley lo sabe).
- **El historial de tableros vistos** sale de las clases que el profe marca como hechas en la agenda, más las tareas entregadas. No se registra automáticamente qué abrió el estudiante por su cuenta.
- **Las entregas de tareas se reconocen por la cuenta del estudiante:** si el estudiante entró con Google, su entrega queda en su ficha aunque la tarea no fuera dirigida a él.
- **La agenda guarda la fecha y hora con zona horaria** y se muestra en la hora local de quien la mira (profe y estudiante pueden estar en países distintos).
- **Una clase en grupo guarda la lista de asistentes del momento**: si el grupo cambia después, las clases pasadas no cambian.
- **La prueba gratis empieza con un botón explícito** («Probar este tablero» en el catálogo), no al cargar la dirección de un tablero. Así un estudiante que abre un enlace viejo de sala o de tarea no gasta ni recibe una prueba sin querer. Los enlaces de sala y de tarea siguen funcionando igual que hoy.
- **«Tablero visto» en el perfil del estudiante abre su práctica** (`estudiantes.html?t=`), no el tablero completo: el estudiante no necesita leer `claves` y los tableros no quedan abiertos sin límite.
- **Quien está en «rechazado» sigue bloqueado.** Solo se aprueban a sí mismas las cuentas de Google y las de correo que ya existían; `admin.html` conserva el botón de rechazar.
- **El profe puede quitar a un estudiante y el estudiante puede dejar a un profe.** Al quitarlo, el estudiante deja de ver las clases y la ficha de ese profe. Va en el primer cambio de reglas, para no pedirle a Arley pegarlas dos veces.
- **Suscripción:** el enlace sale del pie y del catálogo, y el texto del catálogo deja de mencionarla. El archivo `suscripcion.html` se queda sin enlaces, por si vuelve.
- **Página del estudiante:** `estudiantes.html` muestra el perfil si el estudiante entró; si no, lo de hoy (repaso con el enlace de la clase) más «Entrar con Google» para quien tiene invitación.

## Modelo de datos propuesto (Realtime Database)

Nombres en español, como el resto de la base.

```
profes/<uidProfe>            (ya existe) estado pasa a 'aprobado' al entrar con Google
invitaciones/<codigo>        { profe: uidProfe, creada }               código aleatorio de 12 caracteres
invitacionDe/<uidProfe>      <codigo>                                  la invitación vigente del profe
estudiantes/<uidEst>         { nombre, creado, profes: { <uidProfe>: true } }
alumnos/<uidProfe>/<uidEst>  { nombre, idioma, nivel, unido }
                             lo leen el profe y ese estudiante; el profe edita idioma y nivel
grupos/<uidProfe>/<idGrupo>  { nombre, estudiantes: { <uidEst>: true } }   solo el profe
clases/<uidProfe>/<id>       { inicio (ms UTC), zona, tablero, estudiantes: { <uidEst>: true },
                               grupo?, sala?, hecha?, nota? }
                             la lee el profe y cada estudiante que asiste; solo el profe escribe;
                             sala = sala en vivo abierta para esa clase
clasesDe/<uidEst>/<uidProfe>/<id>  true                                índice para que el estudiante
                                                                       encuentre sus clases; lo escribe el profe
notas/<uidProfe>/<uidEst>    texto                                     solo el profe
prueba/<uidAnonimo>          <nombreTablero>                           se escribe una sola vez
claves/<tablero>             (ya existe) además la lee quien tenga prueba/<uid> === <tablero>
tareas/<c>                   (ya existe) nuevo campo opcional: para (uidEst)
```

Reglas clave:
- `invitaciones/<codigo>` se puede leer con el código (para unirse); solo su profe la crea o la borra.
- Unirse: el estudiante escribe `estudiantes/<su uid>` y `alumnos/<uidProfe>/<su uid>` (solo nombre y unido) si `invitaciones/<codigo>/profe === uidProfe` y el código está vigente en `invitacionDe`.
- `prueba/<uid>`: solo el propio usuario anónimo, solo si no existe, y el valor debe ser un tablero del catálogo (que tenga clave en `claves`).
- Los profes ya no necesitan aprobación: **ya está hecho** en la rama (fase 4, porción 1, commit 80e2c75): la ficha nace «aprobado» y las cuentas en «pendiente» se activan solas. Falta que Arley pegue esas reglas; se pegan junto con las de este proyecto.

## Lo que queda al constructor

- Orden de los pasos, dentro de estas prioridades: (1) entrada directa del profe y prueba gratis; (2) invitación y perfil del estudiante; (3) agenda, ficha y notas; (4) quitar vistas previas y limpiar.
- Diseño de cada pantalla con los componentes de `componentes.css` y el sistema de `estilo.html`.
- Textos en es, en y pt, cortos y sin relleno.
- Cómo comprobar las reglas de Firebase sin tocar la base real (por ejemplo, con el emulador de Firebase) y las pruebas de cada pantalla.
- Qué hacer con `admin.html` (seguirá sirviendo para ver profes; ya no hay solicitudes).
