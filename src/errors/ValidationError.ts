import { AppError } from './AppError.js';

/**
 * Error 400 — los datos enviados por el cliente no superan
 * la validación de esquema (campos requeridos, formatos, etc.).
 */
export class ValidationError extends AppError {
  constructor(
    message = 'Los datos proporcionados no son válidos.',
    details?: ReadonlyArray<{ field: string; message: string }>,
  ) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}
