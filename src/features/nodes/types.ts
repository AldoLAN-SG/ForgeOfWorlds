import type { ComponentType } from 'react';
import type { NodeProps } from '@xyflow/react';
import type { LucideIcon } from 'lucide-react';
import type { NodeKind } from '@/types/world';

/**
 * Contrato de un tipo de nodo (Personaje, Lugar, y a futuro Evento, Facción...).
 *
 * Cada tipo se auto-describe mediante una `NodeTypeDefinition`. El core no
 * conoce ningún tipo concreto: solo el registry (registry.ts) y el inspector
 * consumen estas definiciones. Añadir un tipo nuevo = crear su definición y
 * registrarla, sin modificar canvas, store ni inspector.
 */

/** Props que recibe el editor de un nodo en el panel lateral. */
export interface NodePanelProps<TData> {
  nodeId: string;
  data: TData;
  /** Aplica un cambio parcial; el store mezcla y marca `updatedAt`. */
  onChange: (patch: Partial<TData>) => void;
}

/**
 * Descripción declarativa de un campo del inspector. Cada tipo enumera sus
 * campos específicos como DATOS; el panel genérico (EntityPanel) los renderiza.
 * Así, añadir un campo a un tipo es una línea de datos, no JSX nuevo.
 */
export interface FieldSchema {
  /** Clave dentro de `data` donde se guarda el valor. */
  key: string;
  /** Etiqueta visible sobre el campo. */
  label: string;
  /** Control a renderizar. */
  type: 'text' | 'textarea';
  /** Texto de ayuda dentro del control vacío. */
  placeholder?: string;
}

export interface NodeTypeDefinition<TData = unknown> {
  /** Discriminador, debe coincidir con `WorldNode.kind`. */
  kind: NodeKind;
  /** Etiqueta legible, ej. "Personaje". */
  label: string;
  /** Icono representativo (lucide). */
  icon: LucideIcon;
  /** Color de acento (hex) para bordes, iconos y cabeceras. */
  accent: string;
  /** Datos iniciales al crear un nodo de este tipo. */
  createData: () => TData;
  /** Título legible del nodo (para la command palette y listados). */
  getTitle: (data: TData) => string;
  /** Componente que dibuja el nodo en el lienzo (React Flow). */
  CanvasComponent: ComponentType<NodeProps>;
  /** Componente que edita el nodo en el panel lateral. */
  PanelComponent: ComponentType<NodePanelProps<TData>>;
  /** Campos específicos del tipo, mostrados en la sección "Detalles". */
  fields?: FieldSchema[];
  /** Texto plano que la búsqueda global indexará (Fase 5). */
  searchableText: (data: TData) => string;
}
