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

### Entrada 5: Registro y login con Antigravity (21 y 22/10/2026)

**Lo que le pedí a Claude** (corregí la ortografía; el sentido es el original):

> Sí, dale, hagamos lo de registro y login, con eso mañana queda menos tarea por realizar. Dame de nuevo el prompt para dárselo a Antigravity.

Las decisiones de diseño de esta tarea (contraseña de 8 a 72 caracteres, mismo mensaje en los dos fallos de login y email normalizado) ya las había tomado en la Entrada 4.

**Prompt que Claude me dio y que envié a Antigravity:**

```
CONTEXTO: API Express 5 + TypeScript estricto (NO NestJS), PostgreSQL con el driver "pg".
Ya existen: Config (Singleton) en src/config/config.ts, pool en src/persistence/database.ts,
errores en src/errors (AppError, ValidationError, AuthenticationError, ConflictError, ...),
middlewares en src/api/middlewares (validate, errorHandler, notFoundHandler, requestLogger)
y src/app.ts. La tabla users tiene: id (entero autoincremental), nombre, email (UNIQUE),
password_hash, created_at.
Express 5 reenvía solo al errorHandler los errores de funciones async: no uses try/catch
solo para reenviar errores.
Trabajo en Windows (PowerShell).

TAREA: registro y login de usuarios.

HACER:
1. Instalar únicamente: bcrypt, jsonwebtoken y, como dev, @types/bcrypt y @types/jsonwebtoken.
   Si bcrypt falla al instalarse por compilación nativa, DETENTE y avísame; no cambies de librería.
2. Capas (una responsabilidad por archivo):
   - src/api/schemas/auth.schemas.ts: esquemas AJV con additionalProperties: false.
     register: nombre (string, 1-100), email (string, format "email", máx 255),
     password (string, 8-72); los tres requeridos.
     login: email (format "email") y password (string, 1-72); ambos requeridos.
   - src/persistence/user.repository.ts: funciones createUser y findByEmail con consultas
     SQL parametrizadas ($1, $2...). Nunca concatenar texto en el SQL.
   - src/services/auth.service.ts: lógica de negocio.
   - src/controllers/auth.controller.ts: recibe req/res y llama al servicio.
   - src/api/routes/auth.routes.ts: POST /register y POST /login con validate(schema, 'body').
   - Registrar las rutas en src/app.ts bajo /auth, antes de notFoundHandler.
3. Registro: normalizar el email (trim + minúsculas) antes de guardar. Hash con bcrypt con
   saltRounds = 10 definido como constante con nombre. Si el email ya existe, lanzar
   ConflictError con mensaje "El correo ya está registrado". Detectarlo capturando el error
   de PostgreSQL con código 23505, NO consultando primero y luego insertando.
   Responder 201 con { id, nombre, email }. NUNCA devolver password_hash.
4. Login: normalizar el email igual; buscar el usuario; comparar con bcrypt.compare.
   Si el usuario no existe o la contraseña no coincide, lanzar AuthenticationError con el
   mismo mensaje "Credenciales inválidas" en ambos casos. Si el usuario no existe, ejecutar
   igual un bcrypt.compare contra un hash falso constante para igualar tiempos de respuesta.
   Si las credenciales son correctas, firmar un JWT: algoritmo HS256 explícito, secreto
   config.jwtSecret, expiresIn config.jwtExpiresIn, payload { sub: id } (id como string).
   Responder 200 con { token }. Resolver el tipado de expiresIn sin "any".
5. Definir interfaces de TypeScript para User (fila de la BD) y para lo que devuelven los
   servicios.

REGLAS: prohibido "any"; JSDoc en español y comentarios sencillos; nunca registrar en logs
ni devolver contraseñas ni hashes; no cambiar la API de los middlewares existentes;
mantener el mismo estilo de imports que usan los middlewares existentes.

NO HACER: no crear el middleware de autenticación ni rutas de tareas, no tocar config.ts,
database.ts ni schema.sql, no instalar otras dependencias, no usar git.

AL TERMINAR: lista de archivos creados o modificados, versiones instaladas y comandos
curl.exe de PowerShell para probar registro, email repetido, login correcto e incorrecto.
```

**Auditoría del resultado:** le pedí a Antigravity un resumen con este mensaje (corregí la ortografía):

> Dame un walkthrough donde me digas qué hiciste y todo lo que creaste con código, para mostrárselo a mi auditor.

Como el walkthrough es lo que Antigravity cuenta de su propio trabajo, lo comprobé con comandos y Claude lo revisó conmigo contra el prompt. Al correr sus propias pruebas, Antigravity creó un usuario de prueba en mi base de datos.

**Qué se aceptó y por qué:**
- Una capa por archivo (esquemas, repositorio, servicio, controlador y rutas), porque separa las responsabilidades como pide el enunciado.
- Consultas parametrizadas (`$1, $2, $3`) en el repositorio, para evitar inyección SQL.
- Detectar el email repetido capturando el error `23505` de PostgreSQL y no consultando antes de insertar. Así no hay una ventana en la que dos registros simultáneos pasen la comprobación.
- Hash con `bcrypt` y `SALT_ROUNDS = 10` como constante con nombre; el hash nunca se devuelve en una respuesta.
- Mismo mensaje ("Credenciales inválidas") para email inexistente y contraseña incorrecta, y un `bcrypt.compare` contra un hash falso cuando el usuario no existe, para que ambos casos tarden parecido.
- JWT con `HS256` explícito, `sub` como texto y expiración tomada de la configuración.
- Esquemas con `additionalProperties: false`, que rechazan campos que no esperamos (por ejemplo un `rol`).
- Dependencias: `bcrypt` ^6.0.0 y `jsonwebtoken` ^9.0.3, más sus tipos.

