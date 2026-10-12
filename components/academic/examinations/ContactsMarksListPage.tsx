"use client";

import { useMemo, useState } from "react";
import { ToolSwitch } from "@/components/academic/examinations/ToolSwitch";
import { useExaminationsData } from "@/components/academic/examinations/ExaminationsProvider";

const SAMPLE_CONTACTS = [
  { id: "contact-1", name: "Aisha Wambua", phone: "+254 712 345 678", className: "Grade 10", subject: "English", status: "Submitted" },
  { id: "contact-2", name: "Brian Omondi", phone: "+254 723 456 789", className: "Grade 11", subject: "Mathematics", status: "Pending" },
  { id: "contact-3", name: "Cynthia Muli", phone: "+254 734 567 890", className: "Grade 10", subject: "Biology", status: "Reviewed" },
  { id: "contact-4", name: "Daniel Kibet", phone: "+254 745 678 901", className: "Grade 11", subject: "Physics", status: "Submitted" },
];

const SAMPLE_MARKS = [
  { id: "mark-1", student: "Aisha Wambua", exam: "OPENER EXAM", subject: "English", marks: 82 },
  { id: "mark-2", student: "Brian Omondi", exam: "CAT 1", subject: "Mathematics", marks: 74 },
  { id: "mark-3", student: "Cynthia Muli", exam: "CBE PREP EXAM", subject: "Biology", marks: 91 },
  { id: "mark-4", student: "Daniel Kibet", exam: "OPENER EXAM", subject: "Physics", marks: 68 },
];

export function ContactsMarksListPage() {
  const { data, setData } = useExaminationsData();
  const [view, setView] = useState<"contacts" | "marks">("contacts");
  const [query, setQuery] = useState("");

  const toolEnabled = data.toolSettings["exams.lists"] ?? true;

  const filteredContacts = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return SAMPLE_CONTACTS;

    return SAMPLE_CONTACTS.filter((contact) =>
      [contact.name, contact.phone, contact.className, contact.subject, contact.status].some((value) =>
        value.toLowerCase().includes(term),
      ),
    );
  }, [query]);

  const filteredMarks = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return SAMPLE_MARKS;

    return SAMPLE_MARKS.filter((item) =>
      [item.student, item.exam, item.subject].some((value) => value.toLowerCase().includes(term)),
    );
  }, [query]);

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-academic-line bg-academic-surface p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-academic-accent">Examinations</p>
            <h1 className="mt-2 font-display text-3xl text-academic-ink">Contacts / Marks List</h1>
          </div>
          <div className="w-full max-w-xs">
            <ToolSwitch
              checked={toolEnabled}
              label="Tool enabled"
              onChange={(checked) =>
                setData((current) => ({
                  ...current,
                  toolSettings: { ...current.toolSettings, "exams.lists": checked },
                }))
              }
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
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="inline-flex rounded-lg border border-academic-line bg-academic-muted p-1">
            {[
              { key: "contacts", label: "Contacts" },
              { key: "marks", label: "Marks" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                disabled={!toolEnabled}
                onClick={() => setView(tab.key as "contacts" | "marks")}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  view === tab.key
                    ? "bg-academic-accent text-white"
                    : "text-academic-ink-soft hover:text-academic-ink"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <input
            type="search"
            value={query}
            disabled={!toolEnabled}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, subject, exam…"
            className="w-full max-w-md rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink"
          />
        </div>

        {view === "contacts" ? (
          <div className="mt-6 overflow-x-auto rounded-xl border border-academic-line bg-white">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-academic-muted text-academic-ink">
                <tr>
                  <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">Name</th>
                  <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">Phone</th>
                  <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">Class</th>
                  <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">Subject</th>
                  <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-sm text-academic-ink-soft">No contacts match your search.</td>
                  </tr>
                ) : (
                  filteredContacts.map((contact) => (
                    <tr key={contact.id} className="border-b border-academic-line last:border-b-0">
                      <td className="px-3 py-2.5 text-academic-ink">{contact.name}</td>
                      <td className="px-3 py-2.5 text-academic-ink">{contact.phone}</td>
                      <td className="px-3 py-2.5 text-academic-ink">{contact.className}</td>
                      <td className="px-3 py-2.5 text-academic-ink">{contact.subject}</td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${
                            contact.status === "Submitted"
                              ? "bg-emerald-100 text-emerald-700"
                              : contact.status === "Reviewed"
                                ? "bg-sky-100 text-sky-700"
                                : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {contact.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-xl border border-academic-line bg-white">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-academic-muted text-academic-ink">
                <tr>
                  <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">Student</th>
                  <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">Exam</th>
                  <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">Subject</th>
                  <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">Marks</th>
                </tr>
              </thead>
              <tbody>
                {filteredMarks.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-sm text-academic-ink-soft">No marks match your search.</td>
                  </tr>
                ) : (
                  filteredMarks.map((mark) => (
                    <tr key={mark.id} className="border-b border-academic-line last:border-b-0">
                      <td className="px-3 py-2.5 text-academic-ink">{mark.student}</td>
                      <td className="px-3 py-2.5 text-academic-ink">{mark.exam}</td>
                      <td className="px-3 py-2.5 text-academic-ink">{mark.subject}</td>
                      <td className="px-3 py-2.5 text-academic-ink font-semibold">{mark.marks}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
