import type { AnySchemaObject } from 'ajv';

/**
 * Lista de estados válidos permitidos para una tarea.
 */
export const TASK_STATUSES = ['pendiente', 'en curso', 'completada'] as const;

/**
 * Tipo unificado derivado de la tupla inmutable de estados de tarea.
 */
export type TaskStatus = (typeof TASK_STATUSES)[number];

/**
 * Esquema de validación para la creación de una nueva tarea.
 * Requiere únicamente el campo titulo y restringe propiedades adicionales.
 */
export const createTaskSchema: AnySchemaObject = {
  type: 'object',
  properties: {
    titulo: {
      type: 'string',
      minLength: 1,
      maxLength: 200,
      pattern: '\\S',
    },
    descripcion: {
      type: 'string',
      maxLength: 2000,
    },
    fecha_vencimiento: {
      type: 'string',
      format: 'date',
    },
    estado: {
      type: 'string',
      enum: TASK_STATUSES,
    },
  },
  required: ['titulo'],
  additionalProperties: false,
};

/**
 * Esquema de validación para la actualización de una tarea existente.
 * No exige campos específicos pero requiere al menos una propiedad y bloquea adicionales.
 */
export const updateTaskSchema: AnySchemaObject = {
  type: 'object',
  properties: {
    titulo: {
      type: 'string',
      minLength: 1,
      maxLength: 200,
      pattern: '\\S',
    },
    descripcion: {
      type: 'string',
      maxLength: 2000,
    },
    fecha_vencimiento: {
      type: 'string',
      format: 'date',
    },
    estado: {
      type: 'string',
      enum: TASK_STATUSES,
    },
  },
  minProperties: 1,
  additionalProperties: false,
};

/**
 * Esquema de validación para el identificador de tarea recibido en los parámetros de ruta.
 */
export const taskIdParamsSchema: AnySchemaObject = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      pattern: '^[1-9][0-9]{0,8}$',
    },
  },
  required: ['id'],
  additionalProperties: false,
};
