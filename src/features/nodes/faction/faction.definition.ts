import { Users } from 'lucide-react';
import { FACTION_NODE_KIND, type FactionData } from '@/types/world';
import type { NodeTypeDefinition } from '@/features/nodes/types';
import { EntityNode } from '@/features/nodes/shared/EntityNode';
import { EntityPanel } from '@/features/nodes/shared/EntityPanel';

export const factionDefinition: NodeTypeDefinition<FactionData> = {
  kind: FACTION_NODE_KIND,
  label: 'Facción',
  icon: Users,
  accent: '#ea580c', // orange-600
  createData: () => ({ name: 'Nueva facción', description: '' }),
  getTitle: (d) => d.name,
  CanvasComponent: EntityNode,
  PanelComponent: EntityPanel,
  fields: [
    { key: 'goal', label: 'Objetivo', type: 'textarea', placeholder: 'Qué persigue por encima de todo' },
    { key: 'ideology', label: 'Ideología', type: 'textarea', placeholder: 'Valores y creencias que defiende' },
    { key: 'resources', label: 'Recursos o poder', type: 'textarea', placeholder: 'Ejércitos, dinero, influencia…' },
  ],
  searchableText: (d) =>
    [d.name, d.description, d.body, d.goal, d.ideology, d.resources]
      .filter(Boolean)
      .join(' '),
};
