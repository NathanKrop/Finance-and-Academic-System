"use client";

import { useEffect, useMemo, useState } from "react";
import { ToolSwitch } from "@/components/academic/examinations/ToolSwitch";
import { useExaminationsData } from "@/components/academic/examinations/ExaminationsProvider";
import { useRegistrationData } from "@/components/academic/registration/RegistrationProvider";
import type { Student } from "@/lib/academic/registration-data";

type StudentLike = Pick<Student, "id" | "name" | "streamId"> & { admNo: string };

const KCSE_SUBJECTS: Record<string, string[]> = {
  "stream-f4-cambridge": ["subject-english", "subject-maths", "subject-physics", "subject-kiswahili"],
  "stream-g10-stem": ["subject-english", "subject-maths", "subject-physics"],
};

const SUBJECT_META: Record<string, { label: string; outOf: number }> = {
  "subject-english": { label: "English", outOf: 100 },
  "subject-maths": { label: "Mathematics", outOf: 100 },
  "subject-kiswahili": { label: "Kiswahili", outOf: 100 },
  "subject-physics": { label: "Physics", outOf: 100 },
};

const SAMPLE_STUDENTS: StudentLike[] = [
  { id: "student-s4", admNo: "ADM-004", name: "Grace Muthoni", streamId: "stream-f4-cambridge" },
  { id: "student-s5", admNo: "ADM-005", name: "Leah Kibet", streamId: "stream-f4-cambridge" },
  { id: "student-s6", admNo: "ADM-006", name: "Naomi Mutua", streamId: "stream-g10-stem" },
];

