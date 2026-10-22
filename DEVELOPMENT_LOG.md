# Bitácora de desarrollo

**Proyecto:** Sistema de Gestión de Tareas (Node.js + Express + TypeScript + PostgreSQL)
**Inicio:** 20 de octubre de 2026

## Herramientas de IA utilizadas

- **Claude (Anthropic):** planificación, explicación del enunciado y de los conceptos,
  generación de los prompts y auditoría de los cambios.
- **Antigravity (Google):** generación del código a partir de los prompts.

Los commits los hago yo, después de revisar el diff de cada cambio.

## Entrada 0: Planificación con Claude

- **Qué hice:** analicé el enunciado con Claude, confirmé que es solo backend, definí
  PostgreSQL con Docker solo para la base de datos y organicé el trabajo por tareas pequeñas.
- **Decisiones que tomé:**
  - Elegí usar Docker para la base de datos porque es una herramienta con la que me siento
    cómodo y seguro. Además, permite que quien evalúe el proyecto levante la misma versión
    de PostgreSQL con un solo comando, sin instalar nada más.
  - Elegí el nombre del repositorio, `sistema-gestion-tareas-api`, para que coincida con
    el título del enunciado y aclare que es una API.

## Entradas de uso de IA

### Entrada 1: Esqueleto del proyecto (20/10/2026)

**Lo que le pedí a Claude:**

> Listo, ya subí la bitácora. Ahora quiero empezar con el código. Primero necesito el esqueleto del proyecto: que tenga las carpetas que pide el enunciado (api, controllers, services, persistence), TypeScript en modo estricto y un servidor Express básico con una ruta de prueba. Es Express, no NestJS. No quiero que Antigravity instale cosas de más ni haga commits. Dame el prompt para dárselo a Antigravity.

**Prompt que Claude me dio y que envié a Antigravity:**

```
CONTEXTO: Voy a construir una API REST de gestión de tareas con Node.js, Express y TypeScript.
Es Express, NO NestJS. La base de datos será PostgreSQL, pero se conectará más adelante.
Trabajo en Windows (PowerShell).

TAREA: crear solo el esqueleto inicial del proyecto, dentro de la carpeta actual.

HACER:
1. Inicializar el proyecto con package.json y configurar TypeScript con tsconfig.json
   en modo estricto (strict: true), rootDir "src" y outDir "dist".
2. Instalar únicamente estas dependencias:
   - producción: express, dotenv
   - desarrollo: typescript, tsx, @types/node, @types/express
3. Crear estas carpetas, cada una con un archivo .gitkeep dentro:
   src/api/routes, src/api/middlewares, src/controllers, src/services,
   src/persistence, src/config, src/utils, src/errors
4. Crear src/app.ts que cree y exporte la aplicación Express (con express.json())
   y tenga una ruta GET /health que responda { "status": "ok" }.
5. Crear src/index.ts que importe la app y la levante en el puerto indicado por la
   variable de entorno PORT (por defecto 3000), cargando dotenv.
6. Scripts en package.json: "dev" (tsx watch src/index.ts), "build" (tsc)
   y "start" (node dist/index.js).
7. Crear .gitignore con: node_modules, dist, .env
8. Crear .env.example con estas variables (sin valores reales):
   PORT=3000
   DB_HOST=
   DB_PORT=
   DB_USER=
   DB_PASSWORD=
   DB_NAME=
   JWT_SECRET=
   JWT_EXPIRES_IN=

NO HACER:
- No instalar ninguna otra dependencia.
- No crear lógica de autenticación, tareas ni base de datos.
- No crear la clase de configuración (la haremos después).
- No crear archivos .env con valores reales.
- No hacer commits ni ejecutar comandos de git.

AL TERMINAR: lista exacta de archivos creados o modificados, las versiones
instaladas de cada dependencia y el comando para probar que /health responde.
```

