import type { EdgeTypes } from '@xyflow/react';
import { RelationshipEdge } from './RelationshipEdge';

/**
 * Mapa de tipos de edge para React Flow. Referencia estable a nivel de módulo.
 * Todas las relaciones usan el tipo 'relationship' (ver adapters.ts).
 */
export const edgeTypes: EdgeTypes = {
  relationship: RelationshipEdge,
};
