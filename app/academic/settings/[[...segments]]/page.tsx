import { notFound, redirect } from "next/navigation";
import { SettingsPage } from "@/components/academic/settings/SettingsPage";
import { SettingsProvider } from "@/components/academic/settings/SettingsProvider";
import { ExaminationsProvider } from "@/components/academic/examinations/ExaminationsProvider";
import { RegistrationProvider } from "@/components/academic/registration/RegistrationProvider";

const KNOWN_ROUTES = new Set([
  "subject-grading",
  "subjects-ranking",
  "overall-grading",
  "report-form-comments",
  "subjects-comments",
  "fees-arrears",
  "opening-closing-date",
  "pictures-upload",
  "change-password",
  "promotion-demotion",
  "set-term-year",
  "class-teacher-promotion",
  "students-portal",
]);

export default async function AcademicSettingsRoute({
  params,
}: {
  params: Promise<{ segments?: string[] }>;
}) {
  const { segments = [] } = await params;
  const route = segments.join("/");

  if (!route) {
    redirect("/academic/settings/subject-grading");
  }

  if (!KNOWN_ROUTES.has(route)) {
    notFound();
  }

  return (
    <RegistrationProvider>
      <ExaminationsProvider>
        <SettingsProvider>
          <SettingsPage route={route} />
        </SettingsProvider>
      </ExaminationsProvider>
    </RegistrationProvider>
  );
}
