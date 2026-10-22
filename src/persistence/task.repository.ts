import { pool } from './database.js';
import { AuthenticationError } from '../errors/AuthenticationError.js';
import { type TaskStatus } from '../api/schemas/task.schemas.js';

/**
 * Representación de una tarea persistida en la base de datos PostgreSQL.
 */
export interface Task {
  id: number;
  titulo: string;
  descripcion: string | null;
  fecha_vencimiento: string | null;
  estado: TaskStatus;
  user_id: number;
}

/**
 * Datos requeridos para registrar una nueva tarea.
 */
export interface CreateTaskData {
  titulo: string;
  descripcion?: string;
  fecha_vencimiento?: string;
  estado?: TaskStatus;
}

/**
 * Datos opcionales para actualizar una tarea existente.
 */
export interface UpdateTaskData {
  titulo?: string;
  descripcion?: string;
  fecha_vencimiento?: string;
  estado?: TaskStatus;
}

/**
 * Interfaz para evaluar errores lanzados por el driver pg.
 */
interface PostgresError extends Error {
  code?: string;
}

/**
 * Determina si el error capturado corresponde a una violación de foreign key en PostgreSQL (código 23503).
 */
function isForeignKeyViolation(error: unknown): error is PostgresError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as PostgresError).code === '23503'
  );
}

/**
 * Inserta una nueva tarea asociada al usuario en la base de datos.
 *
 * @param userId Identificador del usuario propietario.
 * @param data Datos de la tarea a crear.
 * @returns Tarea recién insertada.
 */
export async function createTask(userId: number, data: CreateTaskData): Promise<Task> {
  const query = `
    INSERT INTO tasks (titulo, descripcion, fecha_vencimiento, estado, user_id)
    VALUES ($1, $2, $3::date, COALESCE($4, 'pendiente'), $5)
    RETURNING id, titulo, descripcion, fecha_vencimiento::text AS fecha_vencimiento, estado, user_id;
  `;
  const values = [
    data.titulo,
    data.descripcion ?? null,
    data.fecha_vencimiento ?? null,
    data.estado ?? null,
    userId,
  ];

  try {
    const result = await pool.query<Task>(query, values);
    const createdTask = result.rows[0];
    if (createdTask === undefined) {
      throw new Error('Error inesperado al insertar la tarea');
    }
    return createdTask;
  } catch (error: unknown) {
    if (isForeignKeyViolation(error)) {
      throw new AuthenticationError('Token inválido o expirado');
    }
    throw error;
  }
}

/**
 * Obtiene todas las tareas pertenecientes al usuario ordenadas por ID ascendente.
 *
 * @param userId Identificador del usuario propietario.
 * @returns Lista de tareas del usuario.
 */
export async function findAllByUser(userId: number): Promise<Task[]> {
  const query = `
    SELECT id, titulo, descripcion, fecha_vencimiento::text AS fecha_vencimiento, estado, user_id
    FROM tasks
    WHERE user_id = $1
    ORDER BY id ASC;
  `;
  const result = await pool.query<Task>(query, [userId]);
  return result.rows;
}

/**
 * Busca una tarea específica garantizando pertenencia al usuario.
 *
 * @param id Identificador de la tarea.
 * @param userId Identificador del usuario propietario.
 * @returns Tarea encontrada o null si no existe o no le pertenece.
 */
export async function findByIdAndUser(id: number, userId: number): Promise<Task | null> {
  const query = `
    SELECT id, titulo, descripcion, fecha_vencimiento::text AS fecha_vencimiento, estado, user_id
    FROM tasks
    WHERE id = $1 AND user_id = $2
    LIMIT 1;
  `;
  const result = await pool.query<Task>(query, [id, userId]);
  return result.rows[0] ?? null;
}

/**
 * Actualiza parcialmente una tarea perteneciente al usuario mediante COALESCE.
 *
 * @param id Identificador de la tarea a actualizar.
 * @param userId Identificador del usuario propietario.
 * @param data Campos a modificar.
 * @returns Tarea actualizada o null si no existe o pertenece a otro usuario.
 */
export async function updateByIdAndUser(
  id: number,
  userId: number,
  data: UpdateTaskData,
): Promise<Task | null> {
  const query = `
    UPDATE tasks
    SET titulo = COALESCE($3, titulo),
        descripcion = COALESCE($4, descripcion),
        fecha_vencimiento = COALESCE($5::date, fecha_vencimiento),
        estado = COALESCE($6, estado),
        updated_at = NOW()
    WHERE id = $1 AND user_id = $2
    RETURNING id, titulo, descripcion, fecha_vencimiento::text AS fecha_vencimiento, estado, user_id;
  `;
  const values = [
    id,
    userId,
    data.titulo ?? null,
    data.descripcion ?? null,
    data.fecha_vencimiento ?? null,
    data.estado ?? null,
  ];

  const result = await pool.query<Task>(query, values);
  return result.rows[0] ?? null;
}

/**
 * Elimina una tarea verificando la propiedad del usuario.
 *
 * @param id Identificador de la tarea a eliminar.
 * @param userId Identificador del usuario propietario.
 * @returns Verdadero si la fila fue eliminada, falso si no existía o pertenecía a otro usuario.
 */
export async function deleteByIdAndUser(id: number, userId: number): Promise<boolean> {
  const query = `
    DELETE FROM tasks
    WHERE id = $1 AND user_id = $2;
  `;
  const result = await pool.query(query, [id, userId]);
  return typeof result.rowCount === 'number' && result.rowCount > 0;
}
