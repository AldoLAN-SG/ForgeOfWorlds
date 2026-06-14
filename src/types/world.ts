/**
 * Modelo de dominio de Forge of Worlds.
 *
 * Principio de diseño: este modelo es la FUENTE DE VERDAD y es independiente
 * de React Flow y de IndexedDB. Los adaptadores (services/) traducen hacia y
 * desde esas tecnologías. Así, añadir un backend o cambiar la librería de
 * canvas no obliga a tocar el modelo.
 *
 * Extensibilidad: `kind` es un string abierto (no un enum cerrado). Para añadir
 * un nuevo tipo de nodo (Evento, Facción, Objeto...) se crea su definición de
 * datos y se registra en el Node Type Registry (Fase 2), sin modificar nada de
 * este archivo ni del store.
 */

/** Discriminador abierto del tipo de nodo. */
export type NodeKind = string;

/** Coordenadas en el espacio del lienzo. */
export interface CanvasPosition {
  x: number;
  y: number;
}

/** Metadatos comunes a todas las entidades persistidas. */
export interface EntityMeta {
  createdAt: number;
  updatedAt: number;
}

/**
 * Nodo genérico del universo. `TData` contiene el payload específico de cada
 * tipo (Personaje, Lugar, ...). El core solo conoce esta forma genérica.
 */
export interface WorldNode<TData = Record<string, unknown>> {
  id: string;
  kind: NodeKind;
  position: CanvasPosition;
  data: TData;
  meta: EntityMeta;
}

/** Metadatos de una relación entre nodos. */
export interface Relationship {
  /** Etiqueta libre, ej. "Hermanos de sangre". */
  name: string;
  /** Categoría extensible, ej. 'friendship' | 'rivalry' | 'kinship' | ... */
  type: string;
  description: string;
}

/** Conexión dirigida entre dos nodos, con metadatos de relación. */
export interface WorldEdge {
  id: string;
  source: string;
  target: string;
  relationship: Relationship;
  meta: EntityMeta;
}

/**
 * Documento completo de un universo. Es lo que se serializa a IndexedDB
 * (Fase 4). `version` permite migraciones de esquema sin romper datos viejos.
 */
export interface WorldDocument {
  version: number;
  id: string;
  name: string;
  nodes: WorldNode[];
  edges: WorldEdge[];
}

/** Versión actual del esquema del documento. */
export const WORLD_DOCUMENT_VERSION = 1;

// ---------------------------------------------------------------------------
// Tipos de nodo concretos
// ---------------------------------------------------------------------------
// Cada tipo concreto define su `data`. El comportamiento (icono, color, cómo
// se dibuja, cómo se edita, qué texto indexa la búsqueda) vive en su definición
// dentro del Node Type Registry (features/nodes/), NO aquí. Así, añadir Evento,
// Facción, Objeto... no requiere tocar el core (este archivo, el store, el
// canvas ni el inspector).

export const CHARACTER_NODE_KIND = 'character';
export const LOCATION_NODE_KIND = 'location';
export const FACTION_NODE_KIND = 'faction';
export const EVENT_NODE_KIND = 'event';
export const POWER_SYSTEM_NODE_KIND = 'power_system';

/**
 * Base común de las entidades con nombre + descripción. Sirve de punto de
 * extensión: los tipos concretos la extienden y pueden añadir campos propios.
 */
export interface NamedEntityData {
  name: string;
  /** Resumen corto: 1-3 líneas. Se muestra en la tarjeta del lienzo. */
  description: string;
  /** Cuerpo largo en markdown (zona Documento). No se muestra en el lienzo. */
  body?: string;
}

export interface CharacterData extends NamedEntityData {
  role?: string;
  motivation?: string;
  flaw?: string;
  arc?: string;
}
export interface LocationData extends NamedEntityData {
  placeType?: string;
  atmosphere?: string;
  relevance?: string;
}
export interface FactionData extends NamedEntityData {
  goal?: string;
  ideology?: string;
  resources?: string;
}
export interface EventData extends NamedEntityData {
  date?: string;
  consequences?: string;
  participants?: string;
}
export interface PowerSystemData extends NamedEntityData {
  source?: string;
  rules?: string;
  cost?: string;
}
