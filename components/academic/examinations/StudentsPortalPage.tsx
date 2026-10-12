"use client";

import { useMemo, useState } from "react";
import { ToolSwitch } from "@/components/academic/examinations/ToolSwitch";
import { useExaminationsData } from "@/components/academic/examinations/ExaminationsProvider";

const FORM_GROUPS = ["Grade 10", "Grade 11"];
const ROW_KEYS = ["Group 2", "Group 3", "Any Other Best"];
const COLUMN_LABELS = ["Col 1", "Col 2", "Col 3", "Col 4"];

export function StudentsPortalPage() {
  const { data, setData, ready } = useExaminationsData();
  const [drafts, setDrafts] = useState<Record<string, Record<string, Record<string, number>>>>(() => data.rankingCriteria);

  const formBlocks = useMemo(
    () => FORM_GROUPS.filter((form) => data.rankingCriteria[form] || true).map((form) => ({ form, rows: ROW_KEYS })),
    [data.rankingCriteria],
  );

  const toolEnabled = data.toolSettings["exams.students_portal"] ?? true;

  const updateCell = (form: string, rowKey: string, colIndex: string, value: string) => {
    const nextValue = Number(value);
    setDrafts((current) => ({
      ...current,
      [form]: {
        ...(current[form] ?? {}),
        [rowKey]: {
          ...((current[form] ?? {})[rowKey] ?? {}),
          [colIndex]: Number.isFinite(nextValue) ? nextValue : 0,
        },
      },
    }));
  };

  const saveForm = (form: string) => {
    setData((current) => ({
      ...current,
      rankingCriteria: {
        ...current.rankingCriteria,
        [form]: drafts[form] ?? current.rankingCriteria[form] ?? {},
      },
    }));
  };

  if (!ready) {
    return <div className="rounded-md border border-academic-line bg-academic-surface p-8 text-center text-sm text-academic-ink-soft">Loading ranking criteria…</div>;
  }

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-academic-line bg-academic-surface p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-academic-accent">Examinations</p>
            <h1 className="mt-2 font-display text-3xl text-academic-ink">Set Subject ranking criteria per form.</h1>
          </div>
          <div className="w-full max-w-xs">
            <ToolSwitch
              checked={toolEnabled}
              label="Tool enabled"
              onChange={(checked) => setData((current) => ({
                ...current,
                toolSettings: { ...current.toolSettings, "exams.students_portal": checked },
              }))}
            />
          </div>
        </div>
      </header>

      {!toolEnabled && (
        <div className="rounded-xl border border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          This tool is switched off.
        </div>
      )}

      <div className="space-y-6">
        {formBlocks.map(({ form }) => (
          <div key={form} className="rounded-2xl border border-academic-line bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold uppercase tracking-[0.06em] text-academic-ink">{form} (STUDENTS PORTAL EXAMS)</h2>
              <button
                type="button"
                disabled={!toolEnabled}
                onClick={() => saveForm(form)}
                className="rounded-md bg-academic-accent px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-academic-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-academic-muted text-academic-ink">
                    <th className="border border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">Category</th>
                    {COLUMN_LABELS.map((label) => (
                      <th key={label} className="border border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROW_KEYS.map((rowKey) => {
                    const rowData = drafts[form]?.[rowKey] ?? data.rankingCriteria[form]?.[rowKey] ?? {
                      "Col 1": 2,
                      "Col 2": 2,
                      "Col 3": 2,
                      "Col 4": 2,
                    };

                    return (
                      <tr key={`${form}-${rowKey}`}>
                        <td className="border border-academic-line px-3 py-2.5 font-medium text-academic-ink">{rowKey}</td>
                        {COLUMN_LABELS.map((column) => (
                          <td key={`${form}-${rowKey}-${column}`} className="border border-academic-line px-2 py-2">
                            <input
                              type="number"
                              min={0}
                              step={1}
                              disabled={!toolEnabled}
                              value={rowData[column] ?? 0}
                              onChange={(event) => updateCell(form, rowKey, column, event.target.value)}
                              className="w-20 rounded-md border border-academic-line bg-white px-2 py-1.5 text-sm text-academic-ink outline-none transition focus:border-academic-accent"
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