**Qué se modificó o rechazó y por qué:**
- **Bug que corregí yo:** Claude notó al leer el código que `minLength: 1` aceptaba un nombre de solo espacios y que luego `trim()` lo dejaba vacío. Lo reproduje con `curl`: la API respondió 201 y guardó un usuario con `"nombre":""` (id 5). Agregué `pattern: '\\S'` al campo `nombre` de `registerSchema` y repetí la misma petición: ahora responde 400 con `"field":"nombre"` (`fix: reject blank names in register schema`).
- **Afirmaciones del walkthrough que no acepté tal cual**, según me señaló Claude: dice que firmar con `HS256` previene el ataque `alg: none`, pero eso se previene al *verificar* el token indicando los algoritmos permitidos, y lo haré en el middleware de autenticación. También habla de "cero conversiones inseguras", pero hay un cast en `jwtExpiresIn`. El formato `email` de AJV es una validación simplificada, no el RFC 5322 completo, y los análisis de complejidad O(1) son relleno que no usaré.
- **Limitaciones conocidas que no corregí:** `Config` no valida el formato de `JWT_EXPIRES_IN` (con un valor inválido, el login respondería 500); el 409 revela que un email ya está registrado; y no hay límite de intentos de login.

**Verificación realizada:**
- `git status`, `git diff package.json`, búsqueda de `any` en `src` (sin resultados) y `npm run build` sin errores.
- Pruebas con `curl` (resultado real de cada una):
  - Registro de `ana@test.com`: 201 con `{id, nombre, email}`, sin hash.
  - El mismo correo con mayúsculas (`ANA@test.com`): 409.
  - Login con contraseña incorrecta: 401 "Credenciales inválidas".
  - Login con email inexistente: 401 con exactamente el mismo cuerpo y el mismo `Content-Length` (84).
  - Login correcto: 200 con token.
  - Campo extra `rol`: 400 con `"field":"rol"`.
  - Contraseña de 3 caracteres: 400 con el detalle en `password`.
- Consulta a la base de datos: los emails se guardan en minúsculas y `password_hash` empieza con `$2b$10$`, es decir, un hash de bcrypt y no la contraseña.
- Tiempos en el log del servidor: 71 ms (contraseña incorrecta), 50 ms (email inexistente) y 56 ms (login correcto). Son del mismo orden de magnitud, así que no se distingue por tiempo si un email existe.

### Entrada 6: Middleware de autenticación y CRUD de tareas con Antigravity (22/10/2026)

**Lo que le pedí a Claude** (corregí la ortografía; el sentido es el original):

> Ya revisé que el diff está todo correcto, también realicé el commit, listo.

Claude me presentó 6 decisiones de diseño con una recomendación para cada una. Antes de enviar el prompt, comprobé que cubría el enunciado y le pregunté:

> Estoy de acuerdo en todo

**Decisiones de diseño que tomé (entre opciones propuestas por Claude):**
1. `PUT /tasks/:id` cambia solo los campos que se envían (mínimo uno), sin exigir la tarea completa.
2. `DELETE` responde 204 sin cuerpo.
3. `fecha_vencimiento` con formato AAAA-MM-DD, y se permiten fechas pasadas.
4. Una tarea ajena o inexistente responde 404 en ambos casos, y la propiedad se comprueba dentro del SQL (`WHERE id = $1 AND user_id = $2`).
5. `GET /tasks` ordenado por id y sin paginación, porque el enunciado no la pide.
6. Token ausente o inválido responde 401, con mensajes distintos para cada caso.

**Prompt que Claude me dio y que envié a Antigravity:**

