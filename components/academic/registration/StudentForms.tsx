"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, UserPlus } from "lucide-react";
import { AcademicButton, FormField, RegInput, RegSelect, RegistrationHeading, RegistrationPanel } from "@/components/academic/registration/RegistrationUI";
import { useRegistrationData } from "@/components/academic/registration/RegistrationProvider";
import { CBE_PATHWAYS, newRegistrationId, type Student } from "@/lib/academic/registration-data";

type StudentDraft = Omit<Student, "id" | "status">;

const EMPTY_STUDENT: StudentDraft = {
  admNo: "", name: "", curriculum: "CBE", streamId: "", gender: "", boarder: false, guardianName: "", dateAdmitted: "", formAdmitted: "", gradeAdmitted: "Grade 10", phone: "", otherPhone: "", upiNo: "", houseId: null, dateOfBirth: "", kcseIndexNo: "", county: "", photoUrl: "", division: "", location: "", subLocation: "", address: "", yearOfLeaving: "", familyId: null, kcpeMarks: "", kcpeIndexNo: "", pathway: "", track: "", kjseaGrade: "", juniorSchool: "",
};

const PHONE_PREFIXES = ["+254", "+255", "+256", "+257", "+250", "+251"];
const TRACKS = ["Track A", "Track B", "Track C"];

