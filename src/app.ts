import express, { Application, Request, Response } from 'express';

const app: Application = express();

// Permite leer cuerpos de petición en formato JSON
app.use(express.json());

// Ruta de prueba para comprobar que el servidor está vivo
app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
});

export default app;