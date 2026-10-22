# Sistema de Gestión de Tareas — API REST

API RESTful donde cada usuario puede registrarse, iniciar sesión y administrar **sus propias tareas**. Está construida con Node.js, Express 5, TypeScript y PostgreSQL como prueba técnica de Backend Developer.

## Qué hace

- Registro e inicio de sesión. Las contraseñas se guardan cifradas con bcrypt y el login devuelve un token JWT.
- CRUD de tareas protegido por el token. Cada tarea pertenece a quien la creó: nadie más puede verla, modificarla ni borrarla.
- Validación de todas las entradas con esquemas JSON (AJV).
- Errores centralizados: todas las respuestas de error tienen el mismo formato JSON.
- Documentación interactiva con Swagger UI.
- Log de cada petición (fecha, método, ruta, estado y duración).

## Tecnologías

| Tecnología | Uso |
|---|---|
| Node.js 20 o superior | Entorno de ejecución |
| Express 5 | Framework web |
| TypeScript (modo estricto) | Lenguaje |
| PostgreSQL 17 | Base de datos (con Docker o instalada en el equipo) |
| pg | Driver de PostgreSQL, con consultas SQL parametrizadas (sin ORM) |
| bcrypt | Cifrado de contraseñas |
| jsonwebtoken | Tokens JWT firmados con HS256 |
| AJV y ajv-formats | Validación de entradas |
| swagger-ui-express | Documentación OpenAPI 3.0 |
| dotenv | Variables de entorno |

## Arquitectura

El proyecto está organizado en capas, y cada una tiene una única responsabilidad:

```
src/
├── api/
│   ├── middlewares/   authenticate, validate, errorHandler, notFoundHandler, requestLogger
│   ├── routes/        auth.routes, task.routes
│   └── schemas/       esquemas AJV de entrada (auth y tareas)
├── config/            Config: Singleton que lee y valida el .env una sola vez
├── controllers/       reciben la petición, llaman al servicio y responden
├── services/          lógica de negocio
├── persistence/       única capa que habla con PostgreSQL (repositorios, pool, schema.sql)
├── errors/            AppError y sus subclases (ValidationError, NotFoundError, ...)
├── docs/              documento OpenAPI para Swagger
├── types/             ampliación del tipo Request de Express
├── app.ts             construye la aplicación Express
└── index.ts           comprueba la base de datos y levanta el servidor
```

Recorrido de una petición a una ruta protegida:

```
Petición → requestLogger → express.json → authenticate → validate → controlador
         → servicio → repositorio → PostgreSQL
Cualquier error → errorHandler → respuesta JSON uniforme
```

### Decisiones de diseño

- **Configuración centralizada (Singleton):** `Config` lee el `.env` una sola vez. Si falta una variable, la aplicación no arranca y dice cuál falta.
- **La propiedad de la tarea se comprueba dentro del SQL** (`WHERE id = $1 AND user_id = $2`) en la lectura, la modificación y el borrado. El identificador del usuario sale siempre del token, nunca del cuerpo de la petición.
- **404 en vez de 403:** si una tarea es de otro usuario, la API responde exactamente igual que si no existiera, para no revelar que existe.
- **Login sin pistas:** el mismo mensaje ("Credenciales inválidas") para email inexistente y contraseña incorrecta, y se ejecuta un cálculo de bcrypt aunque el usuario no exista para que los tiempos de respuesta sean parecidos.
- **Email repetido:** se detecta con la restricción `UNIQUE` de PostgreSQL (código `23505`), no consultando antes de insertar.
- **JWT:** se firma y se verifica con HS256 de forma explícita, y se comprueba la estructura del contenido del token.
- **Express 5:** reenvía solo al manejador de errores los rechazos de funciones `async`, por eso los controladores no usan `try/catch` para eso.

## Requisitos previos

- Node.js 20 o superior y npm
- Git
- Docker Desktop (recomendado para la base de datos) o PostgreSQL instalado en el equipo

## Instalación

**1. Clonar el repositorio e instalar las dependencias**

```bash
git clone https://github.com/pip3saavedra77/sistema-gestion-tareas-api.git
cd sistema-gestion-tareas-api
npm install
```

**2. Crear el archivo `.env`**

Windows (PowerShell):

```powershell
Copy-Item .env.example .env
```

macOS o Linux:

```bash
cp .env.example .env
```

Genera un secreto para los tokens y pégalo como valor de `JWT_SECRET` en tu `.env`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**3. Levantar la base de datos**

*Opción A: con Docker (recomendada).* El archivo `.env` debe existir antes, porque Docker Compose lee de ahí el usuario, la contraseña y el nombre de la base de datos.

```bash
docker compose up -d
docker compose ps
```

Espera a que el estado del contenedor `tasks_db` diga `healthy`.

*Opción B: con PostgreSQL instalado en el equipo.* Crea la base de datos y ajusta en el `.env` los valores `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` y `DB_NAME`:

```bash
psql -U postgres -c "CREATE DATABASE tasks_db;"
```

**4. Crear las tablas**

```bash
npm run db:init
```

El script se puede ejecutar varias veces sin problema.

**5. Ejecutar la aplicación**

```bash
npm run dev
```

La API queda en `http://localhost:3000` y la documentación en `http://localhost:3000/docs`.

## Variables de entorno

