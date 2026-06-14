import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Sección colapsable del inspector. Mantiene el panel corto: cada grupo de
 * campos se puede plegar para que el usuario se concentre en lo que edita.
 * Estilo común a todos los tipos → consistencia visual.
 */
export function InspectorSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border-t border-slate-100">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-2.5 text-left"
      >
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {title}
        </span>
        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform ${open ? '' : '-rotate-90'}`}
        />
      </button>
      {open && <div className="pb-3">{children}</div>}
    </section>
  );
}
