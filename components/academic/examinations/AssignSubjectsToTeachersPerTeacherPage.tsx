"use client";

import { useMemo, useState } from "react";
import { ToolSwitch } from "@/components/academic/examinations/ToolSwitch";
import { useExaminationsData } from "@/components/academic/examinations/ExaminationsProvider";
import { useRegistrationData } from "@/components/academic/registration/RegistrationProvider";

const SUBJECT_META: Record<string, { label: string }> = {
  "subject-english": { label: "English" },
  "subject-maths": { label: "Mathematics" },
  "subject-kiswahili": { label: "Kiswahili" },
  "subject-physics": { label: "Physics" },
};

const SUBJECT_LOOKUP: Record<string, string[]> = {
  "stream-f3-oxford": ["subject-english", "subject-maths", "subject-kiswahili"],
  "stream-f4-cambridge": ["subject-english", "subject-maths", "subject-physics"],
  "stream-g10-stem": ["subject-english", "subject-maths", "subject-physics"],
};

const TEACHERS = [
  { id: "teacher-1", name: "Caroline Njeri" },
  { id: "teacher-2", name: "Beatrice Kilonzo" },
  { id: "teacher-3", name: "Dennis Kiptoo" },
];

export function AssignSubjectsToTeachersPerTeacherPage() {
  const { data: regData } = useRegistrationData();
  const { data, setData } = useExaminationsData();
  const [teacherId, setTeacherId] = useState("teacher-1");
  const [rows, setRows] = useState<Array<{ id: string; streamId: string; streamLabel: string; subjectId: string; subjectLabel: string; selected: boolean }>>([]);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const teacherOptions = useMemo<Array<{ value: string; label: string }>>(
    () => TEACHERS.map((teacher) => ({ value: teacher.id, label: teacher.name })),
    [],
  );

  const toolEnabled = data.toolSettings["exams.teachers_per_teacher"] ?? true;

  const loadAssignments = () => {
    const nextRows: Array<{ id: string; streamId: string; streamLabel: string; subjectId: string; subjectLabel: string; selected: boolean }> = [];

    regData.streams.forEach((stream) => {
      (SUBJECT_LOOKUP[stream.id] ?? []).forEach((subjectId) => {
        nextRows.push({
          id: `${stream.id}-${subjectId}`,
          streamId: stream.id,
          streamLabel: `${stream.grade} ${stream.name}`,
          subjectId,
          subjectLabel: SUBJECT_META[subjectId]?.label ?? subjectId,
          selected: teacherId === "teacher-1" && subjectId === "subject-english",
        });
      });
    });

    setRows(nextRows);
  };

  const toggleRow = (rowId: string) => {
    setRows((current) => current.map((row) => row.id === rowId ? { ...row, selected: !row.selected } : row));
  };

  const saveAssignments = () => {
    setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    setData((current) => ({
      ...current,
      toolSettings: { ...current.toolSettings, "exams.teachers_per_teacher": true },
    }));
  };

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-academic-line bg-academic-surface p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-academic-accent">Examinations</p>
            <h1 className="mt-2 font-display text-3xl text-academic-ink">Assign Subjects to Teachers per Teacher</h1>
          </div>
          <div className="w-full max-w-xs">
            <ToolSwitch
              checked={toolEnabled}
              label="Tool enabled"
              onChange={(checked) => setData((current) => ({
                ...current,
                toolSettings: { ...current.toolSettings, "exams.teachers_per_teacher": checked },
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

      <div className="rounded-2xl border border-academic-line bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <label className="block w-full max-w-md">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Teacher</span>
            <select
              value={teacherId}
              disabled={!toolEnabled}
              onChange={(event) => setTeacherId(event.target.value)}
              className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink"
            >
              {teacherOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <button
            type="button"
            disabled={!toolEnabled}
            onClick={loadAssignments}
            className="rounded-md bg-academic-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-academic-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Load assignments
          </button>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-academic-line bg-white">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-academic-muted text-academic-ink">
              <tr>
                <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">Stream</th>
                <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">Subject</th>
                <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">Assigned</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-3 py-8 text-center text-sm text-academic-ink-soft">No teacher assignments loaded yet.</td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-b border-academic-line last:border-b-0">
                    <td className="px-3 py-2.5 text-academic-ink">{row.streamLabel}</td>
                    <td className="px-3 py-2.5 text-academic-ink">{row.subjectLabel}</td>
                    <td className="px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={row.selected}
                        disabled={!toolEnabled}
                        onChange={() => toggleRow(row.id)}
                        className="h-4 w-4 rounded border-academic-line text-academic-accent focus:ring-academic-accent"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-col items-end gap-2">
          {savedAt && (
            <p className="text-xs uppercase tracking-[0.08em] text-emerald-700">Saved at {savedAt}</p>
          )}
          <button
            type="button"
            onClick={saveAssignments}
            disabled={!toolEnabled || rows.length === 0}
            className="rounded-md bg-academic-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-academic-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save assignments
          </button>
        </div>
      </div>
    </section>
  );
}
