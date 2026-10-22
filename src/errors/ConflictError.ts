import { AppError } from './AppError.js';

/**
 * Error 409 — la operación entra en conflicto con el estado actual
 * del recurso (ej. email duplicado, versión desactualizada).
 */
export class ConflictError extends AppError {
  constructor(message = 'El recurso ya existe o genera un conflicto con los datos actuales.') {
    super(message, 409, 'CONFLICT');
  }
}