export function StudentRegistrationPage() {
  const { data, setData } = useRegistrationData();
  const lastAdmNo = data.students.at(-1)?.admNo ?? "—";
  const highestAdmNo = data.students.reduce((highest, student) => Math.max(highest, Number(student.admNo.replace(/\D/g, "")) || 0), 0) || "—";
  const [draft, setDraft] = useState<StudentDraft>({ ...EMPTY_STUDENT });
  const [phonePrefix, setPhonePrefix] = useState("+254");
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState("");
  const streams = data.streams.filter((stream) => stream.grade.startsWith("Grade"));
  const availableHouses = data.houses;

  function update<K extends keyof StudentDraft>(key: K, value: StudentDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setMessage("");
  }

  function readPhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Choose an image file for the student photo.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => update("photoUrl", typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  }

  function registerStudent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const admNo = draft.admNo.trim();
    if (data.students.some((student) => student.admNo.toLowerCase() === admNo.toLowerCase())) {
      setMessage(`ADM/Assessment number ${admNo} is already registered.`);
      return;
    }
    if (!draft.gender) {
      setMessage("Select a gender for this CBE learner.");
      return;
    }
    if (!draft.pathway || !draft.track) {
      setMessage("Select both a pathway and track for this CBE learner.");
      return;
    }
    const saved: Student = {
      ...draft,
      admNo,
      phone: draft.phone ? `${phonePrefix} ${draft.phone}` : "",
      status: "On session",
      id: newRegistrationId(),
    };
    setData((current) => ({ ...current, students: [...current.students, saved] }));
    setMessage(`CBE learner ${admNo} registered.`);

    if (remember) {
      setDraft({
        ...EMPTY_STUDENT,
        streamId: draft.streamId,
        gender: draft.gender,
        boarder: draft.boarder,
        guardianName: draft.guardianName,
        dateAdmitted: draft.dateAdmitted,
        formAdmitted: draft.formAdmitted,
        gradeAdmitted: draft.gradeAdmitted,
        phone: draft.phone,
        otherPhone: draft.otherPhone,
        county: draft.county,
        houseId: draft.houseId,
        familyId: draft.familyId,
        pathway: draft.pathway,
        track: draft.track,
      });
    } else {
      setDraft({ ...EMPTY_STUDENT });
      setPhonePrefix("+254");
    }
    document.getElementById("student-adm-number")?.focus();
  }

  return (
    <div>
      <RegistrationHeading title="Student's Reg. (CBE)" description="Register Grade 10 and Grade 11 learners under the CBE curriculum." />
      <div className="mb-4 rounded-md border border-academic-line bg-academic-surface px-4 py-3 text-sm text-academic-ink-soft">
        Last Entered ADM no. <span className="font-semibold text-academic-ink">~ {lastAdmNo}</span>
        <span className="mx-3 text-academic-line">||</span>
        Highest ADM No. <span className="font-semibold text-academic-ink">~ {highestAdmNo}</span>
      </div>

      <form onSubmit={registerStudent}>
        <RegistrationPanel title="Student information">
          <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
            <FormField label="Assessment no" required><RegInput id="student-adm-number" value={draft.admNo} onChange={(event) => update("admNo", event.target.value)} placeholder="A000…" required /></FormField>
            <FormField label="Name" required><RegInput value={draft.name} onChange={(event) => update("name", event.target.value)} required /></FormField>
            <FormField label="Grade/Stream" required><RegSelect value={draft.streamId} onChange={(event) => update("streamId", event.target.value)} required><option value="">Select stream</option>{streams.map((stream) => <option key={stream.id} value={stream.id}>{stream.grade} {stream.name}</option>)}</RegSelect></FormField>
            <FormField label="Gender" required><RegSelect value={draft.gender} onChange={(event) => update("gender", event.target.value as StudentDraft["gender"])} required><option value="">Select gender</option><option>Female</option><option>Male</option></RegSelect></FormField>
            <FormField label="Boarder"><RegSelect value={draft.boarder ? "yes" : "no"} onChange={(event) => update("boarder", event.target.value === "yes")}><option value="no">No</option><option value="yes">Yes</option></RegSelect></FormField>
            <FormField label="Guardian name"><RegInput value={draft.guardianName} onChange={(event) => update("guardianName", event.target.value)} /></FormField>
            <FormField label="Date Admitted"><RegInput type="date" value={draft.dateAdmitted} onChange={(event) => update("dateAdmitted", event.target.value)} /></FormField>
            <FormField label="Grade Admitted"><RegSelect value={draft.gradeAdmitted} onChange={(event) => update("gradeAdmitted", event.target.value)}><option>Grade 10</option><option>Grade 11</option></RegSelect></FormField>
            <FormField label="Phone No."><div className="flex gap-2"><RegSelect aria-label="Phone country prefix" value={phonePrefix} onChange={(event) => setPhonePrefix(event.target.value)} className="w-28 shrink-0">{PHONE_PREFIXES.map((prefix) => <option key={prefix}>{prefix}</option>)}</RegSelect><RegInput type="tel" inputMode="tel" value={draft.phone} onChange={(event) => update("phone", event.target.value)} placeholder="7xx xxx xxx" /></div></FormField>
            <FormField label="Other phone"><RegInput value={draft.otherPhone} onChange={(event) => update("otherPhone", event.target.value)} placeholder="Comma-separated numbers" /></FormField>
            <FormField label="UPI no"><RegInput value={draft.upiNo} onChange={(event) => update("upiNo", event.target.value)} /></FormField>
            <FormField label="House"><RegSelect value={draft.houseId ?? ""} onChange={(event) => update("houseId", event.target.value || null)}><option value="">No house</option>{availableHouses.map((house) => <option key={house.id} value={house.id}>{house.name}</option>)}</RegSelect></FormField>
            <FormField label="Date of Birth"><RegInput type="date" value={draft.dateOfBirth} onChange={(event) => update("dateOfBirth", event.target.value)} /></FormField>
            <FormField label="Pathway" required><RegSelect value={draft.pathway} onChange={(event) => update("pathway", event.target.value)} required><option value="">Select pathway</option>{CBE_PATHWAYS.map((pathway) => <option key={pathway}>{pathway}</option>)}</RegSelect></FormField>
            <FormField label="Track" required><RegSelect value={draft.track} onChange={(event) => update("track", event.target.value)} required><option value="">Select track</option>{TRACKS.map((track) => <option key={track}>{track}</option>)}</RegSelect></FormField>
            <FormField label="KJSEA Grade"><RegInput value={draft.kjseaGrade} onChange={(event) => update("kjseaGrade", event.target.value)} placeholder="e.g. B+" /></FormField>
            <FormField label="Junior School"><RegInput value={draft.juniorSchool} onChange={(event) => update("juniorSchool", event.target.value)} /></FormField>
            <FormField label="Student photo"><RegInput type="file" accept="image/*" onChange={readPhoto} className="file:mr-2 file:rounded file:border-0 file:bg-academic-accent-soft file:px-2 file:py-1 file:text-xs" /></FormField>
            {draft.photoUrl && <div className="flex items-center gap-3"><Image src={draft.photoUrl} alt="Student photo preview" width={64} height={64} unoptimized className="h-16 w-16 rounded-md border border-academic-line object-cover" /><AcademicButton variant="outline" onClick={() => update("photoUrl", "")}>Remove photo</AcademicButton></div>}
            <FormField label="County"><RegInput value={draft.county} onChange={(event) => update("county", event.target.value)} /></FormField>
          </div>
          <div className="mt-5 flex flex-col gap-4 border-t border-academic-line pt-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex min-h-10 items-center gap-2 text-sm text-academic-ink-soft"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="accent-[var(--academic-accent)]" />Remember last entry</label>
            <div className="flex flex-wrap items-center gap-3"><AcademicButton type="submit"><UserPlus size={15} className="mr-2" /> Register Student</AcademicButton>{message && <span role="status" className={`text-xs ${message.includes("registered") ? "text-academic-accent" : "text-red-700"}`}><Check size={13} className="mr-1 inline" />{message}</span>}</div>
          </div>
        </RegistrationPanel>
      </form>
    </div>
  );
}