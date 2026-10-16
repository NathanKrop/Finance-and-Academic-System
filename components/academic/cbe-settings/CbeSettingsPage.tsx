"use client";

import { useMemo, useState } from "react";
import { AssignSubjectsToStudentsPage } from "@/components/academic/examinations/AssignSubjectsToStudentsPage";
import { AssignSubjectsToTeachersPerStreamPage } from "@/components/academic/examinations/AssignSubjectsToTeachersPerStreamPage";
import { AssignSubjectsToTeachersPerTeacherPage } from "@/components/academic/examinations/AssignSubjectsToTeachersPerTeacherPage";
import { MarksEntrySubjectPage } from "@/components/academic/examinations/MarksEntrySubjectPage";
import { useRegistrationData } from "@/components/academic/registration/RegistrationProvider";
import { CBE_SETTINGS_ROUTES } from "@/lib/academic/cbe-settings";
import { CBE_PATHWAYS } from "@/lib/academic/registration-data";

type CbeSettingsPageProps = { route: string };

function PathwayStudentListPage() {
  const { data } = useRegistrationData();
  const [grade, setGrade] = useState("Grade 10");
  const [pathway, setPathway] = useState<string>("All");

  const rows = useMemo(() => {
    return [...data.students]
      .filter((student) => student.curriculum === "CBE")
      .filter((student) => {
        const stream = data.streams.find((item) => item.id === student.streamId);
        const matchesGrade = !grade || stream?.grade === grade;
        const matchesPathway = pathway === "All" || student.pathway === pathway || (!student.pathway && pathway === "All");
        return matchesGrade && matchesPathway;
      })
      .sort((first, second) => first.name.localeCompare(second.name));
  }, [data.streams, data.students, grade, pathway]);

  const gradeOptions = Array.from(new Set(data.streams.map((stream) => stream.grade))).sort();

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-academic-line bg-academic-surface p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-academic-accent">CBE Settings</p>
            <h1 className="mt-2 font-display text-3xl text-academic-ink">Pathway Student List</h1>
          </div>
          <div className="rounded-full border border-academic-line bg-white px-3 py-1.5 text-xs font-medium text-academic-ink-soft">
            {rows.length} learners
          </div>
        </div>
      </header>

      <div className="rounded-2xl border border-academic-line bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Grade</span>
            <select
              value={grade}
              onChange={(event) => setGrade(event.target.value)}
              className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink"
            >
              {gradeOptions.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Pathway</span>
            <select
              value={pathway}
              onChange={(event) => setPathway(event.target.value)}
              className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink"
            >
              <option value="All">All pathways</option>
              {CBE_PATHWAYS.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-academic-line bg-white">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-academic-muted text-academic-ink">
              <tr>
                <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">ADM</th>
                <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">Name</th>
                <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">Grade</th>
                <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">Stream</th>
                <th className="border-b border-academic-line px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">Pathway</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-sm text-academic-ink-soft">
                    No learners match the selected filters.
                  </td>
                </tr>
              ) : (
                rows.map((student) => {
                  const stream = data.streams.find((item) => item.id === student.streamId);
                  return (
                    <tr key={student.id} className="border-b border-academic-line last:border-b-0">
                      <td className="px-3 py-2.5 text-academic-ink">{student.admNo}</td>
                      <td className="px-3 py-2.5 text-academic-ink">{student.name}</td>
                      <td className="px-3 py-2.5 text-academic-ink-soft">{stream?.grade ?? (student.gradeAdmitted || "N/A")}</td>
                      <td className="px-3 py-2.5 text-academic-ink-soft">{stream?.name ?? "Unassigned"}</td>
                      <td className="px-3 py-2.5 text-academic-ink">{student.pathway || "Not assigned"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function CbeSettingsPage({ route }: CbeSettingsPageProps) {
  const activeRoute = CBE_SETTINGS_ROUTES.find((item) => item.route === route) ?? CBE_SETTINGS_ROUTES[0];

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-academic-line bg-academic-surface p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-academic-accent">Academic workspace</p>
            <h1 className="mt-2 font-display text-3xl text-academic-ink">CBE Settings</h1>
          </div>
          <div className="rounded-full border border-academic-line bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.08em] text-academic-ink-soft">
            Curriculum: CBE
          </div>
        </div>
      </header>

      <div className="rounded-xl border border-academic-line bg-academic-paper px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-academic-ink-soft">Current view</p>
        <p className="mt-1 text-base font-semibold text-academic-ink">{activeRoute.label}</p>
      </div>

      {route === "marks/subject" ? (
        <MarksEntrySubjectPage />
      ) : route === "assign/students" ? (
        <AssignSubjectsToStudentsPage />
      ) : route === "teachers/per-stream" ? (
        <AssignSubjectsToTeachersPerStreamPage />
      ) : route === "teachers/per-teacher" ? (
        <AssignSubjectsToTeachersPerTeacherPage />
      ) : route === "pathway-students" ? (
        <PathwayStudentListPage />
      ) : (
        <div className="rounded-2xl border border-dashed border-academic-line bg-academic-paper p-6 text-sm text-academic-ink-soft">
          Route not configured: {route}
        </div>
      )}
    </div>
  );
}
