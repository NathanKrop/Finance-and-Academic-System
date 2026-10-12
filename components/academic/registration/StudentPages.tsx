"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ArrowLeft, Camera, Save, Search, X } from "lucide-react";
import { AcademicButton, FormField, RegInput, RegSelect, RegistrationHeading, RegistrationPanel } from "@/components/academic/registration/RegistrationUI";
import { useRegistrationData } from "@/components/academic/registration/RegistrationProvider";
import type { Student, StudentStatus } from "@/lib/academic/registration-data";

const STUDENT_STATUSES: StudentStatus[] = ["On session", "Alumni/Completed", "Transferred", "Deleted"];
const STUDENT_TEXT_FIELDS: { key: keyof Student; label: string; type?: string }[] = [
  { key: "name", label: "Student's Name" },
  { key: "guardianName", label: "Guardian Name" },
  { key: "phone", label: "Guardian Phone" },
  { key: "otherPhone", label: "Other phone" },
  { key: "dateAdmitted", label: "Date Admitted", type: "date" },
  { key: "formAdmitted", label: "Form Admitted" },
  { key: "gradeAdmitted", label: "Grade Admitted" },
  { key: "upiNo", label: "UPI no" },
  { key: "dateOfBirth", label: "Date of Birth", type: "date" },
  { key: "kcseIndexNo", label: "KCSE index no." },
  { key: "county", label: "County" },
  { key: "division", label: "Division" },
  { key: "location", label: "Location" },
  { key: "subLocation", label: "Sub Location" },
  { key: "address", label: "Address" },
  { key: "yearOfLeaving", label: "Year of Leaving", type: "number" },
  { key: "kcpeMarks", label: "KCPE marks", type: "number" },
  { key: "kcpeIndexNo", label: "KCPE index no." },
  { key: "pathway", label: "Pathway" },
  { key: "track", label: "Track" },
  { key: "kjseaGrade", label: "KJSEA Grade" },
  { key: "juniorSchool", label: "Junior School" },
];

