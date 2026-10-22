/**
 * Clase base para todos los errores de dominio de la aplicación.
 * Extiende el Error nativo de JavaScript para que sea compatible
 * con los bloques catch y el manejador central de Express.
 */
export class AppError extends Error {
  /** Código HTTP que se enviará en la respuesta (ej. 400, 404). */
  readonly statusCode: number;

  /** Identificador de máquina para el tipo de error (ej. "NOT_FOUND"). */
  readonly code: string;

  /**
   * Lista opcional de detalles estructurados sobre el error,
   * usada principalmente por errores de validación.
   */
  readonly details?: ReadonlyArray<{ field: string; message: string }>;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    details?: ReadonlyArray<{ field: string; message: string }>,
  ) {
    super(message);
    // Restaura la cadena de prototipos correcta después de extender Error
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}