```
CONTEXTO: API Express 5 + TypeScript estricto (NO NestJS), PostgreSQL con el driver "pg".
Ya existen: Config (Singleton) en src/config/config.ts, pool en src/persistence/database.ts,
errores en src/errors (AppError, ValidationError, AuthenticationError, NotFoundError, ...),
middlewares en src/api/middlewares (validate, errorHandler, notFoundHandler, requestLogger),
el módulo de autenticación (auth.schemas.ts, user.repository.ts, auth.service.ts,
auth.controller.ts, auth.routes.ts) y src/app.ts. El login emite un JWT HS256 firmado con
config.jwtSecret cuyo payload es { sub: "<id del usuario como texto>" }.
La tabla tasks tiene: id (entero autoincremental), titulo, descripcion (opcional),
fecha_vencimiento (DATE, opcional), estado ('pendiente' | 'en curso' | 'completada',
por defecto 'pendiente'), user_id (FK a users), created_at, updated_at.
Express 5 reenvía solo al errorHandler los errores de funciones async: no uses try/catch
solo para reenviar errores.
Trabajo en Windows (PowerShell).

TAREA: middleware de autenticación y CRUD de tareas, donde cada usuario solo accede a sus
propias tareas.

HACER:
1. No instalar dependencias nuevas (jsonwebtoken ya está instalado).
2. src/types/express.d.ts: ampliar el tipo Request de Express con la propiedad opcional
   user?: { id: number } mediante "declare global { namespace Express { interface Request {...} } }"
   y un "export {}" al final.
3. src/api/middlewares/authenticate.ts:
   - Leer la cabecera Authorization con formato "Bearer <token>". Si falta o no tiene ese
     formato, lanzar AuthenticationError con mensaje "Token de autenticación requerido".
   - Verificar con jwt.verify usando el secreto config.jwtSecret y la opción
     algorithms: ['HS256'] (obligatorio).
   - Si el token es inválido o expiró, lanzar AuthenticationError con mensaje
     "Token inválido o expirado".
   - El resultado de jwt.verify puede ser string u objeto: comprobar con una función de guarda
     de tipos que sea un objeto con "sub" de tipo string formado solo por dígitos; convertirlo
     a número y guardarlo en req.user = { id }. Si no cumple, lanzar el mismo
     AuthenticationError "Token inválido o expirado". Sin "any" ni "as unknown as".
   - Exportar también una función requireUserId(req): number que devuelva req.user.id o lance
     AuthenticationError si no existe. Sin usar el operador "!".
4. src/api/schemas/task.schemas.ts (AJV, additionalProperties: false en todos):
   - Definir UNA sola vez la lista de estados como constante "as const" y derivar el tipo
     TaskStatus.
   - createTaskSchema: titulo (string, 1-200, con pattern '\\S'), descripcion (string, máx 2000),
     fecha_vencimiento (string con format "date", es decir AAAA-MM-DD), estado (uno de los 3
     valores). Solo titulo es obligatorio.
   - updateTaskSchema: las mismas propiedades, ninguna obligatoria, minProperties: 1.
   - taskIdParamsSchema: id string con pattern '^[1-9][0-9]{0,8}$', obligatorio.
5. src/persistence/task.repository.ts: consultas SQL parametrizadas ($1, $2...), nunca
   concatenar texto.
   - Interface Task: id, titulo, descripcion (string | null), fecha_vencimiento (string | null),
     estado (TaskStatus), user_id.
   - En TODAS las consultas que devuelvan filas, devolver fecha_vencimiento como texto
     AAAA-MM-DD con fecha_vencimiento::text AS fecha_vencimiento, para que el driver no la
     convierta a un objeto Date.
   - Funciones: createTask(userId, data), findAllByUser(userId) ordenado por id ascendente,
     findByIdAndUser(id, userId), updateByIdAndUser(id, userId, data),
     deleteByIdAndUser(id, userId).
   - La propiedad de la tarea se comprueba EN EL SQL: "WHERE id = $1 AND user_id = $2" en
     select, update y delete. Así una tarea ajena y una inexistente son indistinguibles.
   - El UPDATE usa COALESCE para cambiar solo los campos enviados, sin construir SQL dinámico:
     SET titulo = COALESCE($3, titulo), descripcion = COALESCE($4, descripcion),
     fecha_vencimiento = COALESCE($5::date, fecha_vencimiento), estado = COALESCE($6, estado),
     updated_at = NOW(), pasando null para los campos no enviados.
   - updateByIdAndUser devuelve la tarea o null; deleteByIdAndUser devuelve boolean.
   - En createTask, si PostgreSQL devuelve el código 23503 (violación de clave foránea, por
     ejemplo un token de un usuario que ya fue borrado), lanzar AuthenticationError con
     mensaje "Token inválido o expirado".
6. src/services/task.service.ts: createTask, listTasks, getTask, updateTask, deleteTask.
   Si el repositorio devuelve null o false, lanzar NotFoundError con mensaje
   "Tarea no encontrada" (tanto si no existe como si pertenece a otro usuario: nunca 403).
7. src/controllers/task.controller.ts: obtener el id del usuario con requireUserId(req) y el
   id de la tarea con Number(req.params.id). Respuestas: POST 201 con la tarea; GET lista 200
   con un arreglo; GET por id 200; PUT 200 con la tarea actualizada; DELETE 204 sin cuerpo.
8. src/api/routes/task.routes.ts: aplicar authenticate a todo el router con
   router.use(authenticate). POST / con validate(createTaskSchema,'body'); GET /;
   GET /:id con validate(taskIdParamsSchema,'params'); PUT /:id con
   validate(taskIdParamsSchema,'params') y validate(updateTaskSchema,'body');
   DELETE /:id con validate(taskIdParamsSchema,'params').
9. Modificar src/app.ts: app.use('/tasks', taskRoutes) después de /auth y antes de
   notFoundHandler.

REGLAS: prohibido "any"; prohibido el operador "!"; JSDoc en español y comentarios sencillos;
mismo estilo de imports que los archivos existentes; nunca registrar el token en los logs.

NO HACER: no tocar config.ts, database.ts, schema.sql, validate.ts, errorHandler.ts ni el
módulo de autenticación existente; no instalar paquetes; no usar git.

AL TERMINAR: lista de archivos creados o modificados.
```

**Auditoría del resultado:** le volví a pedir a Antigravity un resumen con el mismo mensaje de la Entrada 5. Ese resumen no incluía ninguna prueba ejecutada, solo que el código compilaba, así que hice yo las pruebas. Claude lo revisó conmigo contra el prompt.

