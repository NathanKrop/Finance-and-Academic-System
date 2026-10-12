"use client";

import { useRegistrationData } from "@/components/academic/registration/RegistrationProvider";
import { HousesFamiliesPage } from "@/components/academic/registration/HousesFamiliesPage";
import { SchoolDetailsPage, StreamsPage } from "@/components/academic/registration/SchoolAndStreams";
import { StudentImportPage } from "@/components/academic/registration/StudentImportPage";
import { BulkStudentEditPage, StudentListPage, StudentPhotosPage, StudentRecordPage } from "@/components/academic/registration/StudentPages";
import { StudentRegistrationPage } from "@/components/academic/registration/StudentForms";
import { SubjectsCbePage } from "@/components/academic/registration/SubjectsPages";
import { TeachersPage } from "@/components/academic/registration/TeachersPage";

export function RegistrationPage({ segments }: { segments: string[] }) {
  const { ready } = useRegistrationData();
  const route = segments.join("/");

  if (!ready) {
    return <div className="rounded-md border border-academic-line bg-academic-surface p-8 text-center text-sm text-academic-ink-soft">Loading registration preview…</div>;
  }

  switch (route) {
    case "students/new-cbe":
      return <StudentRegistrationPage />;
    case "students/upload-cbe":
      return <StudentImportPage />;
    case "students":
      return <StudentListPage />;
    case "student-photos":
      return <StudentPhotosPage />;
    case "bulk-edit":
      return <BulkStudentEditPage />;
    case "students/detail":
      return <StudentListPage />;
    case "teachers":
      return <TeachersPage />;
    case "streams":
      return <StreamsPage />;
    case "subjects-cbe":
      return <SubjectsCbePage />;
    case "houses-families":
      return <HousesFamiliesPage />;
    case "school-details":
      return <SchoolDetailsPage />;
    default:
      if (segments[0] === "students" && segments.length === 2) {
        return <StudentRecordPage adm={segments[1]} />;
      }
      return <div className="rounded-md border border-academic-line bg-academic-surface p-8 text-center text-sm text-academic-ink-soft">Registration page not found.</div>;
  }
}