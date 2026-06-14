import type { Relationship } from '@/types/world';
import {
  getRelationshipType,
  type RelationshipTypeDefinition,
} from './relationshipTypes';

interface RelationshipPanelProps {
  relationship: Relationship;
  /** Tipos disponibles según los kinds conectados (filtrados por contexto). */
  availableTypes: RelationshipTypeDefinition[];
  onChange: (patch: Partial<Relationship>) => void;
}

/**
 * Editor de una relación (edge): nombre, tipo y descripción. Controlado por el
 * store, de modo que cambiar el tipo recolorea el edge y editar el nombre
 * actualiza su etiqueta en tiempo real.
 *
 * El selector de tipo solo ofrece los tipos válidos para el par de nodos
 * conectados. Si el tipo guardado ya no estuviera en esa lista, se incluye de
 * todos modos para no perder el dato.
 */
export function RelationshipPanel({
  relationship,
  availableTypes,
  onChange,
}: RelationshipPanelProps) {
  const options = [...availableTypes];
  if (!options.some((def) => def.type === relationship.type)) {
    const current = getRelationshipType(relationship.type);
    if (current) options.unshift(current);
  }

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-slate-600">
          Nombre
        </span>
        <input
          type="text"
          value={relationship.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Ej. Hermanos de sangre"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-slate-600">
          Tipo
        </span>
        <select
          value={relationship.type}
          onChange={(e) => onChange({ type: e.target.value })}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        >
          {options.map((def) => (
            <option key={def.type} value={def.type}>
              {def.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-slate-600">
          Descripción
        </span>
        <textarea
          value={relationship.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={6}
          placeholder="Describe esta relación…"
          className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm leading-relaxed text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
      </label>
    </div>
  );
}