**Qué pasó:** Antigravity no pudo ejecutar el prompt por errores de red (ver "Retos y soluciones"). Por eso le pedí a Claude los comandos y el contenido de los archivos para crear el esqueleto yo mismo desde la terminal, y los ejecuté y revisé paso a paso.

**Qué se aceptó y por qué:**
- Separar `app.ts` (define la aplicación) de `index.ts` (levanta el servidor), para poder importar la app en pruebas sin abrir un puerto.
- `strict: true` en TypeScript, porque el enunciado pide buenas prácticas de tipado.
- Instalar solo `express` y `dotenv` como dependencias, más las herramientas de desarrollo mínimas, para no cargar el proyecto con paquetes innecesarios.
- Escribir los mensajes de commit en inglés siguiendo Conventional Commits, como en los ejemplos del enunciado.

**Qué se modificó o rechazó y por qué:**
- Claude sugirió el nombre `task-management-api` para el repositorio; lo cambié a `sistema-gestion-tareas-api` para que coincida con el título del enunciado.
- Claude propuso crear `.gitignore` y `.env.example` desde el editor; al hacerlo quedaron dentro de `src/` por error. Los detecté, los borré de ahí y los recreé en la raíz con comandos.

**Verificación realizada:**
- `npm run build` compila sin errores.
- `npm run dev` levanta el servidor y `http://localhost:3000/health` responde `{"status":"ok"}`.
- Revisé `git status` antes del commit y comprobé que `node_modules`, `dist` y `.env` no se suben al repositorio.

### Entrada 2: Configuración centralizada con patrón Singleton (20/10/2026)

**Lo que le pedí a Claude (resumido):**

> Quiero que mejor en el prompt que me vas a dar para Antigravity que haga el singleton de la configuracion y yo lo estudio cuando ya esté hecho, porque la verdad no sé cómo hacerlo. O dime cómo digo yo las reglas y tú lo haces código.

**Qué pasó:** Claude me explicó qué es un Singleton con un ejemplo sencillo y me propuso tres reglas de diseño. Como Antigravity había fallado por red, Claude escribió directamente `src/config/config.ts` y la modificación de `src/index.ts`. Antigravity no se usó en esta tarea.

**Reglas de diseño (propuestas por Claude, que acepté):**
1. Si falta una variable del `.env`, la aplicación no arranca y el error indica cuál falta.
2. Los valores son `readonly`: nadie puede cambiarlos después de cargados.
3. El `.env` se lee una sola vez, en el constructor.

**Qué se aceptó y por qué:**
- Constructor privado y método estático `getInstance()`: es lo que define un Singleton y cumple lo que pide el enunciado.
- Que todas las variables sean obligatorias y fallar al arrancar, porque es mejor un error claro al inicio que un fallo confuso más adelante.
- Validar que `PORT` y `DB_PORT` sean números enteros positivos.
- Dejar de llamar a `dotenv.config()` en `index.ts`, porque ahora lo hace `Config`.
- Poner valores de ejemplo funcionales en `.env.example` (los mismos que usaré con Docker), sin secretos reales.

**Qué se modificó o rechazó y por qué:**
- Usé el código tal como me lo dio Claude, sin modificarlo.
- Generé yo mismo el valor de `JWT_SECRET` con `crypto` en mi máquina; mi `.env` real no se sube porque está en `.gitignore`.

**Verificación realizada:**
- `npm run build` compila sin errores y `/health` sigue respondiendo.
- Vacié `JWT_SECRET` en mi `.env` y comprobé que la aplicación no arranca y dice `Falta la variable de entorno obligatoria: JWT_SECRET`. Luego restauré el valor.
- Escribí `new Config()` fuera de la clase y TypeScript marcó error por el constructor privado.
- `git status` antes del commit: solo aparecen `.env.example`, `src/index.ts` y `src/config/config.ts`; `.env` no aparece.

### Entrada 3: Base de datos PostgreSQL con Docker (21/10/2026)

**Lo que le pedí a Claude** (corregí la ortografía; el sentido es el original):