**Qué se aceptó y por qué:**
- `authenticate` verifica el token con `algorithms: ['HS256']`, que es lo que faltaba al firmar en el login para rechazar tokens con `alg: none`, comprueba que `sub` sea un texto numérico y guarda el id en `req.user`. `requireUserId` no usa el operador `!`.
- La propiedad de la tarea se comprueba dentro del SQL (`WHERE id = $1 AND user_id = $2`) en la consulta, la modificación y el borrado. Una tarea ajena y una inexistente responden igual (404), como decidí en la Entrada 4.
- El `user_id` sale del token y nunca del cuerpo; como los esquemas llevan `additionalProperties: false`, un `user_id` enviado por el cliente se rechaza.
- `fecha_vencimiento::text`, para que el driver no convierta la fecha en un objeto `Date` y la corra un día por la zona horaria.
- Actualización parcial con `COALESCE` en una sola sentencia, sin construir SQL dinámico.
- La lista de estados se define una sola vez (`TASK_STATUSES`) y de ahí sale el tipo `TaskStatus`.
- `taskIdParamsSchema` con `^[1-9][0-9]{0,8}$`, así que `/tasks/abc` responde 400 y no llega a la base de datos.
- `router.use(authenticate)` protege todas las rutas de tareas, y `app.ts` monta `/tasks` antes de `notFoundHandler`.
- Usé el código tal como lo entregó Antigravity, sin modificarlo.

**Qué se modificó o rechazó y por qué:**
- **Observaciones de Claude que dejé como limitaciones conocidas:** la capa `persistence` importa `TaskStatus` desde `api/schemas` (una capa inferior depende de una superior; lo ideal sería una carpeta común); los esquemas de crear y actualizar repiten las mismas propiedades; los controladores usan `req.body as CreateTaskData`, un cast que es seguro solo porque `validate` corre antes en la ruta; y `PUT` no permite borrar la fecha de vencimiento.
- **Afirmaciones del resumen que no repetiré:** "Zero-Trust" y "Row-Level Tenancy" son etiquetas que no explican nada, y el resumen habla de transaccionalidad, pero no hay transacciones: cada operación es una sola sentencia SQL, que ya es atómica. La comprobación de dueño va en la misma sentencia que la acción, y eso es lo que evita la condición de carrera.
- **Hallazgo:** en la prueba de `PUT` con cuerpo vacío (`{}`) la API responde 400, que es correcto, pero el detalle decía `"field":"desconocido"`. Lo corregí en la Entrada 7.

**Verificación realizada:**
- `git status` muestra 7 archivos nuevos (`express.d.ts`, `authenticate.ts`, `task.schemas.ts`, `task.repository.ts`, `task.service.ts`, `task.controller.ts` y `task.routes.ts`) y `app.ts` modificado. `package.json` no cambió, porque no se instaló nada.
- Búsqueda de `any` en `src`: sin resultados. `npm run build`: sin errores.
- **Sin token válido** (los tres con 401): sin cabecera ("Token de autenticación requerido"), con un token inventado y con un token con `alg: none` (ambos "Token inválido o expirado").
- **Ana crea tareas:** 201 con `"estado":"pendiente"` por defecto y `"fecha_vencimiento":"2026-10-30"` sin correrse de día; 201 con `"estado":"en curso"`; 400 con `"field":"user_id"` al intentar enviar un `user_id` en el cuerpo; 400 con `"field":"estado"` con un estado inventado.
- **Luis intenta tocar la tarea de Ana:** su lista de tareas es `[]`, y leer, modificar y borrar la tarea de Ana responde 404 "Tarea no encontrada" en los tres casos.
- **Ana sobre lo suyo:** la tarea seguía intacta después de los intentos de Luis; `PUT` con `{"estado":"en curso"}` cambia solo el estado (200); `PUT` con `{}` responde 400; `GET /tasks/abc` responde 400; `DELETE` responde 204 y después `GET` responde 404.
- El log del servidor muestra los mismos códigos de estado que las respuestas.

### Entrada 7: Documentación con Swagger (22/10/2026)

**Lo que le pedí a Claude:** esta tarea no la pedí con un mensaje mío. Después de las pruebas del CRUD, Claude propuso Swagger como el siguiente paso obligatorio (la sección 5 del enunciado) con cuatro decisiones de diseño, y yo las acepté al enviar el prompt a Antigravity.

**Decisiones de diseño que tomé (entre opciones propuestas por Claude):**
1. El documento OpenAPI se escribe a mano en un solo archivo (`src/docs/openapi.ts`), no con comentarios en cada ruta: es más fácil de revisar y está tipado. La desventaja es que puede desactualizarse si cambian las rutas.
2. La interfaz queda en `/docs` y el JSON en `/docs.json`.
3. Se documentan todas las respuestas reales de cada endpoint (200, 201, 204, 400, 401, 404 y 409), con ejemplos.
4. Los textos van en español.

**Prompt que Claude me dio y que envié a Antigravity:**

