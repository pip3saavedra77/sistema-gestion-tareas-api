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

**Lo que le pedí a Claude** 

> Continuemos con la base de datos.

Claude me presentó cuatro decisiones de diseño con opciones y una recomendación para cada una. Mi respuesta:

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

## Decisiones sin asistencia de IA

1. **Usar Docker solo para la base de datos.** La propuse yo antes de que Claude la recomendara. Razón: me da un entorno reproducible. La API sigue ejecutándose con `npm run dev`, como pide el enunciado, y dejaré en el README una alternativa con PostgreSQL local.
2. **Flujo de trabajo con dos IAs.** Decidí que Antigravity genere el código, que Claude me prepare los prompts y audite los cambios, y que los commits los haga yo después de revisar cada diff. Razón: así reviso todo lo que entra al proyecto y puedo explicarlo.
3. **Nombre del repositorio.** Cambié la sugerencia de Claude (`task-management-api`) por `sistema-gestion-tareas-api`, para que coincida con el título del enunciado.

## Retos y soluciones

### Error de red al usar Antigravity (20/10/2026)

Al enviar el primer prompt, Antigravity mostró errores de conexión hacia un servidor de Google (`wsarecv` por tiempo agotado y `wsasend` por conexión cerrada). Comprobé con `Test-NetConnection` que mi equipo sí llegaba al servidor (`TcpTestSucceeded: True`), así que lo traté como una falla intermitente o del servicio. En vez de esperar, decidí crear el esqueleto con comandos de terminal.

### Archivos creados en la carpeta equivocada (20/10/2026)

Al ejecutar `Copy-Item .env.example .env`, PowerShell dijo que el archivo no existía, y `git status` mostraba `node_modules/` y `dist/` como archivos por subir. Esto pasó porque `.gitignore` y `.env.example` no estaban en la raíz: se habían creado dentro de `src/`. Los recreé en la raíz con comandos, borré los duplicados de `src/` y volví a revisar `git status` hasta que solo aparecieron los archivos correctos.

### Esquema creado con el tipo de id equivocado (21/10/2026)

Había decidido usar ids autoincrementales, pero la base de datos quedó creada con UUID, probablemente porque ejecuté `npm run db:init` con la primera versión del esquema antes de cambiarla. Lo noté en las pruebas manuales: el id de un usuario salía como `1fa37976-...` y una inserción falló con el error `column "user_id" is of type uuid but expression is of type integer`. Revisé `schema.sql`, lo dejé con ids autoincrementales, borré el volumen de Docker con `docker compose down -v` para que la base se recreara, volví a ejecutar `npm run db:init` y repetí las pruebas. Aprendí que `CREATE TABLE IF NOT EXISTS` no modifica tablas que ya existen, y que las pruebas manuales sirven para detectar este tipo de errores.