"use client";

import { useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { AcademicButton, FormField, PrintHeader, RegInput, RegSelect, RegTextarea, RegistrationHeading, RegistrationPanel } from "@/components/academic/registration/RegistrationUI";
import { useRegistrationData } from "@/components/academic/registration/RegistrationProvider";
import { STREAM_GRADES, newRegistrationId, type AcademicStream, type SchoolDetails, type StreamGrade } from "@/lib/academic/registration-data";

const SCHOOL_FIELDS: { key: keyof Omit<SchoolDetails, "logoUrl">; label: string; multiline?: boolean }[] = [
  { key: "name", label: "School Name" },
  { key: "motto", label: "Motto" },
  { key: "poBox", label: "P.O Box" },
  { key: "town", label: "Town" },
  { key: "website", label: "Website" },
  { key: "email", label: "Email" },
  { key: "phone1", label: "Phone 1" },
  { key: "phone2", label: "Phone 2" },
  { key: "mission", label: "Mission", multiline: true },
  { key: "vision", label: "Vision", multiline: true },
];

export function SchoolDetailsPage() {
  const { data, setData } = useRegistrationData();
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState(data.school.logoUrl);

  function updateField(key: keyof SchoolDetails, value: string) {
    setData((current) => ({ ...current, school: { ...current.school, [key]: value } }));
    setSaved(false);
  }

  function handleLogo(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      window.alert("Choose an image file for the school logo.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setPreview(result);
      updateField("logoUrl", result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <RegistrationHeading title="School Details" description="These details appear in the header of printable school lists." />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <RegistrationPanel title="School information">
          <form onSubmit={(event) => { event.preventDefault(); setSaved(true); }} className="grid gap-4 sm:grid-cols-2">
            {SCHOOL_FIELDS.map((field) => (
              <FormField key={field.key} label={field.label} className={field.multiline ? "sm:col-span-2" : ""}>
                {field.multiline ? (
                  <RegTextarea rows={3} value={data.school[field.key]} onChange={(event) => updateField(field.key, event.target.value)} />
                ) : (
                  <RegInput type={field.key === "email" ? "email" : field.key === "website" ? "url" : "text"} value={data.school[field.key]} onChange={(event) => updateField(field.key, event.target.value)} />
                )}
              </FormField>
            ))}
            <div className="sm:col-span-2 flex items-center gap-3 pt-1">
              <AcademicButton type="submit"><Check size={15} className="mr-2" /> Save school details</AcademicButton>
              {saved && <span role="status" className="text-xs font-medium text-academic-accent">Saved to this preview</span>}
            </div>
          </form>
        </RegistrationPanel>
        <div className="space-y-5">
          <RegistrationPanel title="School logo">
            <div className="flex min-h-32 items-center justify-center rounded-md border border-dashed border-academic-line bg-academic-paper p-4">
              {/* Local image preview; no upload leaves the seeded school logo in place. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview || "/Logo/school_logo.jpg"} alt="School logo preview" className="max-h-24 max-w-full object-contain" />
            </div>
            <FormField label="Upload logo" className="mt-4">
              <RegInput type="file" accept="image/*" onChange={handleLogo} className="file:mr-3 file:rounded file:border-0 file:bg-academic-accent-soft file:px-2 file:py-1 file:text-xs" />
            </FormField>
          </RegistrationPanel>
          <RegistrationPanel title="Print header preview">
            <PrintHeader school={data.school} />
            <p className="text-xs text-academic-ink-soft">This header is reused on printable class and family lists.</p>
          </RegistrationPanel>
        </div>
      </div>
    </div>
  );
}

export function StreamsPage() {
  const { data, setData } = useRegistrationData();
  const [name, setName] = useState("");
  const [grades, setGrades] = useState<StreamGrade[]>([]);
  const [editing, setEditing] = useState<AcademicStream | null>(null);

  function toggleGrade(grade: StreamGrade) {
    setGrades((current) => current.includes(grade) ? current.filter((item) => item !== grade) : [...current, grade]);
  }

  function saveStream(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const streamName = name.trim();
    if (!streamName || grades.length === 0) return;
    setData((current) => ({
      ...current,
      streams: editing
        ? current.streams.map((stream) => stream.id === editing.id ? { ...stream, name: streamName, grade: grades[0] } : stream)
        : [...current.streams, ...grades.map((grade) => ({ id: newRegistrationId(), name: streamName, grade, teacherId: "" }))],
    }));
    setName("");
    setGrades([]);
    setEditing(null);
  }

  function editStream(stream: AcademicStream) {
    setEditing(stream);
    setName(stream.name);
    setGrades([stream.grade]);
  }

  function updateTeacher(streamId: string, teacherId: string) {
    setData((current) => ({
      ...current,
      streams: current.streams.map((stream) => stream.id === streamId ? { ...stream, teacherId } : stream),
    }));
  }

  function deleteStream(stream: AcademicStream) {
    const studentCount = data.students.filter((student) => student.streamId === stream.id && student.status !== "Deleted").length;
    if (studentCount > 0) {
      window.alert("This stream has students and cannot be deleted.");
      return;
    }
    if (!window.confirm(`Delete ${stream.grade} ${stream.name}?`)) return;
    setData((current) => ({ ...current, streams: current.streams.filter((item) => item.id !== stream.id) }));
  }

  return (
    <div>
      <RegistrationHeading title="Streams Reg." description="Create streams for either curriculum. A stream is identified by its form/grade and name." />
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <RegistrationPanel title={editing ? "Update stream" : "Add streams"}>
          <form onSubmit={saveStream} className="space-y-4">
            <FormField label="Stream Name" required>
              <RegInput value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. OXFORD" required />
            </FormField>
            <fieldset>
              <legend className="mb-2 text-xs font-medium text-academic-ink-soft">Stream Form/Grade</legend>
              <div className="grid grid-cols-2 gap-2">
                {STREAM_GRADES.map((grade) => (
                  <label key={grade} className="flex min-h-10 items-center gap-2 rounded-md border border-academic-line px-2.5 text-xs">
                    <input type="checkbox" checked={grades.includes(grade)} disabled={Boolean(editing)} onChange={() => toggleGrade(grade)} className="accent-[var(--academic-accent)]" />
                    {grade}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="flex flex-wrap gap-2">
              <AcademicButton type="submit">{editing ? "Save changes" : "Create selected streams"}</AcademicButton>
              {editing && <AcademicButton onClick={() => { setEditing(null); setName(""); setGrades([]); }} variant="outline">Cancel</AcademicButton>}
            </div>
          </form>
        </RegistrationPanel>

        <div className="min-w-0 space-y-5">
          {STREAM_GRADES.map((grade) => {
            const streams = data.streams.filter((stream) => stream.grade === grade);
            const totalStudents = streams.reduce((sum, stream) => sum + data.students.filter((student) => student.streamId === stream.id).length, 0);
            return (
              <RegistrationPanel key={grade} title={`${grade} (${streams.length} ${streams.length === 1 ? "Stream" : "Streams"})`}>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px] text-left text-sm">
                    <thead><tr className="border-b border-academic-line text-[10px] uppercase text-academic-ink-soft"><th className="px-2 py-2">Form/Grade</th><th className="px-2 py-2">Stream</th><th className="px-2 py-2">Students</th><th className="px-2 py-2">Class Teacher</th><th className="px-2 py-2 text-right">Update</th></tr></thead>
                    <tbody>
                      {streams.map((stream) => {
                        const count = data.students.filter((student) => student.streamId === stream.id).length;
                        return (
                          <tr key={stream.id} className="border-b border-academic-line/70">
                            <td className="px-2 py-2.5">{stream.grade}</td>
                            <td className="px-2 py-2.5 font-medium">{stream.grade} {stream.name}</td>
                            <td className="px-2 py-2.5 tabular-nums">{count}</td>
                            <td className="px-2 py-2.5">
                              <RegSelect aria-label={`Class teacher for ${stream.grade} ${stream.name}`} value={stream.teacherId} onChange={(event) => updateTeacher(stream.id, event.target.value)} className="max-w-52">
                                <option value="">Assign teacher</option>
                                {data.teachers.filter((teacher) => !teacher.deleted).map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}
                              </RegSelect>
                            </td>
                            <td className="px-2 py-2.5 text-right">
                              <AcademicButton variant="ghost" className="mr-1 min-h-9 px-2" onClick={() => editStream(stream)}>Edit</AcademicButton>
                              <AcademicButton variant="danger" className="min-h-9 px-2" onClick={() => deleteStream(stream)} disabled={count > 0} aria-label={`Delete ${stream.grade} ${stream.name}`}><Trash2 size={15} /></AcademicButton>
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-academic-paper font-semibold"><td colSpan={2} className="px-2 py-2.5">{grade} Total Students</td><td className="px-2 py-2.5 tabular-nums">{totalStudents}</td><td colSpan={2} /></tr>
                    </tbody>
                  </table>
                </div>
              </RegistrationPanel>
            );
          })}
        </div>
      </div>
    </div>
  );
}