```
CONTEXTO: API Express 5 + TypeScript estricto (NO NestJS). Rutas existentes:
GET /health; POST /auth/register; POST /auth/login; POST /tasks; GET /tasks;
GET /tasks/:id; PUT /tasks/:id; DELETE /tasks/:id (las de /tasks exigen la cabecera
Authorization: Bearer <token>). Los esquemas de validación están en src/api/schemas
(auth.schemas.ts y task.schemas.ts, que exporta TASK_STATUSES). Formato de error de la API:
{ "status": "error", "code": "...", "message": "...", "details": [{ "field": "...", "message": "..." }] }
("details" solo aparece en errores de validación). Trabajo en Windows (PowerShell).

TAREA: documentar la API con OpenAPI 3.0 y mostrarla con Swagger UI en /docs.

HACER:
1. Instalar únicamente: swagger-ui-express y, como dev, @types/swagger-ui-express.
   No instalar swagger-jsdoc ni ninguna otra librería.
2. Crear src/docs/openapi.ts que exporte el documento OpenAPI 3.0.3 como un objeto escrito a
   mano (sin comentarios YAML dentro de las rutas):
   - info: title "API de Gestión de Tareas", version "1.0.0", description en español.
   - servers: [{ url: '/' }].
   - tags: Health, Auth, Tasks.
   - components.securitySchemes.bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }.
   - components.schemas: ErrorResponse, ValidationErrorResponse (con details), RegisterRequest,
     RegisteredUser, LoginRequest, LoginResponse, Task, CreateTaskRequest, UpdateTaskRequest.
     Los valores del enum de estado se toman de TASK_STATUSES (importado), no se copian a mano.
     Los límites (longitudes, patrones, additionalProperties: false, minProperties: 1)
     deben coincidir con los de los esquemas AJV existentes: léelos y replícalos.
   - paths: documentar TODOS los endpoints con summary, description, requestBody cuando
     aplique, parámetro de ruta id (entero positivo) y TODAS las respuestas reales, con ejemplos:
       GET /health: 200.
       POST /auth/register: 201, 400, 409.
       POST /auth/login: 200, 400, 401.
       POST /tasks: 201, 400, 401.
       GET /tasks: 200, 401.
       GET /tasks/{id}: 200, 400, 401, 404.
       PUT /tasks/{id}: 200, 400, 401, 404.
       DELETE /tasks/{id}: 204, 400, 401, 404.
     Los endpoints de /tasks llevan security: [{ bearerAuth: [] }]; los de /auth y /health no.
     En los 404 de /tasks/{id} aclarar que también se devuelve cuando la tarea pertenece a
     otro usuario.
   - Todos los textos en español.
3. Modificar src/app.ts: montar swagger-ui-express en '/docs' (serve + setup con el documento)
   y exponer el documento en GET '/docs.json'. Ambos después de las rutas existentes y antes
   de notFoundHandler.
4. Tipado: sin "any". No instalar openapi-types; usa un tipo propio sencillo o un objeto
   "as const".

REGLAS: JSDoc en español en lo que exportes; prohibido "any" y el operador "!"; mismo estilo de
imports que los archivos existentes; no cambiar el comportamiento de ninguna ruta existente.

NO HACER: no tocar esquemas AJV, controladores, servicios, repositorios ni config; no instalar
otras dependencias; no usar git.

AL TERMINAR: lista de archivos creados o modificados y las versiones instaladas.
```

**Qué pasó:** Antigravity quedó esperando la finalización de una verificación en segundo plano, aunque los archivos ya estaban escritos (`src/docs/openapi.ts` y `src/app.ts`). Los comprobé yo con comandos.

**Qué se aceptó y por qué:**
- Dependencias: solo `swagger-ui-express` y sus tipos.
- Un documento OpenAPI 3.0.3 escrito a mano, con 9 esquemas, 8 endpoints y todas las respuestas reales, con ejemplos en español.
- El enum de estados se importa de `TASK_STATUSES` y no se copia a mano, así que si cambian los estados, la documentación cambia sola.
- Los límites de los esquemas (longitudes, patrones, `additionalProperties`, `minProperties`) coinciden con los esquemas AJV reales.
- Los endpoints de `/tasks` tienen el candado de `bearerAuth`; los de `/auth` y `/health` no.
- En los 404 de `/tasks/{id}` se aclara que también se devuelve cuando la tarea es de otro usuario.
- La interfaz en `/docs` y el JSON en `/docs.json`, montados antes de `notFoundHandler`.

**Qué se modificó o rechazó y por qué:**
- **Hallazgo propio:** al probar Swagger noté que dos ejemplos no coincidían con lo que la API responde de verdad. Listé todos los `message:` del archivo con `Select-String`, los comparé con las respuestas de mis pruebas y encontré cuatro ejemplos con otro texto: `Los datos proporcionados no son válidos.` (la API dice `Datos de entrada inválidos.`), `No autenticado. Por favor, inicia sesión para continuar.` (la API dice `Token de autenticación requerido`), `El email ya está registrado.` (la API dice `El correo ya está registrado`) y `La tarea solicitada no existe.` (la API dice `Tarea no encontrada`). Los corregí a mano con buscar y reemplazar.
- Un quinto ejemplo (el 400 de `PUT` con cuerpo vacío) tenía `field: ''`, mientras que la API devolvía `"desconocido"`. Cambié `validate.ts` para que ese caso se llame `cuerpo` (`fix: name the request body in root-level validation errors`) y pasé el mismo valor al ejemplo de la documentación.

**Verificación realizada:**
- `git status` antes del commit: solo `package.json`, `package-lock.json`, `src/app.ts` y `src/docs/openapi.ts`. Búsqueda de `any` en `src` sin resultados y `npm run build` sin errores.
- Leí `/docs.json` desde la terminal: lista los 8 endpoints con los códigos de respuesta esperados y los 9 esquemas.
- Comprobé que los límites de `RegisterRequest`, `LoginRequest`, `CreateTaskRequest` y `UpdateTaskRequest` coinciden con los esquemas AJV, y que el enum de estados sale igual en `CreateTaskRequest`, `UpdateTaskRequest` y `Task`.
- En la interfaz de `/docs`: hice login desde Swagger, pulsé **Authorize** y `GET /tasks` respondió 200 con mis tareas; después de **Logout**, el mismo endpoint respondió 401 "Token de autenticación requerido". También probé crear tareas con `POST /tasks`, `DELETE` (204) y `PUT` con `{}`, que responde 400 con `"field":"cuerpo"`.
- Swagger no rompió nada: `/ruta-inexistente` responde 404 con `NOT_FOUND`, `/health` responde 200 y `/docs.json` responde 200 con el documento.
### Entrada 8: Revisión externa y correcciones con Claude Code (22/10/2026)

