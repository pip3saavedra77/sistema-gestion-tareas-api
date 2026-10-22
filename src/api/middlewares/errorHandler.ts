import { type Request, type Response, type NextFunction } from 'express';
import { AppError } from '../../errors/AppError.js';

/**
 * Interfaz que describe la estructura del cuerpo de toda respuesta de error.
 * El campo "details" es opcional y solo aparece cuando el error lo incluye.
 */
interface ErrorResponseBody {
  status: 'error';
  code: string;
  message: string;
  details?: ReadonlyArray<{ field: string; message: string }>;
}

/**
 * Determina si el error proviene de `express.json()` al encontrar JSON malformado.
 * Express 5 expone `SyntaxError` con la propiedad `body` en estos casos.
 */
function isJsonParseError(err: unknown): err is SyntaxError {
  return (
    err instanceof SyntaxError &&
    'body' in (err as unknown as Record<string, unknown>)
  );
}

/**
 * Manejador central de errores de Express (4 parámetros obligatorios).
 * Debe registrarse como el ÚLTIMO middleware en app.ts.
 *
 * Casos cubiertos:
 *  1. AppError y subclases: responde con su propio statusCode y estructura JSON.
 *  2. JSON malformado de express.json(): responde 400 con código VALIDATION_ERROR.
 *  3. Cualquier otro error: registra el stack en consola y responde 500 genérico.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Caso 1: error de dominio conocido
  if (err instanceof AppError) {
    const body: ErrorResponseBody = {
      status: 'error',
      code: err.code,
      message: err.message,
    };

    if (err.details !== undefined) {
      body.details = err.details;
    }

    res.status(err.statusCode).json(body);
    return;
  }

  // Caso 2: cuerpo JSON malformado enviado por el cliente
  if (isJsonParseError(err)) {
    const body: ErrorResponseBody = {
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: 'El cuerpo de la petición no es un JSON válido.',
    };
    res.status(400).json(body);
    return;
  }

  // Caso 3: error inesperado — nunca exponer internos al cliente
  console.error('[ErrorHandler] Error no controlado:', err instanceof Error ? err.stack : err);

  const body: ErrorResponseBody = {
    status: 'error',
    code: 'INTERNAL_ERROR',
    message: 'Error interno del servidor.',
  };
  res.status(500).json(body);
}
