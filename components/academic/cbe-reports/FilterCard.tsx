import type { ReactNode } from "react";
import { ToolSwitch } from "@/components/academic/examinations/ToolSwitch";

type FilterCardProps = {
  title: string;
  enabled: boolean;
  onToggle: (checked: boolean) => void;
  children: ReactNode;
  showHideX?: boolean;
  onHideX?: () => void;
};

export function FilterCard({ title, enabled, onToggle, children, showHideX = false, onHideX }: FilterCardProps) {
  return (
    <aside className="rounded-2xl border border-academic-line bg-[#f1f1f1] p-4 shadow-sm" style={{ minHeight: 200 }}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex-1">
          <h2 className="text-xs font-black uppercase tracking-[0.18em] text-[#5d5d2d] underline decoration-[1.5px] underline-offset-4">{title}</h2>
        </div>
        {showHideX && (
          <button
            type="button"
            onClick={onHideX}
            className="rounded-full bg-[#6d47a8] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white"
          >
            Hide X
          </button>
        )}
      </div>

      <div className="mb-5 flex justify-end">
        <div className="w-28">
          <ToolSwitch checked={enabled} onChange={onToggle} label="ON/OFF" />
        </div>
      </div>

      <div className="space-y-4">{children}</div>
    </aside>
  );
}