function StudentEditor({ student, onClose, pageMode = false }: {
  student: Student;
  onClose: () => void;
  pageMode?: boolean;
}) {
  const { data, setData } = useRegistrationData();
  const [draft, setDraft] = useState(student);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const availableFields = STUDENT_TEXT_FIELDS.filter(({ key }) => student.curriculum === "CBE"
    ? !["formAdmitted", "kcseIndexNo", "county", "division", "location", "subLocation", "address", "yearOfLeaving", "kcpeMarks", "kcpeIndexNo"].includes(key)
    : !["gradeAdmitted", "pathway", "track", "kjseaGrade", "juniorSchool"].includes(key));

  function updateField(key: keyof Student, value: string | boolean | null) {
    setDraft((current) => ({ ...current, [key]: value }) as Student);
    setSaved(false);
    setError("");
  }

  function saveStudent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const duplicate = data.students.some((item) => item.id !== student.id && item.admNo.toLowerCase() === draft.admNo.trim().toLowerCase());
    if (duplicate) {
      setError(`ADM/Assessment number ${draft.admNo} is already registered.`);
      return;
    }
    setData((current) => ({ ...current, students: current.students.map((item) => item.id === student.id ? draft : item) }));
    setSaved(true);
  }

  const panel = (
    <section role="dialog" aria-modal="true" aria-labelledby="student-detail-heading" className={pageMode ? "w-full rounded-md border border-academic-line bg-white p-5" : "fixed inset-y-0 right-0 z-50 w-full max-w-3xl overflow-y-auto bg-white p-5 shadow-2xl sm:p-7"}>
      <div className="mb-5 flex items-start justify-between gap-4 border-b border-academic-line pb-4">
        <div><p className="text-xs text-academic-ink-soft">Admission No. {student.admNo} · {student.curriculum}</p><h2 id="student-detail-heading" className="font-display text-2xl">{student.name}</h2></div>
        <button type="button" aria-label="Close student details" onClick={onClose} className="rounded-md p-2 text-academic-ink-soft hover:bg-academic-paper"><X size={19} /></button>
      </div>
      <form onSubmit={saveStudent}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="ADM / Assessment no"><RegInput value={draft.admNo} onChange={(event) => updateField("admNo", event.target.value)} required /></FormField>
          <FormField label="Status"><RegSelect value={draft.status} onChange={(event) => updateField("status", event.target.value as StudentStatus)}>{STUDENT_STATUSES.map((status) => <option key={status}>{status}</option>)}</RegSelect></FormField>
          <FormField label="Stream"><RegSelect value={draft.streamId} onChange={(event) => updateField("streamId", event.target.value)}><option value="">No stream</option>{data.streams.filter((stream) => draft.curriculum === "CBE" ? stream.grade.startsWith("Grade") : stream.grade.startsWith("Form")).map((stream) => <option key={stream.id} value={stream.id}>{stream.grade} {stream.name}</option>)}</RegSelect></FormField>
          <FormField label="Gender"><RegSelect value={draft.gender} onChange={(event) => updateField("gender", event.target.value as Student["gender"])}><option value="">Not set</option><option>Female</option><option>Male</option></RegSelect></FormField>
          <FormField label="Boarder"><RegSelect value={draft.boarder ? "yes" : "no"} onChange={(event) => updateField("boarder", event.target.value === "yes")}><option value="no">No</option><option value="yes">Yes</option></RegSelect></FormField>
          <FormField label="House"><RegSelect value={draft.houseId ?? ""} onChange={(event) => updateField("houseId", event.target.value || null)}><option value="">No house</option>{data.houses.map((house) => <option key={house.id} value={house.id}>{house.name}</option>)}</RegSelect></FormField>
          <FormField label="Family"><RegSelect value={draft.familyId ?? ""} onChange={(event) => updateField("familyId", event.target.value || null)}><option value="">No family</option>{data.families.map((family) => <option key={family.id} value={family.id}>{family.name}</option>)}</RegSelect></FormField>
          {availableFields.map(({ key, label, type }) => <FormField key={key} label={label}><RegInput type={type ?? "text"} value={String(draft[key] ?? "")} onChange={(event) => updateField(key, event.target.value)} /></FormField>)}
          {draft.photoUrl && <div className="sm:col-span-2"><Image src={draft.photoUrl} alt={`${draft.name} student photo`} width={100} height={100} unoptimized className="h-24 w-24 rounded border border-academic-line object-cover" /></div>}
        </div>
        {error && <p role="alert" className="mt-4 text-xs text-red-700">{error}</p>}
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-academic-line pt-4">
          <AcademicButton type="submit"><Save size={15} className="mr-2" /> Save changes</AcademicButton>
          <AcademicButton variant="outline" onClick={onClose}>{pageMode ? <><ArrowLeft size={15} className="mr-2" /> Back to student list</> : "Close"}</AcademicButton>
          {saved && <span role="status" className="text-xs text-academic-accent">Student record saved.</span>}
        </div>
      </form>
    </section>
  );

  return pageMode ? panel : <div className="fixed inset-0 z-40 bg-black/40" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>{panel}</div>;
}

