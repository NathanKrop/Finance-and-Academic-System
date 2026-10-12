type ReportPlaceholderProps = {
  text?: string;
};

export function ReportPlaceholder({ text = "select each of the field on the fields provided to generate Report" }: ReportPlaceholderProps) {
  return (
    <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-academic-line bg-academic-paper p-6 text-center text-sm text-academic-ink-soft">
      {text}
    </div>
  );
}
