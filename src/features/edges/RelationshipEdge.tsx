import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';
import type { Relationship } from '@/types/world';
import { getRelationshipType } from './relationshipTypes';

/**
 * Edge personalizado para relaciones. Color de línea y etiqueta según el tipo
 * de relación; muestra el nombre (o la etiqueta del tipo si no hay nombre).
 * Memoizado para no re-renderizar todas las conexiones al mover un nodo.
 */
function RelationshipEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const rel = data as unknown as Relationship | undefined;
  const def = getRelationshipType(rel?.type ?? 'generic');
  const color = def?.color ?? '#94a3b8';

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const label = rel?.name?.trim() || def?.label || 'Relación';

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{ stroke: color, strokeWidth: selected ? 2.5 : 1.5 }}
      />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan absolute rounded-full border bg-white px-2 py-0.5 text-[10px] font-medium shadow-sm"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            borderColor: color,
            color,
            pointerEvents: 'all',
          }}
        >
          {label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const RelationshipEdge = memo(RelationshipEdgeComponent);
