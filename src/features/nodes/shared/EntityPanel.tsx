import { useState } from 'react';
import { useWorldStore } from '@/store/worldStore';
import { getNodeDefinition } from '@/features/nodes/registry';
import type { NodePanelProps } from '@/features/nodes/types';
import type { NamedEntityData } from '@/types/world';
import { InspectorSection } from './InspectorSection';
import { DocumentEditor } from './DocumentEditor';
import { toPlainText } from './markdown';

/**
 * Editor COMPARTIDO y dirigido por DATOS. Tres zonas:
 *  - Identidad (siempre visible): nombre + resumen corto.
 *  - Detalles (colapsable): los campos específicos del tipo, declarados como
 *    `fields` en su definición. Renderizar es agnóstico al tipo.
 *  - Documento (colapsable): preview del cuerpo largo + acceso al editor a
 *    pantalla amplia (DocumentEditor).
 *
 * Los inputs están controlados por el store, así la edición se refleja en el
 * lienzo en tiempo real. Añadir un campo a un tipo = una línea en su `fields`.
 */

const fieldBase =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200';

export function EntityPanel({ nodeId, data, onChange }: NodePanelProps<NamedEntityData>) {
  // El tipo del nodo decide qué campos mostrar. Se lee del registry por su kind.
  const kind = useWorldStore((s) => s.nodes.find((n) => n.id === nodeId)?.kind);
  const def = kind ? getNodeDefinition(kind) : undefined;
  const fields = def?.fields ?? [];
  const record = data as unknown as Record<string, string | undefined>;

  const [editorOpen, setEditorOpen] = useState(false);
  const body = data.body ?? '';

  // Escribe en una clave arbitraria de `data`; el store mezcla el parche.
  const setField = (key: string, value: string) =>
    onChange({ [key]: value } as unknown as Partial<NamedEntityData>);

  return (
    <div className="space-y-1">
      {/* ── Identidad — siempre visible ── */}
      <div className="space-y-3 pb-1">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Nombre</span>
          <input
            type="text"
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Sin título"
            className={fieldBase}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Resumen</span>
          <textarea
            value={data.description}
            onChange={(e) => onChange({ description: e.target.value })}
            rows={3}
            placeholder="Una línea que capture la esencia…"
            className={`${fieldBase} resize-none leading-relaxed`}
          />
        </label>
      </div>

      {/* ── Detalles — campos específicos del tipo ── */}
      {fields.length > 0 && (
        <InspectorSection title="Detalles" defaultOpen>
          <div className="space-y-3">
            {fields.map((f) => (
              <label key={f.key} className="block">
                <span className="mb-1 block text-xs font-medium text-slate-600">
                  {f.label}
                </span>
                {f.type === 'textarea' ? (
                  <textarea
                    value={record[f.key] ?? ''}
                    onChange={(e) => setField(f.key, e.target.value)}
                    rows={3}
                    placeholder={f.placeholder}
                    className={`${fieldBase} resize-none leading-relaxed`}
                  />
                ) : (
                  <input
                    type="text"
                    value={record[f.key] ?? ''}
                    onChange={(e) => setField(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className={fieldBase}
                  />
                )}
              </label>
            ))}
          </div>
        </InspectorSection>
      )}

      {/* ── Documento — cuerpo largo en markdown ── */}
      <InspectorSection title="Documento" defaultOpen={false}>
        {body.trim() ? (
          <div className="space-y-2">
            <p className="line-clamp-3 text-xs leading-relaxed text-slate-500">
              {toPlainText(body)}
            </p>
            <button
              type="button"
              onClick={() => setEditorOpen(true)}
              className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Abrir editor
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditorOpen(true)}
            className="w-full rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50"
          >
            Escribir documento
          </button>
        )}
      </InspectorSection>

      {editorOpen && (
        <DocumentEditor
          title={data.name}
          initialBody={body}
          onCommit={(b) => onChange({ body: b })}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </div>
  );
}
