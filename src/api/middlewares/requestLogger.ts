import { type Request, type Response, type NextFunction } from 'express';

/**
 * Middleware de log de peticiones HTTP.
 * Se registra al inicio de la cadena de middlewares para capturar toda petición.
 *
 * Escucha el evento "finish" de la respuesta (que se emite cuando los headers
 * y el cuerpo han sido enviados al cliente) para calcular la duración real.
 *
 * Formato de salida:
 *   [ISO_DATE] METHOD /url → STATUS (Xms)
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    // eslint-disable-next-line no-console
    console.log(
      `[${timestamp}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`,
    );
  });

  next();
}
