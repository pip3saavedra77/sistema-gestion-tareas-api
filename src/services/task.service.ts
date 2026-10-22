import { NotFoundError } from '../errors/NotFoundError.js';
import {
  createTask as createTaskRepo,
  findAllByUser as findAllByUserRepo,
  findByIdAndUser as findByIdAndUserRepo,
  updateByIdAndUser as updateByIdAndUserRepo,
  deleteByIdAndUser as deleteByIdAndUserRepo,
  type Task,
  type CreateTaskData,
  type UpdateTaskData,
} from '../persistence/task.repository.js';

/**
 * Crea una nueva tarea asociada a un usuario autenticado.
 *
 * @param userId Identificador del usuario creador.
 * @param data Datos de la tarea a registrar.
 * @returns Tarea creada.
 */
export async function createTask(userId: number, data: CreateTaskData): Promise<Task> {
  return createTaskRepo(userId, data);
}

/**
 * Retorna todas las tareas pertenecientes al usuario autenticado.
 *
 * @param userId Identificador del usuario.
 * @returns Lista de tareas ordenadas por ID ascendente.
 */
export async function listTasks(userId: number): Promise<Task[]> {
  return findAllByUserRepo(userId);
}

/**
 * Obtiene los detalles de una tarea verificando la titularidad del usuario.
 *
 * @param id Identificador de la tarea.
 * @param userId Identificador del usuario propietario.
 * @returns Tarea encontrada.
 * @throws {NotFoundError} Si no existe o pertenece a otro usuario.
 */
export async function getTask(id: number, userId: number): Promise<Task> {
  const task = await findByIdAndUserRepo(id, userId);
  if (task === null) {
    throw new NotFoundError('Tarea no encontrada');
  }
  return task;
}

/**
 * Actualiza los campos de una tarea verificando la titularidad del usuario.
 *
 * @param id Identificador de la tarea.
 * @param userId Identificador del usuario propietario.
 * @param data Campos modificados.
 * @returns Tarea actualizada.
 * @throws {NotFoundError} Si no existe o pertenece a otro usuario.
 */
export async function updateTask(
  id: number,
  userId: number,
  data: UpdateTaskData,
): Promise<Task> {
  const task = await updateByIdAndUserRepo(id, userId, data);
  if (task === null) {
    throw new NotFoundError('Tarea no encontrada');
  }
  return task;
}

/**
 * Elimina una tarea verificando la titularidad del usuario.
 *
 * @param id Identificador de la tarea.
 * @param userId Identificador del usuario propietario.
 * @throws {NotFoundError} Si no existe o pertenece a otro usuario.
 */
export async function deleteTask(id: number, userId: number): Promise<void> {
  const deleted = await deleteByIdAndUserRepo(id, userId);
  if (!deleted) {
    throw new NotFoundError('Tarea no encontrada');
  }
}
