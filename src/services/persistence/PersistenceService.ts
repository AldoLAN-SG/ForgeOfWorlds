import type { WorldDocument } from '@/types/world';

/**
 * Contrato de persistencia, desacoplado de la implementación. La UI y el store
 * dependen de esta interfaz, no de IndexedDB. Cambiar a un backend o a sync en
 * la nube en el futuro = nueva implementación, sin tocar el resto del sistema.
 */
export interface PersistenceService {
  /** Carga el documento guardado, o `null` si no existe. */
  load(): Promise<WorldDocument | null>;
  /** Guarda (sobrescribe) el documento completo. */
  save(doc: WorldDocument): Promise<void>;
}
