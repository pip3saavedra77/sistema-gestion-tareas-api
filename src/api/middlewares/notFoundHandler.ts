import { type Request, type Response, type NextFunction } from 'express';
import { NotFoundError } from '../../errors/NotFoundError.js';

/**
 * Middleware para rutas inexistentes.
 * Se registra DESPUÉS de todas las rutas válidas y ANTES del errorHandler.
 * Lanza NotFoundError para que el manejador central lo procese uniformemente.
 */
export function notFoundHandler(
  _req: Request,
  _res: Response,
  next: NextFunction,
): void {
  next(new NotFoundError('Ruta no encontrada.'));
}
