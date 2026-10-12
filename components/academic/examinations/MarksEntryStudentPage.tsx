"use client";

import { useEffect, useMemo, useState } from "react";
import { ToolSwitch } from "@/components/academic/examinations/ToolSwitch";
import { useExaminationsData } from "@/components/academic/examinations/ExaminationsProvider";
import { useRegistrationData } from "@/components/academic/registration/RegistrationProvider";
import type { Student } from "@/lib/academic/registration-data";

type StudentLike = Pick<Student, "id" | "name" | "streamId"> & { admNo: string };

const SUBJECT_LOOKUP: Record<string, string[]> = {
  "stream-f3-oxford": ["subject-english", "subject-maths", "subject-kiswahili"],
  "stream-f4-cambridge": ["subject-english", "subject-maths", "subject-physics"],
  "stream-g10-stem": ["subject-english", "subject-maths", "subject-physics"],
};

const SUBJECT_META: Record<string, { label: string; outOf: number }> = {
  "subject-english": { label: "English", outOf: 100 },
  "subject-maths": { label: "Mathematics", outOf: 100 },
  "subject-kiswahili": { label: "Kiswahili", outOf: 100 },
  "subject-physics": { label: "Physics", outOf: 100 },
};

const SAMPLE_STUDENTS: StudentLike[] = [
  { id: "student-s1", admNo: "ADM-001", name: "Aisha Njeri", streamId: "stream-f3-oxford" },
  { id: "student-s2", admNo: "ADM-002", name: "Faith Wambui", streamId: "stream-f3-oxford" },
  { id: "student-s3", admNo: "ADM-003", name: "Mercy Kioko", streamId: "stream-f3-oxford" },
  { id: "student-s4", admNo: "ADM-004", name: "Grace Muthoni", streamId: "stream-f4-cambridge" },
  { id: "student-s5", admNo: "ADM-005", name: "Leah Kibet", streamId: "stream-f4-cambridge" },
  { id: "student-s6", admNo: "ADM-006", name: "Naomi Mutua", streamId: "stream-g10-stem" },
];

export function MarksEntryStudentPage() {
  const { data: regData } = useRegistrationData();
  const { data, setData } = useExaminationsData();
  const [streamId, setStreamId] = useState("stream-f3-oxford");
  const [studentId, setStudentId] = useState("student-s1");
  const [examId, setExamId] = useState("");
  const [rows, setRows] = useState<Array<{ id: string; subject: string; mark: string; outOf: number; percent: string }>>([]);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const streamOptions = useMemo<Array<{ value: string; label: string }>>(
    () => regData.streams.map((stream) => ({ value: stream.id, label: `${stream.grade} ${stream.name}` })),
    [regData.streams],
  );

  const examOptions = useMemo<Array<{ value: string; label: string }>>(
    () => data.exams
      .filter((exam) => exam.forms.some((form) => {
        const stream = regData.streams.find((item) => item.id === streamId);
        return stream ? form === stream.grade : false;
      }))
      .map((exam) => ({ value: exam.id, label: `${exam.title} · ${exam.term}` })),
    [data.exams, regData.streams, streamId],
  );

  const studentOptions = useMemo<Array<{ value: string; label: string }>>(() => {
    const studentList: StudentLike[] = regData.students.length
      ? regData.students.map((student) => ({
          id: student.id,
          admNo: student.admNo,
          name: student.name,
          streamId: student.streamId,
        }))
      : SAMPLE_STUDENTS;

    return studentList
      .filter((student) => student.streamId === streamId)
      .sort((a, b) => a.admNo.localeCompare(b.admNo))
      .map((student) => ({ value: student.id, label: `${student.admNo} · ${student.name}` }));
  }, [regData.students, streamId]);

  const streamStudents = useMemo<StudentLike[]>(() => {
    const source = regData.students.length ? regData.students.map((student) => ({
      id: student.id,
      admNo: student.admNo,
      name: student.name,
      streamId: student.streamId,
    })) : SAMPLE_STUDENTS;
    return [...source].filter((student) => student.streamId === streamId).sort((a, b) => a.admNo.localeCompare(b.admNo));
  }, [regData.students, streamId]);

  const selectedStudent = useMemo(
    () => streamStudents.find((student) => student.id === studentId) ?? streamStudents[0],
    [streamStudents, studentId],
  );

  const currentExam = useMemo(
    () => data.exams.find((exam) => exam.id === examId),
    [data.exams, examId],
  );

  useEffect(() => {
    if (!selectedStudent && streamStudents[0]) {
      setStudentId(streamStudents[0].id);
    }
  }, [selectedStudent, streamStudents]);

  const toolEnabled = data.toolSettings["exams.marks_student"] ?? true;

  const populateTable = () => {
    const outOf = currentExam?.outOf ?? 100;
    const nextRows = (SUBJECT_LOOKUP[streamId] ?? []).map((subjectId, index) => {
      const mark = index % 2 === 0 ? 72 : 81;
      const percent = Math.round((mark / outOf) * 100);
      return {
        id: subjectId,
        subject: SUBJECT_META[subjectId]?.label ?? subjectId,
        mark: mark.toString(),
        outOf,
        percent: `${percent}%`,
      };
    });
    setRows(nextRows);
  };

  const handleMarkChange = (subjectId: string, nextMark: string) => {
    const outOf = currentExam?.outOf ?? 100;
    const safeValue = nextMark === "" ? "0" : Math.min(Math.max(Number(nextMark) || 0, 0), outOf).toString();
    setRows((current) => current.map((row) => row.id === subjectId ? {
      ...row,
      mark: safeValue,
      percent: `${Math.min(100, Math.max(0, Math.round((Number(safeValue) / outOf) * 100)))}%`,
    } : row));
  };

  const saveMarks = () => {
    setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    setData((current) => ({
      ...current,
      toolSettings: { ...current.toolSettings, "exams.marks_student": true },
    }));
  };

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-academic-line bg-academic-surface p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-academic-accent">Examinations</p>
            <h1 className="mt-2 font-display text-3xl text-academic-ink">Marks Entry (Student)</h1>
          </div>
          <div className="w-full max-w-xs">
            <ToolSwitch
              checked={toolEnabled}
              label="Tool enabled"
              onChange={(checked) => setData((current) => ({
                ...current,
                toolSettings: { ...current.toolSettings, "exams.marks_student": checked },
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
        <h2 className="text-base font-semibold text-academic-ink">STUDENT MARKS SHEET</h2>

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
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-sm text-academic-ink-soft">No marks loaded yet.</td>
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
