import { useEffect, useRef, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Download, Upload } from 'lucide-react';
import { useWorldStore } from '@/store/worldStore';
import { listNodeDefinitions } from '@/features/nodes/registry';
import type { NodeTypeDefinition } from '@/features/nodes/types';
import type { SaveStatus } from '@/store/worldStore';
import { exportWorld, importWorld } from '@/services/persistence/exportImport';

// ---------------------------------------------------------------------------
// Indicador de guardado
// ---------------------------------------------------------------------------

function formatSavedAt(savedAt: number | null): string {
  if (savedAt === null) return 'Guardado ✓';
  const seconds = Math.floor((Date.now() - savedAt) / 1000);
  if (seconds < 5) return 'Guardado ✓';
  return `Guardado hace ${seconds}s`;
}

function SaveIndicator({ status, savedAt }: { status: SaveStatus; savedAt: number | null }) {
  const [, tick] = useState(0);

  // Actualiza el texto relativo cada segundo mientras mostramos 'saved'.
  useEffect(() => {
    if (status !== 'saved') return;
    const id = window.setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  if (status === 'idle') return null;

  const { text, color } =
    status === 'saving'
      ? { text: 'Guardando…', color: 'text-slate-400' }
      : status === 'error'
        ? { text: 'Error al guardar', color: 'text-red-500' }
        : { text: formatSavedAt(savedAt), color: 'text-slate-400' };

  return <span className={`text-xs font-medium ${color}`}>{text}</span>;
}

// ---------------------------------------------------------------------------
// Toolbar principal
// ---------------------------------------------------------------------------

export function Toolbar() {
  const { screenToFlowPosition } = useReactFlow();
  const addNode = useWorldStore((s) => s.addNode);
  const removeNodes = useWorldStore((s) => s.removeNodes);
  const removeEdges = useWorldStore((s) => s.removeEdges);
  const setSelection = useWorldStore((s) => s.setSelection);
  const selectedNodeIds = useWorldStore((s) => s.selectedNodeIds);
  const selectedEdgeIds = useWorldStore((s) => s.selectedEdgeIds);
  const saveStatus = useWorldStore((s) => s.saveStatus);
  const savedAt = useWorldStore((s) => s.savedAt);

  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedCount = selectedNodeIds.length + selectedEdgeIds.length;
  const definitions = listNodeDefinitions();

  const handleAdd = (def: NodeTypeDefinition) => {
    const center = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    const nodeCount = useWorldStore.getState().nodes.length;
    const offset = (nodeCount % 8) * 28;
    const position = { x: center.x + offset, y: center.y + offset };
    const id = addNode(def.kind, position, def.createData());
    setSelection([id]);
  };

  const handleDelete = () => {
    if (selectedNodeIds.length > 0) removeNodes(selectedNodeIds);
    if (selectedEdgeIds.length > 0) removeEdges(selectedEdgeIds);
  };

  const handleExport = () => exportWorld();

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset para permitir importar el mismo archivo dos veces seguidas.
    e.target.value = '';
    try {
      await importWorld(file);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido.';
      setImportError(msg);
      setTimeout(() => setImportError(null), 4000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 p-2 shadow-lg backdrop-blur">
        {/* Indicador de guardado */}
        <SaveIndicator status={saveStatus} savedAt={savedAt} />
        {saveStatus !== 'idle' && <div className="h-6 w-px bg-slate-200" />}

        {/* Botones de creación por tipo (del registry) */}
        {definitions.map((def) => {
          const Icon = def.icon;
          return (
            <button
              key={def.kind}
              type="button"
              onClick={() => handleAdd(def)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: def.accent }}
            >
              <Icon size={15} />
              {def.label}
            </button>
          );
        })}

        <div className="h-6 w-px bg-slate-200" />

        {/* Exportar */}
        <button
          type="button"
          onClick={handleExport}
          title="Exportar universo como JSON"
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
        >
          <Download size={14} />
          Exportar
        </button>

        {/* Importar */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Importar universo desde JSON"
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
        >
          <Upload size={14} />
          Importar
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.forgworld.json"
          className="hidden"
          onChange={handleImportFile}
        />

        <div className="h-6 w-px bg-slate-200" />

        {/* Eliminar selección */}
        <button
          type="button"
          onClick={handleDelete}
          disabled={selectedCount === 0}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Eliminar{selectedCount > 0 ? ` (${selectedCount})` : ''}
        </button>
      </div>

      {/* Error de importación (bajo la toolbar, desaparece solo) */}
      {importError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 shadow">
          {importError}
        </div>
      )}
    </div>
  );
}
