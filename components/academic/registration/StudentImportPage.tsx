"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Download, FileSpreadsheet, Upload } from "lucide-react";
import { AcademicButton, RegistrationHeading, RegistrationPanel } from "@/components/academic/registration/RegistrationUI";
import { useRegistrationData } from "@/components/academic/registration/RegistrationProvider";
import { CBE_GRADES, newRegistrationId, type Student, type StreamGrade } from "@/lib/academic/registration-data";

type ImportRow = {
  admNo: string;
  name: string;
  grade: string;
  stream: string;
  streamId: string;
  errors: string[];
};
type ImportError = { admNo: string; name: string; reason: string };

function canonicalGrade(value: string): StreamGrade | null {
  const number = value.match(/\d+/)?.[0];
  if (!number) return null;
  const expected = `Grade ${Number(number)}`;
  return CBE_GRADES.find((grade) => grade.toLowerCase() === expected.toLowerCase()) ?? null;
}

function normalized(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function StudentImportPage() {
  const { data, setData } = useRegistrationData();
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<{ imported: number; skipped: number; errors: ImportError[] } | null>(null);
  const gradeColumn = "GRADE";

  function downloadTemplate() {
    const sampleStream = data.streams.find((stream) => stream.grade.startsWith("Grade"));
    const rows = [
      ["ADM", "STUDENT_NAME", gradeColumn, "STREAM"],
      ["A00001", "Sample Student", sampleStream?.grade ?? "Grade 10", sampleStream?.name ?? "STREAM_NAME"],
    ];
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, "cbe-student-template.xlsx");
  }

  async function previewFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setSummary(null);
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) throw new Error("The workbook does not contain a worksheet.");
      const values = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[firstSheetName], { defval: "" });
      const seen = new Set<string>();
      const existing = new Set(data.students.map((student) => normalized(student.admNo)));
      const nextRows = values.map((source): ImportRow => {
        const fields = Object.fromEntries(Object.entries(source).map(([key, value]) => [key.trim().toUpperCase(), String(value ?? "").trim()]));
        const admNo = fields.ADM ?? "";
        const name = fields.STUDENT_NAME ?? "";
        const gradeText = fields[gradeColumn] ?? "";
        const streamText = fields.STREAM ?? "";
        const errors: string[] = [];
        if (!admNo) errors.push("Missing ADM");
        if (!name) errors.push("Missing STUDENT_NAME");
        if (!gradeText) errors.push(`Missing ${gradeColumn}`);
        if (!streamText) errors.push("Missing STREAM");
        const normalizedAdm = normalized(admNo);
        if (normalizedAdm && seen.has(normalizedAdm)) errors.push("Duplicate ADM in file");
        if (normalizedAdm && existing.has(normalizedAdm)) errors.push("ADM already exists in system");
        if (normalizedAdm) seen.add(normalizedAdm);
        const grade = canonicalGrade(gradeText);
        const matchingStream = grade && streamText
          ? data.streams.find((stream) => stream.grade === grade && (
            normalized(stream.name) === normalized(streamText)
            || normalized(`${stream.grade} ${stream.name}`) === normalized(streamText)
          ))
          : undefined;
        if (gradeText && !grade) errors.push(`Unknown CBE grade: ${gradeText}`);
        if (streamText && !matchingStream) errors.push(`Unknown stream: ${streamText}`);
        return { admNo, name, grade: grade ?? gradeText, stream: streamText, streamId: matchingStream?.id ?? "", errors };
      });
      if (nextRows.length === 0) throw new Error("The worksheet has no student rows.");
      setRows(nextRows);
      setFileName(file.name);
    } catch (cause) {
      setRows([]);
      setFileName("");
      setError(cause instanceof Error ? cause.message : "Could not read this workbook.");
    }
  }

  function downloadErrors(errors: ImportError[]) {
    const escapeCsv = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const content = [
      "ADM,STUDENT_NAME,ERRORS",
      ...errors.map((item) => [item.admNo, item.name, item.reason].map(escapeCsv).join(",")),
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "cbe-import-errors.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function confirmImport() {
    const validRows = rows.filter((row) => row.errors.length === 0);
    const errors = rows.filter((row) => row.errors.length > 0).map((row) => ({
      admNo: row.admNo || "[blank ADM]",
      name: row.name || "[blank name]",
      reason: row.errors.join("; "),
    }));
    const students: Student[] = validRows.map((row) => ({
      id: newRegistrationId(),
      admNo: row.admNo,
      name: row.name,
      curriculum: "CBE",
      streamId: row.streamId,
      gender: "",
      boarder: false,
      guardianName: "",
      dateAdmitted: "",
      formAdmitted: "",
      gradeAdmitted: row.grade,
      phone: "",
      otherPhone: "",
      upiNo: "",
      houseId: null,
      dateOfBirth: "",
      kcseIndexNo: "",
      county: "",
      photoUrl: "",
      division: "",
      location: "",
      subLocation: "",
      address: "",
      yearOfLeaving: "",
      familyId: null,
      kcpeMarks: "",
      kcpeIndexNo: "",
      pathway: "",
      track: "",
      kjseaGrade: "",
      juniorSchool: "",
      status: "On session",
    }));
    setData((current) => ({ ...current, students: [...current.students, ...students] }));
    setSummary({ imported: students.length, skipped: errors.length, errors });
    setRows([]);
  }

  return (
    <div>
      <RegistrationHeading title="Student's Excel Upload (CBE)" description="Download a CBE template, upload a workbook, review row validation, then import valid records." />
      <ol className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {["Download the correct template", "Fill mandatory student columns", "Upload and preview validation", "Confirm import of valid rows"].map((step, index) => <li key={step} className="flex min-h-16 items-center gap-3 rounded-md border border-academic-line bg-white p-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-academic-accent text-xs font-semibold text-white">{index + 1}</span><span className="text-xs text-academic-ink-soft">{step}</span></li>)}
      </ol>
      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <RegistrationPanel title="Upload student workbook">
          <p className="mb-4 text-sm text-academic-ink-soft">Mandatory columns: <span className="font-mono text-academic-ink">ADM, STUDENT_NAME, {gradeColumn}, STREAM</span></p>
          <AcademicButton onClick={downloadTemplate}><Download size={15} className="mr-2" /> Download Template</AcademicButton>
          <label className="mt-5 flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-academic-line bg-academic-paper p-4 text-center hover:border-academic-accent">
            <Upload size={20} className="mb-2 text-academic-accent" />
            <span className="text-sm font-medium">Choose Excel file</span>
            <span className="mt-1 text-xs text-academic-ink-soft">.xlsx or .xls</span>
            <input type="file" accept=".xlsx,.xls" className="sr-only" onChange={(event) => previewFile(event.target.files?.[0])} />
          </label>
          {fileName && <p className="mt-3 flex items-center gap-2 break-all text-xs text-academic-ink-soft"><FileSpreadsheet size={15} /> {fileName}</p>}
          {error && <p role="alert" className="mt-3 rounded bg-red-50 p-2 text-xs text-red-800">{error}</p>}
        </RegistrationPanel>

        {rows.length > 0 ? (
          <RegistrationPanel title={`Preview ${rows.length} rows`}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><p className="text-xs text-academic-ink-soft">{rows.filter((row) => row.errors.length === 0).length} valid · {rows.filter((row) => row.errors.length > 0).length} with errors</p><AcademicButton disabled={!rows.some((row) => row.errors.length === 0)} onClick={confirmImport}>Confirm import</AcademicButton></div>
            <div className="max-h-[65dvh] overflow-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="sticky top-0 bg-academic-paper"><tr className="border-b border-academic-line text-[10px] uppercase text-academic-ink-soft"><th className="px-2 py-2">Row</th><th className="px-2 py-2">ADM</th><th className="px-2 py-2">Student name</th><th className="px-2 py-2">{gradeColumn}</th><th className="px-2 py-2">Stream</th><th className="px-2 py-2">Validation</th></tr></thead><tbody>{rows.map((row, index) => <tr key={`${row.admNo}-${index}`} className={`border-b border-academic-line/70 ${row.errors.length ? "bg-red-50" : ""}`}><td className="px-2 py-2.5">{index + 2}</td><td className="px-2 py-2.5">{row.admNo || "—"}</td><td className="px-2 py-2.5">{row.name || "—"}</td><td className="px-2 py-2.5">{row.grade || "—"}</td><td className="px-2 py-2.5">{row.stream || "—"}</td><td className="px-2 py-2.5 text-xs">{row.errors.length ? row.errors.join("; ") : <span className="text-academic-accent">Ready to import</span>}</td></tr>)}</tbody></table></div>
          </RegistrationPanel>
        ) : summary ? (
          <RegistrationPanel title="Import summary">
            <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-md bg-academic-accent-soft p-4"><p className="text-xs text-academic-ink-soft">Imported</p><p className="mt-1 text-2xl font-semibold text-academic-accent">{summary.imported}</p></div><div className="rounded-md bg-red-50 p-4"><p className="text-xs text-red-800">Skipped</p><p className="mt-1 text-2xl font-semibold text-red-800">{summary.skipped}</p></div></div>
            {summary.errors.length > 0 && <><div className="mt-4 space-y-2">{summary.errors.slice(0, 8).map((item) => <p key={`${item.admNo}-${item.name}`} className="text-xs text-red-800">{item.admNo} | {item.name}: {item.reason}</p>)}{summary.errors.length > 8 && <p className="text-xs text-academic-ink-soft">And {summary.errors.length - 8} more skipped rows.</p>}</div><AcademicButton variant="outline" className="mt-4" onClick={() => downloadErrors(summary.errors)}><Download size={15} className="mr-2" /> Download error list</AcademicButton></>}
            <AcademicButton variant="outline" className="mt-4 block" onClick={() => { setSummary(null); setFileName(""); }}>Start another import</AcademicButton>
          </RegistrationPanel>
        ) : (
          <RegistrationPanel title="Ready for preview"><p className="text-sm text-academic-ink-soft">Choose a completed workbook to validate its rows before import.</p></RegistrationPanel>
        )}
      </div>
    </div>
  );
}