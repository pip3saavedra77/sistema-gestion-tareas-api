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

**Qué pasó:** Antigravity no pudo ejecutar el prompt por errores de red. Por eso le pedí a Claude los comandos y el contenido de los archivos para crear el esqueleto yo mismo desde la terminal, y los ejecuté y revisé paso a paso.

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

## Decisiones sin asistencia de IA

1. **Usar Docker solo para la base de datos.** La propuse yo antes de consultarlo con
   Claude. Razón: me da un entorno reproducible. La API sigue ejecutándose con
   `npm run dev`, como pide el enunciado, y dejo en el README una alternativa con
   PostgreSQL local.
2. **Nombre del repositorio.** (Explicado en la Entrada 0.)

## Retos y soluciones

### Error de red al usar Antigravity (20/10/2026)

Al enviar el primer prompt, Antigravity mostró errores de conexión hacia un servidor de Google (`wsarecv` por tiempo agotado y `wsasend` por conexión cerrada). Comprobé con `Test-NetConnection` que mi equipo sí llegaba al servidor (`TcpTestSucceeded: True`), así que lo traté como una falla intermitente o del servicio. En vez de esperar, decidí crear el esqueleto con comandos de terminal.

### Archivos creados en la carpeta equivocada (20/10/2026)

Al ejecutar `Copy-Item .env.example .env`, PowerShell dijo que el archivo no existía, y `git status` mostraba `node_modules/` y `dist/` como archivos por subir. Esto pasó porque `.gitignore` y `.env.example` no estaban en la raíz: se habían creado dentro de `src/`. Los recreé en la raíz con comandos, borré los duplicados de `src/` y volví a revisar `git status` hasta que solo aparecieron los archivos correctos.