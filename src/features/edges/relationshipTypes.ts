import type { NodeKind } from '@/types/world';
import {
  CHARACTER_NODE_KIND,
  EVENT_NODE_KIND,
  FACTION_NODE_KIND,
  LOCATION_NODE_KIND,
  POWER_SYSTEM_NODE_KIND,
} from '@/types/world';

/**
 * Registro de tipos de relación, sensible al CONTEXTO: cada tipo declara para
 * qué pares de kinds (source, target) aplica mediante `pairs`. El comodín '*'
 * encaja con cualquier kind. El emparejamiento es NO dirigido: un par
 * {source, target} también encaja con su inverso.
 *
 * Mismo principio de extensibilidad que el Node Type Registry: añadir un tipo
 * (o soportar un kind nuevo) es agregar/editar entradas aquí; el edge, el panel
 * y el selector se adaptan solos.
 */

type KindMatcher = NodeKind | '*';

interface KindPair {
  source: KindMatcher;
  target: KindMatcher;
}

export interface RelationshipTypeDefinition {
  type: string;
  label: string;
  color: string;
  pairs: KindPair[];
}

const C = CHARACTER_NODE_KIND;
const L = LOCATION_NODE_KIND;
const F = FACTION_NODE_KIND;
const E = EVENT_NODE_KIND;
const P = POWER_SYSTEM_NODE_KIND;

export const relationshipTypes: RelationshipTypeDefinition[] = [
  // Genérica: aplica a cualquier combinación. Siempre disponible como fallback.
  { type: 'generic',    label: 'Relación',         color: '#94a3b8', pairs: [{ source: '*', target: '*' }] },

  // ── Personaje ↔ Personaje ──────────────────────────────────────────────────
  { type: 'friendship', label: 'Amistad',           color: '#10b981', pairs: [{ source: C, target: C }] },
  { type: 'rivalry',    label: 'Rivalidad',         color: '#ef4444', pairs: [{ source: C, target: C }, { source: F, target: F }] },
  { type: 'kinship',    label: 'Parentesco',        color: '#f59e0b', pairs: [{ source: C, target: C }] },
  { type: 'alliance',   label: 'Alianza',           color: '#3b82f6', pairs: [{ source: C, target: C }, { source: F, target: F }] },

  // ── Personaje ↔ Lugar ─────────────────────────────────────────────────────
  { type: 'residence',  label: 'Reside en',         color: '#0d9488', pairs: [{ source: C, target: L }] },
  { type: 'rule',       label: 'Gobierna',          color: '#7c3aed', pairs: [{ source: C, target: L }] },
  { type: 'origin',     label: 'Originario de',     color: '#d97706', pairs: [{ source: C, target: L }] },

  // ── Lugar ↔ Lugar ─────────────────────────────────────────────────────────
  { type: 'borders',    label: 'Frontera con',      color: '#0891b2', pairs: [{ source: L, target: L }] },
  { type: 'part_of',    label: 'Parte de',          color: '#65a30d', pairs: [{ source: L, target: L }] },

  // ── Personaje ↔ Facción ───────────────────────────────────────────────────
  { type: 'membership', label: 'Miembro de',        color: '#0891b2', pairs: [{ source: C, target: F }] },
  { type: 'leads',      label: 'Lidera',            color: '#6366f1', pairs: [{ source: C, target: F }] },

  // ── Facción ↔ Facción ─────────────────────────────────────────────────────
  { type: 'faction_war', label: 'En guerra',        color: '#dc2626', pairs: [{ source: F, target: F }] },

  // ── Facción ↔ Lugar ───────────────────────────────────────────────────────
  { type: 'controls_territory', label: 'Controla', color: '#ea580c', pairs: [{ source: F, target: L }] },
  { type: 'headquartered',      label: 'Sede en',  color: '#0d9488', pairs: [{ source: F, target: L }] },

  // ── * ↔ Evento ────────────────────────────────────────────────────────────
  { type: 'participates_in', label: 'Participa en', color: '#8b5cf6', pairs: [{ source: C, target: E }, { source: F, target: E }] },
  { type: 'causes_event',    label: 'Causa',        color: '#ec4899', pairs: [{ source: C, target: E }, { source: F, target: E }] },
  { type: 'occurs_at',       label: 'Ocurre en',   color: '#14b8a6', pairs: [{ source: L, target: E }] },

  // ── * ↔ Sistema de poder ──────────────────────────────────────────────────
  { type: 'wields',         label: 'Emplea',        color: '#10b981', pairs: [{ source: C, target: P }] },
  { type: 'controls_power', label: 'Controla',      color: '#f59e0b', pairs: [{ source: F, target: P }] },
];

const byType = new Map<string, RelationshipTypeDefinition>(
  relationshipTypes.map((def) => [def.type, def])
);

export const DEFAULT_RELATIONSHIP_TYPE = 'generic';

export function getRelationshipType(
  type: string
): RelationshipTypeDefinition | undefined {
  return byType.get(type);
}

function matchKind(matcher: KindMatcher, kind: NodeKind): boolean {
  return matcher === '*' || matcher === kind;
}

function appliesTo(
  def: RelationshipTypeDefinition,
  a: NodeKind,
  b: NodeKind
): boolean {
  return def.pairs.some(
    (p) =>
      (matchKind(p.source, a) && matchKind(p.target, b)) ||
      (matchKind(p.source, b) && matchKind(p.target, a))
  );
}

export function getRelationshipTypesFor(
  sourceKind: NodeKind,
  targetKind: NodeKind
): RelationshipTypeDefinition[] {
  return relationshipTypes.filter((def) => appliesTo(def, sourceKind, targetKind));
}
