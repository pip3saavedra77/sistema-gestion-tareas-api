import type { AnySchemaObject } from 'ajv';

/**
 * Esquema de validación para el registro de nuevos usuarios.
 * Valida presencia, tipo, longitudes y formato de datos.
 */
export const registerSchema: AnySchemaObject = {
  type: 'object',
  properties: {
    nombre: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
      pattern: '\\S',
    },
    email: {
      type: 'string',
      format: 'email',
      maxLength: 255,
    },
    password: {
      type: 'string',
      minLength: 8,
      maxLength: 72,
    },
  },
  required: ['nombre', 'email', 'password'],
  additionalProperties: false,
};

/**
 * Esquema de validación para el inicio de sesión.
 * Valida formato de correo y límites del password.
 */
export const loginSchema: AnySchemaObject = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
      minLength: 1,
      maxLength: 72,
    },
  },
  required: ['email', 'password'],
  additionalProperties: false,
};
