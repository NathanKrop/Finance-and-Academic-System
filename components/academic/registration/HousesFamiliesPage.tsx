"use client";

import { useState } from "react";
import { Printer } from "lucide-react";
import { AcademicButton, FormField, PrintHeader, RegInput, RegSelect, RegistrationHeading, RegistrationPanel } from "@/components/academic/registration/RegistrationUI";
import { useRegistrationData } from "@/components/academic/registration/RegistrationProvider";
import { newRegistrationId, type Family, type House } from "@/lib/academic/registration-data";

type PrintableGroup = { kind: "house" | "family"; id: string | null; label: string };

export function HousesFamiliesPage() {
  const { data, setData } = useRegistrationData();
  const [house, setHouse] = useState({ name: "", teacherId: "" });
  const [family, setFamily] = useState({ name: "", fatherId: "", motherId: "" });
  const [editingHouse, setEditingHouse] = useState<string | null>(null);
  const [editingFamily, setEditingFamily] = useState<string | null>(null);
  const [printGroup, setPrintGroup] = useState<PrintableGroup | null>(null);
  const teachers = data.teachers.filter((teacher) => !teacher.deleted);
  const activeStudents = data.students.filter((student) => student.status !== "Deleted");

  function saveHouse(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextHouse: House = { id: editingHouse ?? newRegistrationId(), ...house };
    setData((current) => ({ ...current, houses: editingHouse ? current.houses.map((item) => item.id === editingHouse ? nextHouse : item) : [...current.houses, nextHouse] }));
    setHouse({ name: "", teacherId: "" });
    setEditingHouse(null);
  }

  function saveFamily(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextFamily: Family = { id: editingFamily ?? newRegistrationId(), ...family };
    setData((current) => ({ ...current, families: editingFamily ? current.families.map((item) => item.id === editingFamily ? nextFamily : item) : [...current.families, nextFamily] }));
    setFamily({ name: "", fatherId: "", motherId: "" });
    setEditingFamily(null);
  }

  function deleteHouse(item: House) {
    if (!window.confirm(`Delete house ${item.name}? Students assigned to it will become unassigned.`)) return;
    setData((current) => ({ ...current, houses: current.houses.filter((houseItem) => houseItem.id !== item.id), students: current.students.map((student) => student.houseId === item.id ? { ...student, houseId: null } : student) }));
  }

  function deleteFamily(item: Family) {
    if (!window.confirm(`Delete family ${item.name}? Students assigned to it will become unassigned.`)) return;
    setData((current) => ({ ...current, families: current.families.filter((familyItem) => familyItem.id !== item.id), students: current.students.map((student) => student.familyId === item.id ? { ...student, familyId: null } : student) }));
  }

  const shownStudents = printGroup
    ? activeStudents.filter((student) => printGroup.kind === "house" ? student.houseId === printGroup.id : student.familyId === printGroup.id)
    : [];

  return (
    <div>
      <RegistrationHeading title="House/family Reg." description="Maintain student houses and families. Unassigned students remain unassigned; NO_HSE and NO_FAM are computed rows." />
      <div className="space-y-6">
        <section className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
          <RegistrationPanel title={editingHouse ? "Edit house" : "Add house"}>
            <form onSubmit={saveHouse} className="space-y-3.5">
              <FormField label="House Name" required><RegInput value={house.name} onChange={(event) => setHouse({ ...house, name: event.target.value })} required /></FormField>
              <FormField label="House Teacher"><RegSelect value={house.teacherId} onChange={(event) => setHouse({ ...house, teacherId: event.target.value })}><option value="">Select teacher</option>{teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}</RegSelect></FormField>
              <div className="flex gap-2"><AcademicButton type="submit">{editingHouse ? "Save house" : "Add house"}</AcademicButton>{editingHouse && <AcademicButton variant="outline" onClick={() => { setHouse({ name: "", teacherId: "" }); setEditingHouse(null); }}>Cancel</AcademicButton>}</div>
            </form>
          </RegistrationPanel>
          <RegistrationPanel title="All Houses Info">
            <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead><tr className="border-b border-academic-line text-[10px] uppercase text-academic-ink-soft"><th className="px-2 py-2">#</th><th className="px-2 py-2">House name</th><th className="px-2 py-2">House teacher</th><th className="px-2 py-2">Students</th><th className="px-2 py-2">List</th><th className="px-2 py-2 text-right">Update</th></tr></thead><tbody>
              {data.houses.map((item, index) => {
                const count = activeStudents.filter((student) => student.houseId === item.id).length;
                return <tr key={item.id} className="border-b border-academic-line/70"><td className="px-2 py-2.5">{index + 1}</td><td className="px-2 py-2.5 font-medium">{item.name}</td><td className="px-2 py-2.5">{teachers.find((teacher) => teacher.id === item.teacherId)?.name ?? "Not assigned"}</td><td className="px-2 py-2.5 tabular-nums">{count}</td><td className="px-2 py-2.5"><AcademicButton variant="outline" className="min-h-8 px-2 text-xs" onClick={() => setPrintGroup({ kind: "house", id: item.id, label: item.name })}><Printer size={13} className="mr-1" /> View/Print House List</AcademicButton></td><td className="px-2 py-2.5 text-right"><AcademicButton variant="ghost" className="min-h-8 px-2 text-xs" onClick={() => { setEditingHouse(item.id); setHouse({ name: item.name, teacherId: item.teacherId }); }}>Edit</AcademicButton><AcademicButton variant="danger" className="ml-1 min-h-8 px-2 text-xs" onClick={() => deleteHouse(item)}>Delete</AcademicButton></td></tr>;
              })}
              {(() => { const count = activeStudents.filter((student) => !student.houseId).length; return <tr className="bg-academic-paper"><td className="px-2 py-2.5">{data.houses.length + 1}</td><td className="px-2 py-2.5 font-semibold">NO_HSE</td><td className="px-2 py-2.5 text-academic-ink-soft">Computed group</td><td className="px-2 py-2.5 tabular-nums">{count}</td><td className="px-2 py-2.5"><AcademicButton variant="outline" className="min-h-8 px-2 text-xs" onClick={() => setPrintGroup({ kind: "house", id: null, label: "NO_HSE" })}><Printer size={13} className="mr-1" /> View/Print list</AcademicButton></td><td className="px-2 py-2.5 text-right text-xs text-academic-ink-soft">Not editable</td></tr>; })()}
              </tbody></table></div>
          </RegistrationPanel>
        </section>

        <section className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
          <RegistrationPanel title={editingFamily ? "Edit family" : "Add family"}>
            <form onSubmit={saveFamily} className="space-y-3.5">
              <FormField label="Family Name" required><RegInput value={family.name} onChange={(event) => setFamily({ ...family, name: event.target.value })} required /></FormField>
              <FormField label="Father"><RegSelect value={family.fatherId} onChange={(event) => setFamily({ ...family, fatherId: event.target.value })}><option value="">Select teacher</option>{teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}</RegSelect></FormField>
              <FormField label="Mother"><RegSelect value={family.motherId} onChange={(event) => setFamily({ ...family, motherId: event.target.value })}><option value="">Select teacher</option>{teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}</RegSelect></FormField>
              <div className="flex gap-2"><AcademicButton type="submit">{editingFamily ? "Save family" : "Add family"}</AcademicButton>{editingFamily && <AcademicButton variant="outline" onClick={() => { setFamily({ name: "", fatherId: "", motherId: "" }); setEditingFamily(null); }}>Cancel</AcademicButton>}</div>
            </form>
          </RegistrationPanel>
          <RegistrationPanel title="All Families Info">
            <div className="overflow-x-auto"><table className="w-full min-w-[740px] text-left text-sm"><thead><tr className="border-b border-academic-line text-[10px] uppercase text-academic-ink-soft"><th className="px-2 py-2">#</th><th className="px-2 py-2">Family name</th><th className="px-2 py-2">Father</th><th className="px-2 py-2">Mother</th><th className="px-2 py-2">Students</th><th className="px-2 py-2">List</th><th className="px-2 py-2 text-right">Update</th></tr></thead><tbody>
              {data.families.map((item, index) => {
                const count = activeStudents.filter((student) => student.familyId === item.id).length;
                return <tr key={item.id} className="border-b border-academic-line/70"><td className="px-2 py-2.5">{index + 1}</td><td className="px-2 py-2.5 font-medium">{item.name}</td><td className="px-2 py-2.5">{teachers.find((teacher) => teacher.id === item.fatherId)?.name ?? "Not assigned"}</td><td className="px-2 py-2.5">{teachers.find((teacher) => teacher.id === item.motherId)?.name ?? "Not assigned"}</td><td className="px-2 py-2.5 tabular-nums">{count}</td><td className="px-2 py-2.5"><AcademicButton variant="outline" className="min-h-8 px-2 text-xs" onClick={() => setPrintGroup({ kind: "family", id: item.id, label: item.name })}><Printer size={13} className="mr-1" /> View List</AcademicButton></td><td className="px-2 py-2.5 text-right"><AcademicButton variant="ghost" className="min-h-8 px-2 text-xs" onClick={() => { setEditingFamily(item.id); setFamily({ name: item.name, fatherId: item.fatherId, motherId: item.motherId }); }}>Edit</AcademicButton><AcademicButton variant="danger" className="ml-1 min-h-8 px-2 text-xs" onClick={() => deleteFamily(item)}>Delete</AcademicButton></td></tr>;
              })}
              {(() => { const count = activeStudents.filter((student) => !student.familyId).length; return <tr className="bg-academic-paper"><td className="px-2 py-2.5">{data.families.length + 1}</td><td className="px-2 py-2.5 font-semibold">NO_FAM</td><td colSpan={2} className="px-2 py-2.5 text-academic-ink-soft">Computed group</td><td className="px-2 py-2.5 tabular-nums">{count}</td><td className="px-2 py-2.5"><AcademicButton variant="outline" className="min-h-8 px-2 text-xs" onClick={() => setPrintGroup({ kind: "family", id: null, label: "NO_FAM" })}><Printer size={13} className="mr-1" /> View list</AcademicButton></td><td className="px-2 py-2.5 text-right text-xs text-academic-ink-soft">Not editable</td></tr>; })()}
              </tbody></table></div>
          </RegistrationPanel>
        </section>
      </div>

      {printGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 print:static print:block print:bg-white print:p-0">
          <section role="dialog" aria-modal="true" aria-label={`${printGroup.label} student list`} className="academic-print-document max-h-[90dvh] w-full max-w-3xl overflow-y-auto rounded-md bg-white p-6 shadow-2xl print:max-h-none print:max-w-none print:overflow-visible print:rounded-none print:p-0 print:shadow-none">
            <div className="mb-4 flex justify-end gap-2 print:hidden"><AcademicButton variant="outline" onClick={() => setPrintGroup(null)}>Close</AcademicButton><AcademicButton onClick={() => window.print()}><Printer size={15} className="mr-2" /> Print list</AcademicButton></div>
            <PrintHeader school={data.school} />
            <h2 className="mb-4 text-center text-lg font-semibold text-black">{printGroup.kind === "house" ? "House" : "Family"}: {printGroup.label}</h2>
            <table className="w-full border-collapse text-sm text-black"><thead><tr className="border-b border-black"><th className="px-2 py-2 text-left">#</th><th className="px-2 py-2 text-left">ADM No.</th><th className="px-2 py-2 text-left">Student Name</th><th className="px-2 py-2 text-left">Stream</th></tr></thead><tbody>{shownStudents.map((student, index) => { const stream = data.streams.find((item) => item.id === student.streamId); return <tr key={student.id} className="border-b border-gray-300"><td className="px-2 py-2">{index + 1}</td><td className="px-2 py-2">{student.admNo}</td><td className="px-2 py-2">{student.name}</td><td className="px-2 py-2">{stream ? `${stream.grade} ${stream.name}` : "—"}</td></tr>; })}</tbody></table>
            {shownStudents.length === 0 && <p className="py-8 text-center text-sm text-black">No students in this group.</p>}
          </section>
        </div>
      )}
    </div>
  );
}