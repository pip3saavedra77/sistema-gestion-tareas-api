import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { validate } from '../middlewares/validate.js';
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdParamsSchema,
} from '../schemas/task.schemas.js';
import {
  createTask,
  listTasks,
  getTask,
  updateTask,
  deleteTask,
} from '../../controllers/task.controller.js';

const router = Router();

// Protección de todo el router con autenticación obligatoria
router.use(authenticate);

/**
 * Endpoint para crear una nueva tarea.
 */
router.post('/', validate(createTaskSchema, 'body'), createTask);

/**
 * Endpoint para listar las tareas del usuario autenticado.
 */
router.get('/', listTasks);

/**
 * Endpoint para obtener el detalle de una tarea específica.
 */
router.get('/:id', validate(taskIdParamsSchema, 'params'), getTask);

/**
 * Endpoint para actualizar una tarea existente.
 */
router.put(
  '/:id',
  validate(taskIdParamsSchema, 'params'),
  validate(updateTaskSchema, 'body'),
  updateTask,
);

/**
 * Endpoint para eliminar una tarea existente.
 */
router.delete('/:id', validate(taskIdParamsSchema, 'params'), deleteTask);

export default router;
