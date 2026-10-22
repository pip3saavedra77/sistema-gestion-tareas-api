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
        this.jwtSecret = this.requiredMinLength('JWT_SECRET', 32);
        this.jwtExpiresIn = this.requiredDuration('JWT_EXPIRES_IN');
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

    /** Lee una variable de texto obligatoria. Lanza error si tiene menos de minLength caracteres. */
    private requiredMinLength(name: string, minLength: number): string {
        const value = this.required(name);
        if (value.length < minLength) {
            throw new Error(
                `La variable ${name} debe tener al menos ${minLength} caracteres (tiene ${value.length})`,
            );
        }
        return value;
    }

    /**
     * Lee una duración obligatoria con formato número + unidad (s, m, h o d), por ejemplo
     * "30m" o "1h". Lanza error si no tiene ese formato o si el número es cero.
     */
    private requiredDuration(name: string): string {
        const raw = this.required(name);
        const match = /^(\d+)(s|m|h|d)$/.exec(raw);
        if (match === null || Number(match[1]) <= 0) {
            throw new Error(
                `La variable ${name} debe ser un número mayor que cero seguido de s, m, h o d, por ejemplo "1h" o "30m" (valor recibido: "${raw}")`,
            );
        }
        return raw;
    }
}

export default Config;