**Lo que le pedí a Claude:**

> puedes darme un prompt para daarle a code y que el mismo haga eso que dices para agilizar esto rapido

**Contexto:** antes de grabar el video quise una segunda opinión independiente. Le di a una sesión nueva de Claude Code este prompt, que me preparó Claude, para que evaluara el repositorio como lo haría un evaluador técnico:

```
Revisa este repositorio como lo haría un evaluador técnico de Instaleap para un
aprendiz de Backend. Es una API REST de gestión de tareas (Node.js, Express 5,
TypeScript, PostgreSQL). Requisitos: capas (api, controllers, services,
persistence), config con Singleton y .env.example, registro y login con bcrypt
y JWT, middleware Bearer, CRUD de tareas solo para su dueño, validación con
AJV, errores propios con manejador central, Swagger, JSDoc, Conventional
Commits, README y DEVELOPMENT_LOG.md (uso de IA, decisiones propias, retos).
Recorre carpeta por carpeta, intenta instalar, compilar y levantar la API, y
dime con sinceridad qué falla, qué falta y qué mejorarías. No modifiques nada.
```

El informe confirmó que la instalación y el arranque funcionan, y encontró fallos reales. Se los mostré a Claude, que los clasificó y me propuso corregir los de mayor impacto el mismo día. Para eso me dio este prompt, que envié a Claude Code:

```
Trabaja en este repositorio (sistema-gestion-tareas-api). Aplica SOLO los
cambios de abajo, sin refactors extra, sin cambiar el estilo del resto del
código y sin agregar dependencias nuevas. NO hagas commits ni push; déjalo todo
sin commitear para que yo revise el diff. No toques mi .env real ni mi
contenedor tasks_db del puerto 5432: para verificar levanta un PostgreSQL
desechable en otro puerto (ej. 55432) con un .env temporal fuera del repo, y
bórralo al terminar.

CAMBIOS:

1. DEVELOPMENT_LOG.md, sección "Decisiones sin asistencia de IA", decisión 4:
   reemplázala completa por este texto exacto:
   "4. **Estructura del video.** Armé yo el orden: presentación, estructura del
   proyecto, configuración y base de datos, demostración en Swagger, seguridad,
   uso de IA y bitácora, y cierre. Razón: el enunciado pide explicar lo que
   hice, así que primero muestro cómo está construido y luego lo muestro
   funcionando. Mi plan inicial incluía pruebas automáticas con cobertura, pero
   las pruebas eran opcionales y no las implementé; lo dejo declarado en el
   README."
   No modifiques nada más de ese archivo.

2. Cuerpo demasiado grande: en src/api/middlewares/errorHandler.ts, el error de
   express.json() con err.type === 'entity.too.large' debe responder 413 con el
   formato de siempre ({status:'error', code:'PAYLOAD_TOO_LARGE', message}).
   Añade esa fila a la tabla de errores del README.

3. Fecha 0000-01-01 causa 500: en src/api/schemas/task.schemas.ts, rechaza
   fechas con año 0000 en fecha_vencimiento (crear y actualizar) para que
   responda 400 de validación. Comprueba también que 2026-02-30 da 400.

4. JWT_EXPIRES_IN inválido causa 500 en el login: en src/config/config.ts valida
   al arrancar que tenga formato número + unidad (s, m, h o d; ej. 1h, 30m) y
   que sea mayor que cero; si no, error claro al arrancar. Valida también que
   JWT_SECRET tenga al menos 32 caracteres. NO rechaces el valor de ejemplo de
   .env.example (debe seguir arrancando con él).

5. Contraseña medida en bytes: bcrypt solo usa los primeros 72 bytes. Haz que
   registro y login rechacen con 400 contraseñas de más de 72 BYTES UTF-8
   (Buffer.byteLength), no solo 72 caracteres, con un mensaje claro en el campo
   password. Mantén la validación dentro del sistema AJV existente (por ejemplo
   con una palabra clave personalizada en validate.ts) y actualiza la nota en el
   README y en src/docs/openapi.ts.

6. src/api/middlewares/authenticate.ts: acepta el esquema "Bearer" sin importar
   mayúsculas/minúsculas (RFC 7235), manteniendo el resto igual.

7. src/services/auth.service.ts: quita el trim() del email en normalizeEmail
   (AJV ya rechaza emails con espacios antes de llegar ahí); deja el
   toLowerCase().

8. package.json: "main" debe ser "dist/index.js"; añade "description" y
   "engines": {"node": ">=20"}. No inventes "author".

9. README.md, sección "Limitaciones conocidas": quita lo que quedó resuelto
   (JWT_EXPIRES_IN sin validar) y añade: "Un token de un usuario eliminado
   sigue pasando el middleware: GET /tasks responde 200 con lista vacía y
   POST /tasks responde 401."

VERIFICACIÓN (con el PostgreSQL desechable): npm run build sin errores; y con
curl comprueba y muéstrame la respuesta de cada caso:
 - cuerpo de 200 KB a POST /auth/login -> 413
 - fecha_vencimiento "0000-01-01" y "2026-02-30" -> 400
 - arrancar con JWT_EXPIRES_IN=unahora y con JWT_SECRET=corto -> no arranca y
   explica por qué; con el .env.example tal cual -> arranca
 - registro con 36 "ñ" + 36 "A" (más de 72 bytes) -> 400; con 8 caracteres
   normales -> 201
 - "authorization: bearer <token>" en minúsculas -> 200 en GET /tasks
 - regresión: register, login, CRUD completo y aislamiento entre dos usuarios
   siguen funcionando.

AL TERMINAR: lista exacta de archivos modificados, los resultados reales de cada
prueba (sin inventar ninguno) y un mensaje de commit sugerido por cambio, en
inglés y con formato Conventional Commits. Si algún punto no se pudo hacer o
verificar, dilo claramente.
```

