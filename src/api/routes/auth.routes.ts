import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { registerSchema, loginSchema } from '../schemas/auth.schemas.js';
import { register, login } from '../../controllers/auth.controller.js';

const router = Router();

/**
 * Endpoint para registro de nuevos usuarios.
 */
router.post('/register', validate(registerSchema, 'body'), register);

/**
 * Endpoint para inicio de sesión y obtención de token JWT.
 */
router.post('/login', validate(loginSchema, 'body'), login);

export default router;
