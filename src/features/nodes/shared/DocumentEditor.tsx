import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { renderMarkdown } from './markdown';

/**
 * Editor de texto largo en "modo concentración": overlay centrado a ancho de
 * lectura cómodo. Escribe en markdown; alterna entre Editar y Vista previa.
 *
 * Rendimiento + futuro undo: el editor mantiene el texto en estado LOCAL y hace
 * commit al store con debounce. Así escribir no re-renderiza el lienzo en cada
 * tecla, y cada commit es un paso de historial natural para el undo (Fase #2).
 * Al cerrar se hace un flush para no perder lo último escrito.
 */

const COMMIT_DEBOUNCE_MS = 400;

export function DocumentEditor({
  title,
  initialBody,
  onCommit,
  onClose,
}: {
  title: string;
  initialBody: string;
  onCommit: (body: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(initialBody);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  // Refs para acceder al valor/commit actuales desde callbacks estables.
  const valueRef = useRef(value);
  valueRef.current = value;
  const commitRef = useRef(onCommit);
  commitRef.current = onCommit;

  // Commit con debounce: cada pausa al escribir guarda en el store.
  useEffect(() => {
    const t = window.setTimeout(() => commitRef.current(valueRef.current), COMMIT_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [value]);

  const close = () => {
    commitRef.current(valueRef.current); // flush final
    onClose();
  };

  // Esc cierra (con flush). Registrado una vez.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        commitRef.current(valueRef.current);
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const words = value.trim() ? value.trim().split(/\s+/).length : 0;

  const tab = (active: boolean) =>
    [
      'rounded-md px-2 py-1 text-xs font-medium transition-colors',
      active ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700',
    ].join(' ');

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 pt-[8vh]"
      onClick={close}
    >
      <div
        className="flex h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
          <span className="truncate text-sm font-semibold text-slate-800">
            {title || 'Sin título'}
          </span>
          <div className="ml-auto flex items-center gap-0.5 rounded-lg bg-slate-100 p-0.5">
            <button type="button" onClick={() => setMode('edit')} className={tab(mode === 'edit')}>
              Editar
            </button>
            <button
              type="button"
              onClick={() => setMode('preview')}
              className={tab(mode === 'preview')}
            >
              Vista previa
            </button>
          </div>
          <button
            type="button"
            onClick={close}
            title="Cerrar"
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {mode === 'edit' ? (
            <textarea
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Escribe la historia, el trasfondo, las notas largas…&#10;&#10;Usa # para títulos, **negrita**, *cursiva* y - para listas."
              className="h-full w-full resize-none px-6 py-4 text-sm leading-relaxed text-slate-800 outline-none"
            />
          ) : (
            <div
              className="px-6 py-4"
              dangerouslySetInnerHTML={{
                __html:
                  renderMarkdown(value) ||
                  '<p class="text-sm text-slate-400">Nada que previsualizar todavía.</p>',
              }}
            />
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-2 text-[11px] text-slate-400">
          <span>
            {words} palabra{words === 1 ? '' : 's'}
          </span>
          <span>esc cerrar · markdown</span>
        </div>
      </div>
    </div>
  );
}
