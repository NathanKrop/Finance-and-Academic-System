import { notFound, redirect } from "next/navigation";
import { ExaminationsProvider } from "@/components/academic/examinations/ExaminationsProvider";
import { NotesAssignmentsPage } from "@/components/academic/notes-assignments/NotesAssignmentsPage";
import { NotesAssignmentsProvider } from "@/components/academic/notes-assignments/NotesAssignmentsProvider";
import { RegistrationProvider } from "@/components/academic/registration/RegistrationProvider";
import { SettingsProvider } from "@/components/academic/settings/SettingsProvider";

const KNOWN_ROUTES = new Set([
  "post-assignments",
  "post-study-notes",
  "view-unmarked-assignments",
  "marked-assignments",
  "generate-send-parents-auto-login-link",
]);

export default async function NotesAssignmentsRoute({
  params,
}: {
  params: Promise<{ segments?: string[] }>;
}) {
  const { segments = [] } = await params;
  const route = segments.join("/");

  if (!route) {
    redirect("/academic/notes-assignments/post-assignments");
  }

  if (!KNOWN_ROUTES.has(route)) {
    notFound();
  }

  return (
    <RegistrationProvider>
      <ExaminationsProvider>
        <SettingsProvider>
          <NotesAssignmentsProvider>
            <NotesAssignmentsPage route={route} />
          </NotesAssignmentsProvider>
        </SettingsProvider>
      </ExaminationsProvider>
    </RegistrationProvider>
  );
}
