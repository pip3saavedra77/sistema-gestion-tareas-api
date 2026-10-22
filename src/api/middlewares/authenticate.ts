import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Config from '../../config/config.js';
import { AuthenticationError } from '../../errors/AuthenticationError.js';

/**
 * Estructura esperada en el payload decodificado del JWT.
 */
interface JwtPayloadWithSub {
  sub: string;
}

/**
 * Función de guarda de tipos para validar que el resultado decodificado
 * sea un objeto con la propiedad "sub" de tipo string compuesta exclusivamente por dígitos.
 *
 * @param payload Valor decodificado retornado por jwt.verify.
 * @returns Verdadero si cumple con la estructura requerida.
 */
function isJwtPayloadWithSub(payload: unknown): payload is JwtPayloadWithSub {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }
  const record = payload as Record<string, unknown>;
  return typeof record.sub === 'string' && /^\d+$/.test(record.sub);
}

/**
 * Middleware que valida el token JWT de la cabecera Authorization.
 * Si es válido, vincula el identificador del usuario en req.user.
 *
 * @param req Petición HTTP entrante.
 * @param _res Respuesta HTTP.
 * @param next Función para continuar al siguiente middleware.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Token de autenticación requerido');
  }

  const token = authHeader.slice(7).trim();
  if (token === '') {
    throw new AuthenticationError('Token de autenticación requerido');
  }

  const config = Config.getInstance();
  let decoded: unknown;

  try {
    decoded = jwt.verify(token, config.jwtSecret, {
      algorithms: ['HS256'],
    });
  } catch {
    throw new AuthenticationError('Token inválido o expirado');
  }

  if (!isJwtPayloadWithSub(decoded)) {
    throw new AuthenticationError('Token inválido o expirado');
  }

  const userId = Number(decoded.sub);
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    throw new AuthenticationError('Token inválido o expirado');
  }

  req.user = { id: userId };
  next();
}

/**
 * Extrae de forma segura el id del usuario autenticado en la petición.
 * Lanza AuthenticationError si req.user no está definido.
 *
 * @param req Petición HTTP de Express.
 * @returns Identificador numérico del usuario.
 */
export function requireUserId(req: Request): number {
  const user = req.user;
  if (user === undefined || typeof user.id !== 'number') {
    throw new AuthenticationError('Token de autenticación requerido');
  }
  return user.id;
}
