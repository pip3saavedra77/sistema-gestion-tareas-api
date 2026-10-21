import { Pool } from 'pg';
import Config from '../config/config';

const config = Config.getInstance();

/**
 * Pool de conexiones a PostgreSQL, compartido por toda la aplicación.
 * Reutiliza conexiones en lugar de abrir una nueva en cada consulta.
 */
export const pool = new Pool({
    host: config.dbHost,
    port: config.dbPort,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName,
});

/** Comprueba que la base de datos responde. Lanza error si no se puede conectar. */
export async function checkConnection(): Promise<void> {
    await pool.query('SELECT 1');
}