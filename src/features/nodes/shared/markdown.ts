/**
 * Renderizador de markdown MÍNIMO y sin dependencias. Cubre lo que necesita la
 * prosa de worldbuilding: encabezados, negrita, cursiva, listas y párrafos.
 *
 * Está encapsulado aquí a propósito: si algún día se queda corto, se sustituye
 * por una librería sin tocar el editor ni el modelo de datos.
 *
 * Seguridad: el texto se escapa ANTES de aplicar el formato, así un `<script>`
 * del usuario se neutraliza. La salida solo contiene los tags que generamos.
 */

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inline(text: string): string {
  // Negrita antes que cursiva para no romper los dobles asteriscos.
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-slate-800">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');
}

export function renderMarkdown(md: string): string {
  const lines = escapeHtml(md).split('\n');
  const out: string[] = [];
  let listOpen = false;

  const closeList = () => {
    if (listOpen) {
      out.push('</ul>');
      listOpen = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (line.trim() === '') {
      closeList();
      continue;
    }

    const h3 = /^###\s+(.*)$/.exec(line);
    const h2 = /^##\s+(.*)$/.exec(line);
    const h1 = /^#\s+(.*)$/.exec(line);
    const li = /^[-*]\s+(.*)$/.exec(line);

    if (h3) {
      closeList();
      out.push(`<h3 class="mt-2 mb-1 text-sm font-semibold text-slate-700">${inline(h3[1])}</h3>`);
    } else if (h2) {
      closeList();
      out.push(`<h2 class="mt-3 mb-1 text-base font-bold text-slate-800">${inline(h2[1])}</h2>`);
    } else if (h1) {
      closeList();
      out.push(`<h1 class="mt-3 mb-1 text-lg font-bold text-slate-800">${inline(h1[1])}</h1>`);
    } else if (li) {
      if (!listOpen) {
        out.push('<ul class="mb-2 list-disc space-y-0.5 pl-5">');
        listOpen = true;
      }
      out.push(`<li class="text-sm text-slate-700">${inline(li[1])}</li>`);
    } else {
      closeList();
      out.push(`<p class="mb-2 text-sm leading-relaxed text-slate-700">${inline(line)}</p>`);
    }
  }

  closeList();
  return out.join('');
}

/** Versión en texto plano para previews (quita la sintaxis markdown). */
export function toPlainText(md: string): string {
  return md
    .replace(/[#>*_`~-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