**Qué se aceptó y por qué:**
- Corregir los cuerpos de más de 100 KB (ahora 413), la fecha con año 0000 y la duración del JWT inválida, porque un dato del cliente nunca debería provocar un error 500.
- Medir la contraseña en bytes. `bcrypt` solo usa los primeros 72 bytes, así que dos contraseñas distintas podían comportarse como la misma. Se hizo con una palabra clave propia de AJV (`maxBytes`).
- Validar al arrancar que `JWT_SECRET` tenga al menos 32 caracteres y que `JWT_EXPIRES_IN` tenga formato número + unidad (`s`, `m`, `h` o `d`). Es más estricto que la librería, y eso lo acepté a propósito.
- Aceptar `Bearer` sin distinguir mayúsculas, como indica la RFC 7235.
- Quitar el `trim()` del email: AJV rechaza los espacios antes de que llegue al servicio, así que nunca se ejecutaba.
- Corregir `main` y añadir `description` y `engines` en `package.json`.
- Corregir la decisión 4 de "Decisiones sin asistencia de IA", que decía que el video mostraba pruebas con cobertura cuando el repositorio no tiene pruebas automáticas.

**Qué se modificó o rechazó y por qué:**
- Elegí que Code trabajara en una rama nueva (`fix/review-findings`) y no en `main`, para revisar el diff antes de combinar.
- Revisé el diff completo y los commits los hice yo. En vez de los 9 commits que sugirió Code, hice 8: dejé `README.md` y `DEVELOPMENT_LOG.md` juntos en un solo commit de documentación, porque el README cambia por tres motivos distintos y separarlos exigía `git add -p`.
- No corregí todo lo del informe, solo lo que cabía con seguridad antes de entregar. Quedan sin hacer: pruebas automáticas, ESLint y Prettier, `helmet`, cierre ordenado del servidor y el estilo mezclado entre archivos. El caso del token de un usuario eliminado lo dejé documentado como limitación en el README, porque corregirlo bien exige una consulta extra por petición.
- Code señaló dos pendientes que no hizo por no estar en mi prompt: la tabla de variables del README no menciona el mínimo de `JWT_SECRET` ni el formato de `JWT_EXPIRES_IN`, y `openapi.ts` no menciona el patrón de la fecha. No los corregí.

**Verificación realizada:**
- Code reportó haber probado cada caso contra un PostgreSQL desechable en otro puerto, sin tocar mi `.env` ni mi contenedor.
- Yo hice mis propias pruebas con mi `.env` real, y todas dieron el resultado esperado:
  - `npm run build` compila sin errores.
  - `npm run dev` arranca con las validaciones nuevas de configuración.
  - Un cuerpo de 200 KB enviado desde un archivo responde 413 `PAYLOAD_TOO_LARGE`.
  - En Swagger, crear una tarea con `fecha_vencimiento` `0000-01-01` responde 400.
- Revisé `git status` antes de cada commit y comprobé que `.env` y `dist` no se suben.
## Decisiones sin asistencia de IA

1. **Usar Docker solo para la base de datos.** La propuse yo antes de que Claude la recomendara. Razón: me da un entorno reproducible. La API sigue ejecutándose con `npm run dev`, como pide el enunciado, y dejo en el README una alternativa con PostgreSQL local.
2. **Flujo de trabajo con dos IAs.** Decidí que Antigravity genere el código, que Claude me prepare los prompts y audite los cambios, y que los commits los haga yo después de revisar cada diff. Razón: así reviso todo lo que entra al proyecto y puedo explicarlo.
3. **Nombre del repositorio.** Cambié la sugerencia de Claude (`task-management-api`) por `sistema-gestion-tareas-api`, para que coincida con el título del enunciado.
4. **Estructura del video.** Armé yo el orden: presentación, estructura del proyecto, configuración y base de datos, demostración en Swagger, seguridad, uso de IA y bitácora, y cierre. Razón: el enunciado pide explicar lo que hice, así que primero muestro cómo está construido y luego lo muestro funcionando. Mi plan inicial incluía pruebas automáticas con cobertura, pero las pruebas eran opcionales y no las implementé; lo dejo declarado en el README.
5. **Pedirle un walkthrough a Antigravity para auditarlo.** Decidí no aceptar cambios solo por la palabra de la IA: pedí un resumen de lo hecho y lo contrasté con `git status`, `git diff`, una búsqueda de `any`, el build y pruebas con `curl`.
6. **Comprobar el prompt del CRUD contra el enunciado antes de enviarlo.** Antes de dárselo a Antigravity pregunté dónde estaba cada requisito de la sección 3 del enunciado (los cinco endpoints y la asociación de cada tarea con su creador). Razón: no quería enviar un prompt sin estar seguro de que cubría todo lo que piden.

## Retos y soluciones

### Error de red al usar Antigravity (20/10/2026)

