import { AppError } from './AppError.js';

/**
 * Error 403 — el cliente está autenticado pero no tiene permisos
 * suficientes para acceder al recurso solicitado.
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Acceso prohibido. No tienes permisos para realizar esta acción.') {
    super(message, 403, 'FORBIDDEN');
  }
}