Todas son obligatorias. Si falta alguna, la aplicación no arranca e indica cuál falta.

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto de la API | `3000` |
| `DB_HOST` | Servidor de PostgreSQL | `localhost` |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `DB_USER` | Usuario de la base de datos | `postgres` |
| `DB_PASSWORD` | Contraseña de la base de datos | `postgres` |
| `DB_NAME` | Nombre de la base de datos | `tasks_db` |
| `JWT_SECRET` | Secreto con el que se firman los tokens (largo y aleatorio) | — |
| `JWT_EXPIRES_IN` | Duración del token | `1h` |

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Inicia la API en modo desarrollo, con reinicio automático |
| `npm run build` | Compila TypeScript a la carpeta `dist` |
| `npm start` | Ejecuta la versión compilada (`dist/index.js`) |
| `npm run db:init` | Crea las tablas en la base de datos configurada |
| `docker compose up -d` | Levanta PostgreSQL en Docker |
| `docker compose stop` | Detiene la base de datos sin borrar los datos |
| `docker compose down -v` | Detiene la base de datos y **borra sus datos** |

## Documentación de la API

Con la aplicación en marcha, abre **http://localhost:3000/docs** para probar los endpoints desde el navegador. El documento OpenAPI en JSON está en `http://localhost:3000/docs.json` y puede importarse en Postman.

Para probar las rutas protegidas: haz login en `POST /auth/login`, copia el token, pulsa **Authorize** y pégalo.

### Endpoints

| Método | Ruta | Requiere token | Descripción | Respuestas |
|---|---|---|---|---|
| GET | `/health` | No | Estado del servicio | 200 |
| POST | `/auth/register` | No | Registrar un usuario | 201, 400, 409 |
| POST | `/auth/login` | No | Iniciar sesión y obtener el token | 200, 400, 401 |
| POST | `/tasks` | Sí | Crear una tarea | 201, 400, 401 |
| GET | `/tasks` | Sí | Listar las tareas del usuario | 200, 401 |
| GET | `/tasks/:id` | Sí | Consultar una tarea del usuario | 200, 400, 401, 404 |
| PUT | `/tasks/:id` | Sí | Modificar una tarea del usuario (solo los campos enviados) | 200, 400, 401, 404 |
| DELETE | `/tasks/:id` | Sí | Eliminar una tarea del usuario | 204, 400, 401, 404 |

### Datos de una tarea

| Campo | Reglas |
|---|---|
| `titulo` | Obligatorio, de 1 a 200 caracteres y con al menos un carácter que no sea espacio |
| `descripcion` | Opcional, máximo 2000 caracteres |
| `fecha_vencimiento` | Opcional, formato `AAAA-MM-DD` |
| `estado` | `pendiente` (por defecto), `en curso` o `completada` |

Las contraseñas deben tener entre 8 y 72 caracteres. Los emails se guardan en minúsculas.

### Formato de los errores

Todos los errores responden con la misma estructura (`details` solo aparece en errores de validación):

```json
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "Datos de entrada inválidos.",
  "details": [{ "field": "password", "message": "must NOT have fewer than 8 characters" }]
}
```

| Código | Estado HTTP | Cuándo ocurre |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Datos inválidos o JSON mal formado |
| `AUTHENTICATION_ERROR` | 401 | Token ausente, inválido o vencido, o credenciales incorrectas |
| `NOT_FOUND` | 404 | La ruta, o la tarea, no existe (o es de otro usuario) |
| `CONFLICT` | 409 | El correo ya está registrado |
| `INTERNAL_ERROR` | 500 | Error inesperado (nunca se envía el detalle interno al cliente) |

### Ejemplo con curl

```bash
# Registro
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Ana","email":"ana@test.com","password":"Clave12345"}'

# Login (devuelve { "token": "..." })
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana@test.com","password":"Clave12345"}'

# Crear una tarea (reemplaza <TOKEN> por el token del login)
curl -X POST http://localhost:3000/tasks \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Comprar leche","fecha_vencimiento":"2026-10-30"}'
```

En Windows PowerShell es más cómodo usar Swagger UI, o `curl.exe --%` con las comillas escapadas.

## Modelo de datos

- **users:** `id`, `nombre`, `email` (único), `password_hash`, `created_at`.
- **tasks:** `id`, `titulo`, `descripcion`, `fecha_vencimiento`, `estado` (restringido a los tres valores permitidos), `user_id` (clave foránea a `users` con borrado en cascada), `created_at`, `updated_at`.

El esquema completo está en `src/persistence/schema.sql`.

## Limitaciones conocidas y mejoras futuras

- No hay pruebas automáticas (eran opcionales). Las verificaciones manuales de cada funcionalidad están documentadas en `DEVELOPMENT_LOG.md`.
- No hay límite de intentos de login.
- `POST /auth/register` revela si un correo ya está registrado (responde 409).
- El formato de `JWT_EXPIRES_IN` no se valida al arrancar: con un valor inválido, el login respondería 500.
- Los mensajes de la lista `details` de los errores de validación están en inglés, porque son los de AJV.
- `PUT /tasks/:id` no permite borrar la fecha de vencimiento de una tarea.
- `GET /tasks` devuelve todas las tareas, sin paginación.
- La lista de estados se define en la capa de esquemas y la capa de persistencia la importa de ahí; lo ideal sería moverla a una carpeta común.
- `npm run db:init` debe ejecutarse con el script de npm (que usa `tsx`), no desde la carpeta `dist`.
- La aplicación no está desplegada en línea.

## Bitácora de desarrollo

El proceso de desarrollo, el uso de asistentes de IA (prompts, qué se aceptó, qué se modificó y cómo se verificó) y los retos encontrados están en [DEVELOPMENT_LOG.md](DEVELOPMENT_LOG.md).