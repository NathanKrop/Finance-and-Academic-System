import { notFound, redirect } from "next/navigation";
import { BookOpenCheck } from "lucide-react";
import { ACADEMIC_PORTALS } from "@/lib/academic/portals";

export default async function AcademicPortalPage({
  params,
}: {
  params: Promise<{ portal: string }>;
}) {
  const { portal: portalKey } = await params;
  const portal = ACADEMIC_PORTALS.find((item) => item.key === portalKey);

  if (!portal) {
    notFound();
  }

  if (portal.status === "built") {
    redirect(portal.sidebar[0]?.href ?? portal.basePath);
  }

  return (
    <section className="mx-auto flex min-h-[60dvh] max-w-xl flex-col items-center justify-center text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-academic-accent-soft text-academic-accent">
        <BookOpenCheck size={26} />
      </div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-academic-accent">
        Academic workspace
      </p>
      <h1 className="font-display text-3xl text-academic-ink">{portal.label} is coming soon</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-academic-ink-soft">
        This portal is not available yet. Choose another portal from the top bar.
      </p>
    </section>
  );
}