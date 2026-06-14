import { create } from 'zustand';
import type { Connection, EdgeChange, NodeChange } from '@xyflow/react';
import type {
  CanvasPosition,
  NodeKind,
  Relationship,
  WorldDocument,
  WorldEdge,
  WorldNode,
} from '@/types/world';
import { createId, now } from '@/utils/id';

/**
 * Store central del universo (fuente de verdad).
 *
 * Decisiones clave:
 * - Guarda el modelo de DOMINIO (`WorldNode`/`WorldEdge`), no las estructuras
 *   de React Flow. La traducción ocurre en services/reactflow/adapters.ts.
 * - React Flow se usa en modo CONTROLADO: los handlers `onNodesChange` /
 *   `onEdgesChange` traducen los eventos de la librería a mutaciones de dominio.
 * - La selección (de nodos y de edges) se mantiene aquí porque el panel lateral
 *   y la command palette (Fase 5) la necesitan.
 *
 * Nota de rendimiento: las posiciones se actualizan de forma continua durante
 * el arrastre para que el render sea fluido. El "write storm" hacia disco lo
 * resuelve el autosave con debounce (Fase 4), no este store.
 */

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface WorldState {
  // --- estado ---
  nodes: WorldNode[];
  edges: WorldEdge[];
  selectedNodeIds: string[];
  selectedEdgeIds: string[];
  saveStatus: SaveStatus;
  savedAt: number | null;

  // --- acciones de dominio ---
  setSaveStatus: (status: SaveStatus) => void;
  addNode: (kind: NodeKind, position: CanvasPosition, data?: unknown) => string;
  updateNodeData: (id: string, data: unknown) => void;
  removeNodes: (ids: string[]) => void;
  updateEdgeRelationship: (id: string, patch: Partial<Relationship>) => void;
  removeEdges: (ids: string[]) => void;
  setSelection: (nodeIds: string[]) => void;
  clearSelection: () => void;
  /** Reemplaza el estado con un documento cargado (persistencia). */
  hydrate: (doc: WorldDocument) => void;

  // --- handlers de React Flow (modo controlado) ---
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
}

/**
 * Relación por defecto al crear una conexión. El tipo 'generic' es el valor de
 * dominio neutro; el registro de tipos (features/edges) lo mapea a su color y
 * etiqueta. Se usa el literal para no acoplar el store a la capa de features.
 */
function defaultRelationship(): Relationship {
  return { name: '', type: 'generic', description: '' };
}

export const useWorldStore = create<WorldState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeIds: [],
  selectedEdgeIds: [],
  saveStatus: 'idle',
  savedAt: null,

  setSaveStatus: (status) =>
    set({ saveStatus: status, ...(status === 'saved' ? { savedAt: Date.now() } : {}) }),

  addNode: (kind, position, data) => {
    const id = createId();
    const timestamp = now();
    const node: WorldNode = {
      id,
      kind,
      position,
      data: (data as Record<string, unknown>) ?? {},
      meta: { createdAt: timestamp, updatedAt: timestamp },
    };
    set((state) => ({ nodes: [...state.nodes, node] }));
    return id;
  },

  updateNodeData: (id, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              data: { ...(node.data as object), ...(data as object) },
              meta: { ...node.meta, updatedAt: now() },
            }
          : node
      ),
    }));
  },

  removeNodes: (ids) => {
    const idSet = new Set(ids);
    set((state) => {
      // Elimina los edges colgantes que tocaban esos nodos.
      const keptEdges = state.edges.filter(
        (edge) => !idSet.has(edge.source) && !idSet.has(edge.target)
      );
      const keptEdgeIds = new Set(keptEdges.map((edge) => edge.id));
      return {
        nodes: state.nodes.filter((node) => !idSet.has(node.id)),
        edges: keptEdges,
        selectedNodeIds: state.selectedNodeIds.filter((id) => !idSet.has(id)),
        selectedEdgeIds: state.selectedEdgeIds.filter((id) =>
          keptEdgeIds.has(id)
        ),
      };
    });
  },

  updateEdgeRelationship: (id, patch) => {
    set((state) => ({
      edges: state.edges.map((edge) =>
        edge.id === id
          ? {
              ...edge,
              relationship: { ...edge.relationship, ...patch },
              meta: { ...edge.meta, updatedAt: now() },
            }
          : edge
      ),
    }));
  },

  removeEdges: (ids) => {
    const idSet = new Set(ids);
    set((state) => ({
      edges: state.edges.filter((edge) => !idSet.has(edge.id)),
      selectedEdgeIds: state.selectedEdgeIds.filter((id) => !idSet.has(id)),
    }));
  },

  setSelection: (nodeIds) =>
    set({ selectedNodeIds: nodeIds, selectedEdgeIds: [] }),

  clearSelection: () => set({ selectedNodeIds: [], selectedEdgeIds: [] }),

  hydrate: (doc) =>
    set({
      nodes: doc.nodes,
      edges: doc.edges,
      selectedNodeIds: [],
      selectedEdgeIds: [],
    }),

  onNodesChange: (changes) => {
    let nextNodes = get().nodes;
    let nextSelected = get().selectedNodeIds;
    const removedIds: string[] = [];

    for (const change of changes) {
      switch (change.type) {
        case 'position': {
          // Arrastre: actualiza la posición para que el render siga al cursor.
          if (change.position) {
            const pos = change.position;
            nextNodes = nextNodes.map((node) =>
              node.id === change.id ? { ...node, position: pos } : node
            );
          }
          break;
        }
        case 'select': {
          nextSelected = change.selected
            ? [...new Set([...nextSelected, change.id])]
            : nextSelected.filter((id) => id !== change.id);
          break;
        }
        case 'remove': {
          removedIds.push(change.id);
          break;
        }
        // 'add' | 'dimensions' | 'replace' las gestiona React Flow internamente.
        default:
          break;
      }
    }

    if (removedIds.length > 0) {
      // Reutiliza la lógica de borrado (también limpia edges y selección).
      get().removeNodes(removedIds);
      nextNodes = get().nodes;
      nextSelected = get().selectedNodeIds;
    }

    set({ nodes: nextNodes, selectedNodeIds: nextSelected });
  },

  onEdgesChange: (changes) => {
    let nextEdges = get().edges;
    let nextSelected = get().selectedEdgeIds;

    for (const change of changes) {
      switch (change.type) {
        case 'remove': {
          nextEdges = nextEdges.filter((edge) => edge.id !== change.id);
          nextSelected = nextSelected.filter((id) => id !== change.id);
          break;
        }
        case 'select': {
          nextSelected = change.selected
            ? [...new Set([...nextSelected, change.id])]
            : nextSelected.filter((id) => id !== change.id);
          break;
        }
        default:
          break;
      }
    }

    set({ edges: nextEdges, selectedEdgeIds: nextSelected });
  },

  onConnect: (connection) => {
    if (!connection.source || !connection.target) return;
    const timestamp = now();
    const edge: WorldEdge = {
      id: createId(),
      source: connection.source,
      target: connection.target,
      relationship: defaultRelationship(),
      meta: { createdAt: timestamp, updatedAt: timestamp },
    };
    // Crea la relación y la selecciona para editarla de inmediato en el panel.
    set((state) => ({
      edges: [...state.edges, edge],
      selectedEdgeIds: [edge.id],
      selectedNodeIds: [],
    }));
  },
}));
