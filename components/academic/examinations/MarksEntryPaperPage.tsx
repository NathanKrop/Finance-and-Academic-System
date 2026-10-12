"use client";

import { useMemo, useState } from "react";
import { ToolSwitch } from "@/components/academic/examinations/ToolSwitch";
import { useExaminationsData } from "@/components/academic/examinations/ExaminationsProvider";
import { useRegistrationData } from "@/components/academic/registration/RegistrationProvider";
import type { Student } from "@/lib/academic/registration-data";

type StudentLike = Pick<Student, "id" | "name" | "streamId"> & { admNo: string };

type PaperOption = {
  id: string;
  label: string;
  outOf: number;
  subjectId: string;
};

const SUBJECT_PAPERS: Record<string, Array<{ subjectId: string; subjectLabel: string; papers: PaperOption[] }>> = {
  "stream-f3-oxford": [
    {
      subjectId: "subject-english",
      subjectLabel: "English",
      papers: [
        { id: "paper-eng-1", subjectId: "subject-english", label: "Paper 1", outOf: 30 },
        { id: "paper-eng-2", subjectId: "subject-english", label: "Paper 2", outOf: 40 },
      ],
    },
    {
      subjectId: "subject-maths",
      subjectLabel: "Mathematics",
      papers: [
        { id: "paper-math-1", subjectId: "subject-maths", label: "Paper 1", outOf: 20 },
        { id: "paper-math-2", subjectId: "subject-maths", label: "Paper 2", outOf: 30 },
      ],
    },
  ],
  "stream-f4-cambridge": [
    {
      subjectId: "subject-english",
      subjectLabel: "English",
      papers: [
        { id: "paper-eng-1", subjectId: "subject-english", label: "Paper 1", outOf: 35 },
        { id: "paper-eng-2", subjectId: "subject-english", label: "Paper 2", outOf: 45 },
      ],
    },
    {
      subjectId: "subject-physics",
      subjectLabel: "Physics",
      papers: [
        { id: "paper-phy-1", subjectId: "subject-physics", label: "Paper 1", outOf: 25 },
        { id: "paper-phy-2", subjectId: "subject-physics", label: "Paper 2", outOf: 30 },
      ],
    },
  ],
  "stream-g10-stem": [
    {
      subjectId: "subject-english",
      subjectLabel: "English",
      papers: [
        { id: "paper-eng-1", subjectId: "subject-english", label: "Paper 1", outOf: 25 },
        { id: "paper-eng-2", subjectId: "subject-english", label: "Paper 2", outOf: 35 },
      ],
    },
    {
      subjectId: "subject-physics",
      subjectLabel: "Physics",
      papers: [
        { id: "paper-phy-1", subjectId: "subject-physics", label: "Paper 1", outOf: 30 },
        { id: "paper-phy-2", subjectId: "subject-physics", label: "Paper 2", outOf: 35 },
      ],
    },
  ],
};

const SAMPLE_STUDENTS: StudentLike[] = [
  { id: "student-s1", admNo: "ADM-001", name: "Aisha Njeri", streamId: "stream-f3-oxford" },
  { id: "student-s2", admNo: "ADM-002", name: "Faith Wambui", streamId: "stream-f3-oxford" },
  { id: "student-s3", admNo: "ADM-003", name: "Mercy Kioko", streamId: "stream-f3-oxford" },
  { id: "student-s4", admNo: "ADM-004", name: "Grace Muthoni", streamId: "stream-f4-cambridge" },
  { id: "student-s5", admNo: "ADM-005", name: "Leah Kibet", streamId: "stream-f4-cambridge" },
  { id: "student-s6", admNo: "ADM-006", name: "Naomi Mutua", streamId: "stream-g10-stem" },
];