Al enviar el primer prompt, Antigravity mostró errores de conexión hacia un servidor de Google (`wsarecv` por tiempo agotado y `wsasend` por conexión cerrada). Comprobé con `Test-NetConnection` que mi equipo sí llegaba al servidor (`TcpTestSucceeded: True`), así que lo traté como una falla intermitente o del servicio. En vez de esperar, decidí crear el esqueleto con comandos de terminal.

### Archivos creados en la carpeta equivocada (20/10/2026)

Al ejecutar `Copy-Item .env.example .env`, PowerShell dijo que el archivo no existía, y `git status` mostraba `node_modules/` y `dist/` como archivos por subir. Esto pasó porque `.gitignore` y `.env.example` no estaban en la raíz: se habían creado dentro de `src/`. Los recreé en la raíz con comandos, borré los duplicados de `src/` y volví a revisar `git status` hasta que solo aparecieron los archivos correctos.

### Esquema creado con el tipo de id equivocado (21/10/2026)

Había decidido usar ids autoincrementales, pero la base de datos quedó creada con UUID, probablemente porque ejecuté `npm run db:init` con la primera versión del esquema antes de cambiarla. Lo noté en las pruebas manuales: el id de un usuario salía como `1fa37976-...` y una inserción falló con el error `column "user_id" is of type uuid but expression is of type integer`. Revisé `schema.sql`, lo dejé con ids autoincrementales, borré el volumen de Docker con `docker compose down -v` para que la base se recreara, volví a ejecutar `npm run db:init` y repetí las pruebas. Aprendí que `CREATE TABLE IF NOT EXISTS` no modifica tablas que ya existen, y que las pruebas manuales sirven para detectar este tipo de errores.

### Base de datos vacía tras recrear el contenedor (21/10/2026)

Al volver a trabajar, `docker compose ps` no mostraba ningún contenedor y `docker compose up -d` creó de nuevo la red y el volumen. La API arrancaba porque solo comprueba que la base responde, pero las tablas ya no existían. Ejecuté `npm run db:init` y confirmé con `\dt` que volvían a estar `users` y `tasks`. Aprendí que, si el volumen se recreó, hay que volver a aplicar el esquema.

### Nombre de solo espacios aceptado en el registro (22/10/2026)

Al auditar el registro, descubrí que `POST /auth/register` aceptaba un nombre como `"   "` y guardaba un usuario con el nombre vacío. Lo reproduje con `curl` (respondió 201 con `"nombre":""`) y lo corregí en el esquema con `pattern: '\\S'`, que exige al menos un carácter que no sea un espacio. Después comprobé que la misma petición responde 400. Aprendí que `minLength` cuenta los espacios como caracteres y que conviene probar los casos límite, no solo los datos correctos.

### Comandos pegados en una sola línea (22/10/2026)

Al pegar tres comandos `curl.exe --%` seguidos, PowerShell los tomó como una sola línea: `--%` le pasa a `curl` todo lo que viene después, y salió el error `curl: option --%: is unknown`. Ejecuté cada comando por separado y funcionaron. Aprendí a pegar los comandos de uno en uno.

### Campo "desconocido" en el error de cuerpo vacío (22/10/2026)

Al probar `PUT /tasks/:id` con `{}`, la API respondía 400 correctamente, pero el detalle decía `"field":"desconocido"`, porque el error de AJV (`minProperties`) no apunta a ningún campo concreto. Cambié la última línea de `buildFieldName` en `validate.ts` para que devuelva `cuerpo` y repetí la prueba: ahora responde `"field":"cuerpo"`.

### Ejemplos de Swagger que no coincidían con la API (22/10/2026)

Al revisar la documentación, noté que algunos ejemplos de error no decían lo mismo que la API. Listé todos los `message:` de `openapi.ts`, los comparé con mis pruebas y corregí a mano cuatro mensajes más el nombre de campo vacío del ejemplo de `PUT`. Aprendí que la documentación escrita por una IA puede verse correcta y no coincidir con el comportamiento real, y que hay que contrastarla con la API.

### Confusión con "Try it out" en Swagger (22/10/2026)

Pensé que los pasos de `PUT` en Swagger estaban mal, porque no aparecía ninguna respuesta del servidor. En realidad el campo `id` estaba vacío, y Swagger no envía la petición mientras un parámetro obligatorio esté vacío. También confundía los ejemplos de la sección "Responses" (que son documentación fija) con la respuesta real, que aparece más arriba en "Server response". Escribí el `id` y el cuerpo `{}`, y la respuesta fue la esperada (400 con `"field":"cuerpo"`).

### Contradicción entre la bitácora y el repositorio (22/10/2026)

La revisión externa de Claude Code encontró que mi decisión 4 de "Decisiones sin asistencia de IA" describía un video con "pruebas en el código" y "pruebas corriendo con cobertura", pero el repositorio no tiene pruebas automáticas. Había escrito esa estructura al inicio, como plan, y no la actualicé cuando decidí no hacer las pruebas opcionales. Corregí la decisión para que diga lo que realmente se hizo y mantuve la limitación declarada en el README.

### Falso negativo al probar caracteres no ASCII con curl (22/10/2026)

Al verificar el límite de contraseña en bytes, Code probó 36 letras "ñ" (exactamente 72 bytes) con `curl` en Git Bash sobre Windows y la respuesta fue un rechazo, cuando debía aceptarse. Comprobó con Node, enviando UTF-8 correcto, que el código sí funciona: 72 bytes pasan y 73 se rechazan. El problema era la codificación de `curl` en esa terminal, no el código. Aprendí que una prueba fallida puede estar mal hecha, y que conviene confirmar con una segunda herramienta antes de tocar el código.