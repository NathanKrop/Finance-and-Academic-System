import type { ReactNode } from "react";
import { useCbeReports } from "@/components/academic/cbe-reports/CbeReportsProvider";
import { Printer } from "lucide-react";

type PrintableReportProps = {
  title: string;
  children: ReactNode;
  orientation?: "portrait" | "landscape";
};

export function PrintableReport({ title, children, orientation = "portrait" }: PrintableReportProps) {
  const { isPreviewData } = useCbeReports();

  return (
    <div className="academic-print-document w-full min-w-0 rounded-xl border border-academic-line bg-white p-4 shadow-sm" data-orientation={orientation}>
      <div className="mb-4 flex items-center justify-between gap-4 border-b border-academic-line pb-3">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-display text-2xl text-academic-ink">{title}</h3>
          {isPreviewData && <span className="rounded border border-amber-700 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-800">Preview data</span>}
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="no-print inline-flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-md bg-academic-accent px-3 py-2 text-sm font-semibold text-white transition hover:bg-academic-accent/90"
        >
          <Printer aria-hidden="true" size={16} />
          Print report
        </button>
      </div>
      {children}
    </div>
  );
}