> Continuemos con la base de datos.

Claude me presentó cuatro decisiones de diseño con opciones y una recomendación para cada una. Mi respuesta (también con la ortografía corregida):

> 1: esos nombres están bien. 2: me parece lo mejor usar UUID. 3: me gusta más usar CHECK. 4: la API no arranca.

Más tarde, después de que Claude me explicara las diferencias, le dije:

> Entonces si es mejor usar autoincremental, usemos autoincremental.

**Qué pasó:** Claude me dio el contenido de `docker-compose.yml`, `schema.sql`, `database.ts`, `init-db.ts` y la nueva versión de `index.ts`, junto con los comandos y las pruebas. Antigravity no se usó en esta tarea. Yo ejecuté todo, revisé los resultados y corregí un problema con el tipo del id (ver "Retos y soluciones").

**Decisiones de diseño que tomé (entre opciones propuestas por Claude):**
1. **Columnas de `tasks` en español** (`titulo`, `descripcion`, `fecha_vencimiento`, `estado`), igual que el enunciado, para que coincida con lo que piden.
2. **Id autoincremental en lugar de UUID.** Primero elegí UUID, pero después de ver las diferencias lo cambié: autoincremental es más simple de leer y probar, y la protección de las tareas ajenas depende de la verificación de dueño, no del tipo de id.
3. **`CHECK` para limitar `estado`** a `pendiente`, `en curso` y `completada`, en lugar de un tipo `ENUM`, porque es más fácil de modificar si cambian los estados.
4. **La API no arranca si la base de datos no responde**, con un mensaje claro. Es el mismo criterio que usé con las variables del `.env`: es mejor fallar al inicio que tener errores confusos después.

**Qué se aceptó y por qué:**
- `postgres:17-alpine` con versión fija en Docker Compose, para que todos usen la misma versión; el Compose lee las variables de mi `.env`, así que los datos de conexión no se repiten en dos lugares.
- Un `healthcheck` en el contenedor, para saber cuándo la base está lista.
- `pg` con un `Pool` de conexiones, que reutiliza conexiones en vez de abrir una por cada petición.
- Consultas SQL directas en la capa `persistence`, sin ORM, para entender exactamente lo que se ejecuta.
- `schema.sql` con `IF NOT EXISTS` y un script `npm run db:init`, que funciona con cualquier PostgreSQL (el de Docker o uno local), no solo con Docker.
- Clave foránea con `ON DELETE CASCADE` de `tasks.user_id` a `users.id`, y un índice sobre `user_id`, porque `GET /tasks` siempre filtra por usuario.
- `email` con restricción `UNIQUE`.

**Qué se modificó o rechazó y por qué:**
- Claude recomendó id autoincremental; yo elegí UUID y luego volví a autoincremental (ver decisión 2).

**Verificación realizada:**
- `docker compose ps` muestra el contenedor `tasks_db` en estado `healthy`.
- `npm run db:init` crea las tablas `users` y `tasks`, y `\dt` en `psql` las lista.
- `npm run build` compila sin errores y `npm run dev` imprime `Conexión a PostgreSQL establecida` antes de levantar el servidor.
- Pruebas manuales con `psql`: un estado inválido es rechazado por el `CHECK`; una tarea con un `user_id` inexistente es rechazada por la clave foránea; una tarea válida queda con estado `pendiente` y las fechas llenas; un email repetido es rechazado por `UNIQUE`.
- Al borrar un usuario de prueba, su tarea se borra también (`ON DELETE CASCADE`).
- Con `docker compose stop`, `npm run dev` termina con el mensaje de error y no arranca el servidor.
- Ejecutar `npm run db:init` por segunda vez no da error.
- `git status` antes del commit: no aparece `.env`.

### Entrada 4: Manejo de errores, validación y log de peticiones con Antigravity (21/10/2026)

**Lo que le pedí a Claude:**

