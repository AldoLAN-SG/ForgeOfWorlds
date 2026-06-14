import { WORLD_DOCUMENT_VERSION, type WorldDocument } from '@/types/world';
import { useWorldStore } from '@/store/worldStore';
import { IndexedDBAdapter } from './IndexedDBAdapter';
import type { PersistenceService } from './PersistenceService';

/**
 * Orquesta la persistencia: carga el universo al iniciar y guarda los cambios
 * con debounce. Vive en services/ (fuera de React): la UI no sabe nada de cómo
 * ni cuándo se guarda.
 *
 * - Solo persiste cambios de DATOS (nodes/edges); ignora cambios de selección.
 * - El debounce agrupa ráfagas de escrituras (p. ej. el arrastre de un nodo
 *   genera muchos cambios de posición, pero solo se guarda una vez al parar).
 */

const WORLD_ID = 'default';
const WORLD_NAME = 'Mi universo';
const DEBOUNCE_MS = 600;

function buildDocument(): WorldDocument {
  const { nodes, edges } = useWorldStore.getState();
  return {
    version: WORLD_DOCUMENT_VERSION,
    id: WORLD_ID,
    name: WORLD_NAME,
    nodes,
    edges,
  };
}

/**
 * Inicializa la persistencia. Llamar una vez al arrancar la app.
 * Devuelve una función para cancelar la suscripción (limpieza/tests).
 */
export async function initPersistence(
  service: PersistenceService = new IndexedDBAdapter()
): Promise<() => void> {
  // 1. Cargar y restaurar el estado previo.
  try {
    const doc = await service.load();
    if (doc) useWorldStore.getState().hydrate(doc);
  } catch (error) {
    console.error('[persistence] No se pudo cargar el universo:', error);
  }

  // 2. Autosave: suscripción tras la carga, para no sobrescribir lo cargado.
  let timer: number | undefined;

  const unsubscribe = useWorldStore.subscribe((state, prev) => {
    if (state.nodes === prev.nodes && state.edges === prev.edges) return;

    if (timer !== undefined) clearTimeout(timer);
    useWorldStore.getState().setSaveStatus('saving');
    timer = window.setTimeout(() => {
      service
        .save(buildDocument())
        .then(() => useWorldStore.getState().setSaveStatus('saved'))
        .catch((error) => {
          console.error('[persistence] No se pudo guardar el universo:', error);
          useWorldStore.getState().setSaveStatus('error');
        });
    }, DEBOUNCE_MS);
  });

  return unsubscribe;
}
