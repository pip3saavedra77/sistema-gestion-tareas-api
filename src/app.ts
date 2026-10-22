import express, { type Application, type Request, type Response } from 'express';
import { requestLogger } from './api/middlewares/requestLogger.js';
import { notFoundHandler } from './api/middlewares/notFoundHandler.js';
import { errorHandler } from './api/middlewares/errorHandler.js';
import authRoutes from './api/routes/auth.routes.js';

const app: Application = express();

// 1. Log de todas las peticiones entrantes
app.use(requestLogger);

// 2. Parseo del cuerpo JSON (los errores de sintaxis los captura errorHandler)
app.use(express.json());

// 3. Rutas de la aplicación
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);

// 4. Manejador de rutas no encontradas (debe ir después de todas las rutas)
app.use(notFoundHandler);

// 5. Manejador central de errores (debe ser el último middleware)
app.use(errorHandler);

export default app;