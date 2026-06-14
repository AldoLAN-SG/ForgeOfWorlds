import { Sparkles } from 'lucide-react';
import { POWER_SYSTEM_NODE_KIND, type PowerSystemData } from '@/types/world';
import type { NodeTypeDefinition } from '@/features/nodes/types';
import { EntityNode } from '@/features/nodes/shared/EntityNode';
import { EntityPanel } from '@/features/nodes/shared/EntityPanel';

export const powerSystemDefinition: NodeTypeDefinition<PowerSystemData> = {
  kind: POWER_SYSTEM_NODE_KIND,
  label: 'Sistema de poder',
  icon: Sparkles,
  accent: '#7c3aed', // violet-700
  createData: () => ({ name: 'Nuevo sistema', description: '' }),
  getTitle: (d) => d.name,
  CanvasComponent: EntityNode,
  PanelComponent: EntityPanel,
  fields: [
    { key: 'source', label: 'Fuente', type: 'textarea', placeholder: 'De dónde emana: sangre, fe, tecnología…' },
    { key: 'rules', label: 'Reglas y límites', type: 'textarea', placeholder: 'Cómo funciona y qué no puede hacer' },
    { key: 'cost', label: 'Coste o riesgo', type: 'textarea', placeholder: 'Qué cuesta usarlo' },
  ],
  searchableText: (d) =>
    [d.name, d.description, d.body, d.source, d.rules, d.cost]
      .filter(Boolean)
      .join(' '),
};
