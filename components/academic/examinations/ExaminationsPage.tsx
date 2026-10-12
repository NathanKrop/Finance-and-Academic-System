import { ScheduleExamsPage } from "@/components/academic/examinations/ScheduleExamsPage";
import { StudentsPortalPage } from "@/components/academic/examinations/StudentsPortalPage";
import { MarksEntrySubjectPage } from "@/components/academic/examinations/MarksEntrySubjectPage";
import { MarksEntryPaperPage } from "@/components/academic/examinations/MarksEntryPaperPage";
import { MarksEntryStudentPage } from "@/components/academic/examinations/MarksEntryStudentPage";
import { AssignSubjectsToStudentsPage } from "@/components/academic/examinations/AssignSubjectsToStudentsPage";
import { AssignSubjectsUsingExamPage } from "@/components/academic/examinations/AssignSubjectsUsingExamPage";
import { AssignSubjectsToTeachersPerStreamPage } from "@/components/academic/examinations/AssignSubjectsToTeachersPerStreamPage";
import { AssignSubjectsToTeachersPerTeacherPage } from "@/components/academic/examinations/AssignSubjectsToTeachersPerTeacherPage";
import { SetExamContributionPage } from "@/components/academic/examinations/SetExamContributionPage";
import { ContactsMarksListPage } from "@/components/academic/examinations/ContactsMarksListPage";
import { ExaminationsProvider } from "@/components/academic/examinations/ExaminationsProvider";

type ExaminationsPageProps = {
  route: string;
};

const PAGE_TITLES: Record<string, string> = {
  schedule: "Schedule Exams",
  "students-portal": "Students Portal",
  "marks/subject": "Marks Entry (Subject)",
  "marks/paper": "Marks Entry (Paper)",
  "marks/student": "Marks Entry (Student)",
  "assign/students": "Assign Subjs to Students",
  "assign/using-exam": "Assign Subjs using Exam",
  "teachers/per-stream": "Assign Subjects to Teachers per Stream",
  "teachers/per-teacher": "Assign Subjects to Teachers per Teacher",
  contribution: "Set Exam Contribution",
  lists: "Contacts/Marks List",
};

export function ExaminationsPage({ route }: ExaminationsPageProps) {
  return (
    <ExaminationsProvider>
      {route === "schedule" ? (
        <ScheduleExamsPage />
      ) : route === "students-portal" ? (
        <StudentsPortalPage />
      ) : route === "marks/subject" ? (
        <MarksEntrySubjectPage />
      ) : route === "marks/paper" ? (
        <MarksEntryPaperPage />
      ) : route === "marks/student" ? (
        <MarksEntryStudentPage />
      ) : route === "assign/students" ? (
        <AssignSubjectsToStudentsPage />
      ) : route === "assign/using-exam" ? (
        <AssignSubjectsUsingExamPage />
      ) : route === "teachers/per-stream" ? (
        <AssignSubjectsToTeachersPerStreamPage />
      ) : route === "teachers/per-teacher" ? (
        <AssignSubjectsToTeachersPerTeacherPage />
      ) : route === "contribution" ? (
        <SetExamContributionPage />
      ) : route === "lists" ? (
        <ContactsMarksListPage />
      ) : (
        <section className="space-y-6">
          <header className="rounded-2xl border border-academic-line bg-academic-surface p-6 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-academic-accent">
              Examinations workspace
            </p>
            <h1 className="mt-2 font-display text-3xl text-academic-ink">
              {PAGE_TITLES[route] ?? "Examinations"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-academic-ink-soft">
              This portal is active and the remaining exam pages are being built in the same pattern as the schedule flow.
            </p>
          </header>

          <div className="rounded-2xl border border-dashed border-academic-line bg-academic-paper p-6">
            <p className="text-sm text-academic-ink-soft">
              Route loaded: <span className="font-semibold text-academic-ink">/{route}</span>
            </p>
          </div>
        </section>
      )}
    </ExaminationsProvider>
  );
}
