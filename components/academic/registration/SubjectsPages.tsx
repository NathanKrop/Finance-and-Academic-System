"use client";

import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { AcademicButton, FormField, RegInput, RegSelect, RegistrationHeading, RegistrationPanel } from "@/components/academic/registration/RegistrationUI";
import { useRegistrationData } from "@/components/academic/registration/RegistrationProvider";
import { CBE_PATHWAYS, newRegistrationId, type CbePathway, type Paper, type Subject844, type SubjectCbe } from "@/lib/academic/registration-data";

const SUBJECT_GROUPS = ["Languages", "Sciences", "Humanities", "Technical", "Applied", "Other"];

export function Subjects844Page() {
  const { data, setData } = useRegistrationData();
  const [draft, setDraft] = useState({ code: "", abbreviation: "", name: "", group: "", hodId: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [papersSubjectId, setPapersSubjectId] = useState<string | null>(null);
  const [paperDraft, setPaperDraft] = useState<Paper[]>([]);
  const activeTeachers = data.teachers.filter((teacher) => !teacher.deleted);
  const papersSubject = data.subjects844.find((subject) => subject.id === papersSubjectId);

  function resetForm() {
    setDraft({ code: "", abbreviation: "", name: "", group: "", hodId: "" });
    setEditingId(null);
  }

  function saveSubject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const subject: Subject844 = { ...draft, id: editingId ?? newRegistrationId(), papers: data.subjects844.find((item) => item.id === editingId)?.papers ?? [] };
    setData((current) => ({ ...current, subjects844: editingId ? current.subjects844.map((item) => item.id === editingId ? subject : item) : [...current.subjects844, subject] }));
    resetForm();
  }

  function editSubject(subject: Subject844) {
    setEditingId(subject.id);
    setDraft({ code: subject.code, abbreviation: subject.abbreviation, name: subject.name, group: subject.group, hodId: subject.hodId });
  }

  function openPapers(subject: Subject844) {
    setPapersSubjectId(subject.id);
    setPaperDraft(subject.papers.map((paper) => ({ ...paper })));
  }

  function savePapers() {
    const weightTotal = paperDraft.reduce((total, paper) => total + Number(paper.weight || 0), 0);
    if (weightTotal !== 100) {
      window.alert(`Paper weights must total 100%. Current total: ${weightTotal}%.`);
      return;
    }
    setData((current) => ({ ...current, subjects844: current.subjects844.map((subject) => subject.id === papersSubjectId ? { ...subject, papers: paperDraft } : subject) }));
    setPapersSubjectId(null);
  }

  function removeSubject(subject: Subject844) {
    if (!window.confirm(`Delete ${subject.name}?`)) return;
    setData((current) => ({ ...current, subjects844: current.subjects844.filter((item) => item.id !== subject.id) }));
    if (editingId === subject.id) resetForm();
  }

  return (
    <div>
      <RegistrationHeading title="Subject Reg." description="Register 8-4-4 subjects and maintain their examinable paper weights." />
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <RegistrationPanel title={editingId ? "Edit subject" : "Add subject"}>
          <form onSubmit={saveSubject} className="space-y-3.5">
            <FormField label="Subject Code" required><RegInput value={draft.code} onChange={(event) => setDraft({ ...draft, code: event.target.value })} required /></FormField>
            <FormField label="Abr." required><RegInput value={draft.abbreviation} onChange={(event) => setDraft({ ...draft, abbreviation: event.target.value })} required /></FormField>
            <FormField label="Subject Name" required><RegInput value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required /></FormField>
            <FormField label="Group" required>
              <RegSelect value={draft.group} onChange={(event) => setDraft({ ...draft, group: event.target.value })} required>
                <option value="">Select group</option>{SUBJECT_GROUPS.map((group) => <option key={group}>{group}</option>)}
              </RegSelect>
            </FormField>
            <FormField label="H.O.D">
              <RegSelect value={draft.hodId} onChange={(event) => setDraft({ ...draft, hodId: event.target.value })}>
                <option value="">Select teacher</option>{activeTeachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}
              </RegSelect>
            </FormField>
            <div className="flex gap-2"><AcademicButton type="submit">{editingId ? "Save subject" : "Add subject"}</AcademicButton>{editingId && <AcademicButton variant="outline" onClick={resetForm}>Cancel</AcademicButton>}</div>
          </form>
        </RegistrationPanel>

        <RegistrationPanel title="Subjects Info">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead><tr className="border-b border-academic-line text-[10px] uppercase text-academic-ink-soft"><th className="px-2 py-2">#</th><th className="px-2 py-2">Code</th><th className="px-2 py-2">Abr.</th><th className="px-2 py-2">Subject Name</th><th className="px-2 py-2">H.O.D</th><th className="px-2 py-2">Group</th><th className="px-2 py-2">Papers</th><th className="px-2 py-2 text-right">Update</th></tr></thead>
              <tbody>{data.subjects844.map((subject, index) => (
                <tr key={subject.id} className="border-b border-academic-line/70 align-top">
                  <td className="px-2 py-2.5">{index + 1}</td><td className="px-2 py-2.5 tabular-nums">{subject.code}</td><td className="px-2 py-2.5">{subject.abbreviation}</td><td className="px-2 py-2.5 font-medium">{subject.name}</td>
                  <td className="px-2 py-2.5">{activeTeachers.find((teacher) => teacher.id === subject.hodId)?.name ?? "Not assigned"}</td><td className="px-2 py-2.5">{subject.group}</td>
                  <td className="px-2 py-2.5"><div className="space-y-0.5">{subject.papers.map((paper) => <p key={paper.id} className="text-xs">{subject.abbreviation} {paper.name} <span className="tabular-nums text-academic-ink-soft">{paper.weight}%</span></p>)}</div><AcademicButton variant="outline" className="mt-2 min-h-8 px-2 text-xs" onClick={() => openPapers(subject)}>Edit Papers</AcademicButton></td>
                  <td className="px-2 py-2.5 text-right"><AcademicButton variant="ghost" className="min-h-8 px-2 text-xs" onClick={() => editSubject(subject)}>Edit Subject</AcademicButton><AcademicButton variant="danger" className="ml-1 min-h-8 px-2 text-xs" onClick={() => removeSubject(subject)}>Delete</AcademicButton></td>
                </tr>
              ))}{data.subjects844.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-sm text-academic-ink-soft">No 8-4-4 subjects registered.</td></tr>}</tbody>
            </table>
          </div>
        </RegistrationPanel>
      </div>

      {papersSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPapersSubjectId(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="papers-title" className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-md bg-academic-surface p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between"><div><p className="text-xs text-academic-ink-soft">{papersSubject.name}</p><h2 id="papers-title" className="font-display text-xl">Edit papers</h2></div><button type="button" aria-label="Close papers editor" onClick={() => setPapersSubjectId(null)} className="rounded p-2 text-academic-ink-soft hover:bg-academic-paper"><X size={18} /></button></div>
            <div className="space-y-3">
              {paperDraft.map((paper) => (
                <div key={paper.id} className="grid grid-cols-[1fr_100px_40px] items-end gap-2">
                  <FormField label="Paper name"><RegInput value={paper.name} onChange={(event) => setPaperDraft((current) => current.map((item) => item.id === paper.id ? { ...item, name: event.target.value } : item))} /></FormField>
                  <FormField label="Weight %"><RegInput type="number" min="0" max="100" value={paper.weight} onChange={(event) => setPaperDraft((current) => current.map((item) => item.id === paper.id ? { ...item, weight: Number(event.target.value) } : item))} /></FormField>
                  <AcademicButton variant="danger" aria-label={`Remove ${paper.name}`} onClick={() => setPaperDraft((current) => current.filter((item) => item.id !== paper.id))}><Trash2 size={15} /></AcademicButton>
                </div>
              ))}
            </div>
            <AcademicButton variant="outline" className="mt-3" onClick={() => setPaperDraft((current) => [...current, { id: newRegistrationId(), name: `paper${current.length + 1}`, weight: 0 }])}><Plus size={15} className="mr-1" /> Add paper</AcademicButton>
            <div className="mt-5 flex items-center justify-between border-t border-academic-line pt-4"><span className={`text-sm font-semibold ${paperDraft.reduce((sum, paper) => sum + Number(paper.weight || 0), 0) === 100 ? "text-academic-accent" : "text-red-700"}`}>Total: {paperDraft.reduce((sum, paper) => sum + Number(paper.weight || 0), 0)}%</span><div className="flex gap-2"><AcademicButton variant="outline" onClick={() => setPapersSubjectId(null)}>Cancel</AcademicButton><AcademicButton onClick={savePapers}>Save papers</AcademicButton></div></div>
          </section>
        </div>
      )}
    </div>
  );
}

export function SubjectsCbePage() {
  const { data, setData } = useRegistrationData();
  const [draft, setDraft] = useState({ name: "", abbreviation: "", pathways: [] as CbePathway[], hodId: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const activeTeachers = data.teachers.filter((teacher) => !teacher.deleted);

  function saveSubject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (draft.pathways.length === 0) {
      window.alert("Select at least one pathway for this subject.");
      return;
    }
    const subject: SubjectCbe = { ...draft, id: editingId ?? newRegistrationId() };
    setData((current) => ({ ...current, subjectsCbe: editingId ? current.subjectsCbe.map((item) => item.id === editingId ? subject : item) : [...current.subjectsCbe, subject] }));
    setDraft({ name: "", abbreviation: "", pathways: [], hodId: "" });
    setEditingId(null);
  }

  function editSubject(subject: SubjectCbe) {
    setEditingId(subject.id);
    setDraft({ name: subject.name, abbreviation: subject.abbreviation, pathways: [...subject.pathways], hodId: subject.hodId });
  }

  function togglePathway(pathway: CbePathway) {
    setDraft((current) => ({ ...current, pathways: current.pathways.includes(pathway) ? current.pathways.filter((item) => item !== pathway) : [...current.pathways, pathway] }));
  }

  function removeSubject(subject: SubjectCbe) {
    if (!window.confirm(`Delete ${subject.name}?`)) return;
    setData((current) => ({ ...current, subjectsCbe: current.subjectsCbe.filter((item) => item.id !== subject.id) }));
  }

  return (
    <div>
      <RegistrationHeading title="Subject Reg. (CBE)" description="Register subjects and choose the pathways where each subject is offered." />
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <RegistrationPanel title={editingId ? "Edit CBE subject" : "Add CBE subject"}>
          <form onSubmit={saveSubject} className="space-y-3.5">
            <FormField label="Subject Name" required><RegInput value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required /></FormField>
            <FormField label="Abr." required><RegInput value={draft.abbreviation} onChange={(event) => setDraft({ ...draft, abbreviation: event.target.value })} required /></FormField>
            <fieldset><legend className="mb-2 text-xs font-medium text-academic-ink-soft">Select pathways applicable to subject</legend><div className="space-y-2">{CBE_PATHWAYS.map((pathway) => <label key={pathway} className="flex min-h-10 items-center gap-2 rounded-md border border-academic-line px-3 text-sm"><input type="checkbox" checked={draft.pathways.includes(pathway)} onChange={() => togglePathway(pathway)} className="accent-[var(--academic-accent)]" />{pathway}</label>)}</div></fieldset>
            <FormField label="H.O.D"><RegSelect value={draft.hodId} onChange={(event) => setDraft({ ...draft, hodId: event.target.value })}><option value="">Select teacher</option>{activeTeachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}</RegSelect></FormField>
            <div className="flex gap-2"><AcademicButton type="submit">{editingId ? "Save subject" : "Add subject"}</AcademicButton>{editingId && <AcademicButton variant="outline" onClick={() => { setEditingId(null); setDraft({ name: "", abbreviation: "", pathways: [], hodId: "" }); }}>Cancel</AcademicButton>}</div>
          </form>
        </RegistrationPanel>
        <RegistrationPanel title="CBE Subjects Info">
          <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead><tr className="border-b border-academic-line text-[10px] uppercase text-academic-ink-soft"><th className="px-2 py-2">#</th><th className="px-2 py-2">Subject Name</th><th className="px-2 py-2">Abr.</th><th className="px-2 py-2">H.O.D</th><th className="px-2 py-2">Pathways</th><th className="px-2 py-2 text-right">Update</th></tr></thead><tbody>{data.subjectsCbe.map((subject, index) => <tr key={subject.id} className="border-b border-academic-line/70"><td className="px-2 py-2.5">{index + 1}</td><td className="px-2 py-2.5 font-medium">{subject.name}</td><td className="px-2 py-2.5">{subject.abbreviation}</td><td className="px-2 py-2.5">{activeTeachers.find((teacher) => teacher.id === subject.hodId)?.name ?? "Not assigned"}</td><td className="px-2 py-2.5">{subject.pathways.join(", ")}</td><td className="px-2 py-2.5 text-right"><AcademicButton variant="ghost" className="min-h-8 px-2 text-xs" onClick={() => editSubject(subject)}>Edit</AcademicButton><AcademicButton variant="danger" className="ml-1 min-h-8 px-2 text-xs" onClick={() => removeSubject(subject)}>Delete</AcademicButton></td></tr>)}{data.subjectsCbe.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-sm text-academic-ink-soft">No CBE subjects registered.</td></tr>}</tbody></table></div>
        </RegistrationPanel>
      </div>
    </div>
  );
}