> Hola, ya es hora de continuar en donde lo dejamos anoche. Quisiera adelantar bastante ahorita, tengo 3 horas aproximadamente para trabajar hoy. También me gustaría empezar a que Antigravity nos ayude con el código para poder agilizar más.

Claude me presentó 7 decisiones de diseño con una recomendación para cada una, y respondí:

> ok todas

**Decisiones de diseño que tomé (entre opciones propuestas por Claude):**
1. **Formato del JSON de error:** `{ "status": "error", "code": "...", "message": "...", "details": [...] }`, con `details` solo en errores de validación.
2. **Tarea de otro usuario:** responder 404 y no 403, para no revelar que la tarea existe.
3. **Contraseña:** mínimo 8 y máximo 72 caracteres, porque bcrypt ignora lo que pase de 72 bytes.
4. **Login fallido:** el mismo mensaje ("Credenciales inválidas") para email inexistente y contraseña incorrecta, para no revelar qué emails están registrados.
5. **Email:** se guarda en minúsculas y sin espacios, para que `Ana@x.com` y `ana@x.com` no cuenten como usuarios distintos.
6. **Validación:** AJV con `ajv-formats`, como sugiere el enunciado.
7. **Log de peticiones:** middleware propio, sin librería extra (método, ruta, estado y milisegundos).

**Prompt que Claude me dio y que envié a Antigravity:**

```
CONTEXTO: API REST en Node.js + Express + TypeScript (modo estricto). NO es NestJS.
Estructura existente: src/api/routes, src/api/middlewares, src/controllers, src/services,
src/persistence, src/config, src/utils, src/errors. Ya existen src/app.ts, src/index.ts,
src/config/config.ts (Singleton) y src/persistence/database.ts (Pool de pg).
Trabajo en Windows (PowerShell).

TAREA: crear el manejo centralizado de errores, la validación con AJV y un log de peticiones.

HACER:
1. Instalar únicamente: ajv y ajv-formats. Revisa qué versión de Express hay instalada
   e indícala al terminar.

2. src/errors/AppError.ts: clase base AppError que extiende Error, con propiedades
   readonly: statusCode (number), code (string) y details (opcional).
   Subclases, cada una en su archivo dentro de src/errors, con sus códigos:
   - ValidationError: 400, "VALIDATION_ERROR" (acepta details)
   - AuthenticationError: 401, "AUTHENTICATION_ERROR"
   - ForbiddenError: 403, "FORBIDDEN"
   - NotFoundError: 404, "NOT_FOUND"
   - ConflictError: 409, "CONFLICT"
   Mensajes en español y un mensaje por defecto razonable en cada subclase.

3. src/api/middlewares/errorHandler.ts: manejador central de errores de Express.
   - Si el error es AppError: responder con su statusCode y este JSON:
     { "status": "error", "code": "...", "message": "...", "details": [...] }
     ("details" solo aparece si existe).
   - Si es un error de JSON mal formado del body (lo lanza express.json): responder 400
     con code "VALIDATION_ERROR" y mensaje "El cuerpo de la petición no es un JSON válido".
   - Cualquier otro error: registrarlo con console.error (con el stack) y responder 500
     con code "INTERNAL_ERROR" y mensaje genérico "Error interno del servidor".
     NUNCA enviar el stack ni el mensaje interno al cliente.

4. src/api/middlewares/notFoundHandler.ts: para rutas inexistentes, lanzar NotFoundError
   con mensaje "Ruta no encontrada".

5. src/api/middlewares/validate.ts: función validate(schema, source) donde source es
   'body' | 'params' | 'query'. Usa una instancia única de Ajv con allErrors: true y
   ajv-formats, SIN coerceTypes. Compila el esquema una sola vez. Si la validación falla,
   lanza ValidationError con message "Datos de entrada inválidos" y details como arreglo
   de objetos { field, message } (por ejemplo field "email"). Tipar con los tipos de
   ajv (JSONSchemaType o object), sin "any".

6. src/api/middlewares/requestLogger.ts: al terminar cada respuesta (evento "finish"),
   imprimir una línea con fecha ISO, método, url, código de estado y duración en ms.

7. Modificar src/app.ts: orden de middlewares: requestLogger, express.json(), rutas
   (por ahora solo /health), notFoundHandler y, al final, errorHandler.

REGLAS:
- Prohibido usar "any". Tipado estricto en todo.
- JSDoc en español en las clases y funciones, con comentarios sencillos
  (necesito entender el código para explicarlo).
- Código limpio, un archivo por clase de error.

NO HACER: no instalar otras dependencias, no crear rutas de autenticación ni de tareas,
no tocar config.ts, database.ts ni index.ts, no hacer commits ni usar comandos de git.

AL TERMINAR: lista exacta de archivos creados o modificados, la versión de Express
instalada y cómo probar que una ruta inexistente y un JSON mal formado responden bien.
```

