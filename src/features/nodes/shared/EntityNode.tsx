import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { FileText } from 'lucide-react';
import type { NamedEntityData } from '@/types/world';
import { getNodeDefinition } from '@/features/nodes/registry';

/**
 * Componente de lienzo COMPARTIDO para entidades con nombre + descripción.
 * Lee su apariencia (icono, color, etiqueta) de la definición del tipo según
 * `node.type`, de modo que un tipo nuevo con la misma forma de datos no necesita
 * componente propio.
 *
 * Distinción de tipo a cualquier zoom: una FRANJA vertical de acento a la
 * izquierda es la "firma" de color que sigue siendo legible cuando el texto ya
 * no lo es. El icono va en un chip del mismo color y la etiqueta del tipo se
 * tiñe con el acento, reforzando la identidad de un vistazo.
 *
 * Memoizado: evita re-renderizar todos los nodos al arrastrar uno solo.
 */
function EntityNodeComponent({ type, data, selected }: NodeProps) {
  const def = getNodeDefinition(type);
  const { name, description, body } = data as unknown as NamedEntityData;
  const Icon = def?.icon;
  const accent = def?.accent ?? '#6366f1';
  const hasBody = !!body && body.trim().length > 0;

  return (
    <div
      className="relative flex w-56 overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md"
      style={{
        borderColor: selected ? accent : '#e2e8f0',
        boxShadow: selected ? `0 0 0 2px ${accent}40` : undefined,
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2.5 !w-2.5 !border-2 !border-white"
        style={{ background: accent }}
      />

      {/* Franja de acento: identidad de tipo visible a cualquier nivel de zoom. */}
      <div className="w-1.5 shrink-0" style={{ background: accent }} />

      <div className="min-w-0 flex-1 px-3 py-2.5">
        <div className="mb-1 flex items-center gap-1.5">
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
            style={{ background: `${accent}1f` }}
          >
            {Icon && <Icon size={12} style={{ color: accent }} />}
          </span>
          <span
            className="truncate text-[10px] font-semibold uppercase tracking-wide"
            style={{ color: accent }}
          >
            {def?.label ?? type}
          </span>
          {hasBody && (
            <FileText
              size={11}
              className="ml-auto shrink-0 text-slate-300"
              aria-label="Tiene documento"
            />
          )}
        </div>

        <div className="truncate text-sm font-semibold text-slate-800">
          {name || 'Sin título'}
        </div>
        {description && (
          <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-slate-500">
            {description}
          </p>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!h-2.5 !w-2.5 !border-2 !border-white"
        style={{ background: accent }}
      />
    </div>
  );
}

export const EntityNode = memo(EntityNodeComponent);
