import { User } from 'lucide-react';
import {
  CHARACTER_NODE_KIND,
  type CharacterData,
} from '@/types/world';
import type { NodeTypeDefinition } from '@/features/nodes/types';
import { EntityNode } from '@/features/nodes/shared/EntityNode';
import { EntityPanel } from '@/features/nodes/shared/EntityPanel';

/** Definición del tipo de nodo Personaje. */
export const characterDefinition: NodeTypeDefinition<CharacterData> = {
  kind: CHARACTER_NODE_KIND,
  label: 'Personaje',
  icon: User,
  accent: '#6366f1', // indigo
  createData: () => ({ name: 'Nuevo personaje', description: '' }),
  getTitle: (d) => d.name,
  CanvasComponent: EntityNode,
  PanelComponent: EntityPanel,
  fields: [
    { key: 'role', label: 'Rol', type: 'text', placeholder: 'Protagonista, antagonista, mentor…' },
    { key: 'motivation', label: 'Motivación', type: 'textarea', placeholder: '¿Qué desea más que nada?' },
    { key: 'flaw', label: 'Defecto o miedo', type: 'textarea', placeholder: 'La herida interna que lo frena' },
    { key: 'arc', label: 'Arco', type: 'textarea', placeholder: 'Cómo cambia de principio a fin' },
  ],
  searchableText: (d) =>
    [d.name, d.description, d.body, d.role, d.motivation, d.flaw, d.arc]
      .filter(Boolean)
      .join(' '),
};
