"use client";

import { useState } from "react";
import { Plus, RotateCcw, UserRoundPlus } from "lucide-react";
import { AcademicButton, FormField, RegInput, RegistrationHeading, RegistrationPanel } from "@/components/academic/registration/RegistrationUI";
import { useRegistrationData } from "@/components/academic/registration/RegistrationProvider";
import { newRegistrationId, type Teacher } from "@/lib/academic/registration-data";

type TeacherView = "all" | "classes" | "tp" | "deleted";
type TeacherDraft = Omit<Teacher, "id" | "deleted">;

const EMPTY_TEACHER: TeacherDraft = { tscNo: "", name: "", initials: "", responsibility: "", subjects844: [], subjectsCbe: [], employmentType: "TSC" };

export function TeachersPage() {
  const { data, setData } = useRegistrationData();
  const [view, setView] = useState<TeacherView>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<TeacherDraft>(EMPTY_TEACHER);

  const teachers = data.teachers.filter((teacher) => view === "deleted" ? teacher.deleted : !teacher.deleted);
  const visibleTeachers = view === "tp" ? teachers.filter((teacher) => teacher.employmentType === "TP") : teachers;

  function startNew() {
    setDraft(EMPTY_TEACHER);
    setEditingId(null);
    setFormOpen(true);
  }

  function startEdit(teacher: Teacher) {
    setEditingId(teacher.id);
    setDraft({
      tscNo: teacher.tscNo,
      name: teacher.name,
      initials: teacher.initials,
      responsibility: teacher.responsibility,
      subjects844: teacher.subjects844,
      subjectsCbe: teacher.subjectsCbe,
      employmentType: teacher.employmentType,
    });
    setFormOpen(true);
  }

  function saveTeacher(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const saved: Teacher = { ...draft, id: editingId ?? newRegistrationId(), deleted: false };
    setData((current) => ({ ...current, teachers: editingId ? current.teachers.map((teacher) => teacher.id === editingId ? saved : teacher) : [...current.teachers, saved] }));
    setFormOpen(false);
    setEditingId(null);
    setDraft(EMPTY_TEACHER);
  }

  function toggleCbeSubject(subject: string) {
    setDraft((current) => ({ ...current, subjectsCbe: current.subjectsCbe.includes(subject) ? current.subjectsCbe.filter((item) => item !== subject) : [...current.subjectsCbe, subject] }));
  }

  function softDelete(teacher: Teacher) {
    if (!window.confirm(`Move ${teacher.name} to Deleted Teachers?`)) return;
    setData((current) => ({ ...current, teachers: current.teachers.map((item) => item.id === teacher.id ? { ...item, deleted: true } : item) }));
    if (editingId === teacher.id) setFormOpen(false);
  }

  function restore(teacher: Teacher) {
    setData((current) => ({ ...current, teachers: current.teachers.map((item) => item.id === teacher.id ? { ...item, deleted: false } : item) }));
  }

  const navItems: { key: TeacherView; label: string }[] = [
    { key: "all", label: "View Teachers List" },
    { key: "classes", label: "Class Teacher List" },
    { key: "tp", label: "TP List" },
    { key: "deleted", label: "Deleted Teachers" },
  ];

  return (
    <div>
      <RegistrationHeading title="Teachers Reg." description="Manage staff records, subjects taught, employment type, and class-teacher assignments." actions={<AcademicButton onClick={startNew}><UserRoundPlus size={15} className="mr-2" /> New Entry</AcademicButton>} />
      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Teacher lists">
        {navItems.map((item) => <button key={item.key} role="tab" aria-selected={view === item.key} onClick={() => { setView(item.key); setFormOpen(false); }} className={`min-h-10 rounded-md border px-3 text-sm font-medium ${view === item.key ? "border-academic-accent bg-academic-accent text-white" : "border-academic-line bg-white text-academic-ink-soft hover:bg-academic-paper"}`}>{item.label}</button>)}
      </div>

      {formOpen && (
        <RegistrationPanel title={editingId ? "Manage teacher" : "New teacher entry"} className="mb-5">
          <form onSubmit={saveTeacher} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <FormField label="TSC No."><RegInput value={draft.tscNo} onChange={(event) => setDraft({ ...draft, tscNo: event.target.value })} /></FormField>
            <FormField label="Name" required><RegInput value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required /></FormField>
            <FormField label="Initials" required><RegInput value={draft.initials} onChange={(event) => setDraft({ ...draft, initials: event.target.value })} required /></FormField>
            <FormField label="Responsibility"><RegInput value={draft.responsibility} onChange={(event) => setDraft({ ...draft, responsibility: event.target.value })} placeholder="e.g. H.O.D Languages" /></FormField>
            <FormField label="Employment type" required>
              <select value={draft.employmentType} onChange={(event) => setDraft({ ...draft, employmentType: event.target.value as TeacherDraft["employmentType"] })} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm">
                <option value="TSC">TSC</option><option value="BOM">BOM</option><option value="TP">TP</option>
              </select>
            </FormField>
            <div className="flex items-end gap-2"><AcademicButton type="submit">{editingId ? "Save teacher" : "Register teacher"}</AcademicButton><AcademicButton variant="outline" onClick={() => setFormOpen(false)}>Cancel</AcademicButton></div>
            <fieldset className="rounded-md border border-academic-line p-3 sm:col-span-2 xl:col-span-1"><legend className="px-1 text-xs font-semibold text-academic-ink-soft">CBE Subjects Taught</legend><div className="grid grid-cols-2 gap-2">{data.subjectsCbe.map((subject) => <label key={subject.id} className="flex items-center gap-2 text-xs"><input type="checkbox" checked={draft.subjectsCbe.includes(subject.name)} onChange={() => toggleCbeSubject(subject.name)} className="accent-[var(--academic-accent)]" />{subject.name}</label>)}</div></fieldset>
          </form>
        </RegistrationPanel>
      )}

      {view === "classes" ? (
        <RegistrationPanel title="Class Teacher List">
          <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead><tr className="border-b border-academic-line text-[10px] uppercase text-academic-ink-soft"><th className="px-2 py-2">#</th><th className="px-2 py-2">Grade</th><th className="px-2 py-2">Stream</th><th className="px-2 py-2">Class Teacher</th></tr></thead><tbody>{data.streams.filter((stream) => stream.grade.startsWith("Grade")).map((stream, index) => <tr key={stream.id} className="border-b border-academic-line/70"><td className="px-2 py-2.5">{index + 1}</td><td className="px-2 py-2.5">{stream.grade}</td><td className="px-2 py-2.5 font-medium">{stream.grade} {stream.name}</td><td className="px-2 py-2.5">{data.teachers.find((teacher) => teacher.id === stream.teacherId && !teacher.deleted)?.name ?? "Not assigned"}</td></tr>)}</tbody></table></div>
        </RegistrationPanel>
      ) : (
        <RegistrationPanel title={view === "deleted" ? "Deleted Teachers" : view === "tp" ? "TP List" : "View Teachers List"}>
          <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead><tr className="border-b border-academic-line text-[10px] uppercase text-academic-ink-soft"><th className="px-2 py-2">#</th><th className="px-2 py-2">TSC No.</th><th className="px-2 py-2">Name</th><th className="px-2 py-2">Initials</th><th className="px-2 py-2">Class Teacher</th><th className="px-2 py-2">Responsibility</th><th className="px-2 py-2">CBE Subjects Taught</th><th className="px-2 py-2">Employment</th><th className="px-2 py-2 text-right">Edit/Manage</th></tr></thead><tbody>
            {visibleTeachers.map((teacher, index) => {
              const assignedStreams = data.streams.filter((stream) => stream.teacherId === teacher.id && stream.grade.startsWith("Grade")).map((stream) => `${stream.grade} ${stream.name}`);
              return <tr key={teacher.id} className="border-b border-academic-line/70 align-top"><td className="px-2 py-2.5">{index + 1}</td><td className="px-2 py-2.5 tabular-nums">{teacher.tscNo || "—"}</td><td className="px-2 py-2.5 font-medium">{teacher.name}</td><td className="px-2 py-2.5">{teacher.initials}</td><td className="px-2 py-2.5">{assignedStreams.length ? assignedStreams.join(", ") : "—"}</td><td className="px-2 py-2.5">{teacher.responsibility || "—"}</td><td className="px-2 py-2.5">{teacher.subjectsCbe.join(", ") || "—"}</td><td className="px-2 py-2.5">{teacher.employmentType}</td><td className="px-2 py-2.5 text-right">{view === "deleted" ? <AcademicButton variant="outline" className="min-h-8 px-2 text-xs" onClick={() => restore(teacher)}><RotateCcw size={13} className="mr-1" /> Restore</AcademicButton> : <><AcademicButton variant="ghost" className="min-h-8 px-2 text-xs" onClick={() => startEdit(teacher)}>Manage</AcademicButton><AcademicButton variant="danger" className="ml-1 min-h-8 px-2 text-xs" onClick={() => softDelete(teacher)}>Delete</AcademicButton></>}</td></tr>;
            })}
            {visibleTeachers.length === 0 && <tr><td colSpan={9} className="py-8 text-center text-sm text-academic-ink-soft">No teachers in this view.</td></tr>}
          </tbody></table></div>
        </RegistrationPanel>
      )}
      {view !== "deleted" && view !== "classes" && <div className="mt-3 flex items-center gap-1.5 text-xs text-academic-ink-soft"><Plus size={13} /> Class teacher assignments are derived from Streams Reg.</div>}
    </div>
  );
}