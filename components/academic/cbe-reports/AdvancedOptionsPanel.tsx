import type { ReactNode } from "react";

type AdvancedOptionsPanelProps = {
  title?: string;
  children: ReactNode;
  collapsed?: boolean;
  onToggle?: () => void;
};

export function AdvancedOptionsPanel({ title = "Advanced Options", children, collapsed = false, onToggle }: AdvancedOptionsPanelProps) {
  return (
    <div className="flex items-stretch rounded-2xl border-[3px] border-[#2c8d8d] bg-[#dfeef0] text-[#1a2d2d] shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="w-10 rounded-l-xl bg-[#2c8d8d] px-1 py-4 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-white writing-mode-vertical"
        aria-label="Toggle advanced options"
      >
        {collapsed ? "Show" : "Hide"}
      </button>
      {!collapsed && (
        <div className="flex-1 p-4 font-mono text-[11px]">
          <h3 className="mb-3 font-bold uppercase tracking-[0.14em]">{title}</h3>
          <div className="space-y-3">{children}</div>
        </div>
      )}
    </div>
  );
}