**Auditoría del resultado:** al terminar le pedí a Antigravity un resumen (walkthrough) con este mensaje:

> dame el walkthrough de todo lo que hiciste, necesito auditarlo para saber que todo esté bien y no se haya salido de lo que pedí

Como el walkthrough es lo que Antigravity cuenta de su propio trabajo, no lo tomé como prueba y lo comprobé con comandos. Claude lo revisó conmigo contra el prompt original. Antigravity ejecutó además un comando de solo lectura (`node -e ...`) para leer las versiones de `ajv` y `ajv-formats`; Claude me explicó qué hacía y lo acepté.

**Qué se aceptó y por qué:**
- Las 5 clases de error, cada una en su archivo, con los códigos HTTP y `code` pedidos, porque cumplen exactamente el prompt y mi decisión 1.
- `errorHandler` con tres casos (error propio, JSON mal formado y error inesperado). En el inesperado la respuesta es un texto fijo, así que nunca filtra el stack al cliente.
- `notFoundHandler`, que lanza `NotFoundError` y deja que `errorHandler` arme la respuesta.
- `validate` con una instancia única de AJV (`allErrors: true`, `ajv-formats`, sin `coerceTypes`) y errores como `{ field, message }`.
- `requestLogger` con el evento `finish`, para medir la respuesta completa.
- El orden de middlewares en `app.ts` (logger, `express.json()`, rutas, `notFoundHandler`, `errorHandler`).
- Dependencias instaladas: solo `ajv` 8.20.0 y `ajv-formats` 3.0.1, según el reporte de Antigravity.

**Qué se modificó o rechazó y por qué:**
- Claude me señaló que el walkthrough decía que `Object.setPrototypeOf` es obligatorio al compilar a CommonJS, y eso solo era cierto en targets antiguos; mi `tsconfig` usa `ES2022`. Dejé la línea, que no estorba, pero no repetiré esa explicación.
- **Hallazgo:** en `validate.ts`, si un esquema usa `additionalProperties: false` y llega un campo no permitido, el error se reportaba como campo `"desconocido"`. Le pedí a Antigravity un ajuste puntual para que use el nombre real del campo. Revisé el código resultante y lo acepté (`fix: report additional properties in validation errors`).
- Limitación conocida que no corregí: un cuerpo de petición demasiado grande (más de 100 KB) lo rechaza `express.json()` con un error propio que hoy se responde como 500.
- El caché de esquemas con `WeakMap` es más complicado de lo necesario, porque `validate()` ya se ejecuta una sola vez por ruta; lo dejé, pero sé que es redundante.

**Verificación realizada:**
- `git status`: solo los archivos esperados (`package.json`, `package-lock.json`, `app.ts`, 6 de errores y 4 middlewares). No se tocaron `config.ts`, `database.ts`, `index.ts` ni `.env`.
- `git diff package.json`: solo se añadieron `ajv` y `ajv-formats`.
- Búsqueda de `any` en todos los `.ts` de `src`: sin resultados.
- `npm run build`: compila sin errores.
- Con el servidor corriendo: `GET /ruta-inexistente` responde 404 con `NOT_FOUND`; un `POST` con JSON roto responde 400 con `VALIDATION_ERROR`; `GET /health` responde 200 con `{"status":"ok"}`.
- El log del servidor muestra una línea por petición con fecha, método, ruta, estado y milisegundos.

