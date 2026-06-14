import type { NodeTypes } from '@xyflow/react';
import type { NodeKind } from '@/types/world';
import type { NodeTypeDefinition } from './types';
import { characterDefinition } from './character/character.definition';
import { locationDefinition } from './location/location.definition';
import { factionDefinition } from './faction/faction.definition';
import { eventDefinition } from './event/event.definition';
import { powerSystemDefinition } from './power-system/powerSystem.definition';

/**
 * Node Type Registry.
 *
 * Punto único de extensión del sistema: para añadir un tipo de nodo nuevo
 * (Evento, Facción, Objeto...), se crea su definición y se añade UNA línea a
 * `definitions`. Nada más del sistema cambia: el canvas, el store, el inspector
 * y la toolbar se adaptan automáticamente a partir de estas definiciones.
 *
 * Se usa agregación estática (un array a nivel de módulo) en lugar de registro
 * por efecto secundario, para que el orden de carga sea determinista y el mapa
 * `nodeTypes` de React Flow sea una referencia estable.
 */
const definitions: NodeTypeDefinition<any>[] = [
  characterDefinition,
  locationDefinition,
  factionDefinition,
  eventDefinition,
  powerSystemDefinition,
];

const byKind = new Map<NodeKind, NodeTypeDefinition<any>>(
  definitions.map((def) => [def.kind, def])
);

/** Devuelve la definición de un tipo, o `undefined` si no está registrado. */
export function getNodeDefinition(
  kind: NodeKind
): NodeTypeDefinition<any> | undefined {
  return byKind.get(kind);
}

/** Lista todas las definiciones (para la toolbar y la búsqueda). */
export function listNodeDefinitions(): NodeTypeDefinition<any>[] {
  return definitions;
}

/**
 * Mapa `kind -> componente de lienzo` que consume React Flow. Referencia
 * estable a nivel de módulo (recrearlo en cada render degrada el rendimiento).
 */
export const nodeTypes: NodeTypes = Object.fromEntries(
  definitions.map((def) => [def.kind, def.CanvasComponent])
);
