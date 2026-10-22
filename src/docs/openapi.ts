import { TASK_STATUSES } from '../api/schemas/task.schemas.js';

/**
 * Metadatos descriptivos de la especificación de la API.
 */
export interface OpenApiInfo {
  title: string;
  version: string;
  description: string;
}

/**
 * Definición del servidor de alojamiento de la API.
 */
export interface OpenApiServer {
  url: string;
  description?: string;
}

/**
 * Categoría semántica para organizar las operaciones de la API.
 */
export interface OpenApiTag {
  name: string;
  description?: string;
}

/**
 * Estructura de nivel superior del documento OpenAPI 3.0.3.
 */
export interface OpenApiDocument {
  openapi: string;
  info: OpenApiInfo;
  servers: ReadonlyArray<OpenApiServer>;
  tags: ReadonlyArray<OpenApiTag>;
  paths: Record<string, Record<string, unknown>>;
  components: {
    securitySchemes: Record<string, unknown>;
    schemas: Record<string, unknown>;
  };
}

/**
 * Documento OpenAPI 3.0.3 completo para la API de Gestión de Tareas.
 * Define esquemas, esquemas de seguridad y la especificación detallada de cada endpoint.
 */
export const openApiDocument: OpenApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'API de Gestión de Tareas',
    version: '1.0.0',
    description:
      'API RESTful construida con Express 5 y TypeScript para la administración y seguimiento de tareas personales con autenticación JWT.',
  },
  servers: [
    {
      url: '/',
      description: 'Servidor base relativo',
    },
  ],
  tags: [
    {
      name: 'Health',
      description: 'Comprobación de estado y disponibilidad del servicio.',
    },
    {
      name: 'Auth',
      description: 'Operaciones de autenticación y registro de usuarios.',
    },
    {
      name: 'Tasks',
      description: 'Gestión y control de tareas asociadas al usuario autenticado.',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Autenticación mediante JSON Web Token utilizando el encabezado Authorization.',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'error',
          },
          code: {
            type: 'string',
            example: 'AUTHENTICATION_ERROR',
          },
          message: {
            type: 'string',
            example: 'Token de autenticación requerido',
          },
        },
        required: ['status', 'code', 'message'],
        additionalProperties: false,
      },
      ValidationErrorResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'error',
          },
          code: {
            type: 'string',
            example: 'VALIDATION_ERROR',
          },
          message: {
            type: 'string',
            example: 'Datos de entrada inválidos.',
          },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: {
                  type: 'string',
                  example: 'email',
                },
                message: {
                  type: 'string',
                  example: 'must match format "email"',
                },
              },
              required: ['field', 'message'],
              additionalProperties: false,
            },
            example: [
              {
                field: 'email',
                message: 'must match format "email"',
              },
            ],
          },
        },
        required: ['status', 'code', 'message', 'details'],
        additionalProperties: false,
      },
      RegisterRequest: {
        type: 'object',
        properties: {
          nombre: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
            pattern: '\\S',
            example: 'Juan Pérez',
          },
          email: {
            type: 'string',
            format: 'email',
            maxLength: 255,
            example: 'juan.perez@example.com',
          },
          password: {
            type: 'string',
            minLength: 8,
            maxLength: 72,
            example: 'PasswordSeguro123!',
          },
        },
        required: ['nombre', 'email', 'password'],
        additionalProperties: false,
      },
      RegisteredUser: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1,
          },
          nombre: {
            type: 'string',
            example: 'Juan Pérez',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'juan.perez@example.com',
          },
        },
        required: ['id', 'nombre', 'email'],
        additionalProperties: false,
      },
      LoginRequest: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'juan.perez@example.com',
          },
          password: {
            type: 'string',
            minLength: 1,
            maxLength: 72,
            example: 'PasswordSeguro123!',
          },
        },
        required: ['email', 'password'],
        additionalProperties: false,
      },
      LoginResponse: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
        },
        required: ['token'],
        additionalProperties: false,
      },
      Task: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1,
          },
          titulo: {
            type: 'string',
            example: 'Implementar documentación OpenAPI',
          },
          descripcion: {
            type: 'string',
            nullable: true,
            example: 'Diseñar la especificación técnica en OpenAPI 3.0.3 con Swagger UI.',
          },
          fecha_vencimiento: {
            type: 'string',
            format: 'date',
            nullable: true,
            example: '2026-12-31',
          },
          estado: {
            type: 'string',
            enum: [...TASK_STATUSES],
            example: 'en curso',
          },
          user_id: {
            type: 'integer',
            example: 1,
          },
        },
        required: ['id', 'titulo', 'descripcion', 'fecha_vencimiento', 'estado', 'user_id'],
        additionalProperties: false,
      },
      CreateTaskRequest: {
        type: 'object',
        properties: {
          titulo: {
            type: 'string',
            minLength: 1,
            maxLength: 200,
            pattern: '\\S',
            example: 'Configurar Swagger UI',
          },
          descripcion: {
            type: 'string',
            maxLength: 2000,
            example: 'Montar la interfaz visual en la ruta /docs.',
          },
          fecha_vencimiento: {
            type: 'string',
            format: 'date',
            example: '2026-11-15',
          },
          estado: {
            type: 'string',
            enum: [...TASK_STATUSES],
            example: 'pendiente',
          },
        },
        required: ['titulo'],
        additionalProperties: false,
      },
      UpdateTaskRequest: {
        type: 'object',
        properties: {
          titulo: {
            type: 'string',
            minLength: 1,
            maxLength: 200,
            pattern: '\\S',
            example: 'Configurar Swagger UI y esquemas',
          },
          descripcion: {
            type: 'string',
            maxLength: 2000,
            example: 'Validar coincidencia estricta con esquemas AJV.',
          },
          fecha_vencimiento: {
            type: 'string',
            format: 'date',
            example: '2026-11-20',
          },
          estado: {
            type: 'string',
            enum: [...TASK_STATUSES],
            example: 'completada',
          },
        },
        minProperties: 1,
        additionalProperties: false,
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Verificar el estado del servicio',
        description: 'Comprueba la disponibilidad operativa de la API.',
        responses: {
          '200': {
            description: 'Servicio en funcionamiento correcto.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      example: 'ok',
                    },
                  },
                  required: ['status'],
                  additionalProperties: false,
                },
                example: {
                  status: 'ok',
                },
              },
            },
          },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registrar un nuevo usuario',
        description: 'Crea una nueva cuenta de usuario en el sistema con contraseña cifrada mediante bcrypt.',
        requestBody: {
          description: 'Datos requeridos para el registro de la cuenta.',
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RegisterRequest',
              },
              example: {
                nombre: 'Juan Pérez',
                email: 'juan.perez@example.com',
                password: 'PasswordSeguro123!',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Usuario registrado exitosamente.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RegisteredUser',
                },
                example: {
                  id: 1,
                  nombre: 'Juan Pérez',
                  email: 'juan.perez@example.com',
                },
              },
            },
          },
          '400': {
            description: 'Error de validación en los campos del cuerpo de la petición.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ValidationErrorResponse',
                },
                example: {
                  status: 'error',
                  code: 'VALIDATION_ERROR',
                  message: 'Datos de entrada inválidos.',
                  details: [
                    {
                      field: 'password',
                      message: 'must NOT have fewer than 8 characters',
                    },
                  ],
                },
              },
            },
          },
          '409': {
            description: 'El correo electrónico ya se encuentra registrado.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  status: 'error',
                  code: 'CONFLICT',
                  message: 'El correo ya está registrado',
                },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Iniciar sesión',
        description: 'Autentica a un usuario verificando sus credenciales y emite un token JWT.',
        requestBody: {
          description: 'Credenciales de acceso del usuario.',
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginRequest',
              },
              example: {
                email: 'juan.perez@example.com',
                password: 'PasswordSeguro123!',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Autenticación exitosa y generación del token JWT.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginResponse',
                },
                example: {
                  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0...',
                },
              },
            },
          },
          '400': {
            description: 'Error de validación en los datos de autenticación.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ValidationErrorResponse',
                },
                example: {
                  status: 'error',
                  code: 'VALIDATION_ERROR',
                  message: 'Datos de entrada inválidos.',
                  details: [
                    {
                      field: 'email',
                      message: 'must match format "email"',
                    },
                  ],
                },
              },
            },
          },
          '401': {
            description: 'Credenciales inválidas proporcionadas.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  status: 'error',
                  code: 'AUTHENTICATION_ERROR',
                  message: 'Credenciales inválidas',
                },
              },
            },
          },
        },
      },
    },
    '/tasks': {
      post: {
        tags: ['Tasks'],
        summary: 'Crear una nueva tarea',
        description: 'Registra una nueva tarea asociada al usuario autenticado.',
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          description: 'Datos de la tarea a registrar.',
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateTaskRequest',
              },
              example: {
                titulo: 'Revisar logs de auditoría',
                descripcion: 'Analizar trazas de seguridad en el servicio de autenticación.',
                fecha_vencimiento: '2026-11-01',
                estado: 'pendiente',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Tarea creada con éxito.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Task',
                },
                example: {
                  id: 1,
                  titulo: 'Revisar logs de auditoría',
                  descripcion: 'Analizar trazas de seguridad en el servicio de autenticación.',
                  fecha_vencimiento: '2026-11-01',
                  estado: 'pendiente',
                  user_id: 1,
                },
              },
            },
          },
          '400': {
            description: 'Error de validación en el cuerpo de la petición.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ValidationErrorResponse',
                },
                example: {
                  status: 'error',
                  code: 'VALIDATION_ERROR',
                  message: 'Datos de entrada inválidos.',
                  details: [
                    {
                      field: 'titulo',
                      message: 'must NOT have fewer than 1 characters',
                    },
                  ],
                },
              },
            },
          },
          '401': {
            description: 'No autenticado o token JWT inválido/expirado.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  status: 'error',
                  code: 'AUTHENTICATION_ERROR',
                  message: 'Token de autenticación requerido',
                },
              },
            },
          },
        },
      },
      get: {
        tags: ['Tasks'],
        summary: 'Listar tareas del usuario',
        description: 'Recupera todas las tareas pertenecientes al usuario autenticado en orden ascendente.',
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          '200': {
            description: 'Lista de tareas asociadas al usuario.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Task',
                  },
                },
                example: [
                  {
                    id: 1,
                    titulo: 'Revisar logs de auditoría',
                    descripcion: 'Analizar trazas de seguridad en el servicio de autenticación.',
                    fecha_vencimiento: '2026-11-01',
                    estado: 'pendiente',
                    user_id: 1,
                  },
                  {
                    id: 2,
                    titulo: 'Generar reporte mensual',
                    descripcion: null,
                    fecha_vencimiento: null,
                    estado: 'en curso',
                    user_id: 1,
                  },
                ],
              },
            },
          },
          '401': {
            description: 'No autenticado o token JWT inválido/expirado.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  status: 'error',
                  code: 'AUTHENTICATION_ERROR',
                  message: 'Token de autenticación requerido',
                },
              },
            },
          },
        },
      },
    },
    '/tasks/{id}': {
      get: {
        tags: ['Tasks'],
        summary: 'Obtener tarea por identificador',
        description: 'Recupera el detalle de una tarea específica si pertenece al usuario autenticado.',
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Identificador único positivo de la tarea.',
            schema: {
              type: 'integer',
              minimum: 1,
              example: 1,
            },
          },
        ],
        responses: {
          '200': {
            description: 'Detalle de la tarea recuperada exitosamente.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Task',
                },
                example: {
                  id: 1,
                  titulo: 'Revisar logs de auditoría',
                  descripcion: 'Analizar trazas de seguridad en el servicio de autenticación.',
                  fecha_vencimiento: '2026-11-01',
                  estado: 'pendiente',
                  user_id: 1,
                },
              },
            },
          },
          '400': {
            description: 'Identificador de tarea inválido en los parámetros de ruta.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ValidationErrorResponse',
                },
                example: {
                  status: 'error',
                  code: 'VALIDATION_ERROR',
                  message: 'Datos de entrada inválidos.',
                  details: [
                    {
                      field: 'id',
                      message: 'must match pattern "^[1-9][0-9]{0,8}$"',
                    },
                  ],
                },
              },
            },
          },
          '401': {
            description: 'No autenticado o token JWT inválido/expirado.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  status: 'error',
                  code: 'AUTHENTICATION_ERROR',
                  message: 'Token de autenticación requerido',
                },
              },
            },
          },
          '404': {
            description: 'Tarea no encontrada. Esta respuesta también se devuelve cuando la tarea existe pero pertenece a otro usuario.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  status: 'error',
                  code: 'NOT_FOUND',
                  message: 'Tarea no encontrada',
                },
              },
            },
          },
        },
      },
      put: {
        tags: ['Tasks'],
        summary: 'Actualizar una tarea existente',
        description: 'Modifica uno o más campos de una tarea perteneciente al usuario autenticado.',
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Identificador único positivo de la tarea a actualizar.',
            schema: {
              type: 'integer',
              minimum: 1,
              example: 1,
            },
          },
        ],
        requestBody: {
          description: 'Campos a actualizar en la tarea (se requiere al menos un campo).',
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateTaskRequest',
              },
              example: {
                estado: 'completada',
                descripcion: 'Análisis finalizado y archivado sin anomalías detectadas.',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Tarea actualizada exitosamente.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Task',
                },
                example: {
                  id: 1,
                  titulo: 'Revisar logs de auditoría',
                  descripcion: 'Análisis finalizado y archivado sin anomalías detectadas.',
                  fecha_vencimiento: '2026-11-01',
                  estado: 'completada',
                  user_id: 1,
                },
              },
            },
          },
          '400': {
            description: 'Error de validación en parámetros de ruta o cuerpo de la petición.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ValidationErrorResponse',
                },
                example: {
                  status: 'error',
                  code: 'VALIDATION_ERROR',
                  message: 'Datos de entrada inválidos.',
                  details: [
                    {
                      field: 'cuerpo',
                      message: 'must NOT have fewer than 1 properties',
                    },
                  ],
                },
              },
            },
          },
          '401': {
            description: 'No autenticado o token JWT inválido/expirado.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  status: 'error',
                  code: 'AUTHENTICATION_ERROR',
                  message: 'Token de autenticación requerido',
                },
              },
            },
          },
          '404': {
            description: 'Tarea no encontrada. Esta respuesta también se devuelve cuando la tarea existe pero pertenece a otro usuario.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  status: 'error',
                  code: 'NOT_FOUND',
                  message: 'Tarea no encontrada',
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Tasks'],
        summary: 'Eliminar una tarea',
        description: 'Elimina de forma permanente una tarea perteneciente al usuario autenticado.',
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Identificador único positivo de la tarea a eliminar.',
            schema: {
              type: 'integer',
              minimum: 1,
              example: 1,
            },
          },
        ],
        responses: {
          '204': {
            description: 'Tarea eliminada exitosamente sin contenido en la respuesta.',
          },
          '400': {
            description: 'Identificador de tarea inválido en los parámetros de ruta.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ValidationErrorResponse',
                },
                example: {
                  status: 'error',
                  code: 'VALIDATION_ERROR',
                  message: 'Datos de entrada inválidos.',
                  details: [
                    {
                      field: 'id',
                      message: 'must match pattern "^[1-9][0-9]{0,8}$"',
                    },
                  ],
                },
              },
            },
          },
          '401': {
            description: 'No autenticado o token JWT inválido/expirado.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  status: 'error',
                  code: 'AUTHENTICATION_ERROR',
                  message: 'Token de autenticación requerido',
                },
              },
            },
          },
          '404': {
            description: 'Tarea no encontrada. Esta respuesta también se devuelve cuando la tarea existe pero pertenece a otro usuario.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
                example: {
                  status: 'error',
                  code: 'NOT_FOUND',
                  message: 'Tarea no encontrada',
                },
              },
            },
          },
        },
      },
    },
  },
};
