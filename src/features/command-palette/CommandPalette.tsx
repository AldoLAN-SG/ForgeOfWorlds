import { useEffect, useMemo, useRef, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import type { LucideIcon } from 'lucide-react';
import { useWorldStore } from '@/store/worldStore';
import { getNodeDefinition, listNodeDefinitions } from '@/features/nodes/registry';

/**
 * Command Palette (Ctrl/Cmd + K). Buscador y NAVEGADOR de nodos: filtra por
 * texto y por tipo, y salta al nodo elegido (centra el canvas y lo selecciona).
 *
 * A escala (100+ nodos) la paleta es la vía principal de navegación, por eso
 * incorpora chips de filtro por tipo: acota el listado a un solo kind sin
 * teclear. La búsqueda sigue siendo agnóstica al tipo (usa `getTitle` y
 * `searchableText` del registry), así un tipo nuevo aparece sin tocar este
 * componente.
 */

const MAX_RESULTS = 50;

interface SearchResult {
  id: string;
  kind: string;
  title: string;
  typeLabel: string;
  accent: string;
  Icon: LucideIcon | undefined;
  haystack: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [kindFilter, setKindFilter] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { setCenter, getNode } = useReactFlow();
  const nodes = useWorldStore((s) => s.nodes);
  const setSelection = useWorldStore((s) => s.setSelection);

  const definitions = listNodeDefinitions();

  // Abrir/cerrar con Ctrl/Cmd + K (global).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Al abrir: limpiar y enfocar el input.
  useEffect(() => {
    if (open) {
      setQuery('');
      setKindFilter(null);
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Índice de búsqueda derivado del registry (agnóstico al tipo).
  const index = useMemo<SearchResult[]>(() => {
    return nodes.map((node) => {
      const def = getNodeDefinition(node.kind);
      const title = def?.getTitle(node.data) ?? '';
      const text = def?.searchableText(node.data) ?? title;
      return {
        id: node.id,
        kind: node.kind,
        title,
        typeLabel: def?.label ?? node.kind,
        accent: def?.accent ?? '#6366f1',
        Icon: def?.icon,
        haystack: `${title} ${text}`.toLowerCase(),
      };
    });
  }, [nodes]);

  // Conteo por tipo para mostrarlo en los chips de filtro.
  const countByKind = useMemo(() => {
    const counts = new Map<string, number>();
    for (const it of index) counts.set(it.kind, (counts.get(it.kind) ?? 0) + 1);
    return counts;
  }, [index]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let filtered = kindFilter ? index.filter((it) => it.kind === kindFilter) : index;
    if (q) filtered = filtered.filter((it) => it.haystack.includes(q));
    // Ranking simple: primero los títulos que empiezan por la consulta.
    return [...filtered]
      .sort((a, b) => {
        const aStarts = a.title.toLowerCase().startsWith(q) ? 0 : 1;
        const bStarts = b.title.toLowerCase().startsWith(q) ? 0 : 1;
        if (aStarts !== bStarts) return aStarts - bStarts;
        return a.title.localeCompare(b.title);
      })
      .slice(0, MAX_RESULTS);
  }, [index, query, kindFilter]);

  // Mantener el índice activo dentro de rango cuando cambian los resultados.
  useEffect(() => {
    setActiveIndex(0);
  }, [query, kindFilter]);

  const close = () => setOpen(false);

  const focusInput = () => requestAnimationFrame(() => inputRef.current?.focus());

  const goToNode = (id: string) => {
    const node = nodes.find((n) => n.id === id);
    if (!node) return;
    const rfNode = getNode(id);
    const width = rfNode?.measured?.width ?? 0;
    const height = rfNode?.measured?.height ?? 0;
    const targetX = node.position.x + width / 2;
    const targetY = node.position.y + height / 2;

    setSelection([id]);
    close();
    // Diferir el centrado: aplicar la selección provoca un re-render que
    // cancelaría la transición de `setCenter` si se llamara de inmediato.
    requestAnimationFrame(() => {
      setCenter(targetX, targetY, { zoom: 1.2, duration: 600 });
    });
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = results[activeIndex];
      if (item) goToNode(item.id);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/30 pt-[15vh]"
      onClick={close}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onInputKeyDown}
          placeholder="Buscar nodos por nombre…"
          className="w-full border-b border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none"
        />

        {/* Chips de filtro por tipo: acotan el listado a un solo kind. */}
        <div className="flex flex-wrap gap-1 border-b border-slate-200 px-3 py-2">
          <FilterChip
            label="Todos"
            count={index.length}
            active={kindFilter === null}
            onSelect={() => {
              setKindFilter(null);
              focusInput();
            }}
          />
          {definitions.map((def) => (
            <FilterChip
              key={def.kind}
              label={def.label}
              count={countByKind.get(def.kind) ?? 0}
              Icon={def.icon}
              accent={def.accent}
              active={kindFilter === def.kind}
              onSelect={() => {
                setKindFilter((k) => (k === def.kind ? null : def.kind));
                focusInput();
              }}
            />
          ))}
        </div>

        <ul className="max-h-80 overflow-y-auto py-1">
          {results.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-slate-400">
              {nodes.length === 0 ? 'No hay nodos todavía' : 'Sin resultados'}
            </li>
          ) : (
            results.map((item, i) => {
              const Icon = item.Icon;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => goToNode(item.id)}
                    className={[
                      'flex w-full items-center gap-2 px-4 py-2 text-left text-sm',
                      i === activeIndex ? 'bg-indigo-50' : '',
                    ].join(' ')}
                  >
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
                      style={{ background: `${item.accent}1f` }}
                    >
                      {Icon && <Icon size={12} style={{ color: item.accent }} />}
                    </span>
                    <span className="truncate font-medium text-slate-800">
                      {item.title || 'Sin título'}
                    </span>
                    <span className="ml-auto shrink-0 text-xs text-slate-400">
                      {item.typeLabel}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>

        <div className="border-t border-slate-200 px-4 py-2 text-[11px] text-slate-400">
          ↑↓ navegar · ↵ ir al nodo · esc cerrar
        </div>
      </div>
    </div>
  );
}

interface FilterChipProps {
  label: string;
  count: number;
  active: boolean;
  onSelect: () => void;
  Icon?: LucideIcon;
  accent?: string;
}

function FilterChip({ label, count, active, onSelect, Icon, accent }: FilterChipProps) {
  return (
    <button
      type="button"
      // No robar el foco del input al hacer click en el chip.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onSelect}
      className={[
        'flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors',
        active
          ? 'border-transparent text-white'
          : 'border-slate-200 text-slate-600 hover:bg-slate-50',
      ].join(' ')}
      style={active ? { backgroundColor: accent ?? '#6366f1' } : undefined}
    >
      {Icon && (
        <Icon size={11} style={{ color: active ? '#fff' : accent ?? '#64748b' }} />
      )}
      {label}
      <span className={active ? 'text-white/70' : 'text-slate-400'}>{count}</span>
    </button>
  );
}
