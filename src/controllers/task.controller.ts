import { type Request, type Response } from 'express';
import { requireUserId } from '../api/middlewares/authenticate.js';
import {
  createTask as createTaskService,
  listTasks as listTasksService,
  getTask as getTaskService,
  updateTask as updateTaskService,
  deleteTask as deleteTaskService,
} from '../services/task.service.js';
import { type CreateTaskData, type UpdateTaskData } from '../persistence/task.repository.js';

/**
 * Controlador para la creación de una tarea asociada al usuario autenticado.
 * Responde con código HTTP 201 y la tarea recién creada.
 *
 * @param req Petición HTTP con datos validados de la tarea.
 * @param res Respuesta HTTP donde se retorna la tarea creada.
 */
export async function createTask(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  const task = await createTaskService(userId, req.body as CreateTaskData);
  res.status(201).json(task);
}

/**
 * Controlador para listar todas las tareas del usuario autenticado.
 * Responde con código HTTP 200 y el arreglo de tareas.
 *
 * @param req Petición HTTP del usuario autenticado.
 * @param res Respuesta HTTP donde se envía la lista de tareas.
 */
export async function listTasks(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  const tasks = await listTasksService(userId);
  res.status(200).json(tasks);
}

/**
 * Controlador para obtener una tarea por su identificador.
 * Responde con código HTTP 200 y la tarea solicitada.
 *
 * @param req Petición HTTP con el parámetro id validado.
 * @param res Respuesta HTTP donde se envía la tarea encontrada.
 */
export async function getTask(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  const taskId = Number(req.params.id);
  const task = await getTaskService(taskId, userId);
  res.status(200).json(task);
}

/**
 * Controlador para actualizar los datos de una tarea del usuario.
 * Responde con código HTTP 200 y la tarea actualizada.
 *
 * @param req Petición HTTP con el parámetro id y cuerpo validados.
 * @param res Respuesta HTTP donde se envía la tarea modificada.
 */
export async function updateTask(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  const taskId = Number(req.params.id);
  const task = await updateTaskService(taskId, userId, req.body as UpdateTaskData);
  res.status(200).json(task);
}

/**
 * Controlador para eliminar una tarea del usuario.
 * Responde con código HTTP 204 sin cuerpo.
 *
 * @param req Petición HTTP con el parámetro id validado.
 * @param res Respuesta HTTP vacía con estado 204.
 */
export async function deleteTask(req: Request, res: Response): Promise<void> {
  const userId = requireUserId(req);
  const taskId = Number(req.params.id);
  await deleteTaskService(taskId, userId);
  res.status(204).send();
}
