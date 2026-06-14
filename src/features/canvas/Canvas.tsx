import { useMemo } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  Panel,
  ReactFlow,
} from '@xyflow/react';
import { useWorldStore } from '@/store/worldStore';
import { nodeTypes } from '@/features/nodes/registry';
import { edgeTypes } from '@/features/edges/edgeTypes';
import {
  toReactFlowEdge,
  toReactFlowNode,
} from '@/services/reactflow/adapters';
import { Toolbar } from './Toolbar';

/** Teclas que eliminan la selección. */
const DELETE_KEYS = ['Delete', 'Backspace'];

/**
 * Lienzo infinito. React Flow en modo controlado: las nodes/edges se derivan
 * del store de dominio y los eventos se delegan a los handlers del store.
 */
export function Canvas() {
  // Selectores granulares: cada slice se suscribe por separado.
  const nodes = useWorldStore((s) => s.nodes);
  const edges = useWorldStore((s) => s.edges);
  const selectedNodeIds = useWorldStore((s) => s.selectedNodeIds);
  const selectedEdgeIds = useWorldStore((s) => s.selectedEdgeIds);
  const onNodesChange = useWorldStore((s) => s.onNodesChange);
  const onEdgesChange = useWorldStore((s) => s.onEdgesChange);
  const onConnect = useWorldStore((s) => s.onConnect);

  // Traducción dominio -> React Flow, memoizada para no recalcular en cada
  // render ajeno. El Set evita el O(n*m) al marcar la selección.
  const rfNodes = useMemo(() => {
    const selected = new Set(selectedNodeIds);
    return nodes.map((node) => toReactFlowNode(node, selected.has(node.id)));
  }, [nodes, selectedNodeIds]);

  const rfEdges = useMemo(() => {
    const selected = new Set(selectedEdgeIds);
    return edges.map((edge) => toReactFlowEdge(edge, selected.has(edge.id)));
  }, [edges, selectedEdgeIds]);

  return (
    <ReactFlow
      nodes={rfNodes}
      edges={rfEdges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      deleteKeyCode={DELETE_KEYS}
      multiSelectionKeyCode={['Meta', 'Shift']}
      selectionOnDrag
      fitView
      // Rendimiento: solo renderiza los elementos visibles en el viewport.
      onlyRenderVisibleElements
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      <Controls />
      <Panel position="top-left">
        <Toolbar />
      </Panel>
    </ReactFlow>
  );
}
