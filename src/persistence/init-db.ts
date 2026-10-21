import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pool } from './database';

/** Lee schema.sql y lo ejecuta contra la base de datos configurada en el .env. */
async function main(): Promise<void> {
    const sql = await readFile(path.join(__dirname, 'schema.sql'), 'utf-8');
    await pool.query(sql);
    console.log('Esquema aplicado correctamente');
}

main()
    .catch((error) => {
        console.error('Error al aplicar el esquema:', error);
        process.exitCode = 1;
    })
    .finally(() => pool.end());