## Decisiones sin asistencia de IA

1. **Usar Docker solo para la base de datos.** La propuse yo antes de que Claude la recomendara. Razón: me da un entorno reproducible. La API sigue ejecutándose con `npm run dev`, como pide el enunciado, y dejaré en el README una alternativa con PostgreSQL local.
2. **Flujo de trabajo con dos IAs.** Decidí que Antigravity genere el código, que Claude me prepare los prompts y audite los cambios, y que los commits los haga yo después de revisar cada diff. Razón: así reviso todo lo que entra al proyecto y puedo explicarlo.
3. **Nombre del repositorio.** Cambié la sugerencia de Claude (`task-management-api`) por `sistema-gestion-tareas-api`, para que coincida con el título del enunciado.
4. **Estructura del video en cinco partes.** Armé yo el orden: desarrollo y prompts, pruebas en el código, modelo de datos con contraseñas cifradas, pruebas corriendo con cobertura y demostración con Postman. Razón: recorre todo lo que se evalúa, de cómo se construyó a cómo funciona.
5. **Pedirle un walkthrough a Antigravity para auditarlo.** Decidí no aceptar cambios solo por la palabra de la IA: pedí un resumen de lo hecho y lo contrasté con `git status`, `git diff`, una búsqueda de `any`, el build y pruebas con `curl`.

## Retos y soluciones

### Error de red al usar Antigravity (20/10/2026)

Al enviar el primer prompt, Antigravity mostró errores de conexión hacia un servidor de Google (`wsarecv` por tiempo agotado y `wsasend` por conexión cerrada). Comprobé con `Test-NetConnection` que mi equipo sí llegaba al servidor (`TcpTestSucceeded: True`), así que lo traté como una falla intermitente o del servicio. En vez de esperar, decidí crear el esqueleto con comandos de terminal.

### Archivos creados en la carpeta equivocada (20/10/2026)

Al ejecutar `Copy-Item .env.example .env`, PowerShell dijo que el archivo no existía, y `git status` mostraba `node_modules/` y `dist/` como archivos por subir. Esto pasó porque `.gitignore` y `.env.example` no estaban en la raíz: se habían creado dentro de `src/`. Los recreé en la raíz con comandos, borré los duplicados de `src/` y volví a revisar `git status` hasta que solo aparecieron los archivos correctos.

### Esquema creado con el tipo de id equivocado (21/10/2026)

Había decidido usar ids autoincrementales, pero la base de datos quedó creada con UUID, probablemente porque ejecuté `npm run db:init` con la primera versión del esquema antes de cambiarla. Lo noté en las pruebas manuales: el id de un usuario salía como `1fa37976-...` y una inserción falló con el error `column "user_id" is of type uuid but expression is of type integer`. Revisé `schema.sql`, lo dejé con ids autoincrementales, borré el volumen de Docker con `docker compose down -v` para que la base se recreara, volví a ejecutar `npm run db:init` y repetí las pruebas. Aprendí que `CREATE TABLE IF NOT EXISTS` no modifica tablas que ya existen, y que las pruebas manuales sirven para detectar este tipo de errores.

### Base de datos vacía tras recrear el contenedor (21/10/2026)

Al volver a trabajar, `docker compose ps` no mostraba ningún contenedor y `docker compose up -d` creó de nuevo la red y el volumen. La API arrancaba porque solo comprueba que la base responde, pero las tablas ya no existían. Ejecuté `npm run db:init` y confirmé con `\dt` que volvían a estar `users` y `tasks`. Aprendí que, si el volumen se recrea, hay que volver a aplicar el esquema.