"use client";

import { useMemo, useState } from "react";
import { ToolSwitch } from "@/components/academic/examinations/ToolSwitch";
import { useExaminationsData } from "@/components/academic/examinations/ExaminationsProvider";
import { EXAM_TERMS, EXAM_TYPES, type AcademicExam, type AcademicExamTerm, type ExamType } from "@/lib/academic/examinations-data";

const FORM_GROUPS = ["Grade 10", "Grade 11"];

function formatDate(dateString: string) {
  if (!dateString) return "—";
  return new Intl.DateTimeFormat("en-KE", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(dateString));
}

function getDeadlineLabel(deadline: string) {
  const target = new Date(deadline);
  const now = new Date();
  const diff = target.getTime() - now.getTime();

  if (Number.isNaN(diff)) return "—";
  if (diff <= 0) return "Closed";

  const totalDays = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  const hours = Math.max(0, Math.ceil((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
  return `${totalDays} Days ${hours} Hrs`;
}

function getExamFormLabel(forms: string[]) {
  return forms.length ? forms.join(", ") : "—";
}

export function ScheduleExamsPage() {
  const { data, setData, ready } = useExaminationsData();
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));
  const [now] = useState(() => Date.now());
  const [draft, setDraft] = useState<{
    type: ExamType;
    term: AcademicExamTerm;
    title: string;
    startDate: string;
    endDate: string;
    outOf: number;
    marksDeadline: string;
    forms: string[];
    allowTeacherOutOf: boolean;
  }>({
    type: "Other",
    term: "Term 1",
    title: "",
    startDate: "",
    endDate: "",
    outOf: 100,
    marksDeadline: "",
    forms: ["Grade 10"],
    allowTeacherOutOf: false,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredExams = useMemo(
    () => data.exams.filter((exam) => String(exam.year) === yearFilter).sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [data.exams, yearFilter],
  );

  const scheduleEnabled = data.toolSettings["exams.schedule"] ?? true;

  if (!ready) {
    return <div className="rounded-md border border-academic-line bg-academic-surface p-8 text-center text-sm text-academic-ink-soft">Loading exam schedule…</div>;
  }

  const onSubmit = () => {
    const trimmed = draft.title.trim();
    const isKcse = draft.type === "KCSE";
    const invalid = !trimmed || !draft.startDate || !draft.endDate || !draft.marksDeadline || !draft.forms.length || draft.outOf <= 0 && !isKcse || new Date(draft.endDate) < new Date(draft.startDate);

    if (invalid) {
      window.alert("Please complete all required exam fields with valid dates and at least one selected form.");
      return;
    }

    const nextExam: AcademicExam = {
      id: editingId ?? crypto.randomUUID(),
      year: Number(yearFilter),
      term: draft.term,
      type: draft.type,
      title: trimmed,
      startDate: draft.startDate,
      endDate: draft.endDate,
      outOf: isKcse ? 0 : Number(draft.outOf),
      marksDeadline: draft.marksDeadline,
      allowTeacherOutOf: isKcse ? false : draft.allowTeacherOutOf,
      forms: draft.forms,
      archivedAt: null,
      createdAt: new Date().toISOString(),
    };

    setData((current) => ({
      ...current,
      exams: editingId
        ? current.exams.map((exam) => (exam.id === editingId ? nextExam : exam))
        : [nextExam, ...current.exams],
    }));

    setDraft({
      type: "Other",
      term: "Term 1",
      title: "",
      startDate: "",
      endDate: "",
      outOf: 100,
      marksDeadline: "",
      forms: ["Grade 10"],
      allowTeacherOutOf: false,
    });
    setEditingId(null);
  };

  const onEdit = (exam: AcademicExam) => {
    setEditingId(exam.id);
    setDraft({
      type: exam.type,
      term: exam.term,
      title: exam.title,
      startDate: exam.startDate,
      endDate: exam.endDate,
      outOf: exam.outOf || 100,
      marksDeadline: exam.marksDeadline,
      forms: exam.forms,
      allowTeacherOutOf: exam.allowTeacherOutOf,
    });
  };

  const onToggleForm = (form: string) => {
    setDraft((current) => ({
      ...current,
      forms: current.forms.includes(form)
        ? current.forms.filter((item) => item !== form)
        : [...current.forms, form],
    }));
  };

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-academic-line bg-academic-surface p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-academic-accent">Examinations</p>
            <h1 className="mt-2 font-display text-3xl text-academic-ink">Schedule Exams</h1>
          </div>
          <div className="w-full max-w-xs">
            <ToolSwitch
              checked={scheduleEnabled}
              label="Tool enabled"
              onChange={(checked) => setData((current) => ({
                ...current,
                toolSettings: { ...current.toolSettings, "exams.schedule": checked },
              }))}
            />
          </div>
        </div>
      </header>

      {!scheduleEnabled && (
        <div className="rounded-xl border border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          This tool is switched off.
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[430px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-academic-line bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-academic-ink">Schedule Examination</h2>

          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Exam type</span>
                <select
                  value={draft.type}
                  disabled={!scheduleEnabled}
                  onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value as ExamType, outOf: event.target.value === "KCSE" ? 0 : current.outOf || 100 }))}
                  className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink"
                >
                  {EXAM_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Term</span>
                <select
                  value={draft.term}
                  disabled={!scheduleEnabled}
                  onChange={(event) => setDraft((current) => ({ ...current, term: event.target.value as AcademicExamTerm }))}
                  className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink"
                >
                  {EXAM_TERMS.map((term) => (
                    <option key={term} value={term}>{term}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Exam title</span>
              <input
                value={draft.title}
                disabled={!scheduleEnabled}
                placeholder="e.g. CAT 1 or EXAM 1 etc"
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink placeholder:text-academic-ink-soft/60"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Start date</span>
                <input
                  type="date"
                  value={draft.startDate}
                  disabled={!scheduleEnabled}
                  onChange={(event) => setDraft((current) => ({ ...current, startDate: event.target.value }))}
                  className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">End date</span>
                <input
                  type="date"
                  value={draft.endDate}
                  disabled={!scheduleEnabled}
                  onChange={(event) => setDraft((current) => ({ ...current, endDate: event.target.value }))}
                  className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink"
                />
              </label>
            </div>

            <div>
              <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Exam for</p>
              <div className="grid grid-cols-2 gap-2">
                {FORM_GROUPS.map((form) => (
                  <label key={form} className="flex items-center gap-2 rounded-md border border-academic-line bg-academic-paper px-2 py-2 text-sm text-academic-ink">
                    <input
                      type="checkbox"
                      checked={draft.forms.includes(form)}
                      disabled={!scheduleEnabled}
                      onChange={() => onToggleForm(form)}
                    />
                    {form}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Marks entry deadline</span>
                <input
                  type="date"
                  value={draft.marksDeadline}
                  disabled={!scheduleEnabled}
                  onChange={(event) => setDraft((current) => ({ ...current, marksDeadline: event.target.value }))}
                  className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Marked Out-Off</span>
                <input
                  type="number"
                  min={0}
                  value={draft.outOf}
                  disabled={!scheduleEnabled || draft.type === "KCSE"}
                  onChange={(event) => setDraft((current) => ({ ...current, outOf: Number(event.target.value) || 0 }))}
                  className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink"
                />
              </label>
            </div>

            <label className="flex items-center gap-2 text-sm text-academic-ink">
              <input
                type="checkbox"
                checked={draft.allowTeacherOutOf}
                disabled={!scheduleEnabled || draft.type === "KCSE"}
                onChange={(event) => setDraft((current) => ({ ...current, allowTeacherOutOf: event.target.checked }))}
              />
              Allow teachers to set marks outOff during marks entry
            </label>

            <button
              type="button"
              disabled={!scheduleEnabled}
              onClick={onSubmit}
              className="w-full rounded-md bg-academic-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-academic-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {editingId ? "Update Exam Schedule" : "Save Exam Schedule"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-academic-line bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-semibold text-academic-ink">Upcoming Exam schedule</h2>
            <label className="block text-sm text-academic-ink-soft">
              <span className="mr-2">Year</span>
              <select
                value={yearFilter}
                onChange={(event) => setYearFilter(event.target.value)}
                className="rounded-md border border-academic-line bg-white px-2 py-1.5 text-sm text-academic-ink"
              >
                {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map((year) => (
                  <option key={year} value={String(year)}>{year}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 rounded-md border border-academic-line bg-academic-paper px-3 py-2 text-[11px] text-academic-ink-soft">
            <span className="font-semibold text-academic-ink">🔒</span> This icon means that teachers cannot input marks Out-Off during marks entry. Use Edit to change this.
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-academic-muted text-academic-ink">
                  <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">Term</th>
                  <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">Exam type</th>
                  <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">Exam title</th>
                  <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">Start date</th>
                  <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">End date</th>
                  <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">Exam for</th>
                  <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">Out-off</th>
                  <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">Marks entry deadline</th>
                  <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">Edit</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-3 py-6 text-center text-sm text-academic-ink-soft">No exams scheduled for this year.</td>
                  </tr>
                ) : (
                  filteredExams.map((exam, index) => {
                    const isClosed = new Date(exam.marksDeadline).getTime() < now;
                    const deadlineState = getDeadlineLabel(exam.marksDeadline);
                    const showLock = !exam.allowTeacherOutOf;

                    return (
                      <tr key={exam.id} className={index % 2 === 0 ? "bg-white" : "bg-academic-paper/60"}>
                        <td className="border-b border-academic-line px-3 py-2.5 text-academic-ink">
                          {index === 0 || filteredExams[index - 1].term !== exam.term ? exam.term : ""}
                        </td>
                        <td className="border-b border-academic-line px-3 py-2.5 text-academic-ink">{exam.type}</td>
                        <td className="border-b border-academic-line px-3 py-2.5 text-academic-ink">{exam.title}</td>
                        <td className="border-b border-academic-line px-3 py-2.5 text-academic-ink">{formatDate(exam.startDate)}</td>
                        <td className="border-b border-academic-line px-3 py-2.5 text-academic-ink">{formatDate(exam.endDate)}</td>
                        <td className="border-b border-academic-line px-3 py-2.5 text-academic-ink">{getExamFormLabel(exam.forms)}</td>
                        <td className="border-b border-academic-line px-3 py-2.5 text-academic-ink">
                          {showLock ? `${exam.outOf} 🔒` : exam.outOf}
                        </td>
                        <td className={`border-b border-academic-line px-3 py-2.5 ${isClosed ? "text-red-600" : "text-academic-ink"}`}>
                          {deadlineState}
                        </td>
                        <td className="border-b border-academic-line px-3 py-2.5">
                          <button
                            type="button"
                            onClick={() => onEdit(exam)}
                            className="text-sm font-medium text-academic-accent underline-offset-2 hover:underline"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
