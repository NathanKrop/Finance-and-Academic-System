type ExaminationsPlaceholderPageProps = {
  title: string;
  description?: string;
};

export function ExaminationsPlaceholderPage({ title, description }: ExaminationsPlaceholderPageProps) {
  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-academic-line bg-academic-surface p-6 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-academic-accent">Examinations workspace</p>
        <h1 className="mt-2 font-display text-3xl text-academic-ink">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm text-academic-ink-soft">
          {description ?? "This page is active and follows the exam workspace pattern. The detailed implementation of this workflow is being built in the next pass."}
        </p>
      </header>

      <div className="rounded-2xl border border-dashed border-academic-line bg-academic-paper p-6 text-sm text-academic-ink-soft">
        The route is live and ready for the next form-specific build step.
      </div>
    </section>
  );
}
