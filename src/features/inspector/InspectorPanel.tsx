import { useWorldStore } from '@/store/worldStore';
import { getNodeDefinition } from '@/features/nodes/registry';
import {
  getRelationshipType,
  getRelationshipTypesFor,
} from '@/features/edges/relationshipTypes';
import { RelationshipPanel } from '@/features/edges/RelationshipPanel';
import type { NamedEntityData } from '@/types/world';

/**
 * Panel lateral derecho. Muestra y edita el elemento seleccionado:
 * - Un nodo  → delega en el `PanelComponent` de su tipo (registry).
 * - Un edge  → editor de relación (nombre, tipo, descripción).
 * - Nada / selección múltiple → estado vacío.
 *
 * El ancho lo controla App.tsx (panel redimensionable); aquí solo usamos w-full.
 */
export function InspectorPanel() {
  const selectedNodeIds = useWorldStore((s) => s.selectedNodeIds);
  const selectedEdgeIds = useWorldStore((s) => s.selectedEdgeIds);
  const nodes = useWorldStore((s) => s.nodes);
  const edges = useWorldStore((s) => s.edges);
  const updateNodeData = useWorldStore((s) => s.updateNodeData);
  const updateEdgeRelationship = useWorldStore((s) => s.updateEdgeRelationship);

  const onlyNode = selectedNodeIds.length === 1 && selectedEdgeIds.length === 0;
  const onlyEdge = selectedEdgeIds.length === 1 && selectedNodeIds.length === 0;

  const node = onlyNode
    ? nodes.find((n) => n.id === selectedNodeIds[0])
    : undefined;
  const nodeDef = node ? getNodeDefinition(node.kind) : undefined;

  const edge = onlyEdge
    ? edges.find((e) => e.id === selectedEdgeIds[0])
    : undefined;
  const relDef = edge ? getRelationshipType(edge.relationship.type) : undefined;

  const edgeSourceKind = edge
    ? nodes.find((n) => n.id === edge.source)?.kind
    : undefined;
  const edgeTargetKind = edge
    ? nodes.find((n) => n.id === edge.target)?.kind
    : undefined;
  const availableTypes =
    edge && edgeSourceKind && edgeTargetKind
      ? getRelationshipTypesFor(edgeSourceKind, edgeTargetKind)
      : [];

  // Nombre del nodo para mostrarlo en el header (QoL: se actualiza en tiempo real)
  const nodeTitle = node
    ? ((node.data as unknown as NamedEntityData).name || 'Sin título')
    : undefined;

  return (
    <aside className="flex h-full w-full flex-col border-l border-slate-200 bg-white">
      {node && nodeDef ? (
        <>
          <header className="flex min-w-0 flex-col gap-0.5 border-b border-slate-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <nodeDef.icon size={14} style={{ color: nodeDef.accent }} />
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {nodeDef.label}
              </span>
            </div>
            <span className="truncate text-sm font-semibold text-slate-800">
              {nodeTitle}
            </span>
          </header>
          <div className="flex-1 overflow-y-auto p-4">
            <nodeDef.PanelComponent
              nodeId={node.id}
              data={node.data}
              onChange={(patch) => updateNodeData(node.id, patch)}
            />
          </div>
        </>
      ) : edge ? (
        <>
          <header className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: relDef?.color ?? '#94a3b8' }}
            />
            <span className="text-sm font-semibold text-slate-800">
              {relDef?.label ?? 'Relación'}
            </span>
          </header>
          <div className="flex-1 overflow-y-auto p-4">
            <RelationshipPanel
              relationship={edge.relationship}
              availableTypes={availableTypes}
              onChange={(patch) => updateEdgeRelationship(edge.id, patch)}
            />
          </div>
        </>
      ) : (
        <EmptyState count={selectedNodeIds.length + selectedEdgeIds.length} />
      )}
    </aside>
  );
}

function EmptyState({ count }: { count: number }) {
  return (
    <div className="flex flex-1 items-center justify-center p-6 text-center">
      <p className="text-sm text-slate-400">
        {count > 1
          ? `${count} elementos seleccionados`
          : 'Selecciona un nodo o una relación para ver y editar sus propiedades'}
      </p>
    </div>
  );
}
