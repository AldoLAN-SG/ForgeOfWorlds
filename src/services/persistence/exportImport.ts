import { WORLD_DOCUMENT_VERSION, type WorldDocument } from '@/types/world';
import { useWorldStore } from '@/store/worldStore';

const FILE_EXT = '.forgworld.json';

function buildExportDoc(): WorldDocument {
  const { nodes, edges } = useWorldStore.getState();
  return {
    version: WORLD_DOCUMENT_VERSION,
    id: 'default',
    name: 'Mi universo',
    nodes,
    edges,
  };
}

/** Descarga el universo actual como archivo JSON. */
export function exportWorld(): void {
  const doc = buildExportDoc();
  const json = JSON.stringify(doc, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mi-universo${FILE_EXT}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Valida que un objeto sea un WorldDocument mínimamente correcto. */
function isValidDocument(obj: unknown): obj is WorldDocument {
  if (typeof obj !== 'object' || obj === null) return false;
  const doc = obj as Record<string, unknown>;
  return (
    typeof doc.version === 'number' &&
    Array.isArray(doc.nodes) &&
    Array.isArray(doc.edges)
  );
}

/**
 * Lee un archivo .forgworld.json, valida su estructura e hidrata el store.
 * El autosave detectará el cambio y persistirá en IndexedDB automáticamente.
 */
export async function importWorld(file: File): Promise<void> {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('El archivo no es un JSON válido.');
  }
  if (!isValidDocument(parsed)) {
    throw new Error('El archivo no tiene el formato de Forge of Worlds.');
  }
  useWorldStore.getState().hydrate(parsed);
}
