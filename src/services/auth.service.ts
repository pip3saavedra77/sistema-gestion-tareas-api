import bcrypt from 'bcrypt';
import jwt, { type SignOptions } from 'jsonwebtoken';
import Config from '../config/config.js';
import { AuthenticationError } from '../errors/AuthenticationError.js';
import { createUser, findByEmail } from '../persistence/user.repository.js';

/**
 * Número de rondas para la generación del salt de bcrypt.
 */
const SALT_ROUNDS = 10;

/**
 * Hash bcrypt precalculado con 10 rondas para mitigar ataques de temporización
 * cuando el usuario consultado no existe en la base de datos.
 */
const DUMMY_HASH = '$2b$10$7EqJtq98hPqEX7fNZaODi.mR6g.cQy35PzrqG8lZ9H1vWqQoHh1g.';

/**
 * Datos requeridos para registrar un usuario en el sistema.
 */
export interface RegisterInput {
  nombre: string;
  email: string;
  password: string;
}

/**
 * Respuesta pública tras un registro exitoso (excluye deliberadamente el password_hash).
 */
export interface RegisteredUserResult {
  id: number;
  nombre: string;
  email: string;
}

/**
 * Credenciales requeridas para la autenticación de un usuario.
 */
export interface LoginInput {
  email: string;
  password: string;
}

/**
 * Respuesta que contiene el token JWT generado tras un login exitoso.
 */
export interface LoginResult {
  token: string;
}

/**
 * Normaliza una dirección de correo convirtiéndola a minúsculas.
 * No hace falta quitar espacios: AJV rechaza los emails con espacios antes de llegar aquí.
 *
 * @param email Cadena original del correo.
 * @returns Correo saneado y estandarizado.
 */
function normalizeEmail(email: string): string {
  return email.toLowerCase();
}

/**
 * Registra un nuevo usuario en el sistema tras aplicar hash a su contraseña.
 *
 * @param input Datos del usuario a registrar.
 * @returns Datos seguros del usuario creado (id, nombre, email).
 */
export async function register(input: RegisterInput): Promise<RegisteredUserResult> {
  const normalizedEmail = normalizeEmail(input.email);
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const newUser = await createUser({
    nombre: input.nombre.trim(),
    email: normalizedEmail,
    passwordHash,
  });

  return {
    id: newUser.id,
    nombre: newUser.nombre,
    email: newUser.email,
  };
}

/**
 * Autentica un usuario verificando credenciales y generando un token JWT firmado.
 *
 * @param input Credenciales de acceso (email y contraseña).
 * @returns Objeto con el token JWT emitido.
 */
export async function login(input: LoginInput): Promise<LoginResult> {
  const normalizedEmail = normalizeEmail(input.email);
  const user = await findByEmail(normalizedEmail);

  // Se ejecuta compare contra el hash real o el hash simulado para igualar tiempos de respuesta
  const targetHash = user !== null ? user.password_hash : DUMMY_HASH;
  const isPasswordValid = await bcrypt.compare(input.password, targetHash);

  if (user === null || !isPasswordValid) {
    throw new AuthenticationError('Credenciales inválidas');
  }

  const config = Config.getInstance();
  const signOptions: SignOptions = {
    algorithm: 'HS256',
    expiresIn: config.jwtExpiresIn as NonNullable<SignOptions['expiresIn']>,
  };

  const token = jwt.sign({ sub: String(user.id) }, config.jwtSecret, signOptions);

  return { token };
}
