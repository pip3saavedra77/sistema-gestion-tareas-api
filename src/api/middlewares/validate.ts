import Ajv, {
  type AnySchemaObject,
  type ValidateFunction,
  type ErrorObject,
  type SchemaValidateFunction,
} from 'ajv';
import addFormats from 'ajv-formats';
import { type Request, type Response, type NextFunction } from 'express';
import { ValidationError } from '../../errors/ValidationError.js';

/** Fuente de datos de la petición que será validada contra el esquema. */
type ValidationSource = 'body' | 'params' | 'query';

/** Par campo–mensaje que describe un error de validación individual. */
interface FieldError {
  field: string;
  message: string;
}

/**
 * Instancia única de Ajv compartida por todos los middlewares de validación.
 * - allErrors: true  → recoge TODOS los errores, no solo el primero.
 * - coerceTypes: no configurado → los tipos se comprueban tal cual llegan.
 */
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

/**
 * Valida la palabra clave personalizada "maxBytes": el texto no puede ocupar más
 * de `limit` bytes en UTF-8. "maxLength" cuenta caracteres, pero bcrypt solo usa
 * los primeros 72 bytes (una "ñ" ocupa 2), así que hace falta medir en bytes.
 */
const validateMaxBytes: SchemaValidateFunction = (limit: number, data: string): boolean => {
  const valid = Buffer.byteLength(data, 'utf8') <= limit;
  validateMaxBytes.errors = valid
    ? []
    : [
        {
          keyword: 'maxBytes',
          message: `must NOT have more than ${limit} bytes (UTF-8)`,
          params: { limit },
        },
      ];
  return valid;
};

ajv.addKeyword({
  keyword: 'maxBytes',
  type: 'string',
  schemaType: 'number',
  errors: true,
  validate: validateMaxBytes,
});

/**
 * Convierte la ruta de instancia de AJV en un nombre de campo legible.
 * Por ejemplo: "/email" → "email", "/address/city" → "address.city".
 */
function buildFieldName(instancePath: string, params: ErrorObject['params']): string {
  if (instancePath) {
    return instancePath.replace(/^\//, '').replace(/\//g, '.');
  }
  // Para errores de tipo "required", el campo faltante está en params.missingProperty
  if ('missingProperty' in params && typeof params.missingProperty === 'string') {
    return params.missingProperty;
  }
  // Para errores de tipo "additionalProperties", el campo no permitido está en params.additionalProperty
  if ('additionalProperty' in params && typeof params.additionalProperty === 'string') {
    return params.additionalProperty;
  }
  return 'cuerpo';
}

/**
 * Transforma el array de ErrorObject de AJV en el formato { field, message }
 * que expone la API al cliente.
 */
function mapErrors(errors: ErrorObject[]): FieldError[] {
  return errors.map((err) => ({
    field: buildFieldName(err.instancePath, err.params),
    message: err.message ?? 'Valor inválido.',
  }));
}

/**
 * Cache de funciones de validación ya compiladas, indexadas por el objeto esquema.
 * Evita recompilar el mismo esquema en cada petición (O(1) amortizado por lookup).
 */
const compiledSchemas = new WeakMap<AnySchemaObject, ValidateFunction>();

/**
 * Factoría de middleware de validación.
 *
 * @param schema - Esquema JSON Schema (objeto AJV) que describe los datos esperados.
 * @param source - Parte de la petición a validar: 'body', 'params' o 'query'.
 * @returns Middleware de Express que lanza ValidationError si los datos no son válidos.
 *
 * @example
 * router.post('/tareas', validate(crearTareaSchema, 'body'), crearTareaController);
 */
export function validate(
  schema: AnySchemaObject,
  source: ValidationSource,
): (req: Request, res: Response, next: NextFunction) => void {
  // Compilar el esquema una sola vez y cachear el resultado
  if (!compiledSchemas.has(schema)) {
    compiledSchemas.set(schema, ajv.compile(schema));
  }

  // Non-null assertion segura: acabamos de garantizar que existe en el mapa
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const validateFn = compiledSchemas.get(schema)!;

  return (req: Request, _res: Response, next: NextFunction): void => {
    const data: unknown = req[source];
    const valid = validateFn(data);

    if (!valid) {
      const errors: ErrorObject[] = validateFn.errors ?? [];
      next(new ValidationError('Datos de entrada inválidos.', mapErrors(errors)));
      return;
    }

    next();
  };
}
