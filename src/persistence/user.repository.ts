import { pool } from './database.js';
import { ConflictError } from '../errors/ConflictError.js';

/**
 * Representación de la fila persistida en la tabla users de PostgreSQL.
 */
export interface User {
  id: number;
  nombre: string;
  email: string;
  password_hash: string;
  created_at: Date;
}

/**
 * Datos requeridos para registrar un nuevo usuario en la base de datos.
 */
export interface CreateUserData {
  nombre: string;
  email: string;
  passwordHash: string;
}

/**
 * Interfaz para evaluar errores generados por el cliente de PostgreSQL.
 */
interface PostgresError extends Error {
  code?: string;
}

/**
 * Determina si el error capturado corresponde a una violación de restricción UNIQUE en PostgreSQL.
 * El código 23505 corresponde a "unique_violation".
 */
function isUniqueViolation(error: unknown): error is PostgresError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as PostgresError).code === '23505'
  );
}

/**
 * Inserta un nuevo usuario en la base de datos mediante consulta parametrizada.
 * Si el email ya existe, captura el código de error 23505 y lanza ConflictError.
 *
 * @param userData Datos validados del usuario a persistir.
 * @returns Registro completo del usuario creado.
 */
export async function createUser(userData: CreateUserData): Promise<User> {
  const query = `
    INSERT INTO users (nombre, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, nombre, email, password_hash, created_at;
  `;
  const values = [userData.nombre, userData.email, userData.passwordHash];

  try {
    const result = await pool.query<User>(query, values);
    return result.rows[0];
  } catch (error: unknown) {
    if (isUniqueViolation(error)) {
      throw new ConflictError('El correo ya está registrado');
    }
    throw error;
  }
}

/**
 * Busca un usuario por su dirección de correo electrónico mediante consulta parametrizada.
 *
 * @param email Correo electrónico normalizado.
 * @returns El usuario encontrado o null si no existe.
 */
export async function findByEmail(email: string): Promise<User | null> {
  const query = `
    SELECT id, nombre, email, password_hash, created_at
    FROM users
    WHERE email = $1
    LIMIT 1;
  `;
  const result = await pool.query<User>(query, [email]);
  return result.rows[0] ?? null;
}
