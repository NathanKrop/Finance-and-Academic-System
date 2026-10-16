"use client";

import { useMemo, useState } from "react";
import { ToolSwitch } from "@/components/academic/examinations/ToolSwitch";
import { useExaminationsData } from "@/components/academic/examinations/ExaminationsProvider";

const SUBJECT_OPTIONS = [
  { id: "subject-english", label: "English" },
  { id: "subject-maths", label: "Mathematics" },
  { id: "subject-kiswahili", label: "Kiswahili" },
  { id: "subject-physics", label: "Physics" },
  { id: "subject-biology", label: "Biology" },
  { id: "subject-chemistry", label: "Chemistry" },
  { id: "subject-history", label: "History" },
];

const DEFAULT_WEIGHTS: Record<string, number> = {
  "subject-english": 20,
  "subject-maths": 20,
  "subject-kiswahili": 15,
  "subject-physics": 15,
  "subject-biology": 15,
  "subject-chemistry": 10,
  "subject-history": 5,
};

export function SetExamContributionPage() {
  const { data, setData } = useExaminationsData();
  const [examId, setExamId] = useState(data.exams[0]?.id ?? "");
  const [formLevel, setFormLevel] = useState("Grade 10");
  const [weights, setWeights] = useState<Record<string, number>>(DEFAULT_WEIGHTS);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const examOptions = useMemo(() => data.exams.map((exam) => ({ value: exam.id, label: `${exam.title} (${exam.term})` })), [data.exams]);
  const formOptions = useMemo(() => ["Grade 10", "Grade 11"], []);
  const toolEnabled = data.toolSettings["exams.contribution"] ?? true;
  const selectedExamId = examOptions.some((exam) => exam.value === examId)
    ? examId
    : examOptions[0]?.value ?? "";

  const totalContribution = Object.values(weights).reduce((sum, value) => sum + Number(value || 0), 0);

  const updateWeight = (subjectId: string, value: string) => {
    const parsed = Number(value);
    setWeights((current) => ({
      ...current,
      [subjectId]: Number.isFinite(parsed) ? Math.max(0, parsed) : 0,
    }));
  };

  const saveContribution = () => {
    setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    setData((current) => ({
      ...current,
      toolSettings: { ...current.toolSettings, "exams.contribution": true },
    }));
  };

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-academic-line bg-academic-surface p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-academic-accent">Examinations</p>
            <h1 className="mt-2 font-display text-3xl text-academic-ink">Set Exam Contribution</h1>
          </div>
          <div className="w-full max-w-xs">
            <ToolSwitch
              checked={toolEnabled}
              label="Tool enabled"
              onChange={(checked) =>
                setData((current) => ({
                  ...current,
                  toolSettings: { ...current.toolSettings, "exams.contribution": checked },
                }))
              }
            />
          </div>
        </div>
      </header>

      {!toolEnabled && (
        <div className="rounded-xl border border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          This tool is switched off.
        </div>
      )}

      <div className="rounded-2xl border border-academic-line bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Exam</span>
            <select
              value={selectedExamId}
              disabled={!toolEnabled}
              onChange={(event) => setExamId(event.target.value)}
              className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink"
            >
              {examOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Form / Level</span>
            <select
              value={formLevel}
              disabled={!toolEnabled}
              onChange={(event) => setFormLevel(event.target.value)}
              className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink"
            >
              {formOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-academic-line bg-white">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-academic-muted text-academic-ink">
              <tr>
                <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">Subject</th>
                <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">Contribution %</th>
              </tr>
            </thead>
            <tbody>
              {SUBJECT_OPTIONS.map((subject) => (
                <tr key={subject.id} className="border-b border-academic-line last:border-b-0">
                  <td className="px-3 py-2.5 text-academic-ink">{subject.label}</td>
                  <td className="px-3 py-2.5">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={weights[subject.id] ?? 0}
                      disabled={!toolEnabled}
                      onChange={(event) => updateWeight(subject.id, event.target.value)}
                      className="w-24 rounded-md border border-academic-line bg-white px-2 py-1.5 text-sm text-academic-ink"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-academic-ink-soft">
            Total contribution: <span className={`font-semibold ${totalContribution === 100 ? "text-emerald-700" : "text-amber-700"}`}>
              {totalContribution}%
            </span>
          </p>

          <div className="flex items-center gap-3">
            {savedAt && <p className="text-xs uppercase tracking-[0.08em] text-emerald-700">Saved at {savedAt}</p>}
            <button
              type="button"
              onClick={saveContribution}
              disabled={!toolEnabled}
              className="rounded-md bg-academic-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-academic-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save contribution
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
