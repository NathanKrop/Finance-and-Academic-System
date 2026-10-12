import type { KeyboardEvent, ReactNode } from "react";

export type MarksGridRow = {
  id: string;
  adm: string;
  name: string;
  mark?: number | null;
  percent?: number | null;
  status?: string;
};

export type MarksGridProps = {
  rows: MarksGridRow[];
  title?: string;
  outOf?: number;
  saveLabel?: string;
  summary?: ReactNode;
  onSave?: () => void;
  onMarkChange?: (rowId: string, value: string) => void;
};

export function MarksGrid({
  rows,
  title = "Marks entry grid",
  outOf = 100,
  saveLabel = "Save",
  summary,
  onSave,
  onMarkChange,
}: MarksGridProps) {
  const entered = rows.filter((row) => row.mark !== null && row.mark !== undefined && !Number.isNaN(row.mark)).length;
  const missing = rows.length - entered;

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, rowIndex: number, columnIndex: number) => {
    if (event.key === "Enter" || event.key === "ArrowDown") {
      event.preventDefault();
      const next = document.querySelector<HTMLInputElement>(`[data-row-index="${rowIndex + 1}"][data-col-index="${columnIndex}"]`);
      next?.focus();
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      const prev = document.querySelector<HTMLInputElement>(`[data-row-index="${Math.max(0, rowIndex - 1)}"][data-col-index="${columnIndex}"]`);
      prev?.focus();
    }
  };

  return (
    <div className="rounded-xl border border-academic-line bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-academic-line bg-academic-paper px-4 py-3">
        <h3 className="text-sm font-semibold text-academic-ink">{title}</h3>
        {summary ?? (
          <div className="flex items-center gap-3 text-[11px] text-academic-ink-soft">
            <span>{rows.length} students</span>
            <span>{entered} entered</span>
            <span>{missing} missing</span>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-academic-muted text-academic-ink">
            <tr>
              <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">#</th>
              <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">ADM</th>
              <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">Name</th>
              <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">Marks</th>
              <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">%</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={row.id} className="border-b border-academic-line last:border-b-0">
                <td className="px-3 py-2.5 text-academic-ink-soft">{rowIndex + 1}</td>
                <td className="px-3 py-2.5 text-academic-ink">{row.adm}</td>
                <td className="px-3 py-2.5 text-academic-ink">{row.name}</td>
                <td className="px-3 py-2.5">
                  <input
                    type="number"
                    min={0}
                    max={outOf}
                    step="0.1"
                    value={row.mark ?? ""}
                    data-row-index={rowIndex}
                    data-col-index={0}
                    onChange={(event) => onMarkChange?.(row.id, event.target.value)}
                    onKeyDown={(event) => handleKeyDown(event, rowIndex, 0)}
                    className="w-24 rounded-md border border-academic-line bg-white px-2 py-1.5 text-sm text-academic-ink outline-none transition focus:border-academic-accent"
                  />
                </td>
                <td className="px-3 py-2.5 text-academic-ink-soft">
                  {row.percent !== null && row.percent !== undefined ? `${row.percent}%` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-academic-line bg-academic-paper px-4 py-3 text-xs text-academic-ink-soft">
        <span>Dirty cells highlighted in the final implementation</span>
        <button
          type="button"
          onClick={onSave}
          className="rounded-md bg-academic-accent px-3 py-1.5 font-medium text-white transition hover:bg-academic-accent/90"
        >
          {saveLabel}
        </button>
      </div>
    </div>
  );
}