export function StudentListPage() {
  const { data } = useRegistrationData();
  const [query, setQuery] = useState("");
  const [streamId, setStreamId] = useState("all");
  const [category, setCategory] = useState("On session");
  const [pageSize, setPageSize] = useState(50);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Student | null>(null);
  const streams = useMemo(() => new Map(data.streams.map((stream) => [stream.id, `${stream.grade} ${stream.name}`])), [data.streams]);
  const matching = data.students.filter((student) => {
    const search = query.trim().toLowerCase();
    const matchesQuery = !search || student.name.toLowerCase().includes(search) || student.admNo.toLowerCase().includes(search);
    return matchesQuery && (streamId === "all" || student.streamId === streamId) && student.status === category;
  });
  const pageCount = Math.max(1, Math.ceil(matching.length / pageSize));
  const paged = matching.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <RegistrationHeading title="View/ Edit Student List" description="Search the student register, filter by stream and status, and open a full editable record." />
      <RegistrationPanel title="Student register">
        <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_220px_220px_170px]">
          <label className="relative"><span className="sr-only">Search by name or admission number</span><Search size={15} className="absolute left-3 top-3 text-academic-ink-soft" /><RegInput value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Name or ADM no." className="pl-9" /></label>
          <RegSelect aria-label="Filter by stream" value={streamId} onChange={(event) => { setStreamId(event.target.value); setPage(1); }}><option value="all">All streams</option>{data.streams.map((stream) => <option key={stream.id} value={stream.id}>{stream.grade} {stream.name}</option>)}</RegSelect>
          <RegSelect aria-label="Filter by category" value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }}>{STUDENT_STATUSES.map((status) => <option key={status}>{status}</option>)}</RegSelect>
          <RegSelect aria-label="Results per page" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}><option value={50}>50 per page</option><option value={100}>100 per page</option><option value={200}>200 per page</option></RegSelect>
        </div>
        <p className="mb-3 text-xs text-academic-ink-soft">{matching.length} Results found <span className="mx-1">~</span> Showing {Math.min(pageSize, Math.max(matching.length - (page - 1) * pageSize, 0))} results per page</p>
        <div className="overflow-x-auto"><table className="w-full min-w-[1120px] text-left text-sm"><thead><tr className="border-b border-academic-line text-[10px] uppercase text-academic-ink-soft"><th className="px-2 py-2">#</th><th className="px-2 py-2">ADM No.</th><th className="px-2 py-2">Student&apos;s Name</th><th className="px-2 py-2">Status</th><th className="px-2 py-2">Gender</th><th className="px-2 py-2">Stream</th><th className="px-2 py-2">Guardian Name</th><th className="px-2 py-2">Guardian Phone</th><th className="px-2 py-2">KCPE</th><th className="px-2 py-2">Index No.</th><th className="px-2 py-2">More Info</th></tr></thead><tbody>
          {paged.map((student, index) => <tr key={student.id} className="border-b border-academic-line/70"><td className="px-2 py-2.5">{(page - 1) * pageSize + index + 1}</td><td className="px-2 py-2.5 tabular-nums">{student.admNo}</td><td className="px-2 py-2.5 font-medium">{student.name}</td><td className="px-2 py-2.5"><span className="rounded-sm bg-academic-accent-soft px-2 py-1 text-xs text-academic-accent">{student.status}</span></td><td className="px-2 py-2.5">{student.gender || "—"}</td><td className="px-2 py-2.5">{streams.get(student.streamId) ?? "—"}</td><td className="px-2 py-2.5">{student.guardianName || "—"}</td><td className="px-2 py-2.5">{student.phone || "—"}</td><td className="px-2 py-2.5">{student.kcpeMarks || "—"}</td><td className="px-2 py-2.5">{student.kcpeIndexNo || student.kcseIndexNo || "—"}</td><td className="px-2 py-2.5"><AcademicButton variant="outline" className="min-h-8 px-2 text-xs" onClick={() => setSelected(student)}>More Info</AcademicButton></td></tr>)}
          {paged.length === 0 && <tr><td colSpan={11} className="py-10 text-center text-sm text-academic-ink-soft">No students match these filters.</td></tr>}
        </tbody></table></div>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-academic-line pt-3 text-xs text-academic-ink-soft"><span>Page {page} of {pageCount}</span><div className="flex gap-2"><AcademicButton variant="outline" className="min-h-9" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</AcademicButton><AcademicButton variant="outline" className="min-h-9" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>Next</AcademicButton></div></div>
      </RegistrationPanel>
      {selected && <StudentEditor key={selected.id} student={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

export function StudentRecordPage({ adm }: { adm: string }) {
  const { data } = useRegistrationData();
  const student = data.students.find((item) => item.admNo === decodeURIComponent(adm));
  if (!student) return <div className="rounded-md border border-academic-line bg-white p-8 text-center text-sm text-academic-ink-soft">Student not found in this preview.</div>;
  return <StudentEditor key={student.id} student={student} onClose={() => window.history.back()} pageMode />;
}

export function StudentPhotosPage() {
  const { data, setData } = useRegistrationData();
  const [query, setQuery] = useState("");
  const students = data.students.filter((student) => student.status !== "Deleted" && (!query || student.name.toLowerCase().includes(query.toLowerCase()) || student.admNo.toLowerCase().includes(query.toLowerCase())));

  function changePhoto(student: Student, file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      window.alert("Choose an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const photoUrl = typeof reader.result === "string" ? reader.result : "";
      setData((current) => ({ ...current, students: current.students.map((item) => item.id === student.id ? { ...item, photoUrl } : item) }));
    };
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <RegistrationHeading title="View/ Edit Student Pics" description="Find a student and upload or replace their register photo." />
      <div className="mb-4 max-w-sm"><RegInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or ADM no." /></div>
      {students.length === 0 ? <RegistrationPanel title="Student photos"><p className="text-sm text-academic-ink-soft">Register students before managing student photos.</p></RegistrationPanel> : <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{students.map((student) => <section key={student.id} className="flex items-center gap-3 rounded-md border border-academic-line bg-white p-3"><div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded bg-academic-paper">{student.photoUrl ? <Image src={student.photoUrl} alt={`${student.name} photo`} width={64} height={64} unoptimized className="h-full w-full object-cover" /> : <Camera size={21} className="text-academic-ink-soft" />}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{student.name}</p><p className="text-xs text-academic-ink-soft">ADM {student.admNo}</p><label className="mt-1 inline-block cursor-pointer text-xs font-medium text-academic-accent hover:underline">{student.photoUrl ? "Replace photo" : "Upload photo"}<input type="file" accept="image/*" className="sr-only" onChange={(event) => changePhoto(student, event.target.files?.[0])} /></label></div></section>)}</div>}
    </div>
  );
}

export function BulkStudentEditPage() {
  const { data, setData } = useRegistrationData();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [streamId, setStreamId] = useState("");
  const [status, setStatus] = useState("");

  function toggle(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]);
  }

  function applyChanges() {
    if (selectedIds.length === 0 || (!streamId && !status)) return;
    setData((current) => ({
      ...current,
      students: current.students.map((student) => selectedIds.includes(student.id) ? {
        ...student,
        ...(streamId ? { streamId } : {}),
        ...(status ? { status: status as StudentStatus } : {}),
      } : student),
    }));
    setSelectedIds([]);
    setStreamId("");
    setStatus("");
  }

  return (
    <div>
      <RegistrationHeading title="Bulk Student Edit" description="Select students, then apply a stream or status change to the selected records." />
      <RegistrationPanel title="Bulk changes">
        <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_auto]">
          <RegSelect aria-label="New stream" value={streamId} onChange={(event) => setStreamId(event.target.value)}><option value="">Keep current stream</option>{data.streams.map((stream) => <option key={stream.id} value={stream.id}>{stream.grade} {stream.name}</option>)}</RegSelect>
          <RegSelect aria-label="New status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Keep current status</option>{STUDENT_STATUSES.map((item) => <option key={item}>{item}</option>)}</RegSelect>
          <AcademicButton onClick={applyChanges} disabled={!selectedIds.length || (!streamId && !status)}>Apply to {selectedIds.length} selected</AcademicButton>
        </div>
        <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead><tr className="border-b border-academic-line text-[10px] uppercase text-academic-ink-soft"><th className="w-10 px-2 py-2">Select</th><th className="px-2 py-2">ADM No.</th><th className="px-2 py-2">Name</th><th className="px-2 py-2">Stream</th><th className="px-2 py-2">Status</th></tr></thead><tbody>{data.students.filter((student) => student.status !== "Deleted").map((student) => <tr key={student.id} className="border-b border-academic-line/70"><td className="px-2 py-2.5"><input type="checkbox" checked={selectedIds.includes(student.id)} onChange={() => toggle(student.id)} aria-label={`Select ${student.name}`} className="accent-[var(--academic-accent)]" /></td><td className="px-2 py-2.5">{student.admNo}</td><td className="px-2 py-2.5">{student.name}</td><td className="px-2 py-2.5">{data.streams.find((stream) => stream.id === student.streamId)?.name ?? "—"}</td><td className="px-2 py-2.5">{student.status}</td></tr>)}</tbody></table></div>
      </RegistrationPanel>
    </div>
  );
}