import type { WorldDocument } from '@/types/world';
import type { PersistenceService } from './PersistenceService';

/**
 * Implementación de PersistenceService sobre IndexedDB, sin dependencias
 * externas. Para el MVP guarda un único documento ("current") en un object
 * store clave-valor. La escritura es transaccional, evitando estados corruptos
 * si el guardado se interrumpe.
 */
const DB_NAME = 'forge-of-worlds';
const DB_VERSION = 1;
const STORE = 'worlds';
const DOC_KEY = 'current';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export class IndexedDBAdapter implements PersistenceService {
  async load(): Promise<WorldDocument | null> {
    const db = await openDatabase();
    try {
      return await new Promise<WorldDocument | null>((resolve, reject) => {
        const tx = db.transaction(STORE, 'readonly');
        const request = tx.objectStore(STORE).get(DOC_KEY);
        request.onsuccess = () =>
          resolve((request.result as WorldDocument | undefined) ?? null);
        request.onerror = () => reject(request.error);
      });
    } finally {
      db.close();
    }
  }

  async save(doc: WorldDocument): Promise<void> {
    const db = await openDatabase();
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put(doc, DOC_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
    } finally {
      db.close();
    }
  }
}
