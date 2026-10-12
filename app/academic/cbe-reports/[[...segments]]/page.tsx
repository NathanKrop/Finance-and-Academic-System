import { notFound, redirect } from "next/navigation";
import { CbeReportsPage } from "@/components/academic/cbe-reports/CbeReportsPage";
import { CbeReportsProvider } from "@/components/academic/cbe-reports/CbeReportsProvider";
import { ExaminationsProvider } from "@/components/academic/examinations/ExaminationsProvider";

const KNOWN_ROUTES = new Set([
  "end-term-reports",
  "subject-analysis-marks",
  "marks-correction-sheet",
  "subject-champions",
  "rank-students-by-subject",
  "subjects-grade-count",
]);

export default async function CbeReportsRoute({
  params,
}: {
  params: Promise<{ segments?: string[] }>;
}) {
  const { segments = [] } = await params;
  const route = segments.join("/");

  if (!route) {
    redirect("/academic/cbe-reports/end-term-reports");
  }

  if (!KNOWN_ROUTES.has(route)) {
    notFound();
  }

  return (
    <ExaminationsProvider>
      <CbeReportsProvider>
        <CbeReportsPage route={route} />
      </CbeReportsProvider>
    </ExaminationsProvider>
  );
}
