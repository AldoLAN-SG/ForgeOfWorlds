import { MapPin } from 'lucide-react';
import {
  LOCATION_NODE_KIND,
  type LocationData,
} from '@/types/world';
import type { NodeTypeDefinition } from '@/features/nodes/types';
import { EntityNode } from '@/features/nodes/shared/EntityNode';
import { EntityPanel } from '@/features/nodes/shared/EntityPanel';

/** Definición del tipo de nodo Lugar. */
export const locationDefinition: NodeTypeDefinition<LocationData> = {
  kind: LOCATION_NODE_KIND,
  label: 'Lugar',
  icon: MapPin,
  accent: '#0d9488', // teal
  createData: () => ({ name: 'Nuevo lugar', description: '' }),
  getTitle: (d) => d.name,
  CanvasComponent: EntityNode,
  PanelComponent: EntityPanel,
  fields: [
    { key: 'placeType', label: 'Tipo de lugar', type: 'text', placeholder: 'Ciudad, reino, bosque…' },
    { key: 'atmosphere', label: 'Atmósfera', type: 'textarea', placeholder: 'Qué se siente al estar allí' },
    { key: 'relevance', label: 'Relevancia', type: 'textarea', placeholder: 'Por qué importa en la historia' },
  ],
  searchableText: (d) =>
    [d.name, d.description, d.body, d.placeType, d.atmosphere, d.relevance]
      .filter(Boolean)
      .join(' '),
};
