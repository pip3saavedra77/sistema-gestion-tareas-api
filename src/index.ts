import app from './app';
import Config from './config/config';
import { checkConnection } from './persistence/database';

const config = Config.getInstance();

/** Verifica la base de datos y luego levanta el servidor. */
async function start(): Promise<void> {
    try {
        await checkConnection();
        console.log('Conexión a PostgreSQL establecida');
    } catch (error) {
        console.error(
            'No se pudo conectar a PostgreSQL. ¿Está levantada la base de datos? (docker compose up -d)',
        );
        console.error(error);
        process.exit(1);
    }

    app.listen(config.port, () => {
        console.log(`Servidor escuchando en http://localhost:${config.port}`);
    });
}

void start();