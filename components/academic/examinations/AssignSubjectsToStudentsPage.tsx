"use client";

import { useMemo, useState } from "react";
import { ToolSwitch } from "@/components/academic/examinations/ToolSwitch";
import { useExaminationsData } from "@/components/academic/examinations/ExaminationsProvider";
import { useRegistrationData } from "@/components/academic/registration/RegistrationProvider";
import type { Student } from "@/lib/academic/registration-data";

type StudentLike = Pick<Student, "id" | "name" | "streamId"> & { admNo: string };

type StudentSubjectRow = {
  studentId: string;
  studentName: string;
  admNo: string;
  subjectIds: Record<string, boolean>;
};

const SUBJECT_LOOKUP: Record<string, string[]> = {
  "stream-f3-oxford": ["subject-english", "subject-maths", "subject-kiswahili"],
  "stream-f4-cambridge": ["subject-english", "subject-maths", "subject-physics"],
  "stream-g10-stem": ["subject-english", "subject-maths", "subject-physics"],
};

const SUBJECT_META: Record<string, { label: string }> = {
  "subject-english": { label: "English" },
  "subject-maths": { label: "Mathematics" },
  "subject-kiswahili": { label: "Kiswahili" },
  "subject-physics": { label: "Physics" },
};

const SAMPLE_STUDENTS: StudentLike[] = [
  { id: "student-s1", admNo: "ADM-001", name: "Aisha Njeri", streamId: "stream-f3-oxford" },
  { id: "student-s2", admNo: "ADM-002", name: "Faith Wambui", streamId: "stream-f3-oxford" },
  { id: "student-s3", admNo: "ADM-003", name: "Mercy Kioko", streamId: "stream-f3-oxford" },
  { id: "student-s4", admNo: "ADM-004", name: "Grace Muthoni", streamId: "stream-f4-cambridge" },
  { id: "student-s5", admNo: "ADM-005", name: "Leah Kibet", streamId: "stream-f4-cambridge" },
  { id: "student-s6", admNo: "ADM-006", name: "Naomi Mutua", streamId: "stream-g10-stem" },
];

export function AssignSubjectsToStudentsPage() {
  const { data: regData } = useRegistrationData();
  const { data, setData } = useExaminationsData();
  const [streamId, setStreamId] = useState("stream-f3-oxford");
  const [rows, setRows] = useState<StudentSubjectRow[]>([]);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const streamOptions = useMemo<Array<{ value: string; label: string }>>(
    () => regData.streams.map((stream) => ({ value: stream.id, label: `${stream.grade} ${stream.name}` })),
    [regData.streams],
  );

  const subjectOptions = useMemo<Array<{ value: string; label: string }>>(
    () => (SUBJECT_LOOKUP[streamId] ?? []).map((subjectId) => ({
      value: subjectId,
      label: SUBJECT_META[subjectId]?.label ?? subjectId,
    })),
    [streamId],
  );

  const streamStudents = useMemo<StudentLike[]>(() => {
    const source: StudentLike[] = regData.students.length ? regData.students.map((student) => ({
      id: student.id,
      admNo: student.admNo,
      name: student.name,
      streamId: student.streamId,
    })) : SAMPLE_STUDENTS;

    return [...source]
      .filter((student) => student.streamId === streamId)
      .sort((a, b) => a.admNo.localeCompare(b.admNo));
  }, [regData.students, streamId]);

  const toolEnabled = data.toolSettings["exams.assign_students"] ?? true;

  const loadAssignments = () => {
    const nextRows = streamStudents.map((student) => ({
      studentId: student.id,
      studentName: student.name,
      admNo: student.admNo,
      subjectIds: Object.fromEntries(
        (SUBJECT_LOOKUP[streamId] ?? []).map((subjectId, index) => [subjectId, index % 2 === 0]),
      ),
    }));
    setRows(nextRows);
  };

  const toggleSubject = (studentId: string, subjectId: string) => {
    setRows((current) => current.map((row) => row.studentId === studentId ? {
      ...row,
      subjectIds: {
        ...row.subjectIds,
        [subjectId]: !row.subjectIds[subjectId],
      },
    } : row));
  };

  const saveAssignments = () => {
    setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    setData((current) => ({
      ...current,
      toolSettings: { ...current.toolSettings, "exams.assign_students": true },
    }));
  };

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-academic-line bg-academic-surface p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-academic-accent">Examinations</p>
            <h1 className="mt-2 font-display text-3xl text-academic-ink">Assign Subjs to Students</h1>
          </div>
          <div className="w-full max-w-xs">
            <ToolSwitch
              checked={toolEnabled}
              label="Tool enabled"
              onChange={(checked) => setData((current) => ({
                ...current,
                toolSettings: { ...current.toolSettings, "exams.assign_students": checked },
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
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Stream</span>
            <select
              value={streamId}
              disabled={!toolEnabled}
              onChange={(event) => setStreamId(event.target.value)}
              className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink"
            >
              {streamOptions.map((option) => (
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
                <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">ADM</th>
                <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">Student</th>
                {subjectOptions.map((subject) => (
                  <th key={subject.value} className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">
                    {subject.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={2 + subjectOptions.length} className="px-3 py-8 text-center text-sm text-academic-ink-soft">No assignments loaded yet.</td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.studentId} className="border-b border-academic-line last:border-b-0">
                    <td className="px-3 py-2.5 text-academic-ink">{row.admNo}</td>
                    <td className="px-3 py-2.5 text-academic-ink">{row.studentName}</td>
                    {subjectOptions.map((subject) => (
                      <td key={`${row.studentId}-${subject.value}`} className="px-2 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={!!row.subjectIds[subject.value]}
                          disabled={!toolEnabled}
                          onChange={() => toggleSubject(row.studentId, subject.value)}
                          className="h-4 w-4 rounded border-academic-line text-academic-accent focus:ring-academic-accent"
                        />
                      </td>
                    ))}
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
