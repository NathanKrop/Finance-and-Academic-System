import { notFound, redirect } from "next/navigation";
import { RegistrationPage } from "@/components/academic/registration/RegistrationPage";

const KNOWN_ROUTES = new Set([
  "students/new-cbe",
  "students/upload-cbe",
  "students",
  "student-photos",
  "bulk-edit",
  "teachers",
  "streams",
  "subjects-cbe",
  "houses-families",
  "school-details",
]);

export default async function RegistrationRoute({
  params,
}: {
  params: Promise<{ segments?: string[] }>;
}) {
  const { segments = [] } = await params;
  const route = segments.join("/");

  if (!route) {
    redirect("/academic/registration/students/new-cbe");
  }

  if (route === "students/new") {
    redirect("/academic/registration/students/new-cbe");
  }

  if (route === "students/upload") {
    redirect("/academic/registration/students/upload-cbe");
  }

  if (route === "subjects") {
    redirect("/academic/registration/subjects-cbe");
  }

  const isStudentRecord = segments[0] === "students"
    && segments.length === 2
    && !["new", "new-cbe", "upload", "upload-cbe"].includes(segments[1]);

  if (!KNOWN_ROUTES.has(route) && !isStudentRecord) {
    notFound();
  }

  return <RegistrationPage segments={segments} />;
}