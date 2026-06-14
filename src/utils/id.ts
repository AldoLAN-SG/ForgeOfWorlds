/** Genera un identificador único. Aislado para poder cambiar la estrategia. */
export function createId(): string {
  // `crypto.randomUUID` está disponible en todos los navegadores objetivo.
  return crypto.randomUUID();
}

/** Marca de tiempo en milisegundos. Aislado por consistencia y testeo. */
export function now(): number {
  return Date.now();
}
