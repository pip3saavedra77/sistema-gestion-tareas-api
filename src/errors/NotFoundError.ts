import { AppError } from './AppError.js';

/**
 * Error 404 — el recurso solicitado no existe en el servidor.
 */
export class NotFoundError extends AppError {
  constructor(message = 'El recurso solicitado no fue encontrado.') {
    super(message, 404, 'NOT_FOUND');
  }
}
