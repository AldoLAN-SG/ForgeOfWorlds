import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ReactFlowProvider } from '@xyflow/react';
import { Canvas } from '@/features/canvas/Canvas';
import { InspectorPanel } from '@/features/inspector/InspectorPanel';
import { CommandPalette } from '@/features/command-palette/CommandPalette';

const PANEL_MIN = 220;
const PANEL_MAX = 700;
const PANEL_DEFAULT = 320;

export default function App() {
  const [panelWidth, setPanelWidth] = useState(PANEL_DEFAULT);
  const [collapsed, setCollapsed] = useState(false);
  const dragState = useRef<{ startX: number; startWidth: number } | null>(null);

  const onHandleMouseDown = (e: React.MouseEvent) => {
    if (collapsed) return;
    e.preventDefault(); // evita selección de texto durante el arrastre
    dragState.current = { startX: e.clientX, startWidth: panelWidth };

    const onMove = (ev: MouseEvent) => {
      if (!dragState.current) return;
      // Arrastrar a la izquierda = panel más ancho; a la derecha = más estrecho
      const delta = dragState.current.startX - ev.clientX;
      const next = Math.max(PANEL_MIN, Math.min(PANEL_MAX, dragState.current.startWidth + delta));
      setPanelWidth(next);
    };

    const onUp = () => {
      dragState.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <ReactFlowProvider>
      <main className="flex h-screen w-screen overflow-hidden bg-slate-50">
        {/* Canvas ocupa todo el espacio restante; min-w-0 permite que se encoja */}
        <div className="relative min-w-0 flex-1">
          <Canvas />
        </div>

        {/* Asa de redimensionado */}
        <div
          className={[
            'group relative flex w-1.5 shrink-0 items-center bg-slate-200',
            'transition-colors hover:bg-indigo-400',
            collapsed ? 'cursor-pointer' : 'cursor-col-resize',
          ].join(' ')}
          onMouseDown={onHandleMouseDown}
        >
          {/* Botón de colapsar / expandir, centrado verticalmente */}
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? 'Expandir panel' : 'Colapsar panel'}
            className={[
              'absolute left-1/2 top-1/2 z-10',
              '-translate-x-1/2 -translate-y-1/2',
              'flex h-7 w-4 items-center justify-center',
              'rounded border border-slate-200 bg-white shadow-sm',
              'opacity-0 transition-opacity group-hover:opacity-100',
              'hover:bg-slate-50',
            ].join(' ')}
          >
            {collapsed
              ? <ChevronLeft size={10} className="text-slate-500" />
              : <ChevronRight size={10} className="text-slate-500" />}
          </button>
        </div>

        {/* Panel inspector con ancho dinámico */}
        <div
          className="shrink-0 overflow-hidden transition-[width] duration-200"
          style={{ width: collapsed ? 0 : panelWidth }}
        >
          <InspectorPanel />
        </div>
      </main>
      <CommandPalette />
    </ReactFlowProvider>
  );
}
