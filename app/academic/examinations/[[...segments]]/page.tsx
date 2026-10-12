import { notFound, redirect } from "next/navigation";
import { ExaminationsPage } from "@/components/academic/examinations/ExaminationsPage";

const KNOWN_ROUTES = new Set([
  "schedule",
  "students-portal",
  "marks/subject",
  "marks/paper",
  "marks/student",
  "assign/students",
  "assign/using-exam",
  "teachers/per-stream",
  "teachers/per-teacher",
  "contribution",
  "lists",
]);

export default async function ExaminationsRoute({
  params,
}: {
  params: Promise<{ segments?: string[] }>;
}) {
  const { segments = [] } = await params;
  const route = segments.join("/");

  if (!route) {
    redirect("/academic/examinations/schedule");
  }

  if (!KNOWN_ROUTES.has(route)) {
    notFound();
  }

  return <ExaminationsPage route={route} />;
}
