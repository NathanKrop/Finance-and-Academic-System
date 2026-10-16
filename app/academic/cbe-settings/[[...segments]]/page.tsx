import { notFound, redirect } from "next/navigation";
import { CbeSettingsPage } from "@/components/academic/cbe-settings/CbeSettingsPage";
import { ExaminationsProvider } from "@/components/academic/examinations/ExaminationsProvider";
import { RegistrationProvider } from "@/components/academic/registration/RegistrationProvider";
import { CBE_SETTINGS_ROUTES } from "@/lib/academic/cbe-settings";

const KNOWN_ROUTES = new Set(CBE_SETTINGS_ROUTES.map((item) => item.route));

export default async function CbeSettingsRoute({
  params,
}: {
  params: Promise<{ segments?: string[] }>;
}) {
  const { segments = [] } = await params;
  const route = segments.join("/");

  if (!route) {
    redirect("/academic/cbe-settings/marks/subject");
  }

  if (!KNOWN_ROUTES.has(route)) {
    notFound();
  }

  return (
    <RegistrationProvider>
      <ExaminationsProvider>
        <CbeSettingsPage route={route} />
      </ExaminationsProvider>
    </RegistrationProvider>
  );
}