export function KCSEEntryStudentPage() {
  const { data: regData } = useRegistrationData();
  const { data, setData } = useExaminationsData();
  const [streamId, setStreamId] = useState("stream-f4-cambridge");
  const [studentId, setStudentId] = useState("student-s4");
  const [examId, setExamId] = useState("");
  const [rows, setRows] = useState<Array<{ id: string; subject: string; mark: string; outOf: number; percent: string; grade: string }>>([]);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const streamOptions = useMemo<Array<{ value: string; label: string }>>(
    () => regData.streams
      .filter((stream) => stream.grade === "Grade 10" || stream.grade === "Grade 11")
      .map((stream) => ({ value: stream.id, label: `${stream.grade} ${stream.name}` })),
    [regData.streams],
  );

  const examOptions = useMemo<Array<{ value: string; label: string }>>(
    () => data.exams
      .filter((exam) => exam.type === "KCSE")
      .filter((exam) => exam.forms.some((form) => {
        const stream = regData.streams.find((item) => item.id === streamId);
        return stream ? form === stream.grade : false;
      }))
      .map((exam) => ({ value: exam.id, label: `${exam.title} · ${exam.term}` })),
    [data.exams, regData.streams, streamId],
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

  const studentOptions = useMemo<Array<{ value: string; label: string }>>(
    () => streamStudents.map((student) => ({ value: student.id, label: `${student.admNo} · ${student.name}` })),
    [streamStudents],
  );

  const selectedStudent = useMemo(
    () => streamStudents.find((student) => student.id === studentId) ?? streamStudents[0],
    [streamStudents, studentId],
  );

  useEffect(() => {
    if (!selectedStudent && streamStudents[0]) {
      setStudentId(streamStudents[0].id);
    }
  }, [selectedStudent, streamStudents]);

  const currentExam = useMemo(
    () => data.exams.find((exam) => exam.id === examId),
    [data.exams, examId],
  );

  const toolEnabled = data.toolSettings["exams.kcse_student"] ?? true;

  const getGrade = (mark: number, outOf: number) => {
    const percent = (mark / outOf) * 100;
    if (percent >= 80) return "A";
    if (percent >= 70) return "B";
    if (percent >= 60) return "C";
    if (percent >= 50) return "D";
    if (percent >= 40) return "E";
    return "F";
  };

  const populateTable = () => {
    const nextRows = (KCSE_SUBJECTS[streamId] ?? []).map((subjectId, index) => {
      const outOf = SUBJECT_META[subjectId]?.outOf ?? 100;
      const mark = 62 + (index % 5) * 7;
      const percent = Math.round((mark / outOf) * 100);
      return {
        id: subjectId,
        subject: SUBJECT_META[subjectId]?.label ?? subjectId,
        mark: mark.toString(),
        outOf,
        percent: `${percent}%`,
        grade: getGrade(mark, outOf),
      };
    });
    setRows(nextRows);
  };

  const handleMarkChange = (subjectId: string, nextValue: string) => {
    const outOf = SUBJECT_META[subjectId]?.outOf ?? currentExam?.outOf ?? 100;
    const safeValue = nextValue === "" ? "0" : Math.min(Math.max(Number(nextValue) || 0, 0), outOf).toString();
    const ratio = Math.round((Number(safeValue) / outOf) * 100);

    setRows((current) => current.map((row) => row.id === subjectId ? {
      ...row,
      mark: safeValue,
      percent: `${Math.min(100, Math.max(0, ratio))}%`,
      grade: getGrade(Number(safeValue), outOf),
    } : row));
  };

  const saveMarks = () => {
    setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    setData((current) => ({
      ...current,
      toolSettings: { ...current.toolSettings, "exams.kcse_student": true },
    }));
  };

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-academic-line bg-academic-surface p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-academic-accent">Examinations</p>
            <h1 className="mt-2 font-display text-3xl text-academic-ink">KCSE Entry (Student)</h1>
          </div>
          <div className="w-full max-w-xs">
            <ToolSwitch
              checked={toolEnabled}
              label="Tool enabled"
              onChange={(checked) => setData((current) => ({
                ...current,
                toolSettings: { ...current.toolSettings, "exams.kcse_student": checked },
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
        <h2 className="text-base font-semibold text-academic-ink">KCSE STUDENT ENTRY</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="block xl:col-span-2">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Form/Stream</span>
            <select
              value={streamId}
              disabled={!toolEnabled}
              onChange={(event) => {
                const nextStream = event.target.value;
                setStreamId(nextStream);
                const nextStudent = (regData.students.length ? regData.students : SAMPLE_STUDENTS)
                  .filter((student) => student.streamId === nextStream)
                  .sort((a, b) => a.admNo.localeCompare(b.admNo))[0];
                if (nextStudent) setStudentId(nextStudent.id);
              }}
              className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink"
            >
              {streamOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="block xl:col-span-2">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Student</span>
            <select
              value={selectedStudent?.id ?? studentId}
              disabled={!toolEnabled || studentOptions.length === 0}
              onChange={(event) => setStudentId(event.target.value)}
              className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink"
            >
              {studentOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Exam</span>
            <select
              value={examId}
              disabled={!toolEnabled}
              onChange={(event) => setExamId(event.target.value)}
              className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink"
            >
              <option value="">Select exam</option>
              {examOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <button
            type="button"
            disabled={!toolEnabled || !selectedStudent}
            onClick={populateTable}
            className="rounded-md bg-academic-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-academic-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Populate Table
          </button>
        </div>

        <div className="mt-5 rounded-xl border border-academic-line bg-academic-paper px-4 py-3 text-sm text-academic-ink">
          <span className="font-semibold">Selected student:</span> {selectedStudent ? `${selectedStudent.admNo} · ${selectedStudent.name}` : "None"}
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-academic-line bg-white">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-academic-muted text-academic-ink">
              <tr>
                <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">Subject</th>
                <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">Out Of</th>
                <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">Mark</th>
                <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">%</th>
                <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">Grade</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-sm text-academic-ink-soft">No marks loaded yet.</td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-b border-academic-line last:border-b-0">
                    <td className="px-3 py-2.5 text-academic-ink">{row.subject}</td>
                    <td className="px-3 py-2.5 text-academic-ink-soft">{row.outOf}</td>
                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        min={0}
                        max={row.outOf}
                        value={row.mark}
                        disabled={!toolEnabled}
                        onChange={(event) => handleMarkChange(row.id, event.target.value)}
                        className="w-24 rounded-md border border-academic-line bg-white px-2 py-1.5 text-sm text-academic-ink outline-none focus:border-academic-accent"
                      />
                    </td>
                    <td className="px-3 py-2.5 text-academic-ink-soft">{row.percent}</td>
                    <td className="px-3 py-2.5 text-academic-ink font-medium">{row.grade}</td>
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
            onClick={saveMarks}
            disabled={!toolEnabled || rows.length === 0}
            className="rounded-md bg-academic-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-academic-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save marks
          </button>
        </div>
      </div>
    </section>
  );
}
