import { AppError } from './AppError.js';

/**
 * Error 401 — el cliente no está autenticado o las credenciales
 * proporcionadas son incorrectas o han expirado.
 */
export class AuthenticationError extends AppError {
  constructor(message = 'No autenticado. Por favor, inicia sesión para continuar.') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}
