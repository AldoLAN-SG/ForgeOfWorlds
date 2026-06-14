import { Zap } from 'lucide-react';
import { EVENT_NODE_KIND, type EventData } from '@/types/world';
import type { NodeTypeDefinition } from '@/features/nodes/types';
import { EntityNode } from '@/features/nodes/shared/EntityNode';
import { EntityPanel } from '@/features/nodes/shared/EntityPanel';

export const eventDefinition: NodeTypeDefinition<EventData> = {
  kind: EVENT_NODE_KIND,
  label: 'Evento',
  icon: Zap,
  accent: '#d97706', // amber-600
  createData: () => ({ name: 'Nuevo evento', description: '' }),
  getTitle: (d) => d.name,
  CanvasComponent: EntityNode,
  PanelComponent: EntityPanel,
  fields: [
    { key: 'date', label: 'Fecha o era', type: 'text', placeholder: 'Año 1200 AC, Tercera Edad…' },
    { key: 'consequences', label: 'Consecuencias', type: 'textarea', placeholder: 'Qué cambió en el mundo tras esto' },
    { key: 'participants', label: 'Implicados', type: 'textarea', placeholder: 'Quién o qué tomó parte' },
  ],
  searchableText: (d) =>
    [d.name, d.description, d.body, d.date, d.consequences, d.participants]
      .filter(Boolean)
      .join(' '),
};
