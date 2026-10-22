import { type Request, type Response } from 'express';
import {
  register as registerService,
  login as loginService,
  type RegisterInput,
  type LoginInput,
} from '../services/auth.service.js';

/**
 * Controlador para la creación de cuentas de usuario.
 * Responde con código HTTP 201 y la información pública del usuario registrado.
 *
 * @param req Petición HTTP que contiene el cuerpo validado por el middleware.
 * @param res Respuesta HTTP donde se envía el usuario creado.
 */
export async function register(req: Request, res: Response): Promise<void> {
  const result = await registerService(req.body as RegisterInput);
  res.status(201).json(result);
}

/**
 * Controlador para la autenticación de usuarios existentes.
 * Responde con código HTTP 200 y el token JWT firmado.
 *
 * @param req Petición HTTP con credenciales de acceso validadas.
 * @param res Respuesta HTTP donde se entrega el token de autenticación.
 */
export async function login(req: Request, res: Response): Promise<void> {
  const result = await loginService(req.body as LoginInput);
  res.status(200).json(result);
}
