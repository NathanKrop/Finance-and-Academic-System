"use client";

import { useState } from "react";
import { useRegistrationData } from "@/components/academic/registration/RegistrationProvider";
import { useSettingsData } from "@/components/academic/settings/SettingsProvider";
import { type SchoolTerm } from "@/lib/academic/settings-defaults";

function SettingsCard({ title, children, onToggle, enabled = true }: { title: string; children: React.ReactNode; onToggle?: (next: boolean) => void; enabled?: boolean; }) {
  return (
    <div className={`rounded-2xl border border-academic-line bg-[#f6f7f2] p-4 shadow-sm ${enabled ? "opacity-100" : "opacity-60"}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-[11px] font-black uppercase tracking-[0.14em] text-[#5a6f39] underline decoration-2 underline-offset-4">{title}</h2>
        {onToggle && (
          <button type="button" onClick={() => onToggle(!enabled)} className={`relative inline-flex h-6 w-11 items-center rounded-full border transition-colors ${enabled ? "border-[#1f8e6a] bg-[#3e9f7d]" : "border-[#c7c8c2] bg-[#dfe1dc]"}`} aria-label="Toggle settings card">
            <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function InstructionBanner({ text }: { text: string }) {
  return <div className="mb-4 rounded-md border border-[#1f8e6a] bg-[#effaf2] px-3 py-2 text-sm text-[#1a6d4b]">{text}</div>;
}

function SettingsTable({ children }: { children: React.ReactNode }) {
  return <div className="overflow-x-auto rounded-xl border border-[#1d2d2a] bg-white">{children}</div>;
}

function formatDate(date: string) {
  if (!date) return "-";
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return date;
  return `${String(value.getDate()).padStart(2, "0")}-${String(value.getMonth() + 1).padStart(2, "0")}-${value.getFullYear()}`;
}

function SubjectGradingPage() {
  const { state, setState } = useSettingsData();
  const { data: registration } = useRegistrationData();
  const [selectedLevel, setSelectedLevel] = useState("Form 1");
  const [editing, setEditing] = useState(false);

  const levels = ["Form 1", "Form 2", "Form 3", "Form 4"];
  const subjects = registration.subjectsCbe.map((subject) => subject.name);

  const currentGrading = state.subjectGrading[selectedLevel] ?? {};

  return (
    <SettingsCard title="SET SUBJECTS GRADING" enabled>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-academic-ink">Level</label>
          <select value={selectedLevel} onChange={(event) => setSelectedLevel(event.target.value)} className="min-w-40 rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink">
            {levels.map((level) => <option key={level} value={level}>{level}</option>)}
          </select>
          <button type="button" onClick={() => setEditing(true)} className="rounded-md bg-[#3e9f7d] px-4 py-2 text-sm font-semibold text-white">Edit Grading</button>
        </div>

        {!editing ? (
          <div className="flex min-h-[170px] items-center justify-center rounded-xl border border-dashed border-academic-line bg-white text-center text-sm text-academic-ink-soft">Please select Level to start editing subjects grading</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-academic-line bg-white">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-[#dff3ea] text-academic-ink">
                <tr>
                  <th className="border-b border-academic-line px-3 py-2">Subject</th>
                  <th className="border-b border-academic-line px-3 py-2">A (12)</th>
                  <th className="border-b border-academic-line px-3 py-2">A- (11)</th>
                  <th className="border-b border-academic-line px-3 py-2">B+ (10)</th>
                  <th className="border-b border-academic-line px-3 py-2">B (9)</th>
                  <th className="border-b border-academic-line px-3 py-2">B- (8)</th>
                  <th className="border-b border-academic-line px-3 py-2">C+ (7)</th>
                  <th className="border-b border-academic-line px-3 py-2">C (6)</th>
                  <th className="border-b border-academic-line px-3 py-2">C- (5)</th>
                  <th className="border-b border-academic-line px-3 py-2">D+ (4)</th>
                  <th className="border-b border-academic-line px-3 py-2">D (3)</th>
                  <th className="border-b border-academic-line px-3 py-2">D- (2)</th>
                  <th className="border-b border-academic-line px-3 py-2">E (1)</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => (
                  <tr key={subject} className="border-b border-academic-line last:border-b-0">
                    <td className="px-3 py-2 font-medium text-academic-ink">{subject}</td>
                    {Array.from({ length: 12 }, (_, index) => {
                      const value = Number(currentGrading[subject] ?? 0) || index + 1;
                      return (
                        <td key={`${subject}-${index}`} className="px-2 py-2">
                          <input type="number" value={value} onChange={(event) => {
                            const nextValue = Number(event.target.value) || 0;
                            setState((current) => ({
                              ...current,
                              subjectGrading: {
                                ...current.subjectGrading,
                                [selectedLevel]: {
                                  ...(current.subjectGrading[selectedLevel] ?? {}),
                                  [subject]: nextValue,
                                },
                              },
                            }));
                          }} className="w-16 rounded-md border border-academic-line bg-white px-2 py-1 text-center text-sm" />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SettingsCard>
  );
}

function SubjectsRankingPage() {
  const { state, setState } = useSettingsData();
  const groups = ["Group 1", "Group 2", "Group 3", "Any Other Best"] as const;

  return (
    <SettingsCard title="SUBJECTS RANKING PER FORM" enabled>
      <div className="space-y-4">
        <h3 className="text-center text-lg font-bold uppercase tracking-wide text-[#204a3c] underline">Set Subject ranking criteria per form.</h3>
        <SettingsTable>
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-[#dfeee8] text-academic-ink">
              <tr>
                <th className="border-b border-academic-line px-3 py-2">SUBJECT GROUP</th>
                {Array.from({ length: 4 }, (_, index) => <th key={index} className="border-b border-academic-line px-3 py-2">FORM {index + 1}</th>)}
              </tr>
            </thead>
            <tbody>
              {groups.map((group, rowIndex) => (
                <tr key={group} className={rowIndex % 2 === 0 ? "bg-white" : "bg-[#f8f5ee]"}>
                  <td className="border-b border-academic-line px-3 py-3 text-right font-semibold text-[#184634]">{group}:</td>
                  {Array.from({ length: 4 }, (_, index) => {
                    const formKey = `Form ${index + 1}`;
                    const value = state.subjectRanking[group]?.[formKey] ?? 1;
                    return (
                      <td key={`${group}-${formKey}`} className="border-b border-academic-line px-3 py-3 text-center">
                        <input
                          type="number"
                          min={0}
                          max={7}
                          value={value}
                          onChange={(event) => {
                            const next = Number(event.target.value) || 0;
                            setState((current) => ({
                              ...current,
                              subjectRanking: {
                                ...current.subjectRanking,
                                [group]: {
                                  ...(current.subjectRanking[group] ?? {}),
                                  [formKey]: Math.max(0, Math.min(7, next)),
                                },
                              },
                            }));
                          }}
                          className="mx-auto h-9 w-14 rounded-full border border-academic-line bg-white px-2 text-center text-sm"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </SettingsTable>
        <div className="text-xs text-academic-ink-soft">Subjects counted: 7</div>
      </div>
    </SettingsCard>
  );
}

function OverallGradingPage() {
  const { state, setState } = useSettingsData();
  const forms = ["Form 1", "Form 2", "Form 3", "Form 4"];
  const columns = ["A (12)", "A- (11)", "B+ (10)", "B (9)", "B- (8)", "C+ (7)", "C (6)", "C- (5)", "D+ (4)", "D (3)", "D- (2)", "E (1)"];

  return (
    <SettingsCard title="OVERALL MARKS GRADING" enabled>
      <div className="space-y-4">
        <h3 className="text-center text-base font-medium text-academic-ink">Use the fields below to set report form-grading</h3>
        <InstructionBanner text={'Set overall marks grading for by inserting the starting value of each grade (the lowest value of each grade). By default "E" starts from 0.'} />
        <SettingsTable>
          <table className="min-w-full border-collapse text-xs">
            <thead className="bg-[#dff3ea] text-academic-ink">
              <tr>
                <th className="border-b border-academic-line px-2 py-2">FORM</th>
                {columns.map((column) => <th key={column} className="border-b border-academic-line px-2 py-2">{column}</th>)}
              </tr>
            </thead>
            <tbody>
              {forms.map((form, rowIndex) => (
                <tr key={form} className={rowIndex % 2 === 0 ? "bg-white" : "bg-[#f8f5ee]"}>
                  <td className="border-b border-academic-line px-2 py-2 font-medium text-academic-ink">{form}</td>
                  {state.overallMarks[form].map((value, index) => (
                    <td key={`${form}-${index}`} className="border-b border-academic-line px-1 py-2">
                      <input
                        type="number"
                        value={value}
                        onChange={(event) => {
                          const nextValue = Number(event.target.value) || 0;
                          const next = [...state.overallMarks[form]];
                          next[index] = nextValue;
                          setState((current) => ({
                            ...current,
                            overallMarks: { ...current.overallMarks, [form]: next },
                          }));
                        }}
                        className="w-12 rounded-md border border-academic-line bg-white px-1 py-1 text-center"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </SettingsTable>
      </div>
    </SettingsCard>
  );
}

function ReportFormCommentsPage() {
  const { state, setState } = useSettingsData();
  const grades = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "E"] as const;

  return (
    <SettingsCard title="REPORT FORM COMMENTS" enabled>
      <InstructionBanner text="Set grades comments as they should appear in the report form" />
      <SettingsTable>
        <table className="min-w-full border-collapse text-xs">
          <thead className="bg-[#dff3ea] text-academic-ink">
            <tr>
              <th className="border-b border-academic-line px-2 py-2">NO.</th>
              <th className="border-b border-academic-line px-2 py-2">MEAN GRADE</th>
              <th className="border-b border-academic-line px-2 py-2">PRINCIPAL&apos;S COMMENTS</th>
              <th className="border-b border-academic-line px-2 py-2">CLASS TEACHER&apos;S COMMENTS</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((grade, index) => (
              <tr key={grade} className={index % 2 === 0 ? "bg-white" : "bg-[#f8f5ee]"}>
                <td className="border-b border-academic-line px-2 py-2 text-center">{index + 1}</td>
                <td className="border-b border-academic-line px-2 py-2 text-center font-bold text-[#214337]">{grade}:</td>
                <td className="border-b border-academic-line px-2 py-2">
                  <input value={state.reportComments[grade].principal} onChange={(event) => { const next = { ...state.reportComments[grade], principal: event.target.value }; setState((current) => ({ ...current, reportComments: { ...current.reportComments, [grade]: next } })); }} className="w-full rounded-md border border-academic-line bg-white px-2 py-1 text-xs" />
                </td>
                <td className="border-b border-academic-line px-2 py-2">
                  <input value={state.reportComments[grade].teacher} onChange={(event) => { const next = { ...state.reportComments[grade], teacher: event.target.value }; setState((current) => ({ ...current, reportComments: { ...current.reportComments, [grade]: next } })); }} className="w-full rounded-md border border-academic-line bg-white px-2 py-1 text-xs" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SettingsTable>
    </SettingsCard>
  );
}

function SubjectsCommentsPage() {
  const { state, setState } = useSettingsData();
  const { data: registration } = useRegistrationData();
  const grades = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "E"] as const;
  const subjects = registration.subjectsCbe.map((subject) => subject.name);

  return (
    <SettingsCard title="SUBJECTS COMMENTS" enabled>
      <InstructionBanner text="Set subject comments as they should appear in the report form" />
      <SettingsTable>
        <table className="min-w-full border-collapse text-xs">
          <thead className="bg-[#dff3ea] text-academic-ink">
            <tr>
              <th className="border-b border-academic-line px-2 py-2">#</th>
              <th className="border-b border-academic-line px-2 py-2">SUBJECT</th>
              {grades.map((grade) => <th key={grade} className="border-b border-academic-line px-2 py-2">{grade} ({grade === "A" ? "12" : grade === "A-" ? "11" : grade === "B+" ? "10" : grade === "B" ? "9" : grade === "B-" ? "8" : grade === "C+" ? "7" : grade === "C" ? "6" : grade === "C-" ? "5" : grade === "D+" ? "4" : grade === "D" ? "3" : grade === "D-" ? "2" : "1"})</th>)}
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject, index) => (
              <tr key={subject} className={index % 2 === 0 ? "bg-white" : "bg-[#f8f5ee]"}>
                <td className="border-b border-academic-line px-2 py-2 text-center">{index + 1}</td>
                <td className="border-b border-academic-line px-2 py-2 text-right font-semibold text-[#204a3c]">{subject}</td>
                {grades.map((grade) => {
                  const value = state.subjectComments[subject]?.[grade] ?? "";
                  return (
                    <td key={`${subject}-${grade}`} className="border-b border-academic-line px-1 py-2">
                      <input value={value || ""} onChange={(event) => {
                        const next = event.target.value;
                        setState((current) => ({
                          ...current,
                          subjectComments: {
                            ...current.subjectComments,
                            [subject]: { ...current.subjectComments[subject], [grade]: next },
                          },
                        }));
                      }} className="w-20 rounded-md border border-academic-line bg-white px-2 py-1 text-center text-[11px] focus:border-[#3e9f7d] focus:bg-[#edf9f1]" placeholder="-" />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </SettingsTable>
    </SettingsCard>
  );
}

function FeesArrearsPage() {
  const { data: registration } = useRegistrationData();
  const [selectedStream, setSelectedStream] = useState(registration.streams[0]?.id ?? "");
  const stream = registration.streams.find((item) => item.id === selectedStream);
  const students = registration.students.filter((student) => student.streamId === selectedStream);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-academic-ink">Form/Stream :</label>
        <select value={selectedStream} onChange={(event) => setSelectedStream(event.target.value)} className="w-[255px] rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink">
          <option value="">Select stream</option>
          {registration.streams.map((item) => (
            <option key={item.id} value={item.id}>{item.grade} {item.name}</option>
          ))}
        </select>
      </div>
      <div className="rounded-xl border border-academic-line bg-white p-3">
        <p className="border-l-4 border-[#1f8e6a] pl-3 text-sm font-medium text-[#1d5a3d]">Select a class from the dropdown to start editing Arrears to students</p>
        <p className="mt-2 italic text-[#c34040]">*NOTE: This will not affect fees arrears in the Finance module *</p>
      </div>
      {stream && (
        <div className="overflow-x-auto rounded-xl border border-academic-line bg-white">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-[#dff3ea] text-academic-ink">
              <tr>
                <th className="border-b border-academic-line px-3 py-2">ADM NO.</th>
                <th className="border-b border-academic-line px-3 py-2">NAME</th>
                <th className="border-b border-academic-line px-3 py-2">ARREARS AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? <tr><td colSpan={3} className="px-3 py-8 text-center text-academic-ink-soft">No students in this stream.</td></tr> : students.map((student) => (
                <tr key={student.id} className="border-b border-academic-line">
                  <td className="px-3 py-2">{student.admNo}</td>
                  <td className="px-3 py-2">{student.name}</td>
                  <td className="px-3 py-2"><input type="number" className="w-28 rounded-md border border-academic-line bg-white px-2 py-1.5" defaultValue={0} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function OpeningClosingDatesPage() {
  const { state, setState } = useSettingsData();
  const [term, setTerm] = useState<SchoolTerm>("Term 1");
  const [year, setYear] = useState<number>(2026);
  const [closingDate, setClosingDate] = useState("01-04-2026");
  const [nextOpening, setNextOpening] = useState("28-04-2026");

  const saveDates = () => {
    if (!term || !year || !closingDate || !nextOpening) return;
    setState((current) => ({
      ...current,
      openingClosingDates: [...current.openingClosingDates.filter((entry) => !(entry.term === term && entry.year === year)), { term, year, closingDate: formatDate(closingDate), nextOpening: formatDate(nextOpening) }].sort((first, second) => first.year - second.year || ["Term 1", "Term 2", "Term 3"].indexOf(first.term) - ["Term 1", "Term 2", "Term 3"].indexOf(second.term)),
    }));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <SettingsCard title="SET OPENING AND CLOSING DATES" enabled>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <label className="font-medium text-academic-ink">Term</label>
            <select value={term} onChange={(event) => setTerm(event.target.value as SchoolTerm)} className="min-w-36 rounded-md border border-academic-line bg-white px-3 py-2 text-sm">
              {(["Term 1", "Term 2", "Term 3"] as const).map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-between gap-3">
            <label className="font-medium text-academic-ink">Year</label>
            <select value={year} onChange={(event) => setYear(Number(event.target.value))} className="min-w-32 rounded-md border border-academic-line bg-white px-3 py-2 text-sm">
              {Array.from({ length: 16 }, (_, index) => 2019 + index).map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-between gap-3">
            <label className="font-medium text-academic-ink">Term Closing date</label>
            <input value={closingDate} placeholder="dd-mm-yyyy" onChange={(event) => setClosingDate(event.target.value)} className="w-36 rounded-md border border-academic-line bg-white px-3 py-2 text-sm italic text-academic-ink-soft" />
          </div>
          <div className="flex items-center justify-between gap-3">
            <label className="font-medium text-academic-ink">Next Term Opening</label>
            <input value={nextOpening} placeholder="dd-mm-yyyy" onChange={(event) => setNextOpening(event.target.value)} className="w-36 rounded-md border border-academic-line bg-white px-3 py-2 text-sm italic text-academic-ink-soft" />
          </div>
          <div className="flex justify-center">
            <button type="button" onClick={saveDates} className="rounded-md bg-[#3e9f7d] px-6 py-2 text-sm font-semibold text-white">Save Dates</button>
          </div>
        </div>
      </SettingsCard>

      <div className="space-y-3">
        <h3 className="text-center text-xl font-semibold text-academic-ink">Opening and Closing Dates</h3>
        <SettingsTable>
          <table className="min-w-full border-collapse text-xs">
            <thead className="bg-[#dff3ea] text-academic-ink">
              <tr>
                <th className="border-b border-academic-line px-2 py-2">TERM</th>
                <th className="border-b border-academic-line px-2 py-2">YEAR.</th>
                <th className="border-b border-academic-line px-2 py-2">CLOSING DATE</th>
                <th className="border-b border-academic-line px-2 py-2">NEXT TERM OPENING</th>
                <th className="border-b border-academic-line px-2 py-2">DELETE</th>
              </tr>
            </thead>
            <tbody>
              {state.openingClosingDates.map((entry, index) => (
                <tr key={`${entry.term}-${entry.year}`} className={index % 2 === 0 ? "bg-white" : "bg-[#f8f5ee]"}>
                  <td className="border-b border-academic-line px-2 py-2">{entry.term}</td>
                  <td className="border-b border-academic-line px-2 py-2">{entry.year}</td>
                  <td className="border-b border-academic-line px-2 py-2">{formatDate(entry.closingDate)}</td>
                  <td className="border-b border-academic-line px-2 py-2">{formatDate(entry.nextOpening)}</td>
                  <td className="border-b border-academic-line px-2 py-2"><button type="button" onClick={() => setState((current) => ({ ...current, openingClosingDates: current.openingClosingDates.filter((row) => !(row.term === entry.term && row.year === entry.year)) }))} className="rounded-md border border-red-300 bg-red-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-red-600">Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </SettingsTable>
      </div>
    </div>
  );
}

function PicturesUploadPage() {
  const [uploadStatus, setUploadStatus] = useState<string[]>(["Select pictures you wish to upload and then click upload pictures to start uploading"]);
  const [enabled, setEnabled] = useState(true);

  return (
    <SettingsCard title="UPLOAD PICTURES" enabled={enabled} onToggle={setEnabled}>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <label className="text-sm font-medium text-academic-ink">Select photos :</label>
          <input type="file" multiple accept="image/*" className="w-full rounded-md border border-academic-line bg-white p-2" />
          <div className="border-t border-academic-line pt-3">
            <button type="button" onClick={() => setUploadStatus(["Select pictures you wish to upload and then click upload pictures to start uploading", "*NB: ensure that each picture has students ADM number as its name*", "*NB: ensure that a single picture does not exceed 500kb*"])} className="rounded-md bg-[#3e9f7d] px-4 py-2 text-sm font-semibold text-white">Upload</button>
          </div>
        </div>
        <div>
          <h3 className="text-center text-lg font-semibold text-academic-ink">File Upload Status</h3>
          <div className="mt-3 rounded-xl border border-academic-line bg-[#f6f9f8] p-4 font-mono text-xs text-academic-ink">
            {uploadStatus.map((line) => <p key={line} className="mb-2">{line}</p>)}
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}

function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const save = () => {
    if (newPassword.length < 8) return setMessage("New password must be at least 8 characters.");
    if (newPassword !== confirmPassword) return setMessage("Passwords do not match.");
    if (newPassword === currentPassword) return setMessage("New password must differ from current password.");
    setMessage("Password changed successfully.");
  };

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-[#d2cab8] bg-[#f5f1ea] p-6 shadow-sm">
      <h3 className="text-center text-xl font-bold text-[#214337]">Fill the fields provided to change your account details</h3>
      <div className="mt-3 border-t border-[#2f7f5f]" />
      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-academic-ink">Username</span>
          <input defaultValue="mike" className="w-full rounded-md border border-academic-line bg-white px-3 py-2" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-academic-ink">Current Password</span>
          <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="w-full rounded-md border border-academic-line bg-white px-3 py-2" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-academic-ink">New Password</span>
          <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="w-full rounded-md border border-academic-line bg-white px-3 py-2" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-academic-ink">Re- Enter new Password</span>
          <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-md border border-academic-line bg-white px-3 py-2" />
        </label>
        <button type="button" onClick={save} className="w-full rounded-md bg-[#3e9f7d] px-4 py-3 text-sm font-semibold text-white leading-tight">Change Password</button>
        {message && <p className="text-sm text-[#2a5d43]">{message}</p>}
      </div>
    </div>
  );
}

function PromotionDemotionPage() {
  const { data: registration } = useRegistrationData();
  const [grade, setGrade] = useState("Grade 10");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetStream, setTargetStream] = useState("");
  const [allSelected, setAllSelected] = useState(false);

  const students = registration.students.filter((student) => student.gradeAdmitted === grade || (grade === "Grade 10" && student.gradeAdmitted === "Grade 10"));

  const toggleAll = () => {
    setAllSelected((state) => !state);
    setSelectedIds((state) => (state.length === students.length ? [] : students.map((student) => student.id)));
  };

  return (
    <SettingsCard title="PROMOTE/DEMOTE STUDENTS" enabled>
      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="space-y-3">
          <p className="text-center text-xs font-medium uppercase tracking-[0.12em] text-academic-ink-soft">Select Form/Grade to start Promotion/Demotion</p>
          <div className="grid grid-cols-2 gap-2">
            {(["Grade 10", "Form 2", "Form 3", "Form 4"] as const).map((item) => (
              <button key={item} type="button" onClick={() => setGrade(item)} className={`rounded-md border px-3 py-2 text-sm font-semibold ${grade === item ? "border-[#1f8e6a] bg-[#e8f8ef] text-[#1c5d43]" : "border-academic-line bg-white text-academic-ink"}`}>{item}</button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div className="border border-academic-line bg-white px-3 py-3 text-center text-sm text-[#1d5a3d]">* Select Form from the buttons on the left to start Promoting/Demoting Students *</div>
          {students.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm font-medium text-academic-ink"><input type="checkbox" checked={allSelected} onChange={toggleAll} /> Select all</label>
                <select value={targetStream} onChange={(event) => setTargetStream(event.target.value)} className="w-48 rounded-md border border-academic-line bg-white px-3 py-2 text-sm">
                  <option value="">Target stream</option>
                  {registration.streams.map((stream) => <option key={stream.id} value={stream.id}>{stream.grade} {stream.name}</option>)}
                </select>
              </div>
              <div className="overflow-x-auto rounded-xl border border-academic-line bg-white">
                <table className="min-w-full border-collapse text-sm">
                  <thead className="bg-[#dff3ea] text-academic-ink">
                    <tr>
                      <th className="border-b border-academic-line px-2 py-2">Select</th>
                      <th className="border-b border-academic-line px-2 py-2">Adm No</th>
                      <th className="border-b border-academic-line px-2 py-2">Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} className="border-b border-academic-line">
                        <td className="px-2 py-2"><input type="checkbox" checked={selectedIds.includes(student.id)} onChange={() => setSelectedIds((current) => current.includes(student.id) ? current.filter((item) => item !== student.id) : [...current, student.id])} /></td>
                        <td className="px-2 py-2">{student.admNo}</td>
                        <td className="px-2 py-2">{student.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-3">
                <button type="button" className="rounded-md bg-[#3e9f7d] px-4 py-2 text-sm font-semibold text-white">Promote</button>
                <button type="button" className="rounded-md border border-[#c35454] bg-[#fff4f4] px-4 py-2 text-sm font-semibold text-[#b84d4d]">Demote</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SettingsCard>
  );
}

function ClassTeacherPromotionPage() {
  const { data: registration } = useRegistrationData();
  const [form, setForm] = useState("Form 1");
  const year = new Date().getFullYear();

  return (
    <SettingsCard title="PROMOTE CLASSTEACHERS" enabled>
      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="space-y-3">
          <p className="text-center text-xs font-medium uppercase tracking-[0.12em] text-academic-ink-soft">Select Form to start Promotion/Demotion</p>
          <div className="grid grid-cols-2 gap-2">
            {(["Form 1", "Form 2", "Form 3", "Form 4"] as const).map((item) => (
              <button key={item} type="button" onClick={() => setForm(item)} className={`rounded-md border px-3 py-2 text-sm font-semibold ${form === item ? "border-[#f7d266] bg-[#fff7d6] text-[#59460d]" : "border-academic-line bg-white text-academic-ink"}`}>{item}</button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div className="border border-academic-line bg-white px-3 py-3 text-center text-sm text-[#1d5a3d]">* Select Form from the buttons on the left to start Promoting ClassTeachers*</div>
          <p className="text-sm font-semibold text-[#a23b3b]">NB/: Incase you promoted the students from {year - 1} to {year} but their CLASSTEACHERS did NOT promote. Then use this option to promote classteachers</p>
          <div className="overflow-x-auto rounded-xl border border-academic-line bg-white">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-[#dff3ea] text-academic-ink">
                <tr>
                  <th className="border-b border-academic-line px-2 py-2">STREAM</th>
                  <th className="border-b border-academic-line px-2 py-2">CURRENT CLASSTEACHER</th>
                  <th className="border-b border-academic-line px-2 py-2">PROMOTE TO</th>
                </tr>
              </thead>
              <tbody>
                {registration.streams.filter((stream) => stream.grade === form).map((stream) => (
                  <tr key={stream.id} className="border-b border-academic-line">
                    <td className="px-2 py-2">{stream.name}</td>
                    <td className="px-2 py-2">{registration.teachers.find((teacher) => teacher.id === stream.teacherId)?.name ?? "Unassigned"}</td>
                    <td className="px-2 py-2"><select className="w-full rounded-md border border-academic-line bg-white px-2 py-1.5"><option value="">Select</option>{registration.teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}</select></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}

function StudentsPortalSettingsPage() {
  const { state } = useSettingsData();
  const rows = ["Form 1", "Form 2", "Form 3", "Form 4", "Grade 10"];

  return (
    <SettingsCard title="STUDENTS PORTAL" enabled>
      <InstructionBanner text="Set the results to be seen on the students portal for each form" />
      <SettingsTable>
        <table className="min-w-full border-collapse text-xs">
          <thead className="bg-[#dff3ea] text-academic-ink">
            <tr>
              <th className="border-b border-academic-line px-2 py-2">FORM</th>
              <th className="border-b border-academic-line px-2 py-2">YEAR</th>
              <th className="border-b border-academic-line px-2 py-2">TERM</th>
              <th className="border-b border-academic-line px-2 py-2">EXAM</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row} className={index % 2 === 0 ? "bg-white" : "bg-[#f8f5ee]"}>
                <td className="border-b border-academic-line px-2 py-2 text-center">{row}</td>
                <td className="border-b border-academic-line px-2 py-2 text-center">{state.studentsPortal[row]?.year ?? 2022}</td>
                <td className="border-b border-academic-line px-2 py-2 text-center">{state.studentsPortal[row]?.term ?? "Term 3"}</td>
                <td className="border-b border-academic-line px-2 py-2 text-center">{state.studentsPortal[row]?.exam ?? "END YEAR EXAM"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SettingsTable>
      <div className="mt-4 flex justify-center">
        <button type="button" className="rounded-md bg-[#3e9f7d] px-5 py-2 text-sm font-semibold text-white">Change this Settings</button>
      </div>
    </SettingsCard>
  );
}

function CalendarModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, setState } = useSettingsData();
  const [editing, setEditing] = useState(false);
  const [term, setTerm] = useState<SchoolTerm>(state.currentTerm);
  const [year, setYear] = useState<number>(state.currentYear);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="calendar-modal-title" className="w-full max-w-[420px] overflow-hidden rounded-xl border border-academic-line bg-[#f5f4f0] shadow-xl" onClick={(event) => event.stopPropagation()}>
        <div className="bg-[#1f4e46] px-5 py-3 text-center text-base font-semibold text-white" id="calendar-modal-title">CURRENT SCHOOL CALENDER</div>
        <div className="p-5">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border border-[#1d4d46] bg-[#1f4e46] px-3 py-2 font-semibold text-white">Term</th>
                <th className="border border-[#1d4d46] bg-[#1f4e46] px-3 py-2 font-semibold text-white">Year</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-academic-line bg-[#eceae1] px-3 py-3 text-center">{editing ? <select value={term} onChange={(event) => setTerm(event.target.value as SchoolTerm)} className="rounded-full border border-academic-line bg-white px-2 py-1 text-sm"><option value="Term 1">Term 1</option><option value="Term 2">Term 2</option><option value="Term 3">Term 3</option></select> : <span className="inline-flex rounded-full bg-white px-3 py-1.5 font-medium">{state.currentTerm}</span>}</td>
                <td className="border border-academic-line bg-[#eceae1] px-3 py-3 text-center">{editing ? <select value={year} onChange={(event) => setYear(Number(event.target.value))} className="rounded-full border border-academic-line bg-white px-2 py-1 text-sm">{Array.from({ length: 16 }, (_, index) => 2019 + index).map((item) => <option key={item} value={item}>{item}</option>)}</select> : <span className="inline-flex rounded-full bg-white px-3 py-1.5 font-medium">{state.currentYear}</span>}</td>
              </tr>
            </tbody>
          </table>
          <div className="my-4 border-t border-[#1f8e6a]" />
          <div className="flex justify-center gap-3">
            {editing ? (
              <>
                <button type="button" onClick={() => { setState((current) => ({ ...current, currentTerm: term, currentYear: year })); setEditing(false); onClose(); }} className="rounded-full bg-[#2b5a7d] px-5 py-2 text-sm font-semibold text-white">Save</button>
                <button type="button" onClick={() => setEditing(false)} className="rounded-full border border-academic-line bg-white px-5 py-2 text-sm font-semibold text-academic-ink">Cancel</button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => setEditing(true)} className="rounded-full border border-[#b65050] bg-[#f7d4d4] px-5 py-2 text-sm font-semibold text-[#883a3a]">Change</button>
                <button type="button" onClick={onClose} className="rounded-full bg-[#1d4d46] px-5 py-2 text-sm font-semibold text-white">OK</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SetTermYearPage() {
  const { state, setState } = useSettingsData();
  const [term, setTerm] = useState<SchoolTerm>(state.currentTerm);
  const [year, setYear] = useState<number>(state.currentYear);

  return (
    <SettingsCard title="SET TERM/YEAR" enabled>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-academic-ink">
          <span className="mb-2 block font-medium">Current term</span>
          <select value={term} onChange={(event) => setTerm(event.target.value as SchoolTerm)} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm">
            {(["Term 1", "Term 2", "Term 3"] as const).map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="block text-sm text-academic-ink">
          <span className="mb-2 block font-medium">Current year</span>
          <select value={year} onChange={(event) => setYear(Number(event.target.value))} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm">
            {Array.from({ length: 16 }, (_, index) => 2019 + index).map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-4 flex justify-center">
        <button type="button" onClick={() => setState((current) => ({ ...current, currentTerm: term, currentYear: year }))} className="rounded-md bg-[#3e9f7d] px-5 py-2 text-sm font-semibold text-white">Update calendar</button>
      </div>
    </SettingsCard>
  );
}

function SettingsCalendarControl({ route }: { route: string }) {
  const [calendarOpen, setCalendarOpen] = useState(route === "set-term-year");

  return (
    <>
      <button type="button" onClick={() => setCalendarOpen(true)} className="rounded-md bg-[#dff3ea] px-4 py-2 text-sm font-semibold text-[#1d5a3d]">Set Term/Year</button>
      <CalendarModal open={calendarOpen} onClose={() => setCalendarOpen(false)} />
    </>
  );
}

export function SettingsPage({ route }: { route: string }) {

  const page = route === "subject-grading" ? <SubjectGradingPage /> : route === "subjects-ranking" ? <SubjectsRankingPage /> : route === "overall-grading" ? <OverallGradingPage /> : route === "report-form-comments" ? <ReportFormCommentsPage /> : route === "subjects-comments" ? <SubjectsCommentsPage /> : route === "fees-arrears" ? <FeesArrearsPage /> : route === "opening-closing-date" ? <OpeningClosingDatesPage /> : route === "pictures-upload" ? <PicturesUploadPage /> : route === "change-password" ? <ChangePasswordPage /> : route === "promotion-demotion" ? <PromotionDemotionPage /> : route === "set-term-year" ? <SetTermYearPage /> : route === "class-teacher-promotion" ? <ClassTeacherPromotionPage /> : route === "students-portal" ? <StudentsPortalSettingsPage /> : <SubjectGradingPage />;

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-academic-line bg-academic-surface p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-academic-accent">Academic workspace</p>
            <h1 className="mt-2 font-display text-3xl text-academic-ink">Settings</h1>
          </div>
          <SettingsCalendarControl key={route} route={route} />
        </div>
      </header>
      {page}
    </div>
  );
}
