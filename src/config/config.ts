import dotenv from 'dotenv';

/**
 * Configuración central de la aplicación (patrón Singleton).
 *
 * Lee las variables de entorno una sola vez, las valida y las deja
 * disponibles de solo lectura. Si falta una variable obligatoria,
 * lanza un error y la aplicación no arranca.
 */
class Config {
    private static instance: Config | undefined;

    readonly port: number;
    readonly dbHost: string;
    readonly dbPort: number;
    readonly dbUser: string;
    readonly dbPassword: string;
    readonly dbName: string;
    readonly jwtSecret: string;
    readonly jwtExpiresIn: string;

    /** Constructor privado: nadie puede crear otra instancia con "new". */
    private constructor() {
        dotenv.config();

        this.port = this.requiredNumber('PORT');
        this.dbHost = this.required('DB_HOST');
        this.dbPort = this.requiredNumber('DB_PORT');
        this.dbUser = this.required('DB_USER');
        this.dbPassword = this.required('DB_PASSWORD');
        this.dbName = this.required('DB_NAME');
        this.jwtSecret = this.required('JWT_SECRET');
        this.jwtExpiresIn = this.required('JWT_EXPIRES_IN');
    }

    /**
     * Devuelve la única instancia de Config. La crea la primera vez
     * que se llama; después siempre devuelve la misma.
     */
    static getInstance(): Config {
        if (!Config.instance) {
            Config.instance = new Config();
        }
        return Config.instance;
    }

    /** Lee una variable de texto obligatoria. Lanza error si falta o está vacía. */
    private required(name: string): string {
        const value = process.env[name];
        if (value === undefined || value.trim() === '') {
            throw new Error(`Falta la variable de entorno obligatoria: ${name}`);
        }
        return value.trim();
    }

    /** Lee una variable numérica obligatoria. Lanza error si no es un entero positivo. */
    private requiredNumber(name: string): number {
        const raw = this.required(name);
        const value = Number(raw);
        if (!Number.isInteger(value) || value <= 0) {
            throw new Error(
                `La variable ${name} debe ser un número entero positivo (valor recibido: "${raw}")`,
            );
        }
        return value;
    }
}

export default Config;