export function MarksEntryPaperPage() {
  const { data: regData } = useRegistrationData();
  const { data, setData } = useExaminationsData();
  const [streamId, setStreamId] = useState("stream-f3-oxford");
  const [subjectId, setSubjectId] = useState("subject-english");
  const [paperId, setPaperId] = useState("paper-eng-1");
  const [examId, setExamId] = useState("");
  const [arrangeBy, setArrangeBy] = useState("ADM Ascending");
  const [rows, setRows] = useState<Array<{ id: string; adm: string; name: string; mark: string; percent: string }>>([]);
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

  const subjectOptions = useMemo<Array<{ value: string; label: string }>>(
    () => (SUBJECT_PAPERS[streamId] ?? []).map((entry) => ({ value: entry.subjectId, label: entry.subjectLabel })),
    [streamId],
  );

  const paperOptions = useMemo<PaperOption[]>(
    () => (SUBJECT_PAPERS[streamId] ?? []).find((entry) => entry.subjectId === subjectId)?.papers ?? [],
    [subjectId, streamId],
  );

  const selectedPaper = useMemo(
    () => paperOptions.find((paper) => paper.id === paperId) ?? paperOptions[0],
    [paperId, paperOptions],
  );

  const currentExam = useMemo(
    () => data.exams.find((exam) => exam.id === examId),
    [data.exams, examId],
  );

  const streamStudents = useMemo<StudentLike[]>(() => {
    const source: StudentLike[] = regData.students.length ? regData.students.map((student) => ({
      id: student.id,
      admNo: student.admNo,
      name: student.name,
      streamId: student.streamId,
    })) : SAMPLE_STUDENTS;
    const filtered = source.filter((student) => student.streamId === streamId);
    return [...filtered].sort((a, b) => a.admNo.localeCompare(b.admNo));
  }, [regData.students, streamId]);

  const subjectStudents = useMemo<StudentLike[]>(() => {
    return [...streamStudents].sort((a, b) => {
      if (arrangeBy === "Name A–Z") return a.name.localeCompare(b.name);
      if (arrangeBy === "ADM Descending") return b.admNo.localeCompare(a.admNo);
      return a.admNo.localeCompare(b.admNo);
    });
  }, [arrangeBy, streamStudents]);

  const toolEnabled = data.toolSettings["exams.marks_paper"] ?? true;

  const populateTable = () => {
    const outOf = selectedPaper?.outOf ?? currentExam?.outOf ?? 100;
    const nextRows = subjectStudents.map((student, index) => {
      const mark = index % 2 === 0 ? 72 : 84;
      const percent = Math.round((mark / outOf) * 100);
      return {
        id: student.id,
        adm: student.admNo,
        name: student.name,
        mark: mark.toString(),
        percent: `${percent}%`,
      };
    });
    setRows(nextRows);
  };

  const handleMarkChange = (rowId: string, nextMark: string) => {
    const safeValue = nextMark === "" ? "0" : Math.min(Number(nextMark) || 0, selectedPaper?.outOf ?? currentExam?.outOf ?? 100).toString();
    const outOf = selectedPaper?.outOf ?? currentExam?.outOf ?? 100;

    setRows((current) => current.map((item) => item.id === rowId ? {
      ...item,
      mark: safeValue,
      percent: `${Math.min(100, Math.max(0, Math.round((Number(safeValue) / outOf) * 100)))}%`,
    } : item));
  };

  const saveMarks = () => {
    setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    setData((current) => ({
      ...current,
      toolSettings: { ...current.toolSettings, "exams.marks_paper": true },
    }));
  };

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-academic-line bg-academic-surface p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-academic-accent">Examinations</p>
            <h1 className="mt-2 font-display text-3xl text-academic-ink">Marks Entry (Paper)</h1>
          </div>
          <div className="w-full max-w-xs">
            <ToolSwitch
              checked={toolEnabled}
              label="Tool enabled"
              onChange={(checked) => setData((current) => ({
                ...current,
                toolSettings: { ...current.toolSettings, "exams.marks_paper": checked },
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
        <h2 className="text-base font-semibold text-academic-ink">PAPER MARKS ENTRY</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <label className="block xl:col-span-2">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Form/Stream</span>
            <select
              value={streamId}
              disabled={!toolEnabled}
              onChange={(event) => {
                const nextStream = event.target.value;
                setStreamId(nextStream);
                const nextSubject = (SUBJECT_PAPERS[nextStream] ?? [])[0]?.subjectId ?? "subject-english";
                setSubjectId(nextSubject);
                setPaperId((SUBJECT_PAPERS[nextStream] ?? []).find((entry) => entry.subjectId === nextSubject)?.papers[0]?.id ?? "");
              }}
              className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink"
            >
              {streamOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="block xl:col-span-2">
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

          <label className="block xl:col-span-2">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Subject</span>
            <select
              value={subjectId}
              disabled={!toolEnabled}
              onChange={(event) => {
                const nextSubject = event.target.value;
                setSubjectId(nextSubject);
                setPaperId((SUBJECT_PAPERS[streamId] ?? []).find((entry) => entry.subjectId === nextSubject)?.papers[0]?.id ?? "");
              }}
              className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink"
            >
              {subjectOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Paper</span>
            <select
              value={paperId}
              disabled={!toolEnabled || paperOptions.length === 0}
              onChange={(event) => setPaperId(event.target.value)}
              className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink"
            >
              {paperOptions.map((paper) => (
                <option key={paper.id} value={paper.id}>{paper.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Out Of</span>
            <input
              type="number"
              value={selectedPaper?.outOf ?? currentExam?.outOf ?? 100}
              readOnly
              className="w-full rounded-md border border-academic-line bg-academic-paper px-3 py-2 text-sm text-academic-ink"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Arrange By</span>
            <select
              value={arrangeBy}
              disabled={!toolEnabled}
              onChange={(event) => setArrangeBy(event.target.value)}
              className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink"
            >
              <option>ADM Ascending</option>
              <option>ADM Descending</option>
              <option>Name A–Z</option>
            </select>
          </label>

          <button
            type="button"
            disabled={!toolEnabled || !selectedPaper}
            onClick={populateTable}
            className="rounded-md bg-academic-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-academic-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Populate Table
          </button>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-academic-line bg-white">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-academic-muted text-academic-ink">
              <tr>
                <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">#</th>
                <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">ADM</th>
                <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">Name</th>
                <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">Marks</th>
                <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">%</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-sm text-academic-ink-soft">No marks loaded yet.</td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr key={row.id} className="border-b border-academic-line last:border-b-0">
                    <td className="px-3 py-2.5 text-academic-ink-soft">{index + 1}</td>
                    <td className="px-3 py-2.5 text-academic-ink">{row.adm}</td>
                    <td className="px-3 py-2.5 text-academic-ink">{row.name}</td>
                    <td className="px-3 py-2.5">
                      <input
                        type="number"
                        min={0}
                        max={selectedPaper?.outOf ?? currentExam?.outOf ?? 100}
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
