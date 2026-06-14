import type { Edge as RFEdge, Node as RFNode } from '@xyflow/react';
import type { WorldEdge, WorldNode } from '@/types/world';

/**
 * Traducción entre el modelo de dominio y las estructuras de React Flow.
 *
 * React Flow tiene su propio shape de Node/Edge. Mantener esta capa evita
 * acoplar nuestro modelo a la API de la librería: si React Flow cambia, solo
 * se toca este archivo; el store, la persistencia y el resto de la UI no se
 * enteran.
 */

/** Convierte un nodo de dominio a un nodo de React Flow. */
export function toReactFlowNode(node: WorldNode, selected: boolean): RFNode {
  return {
    id: node.id,
    // El "type" de React Flow se corresponde con nuestro `kind`. React Flow lo
    // resuelve contra el mapa `nodeTypes` para elegir el componente a renderizar.
    type: node.kind,
    position: node.position,
    data: node.data as Record<string, unknown>,
    selected,
  };
}

/** Convierte una relación de dominio a un edge de React Flow. */
export function toReactFlowEdge(edge: WorldEdge, selected: boolean): RFEdge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    // Todas las relaciones usan el edge personalizado 'relationship', que lee
    // su color y etiqueta de `data` (ver features/edges/RelationshipEdge.tsx).
    type: 'relationship',
    selected,
    data: { ...edge.relationship },
  };
}
