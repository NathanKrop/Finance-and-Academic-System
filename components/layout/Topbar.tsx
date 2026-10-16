"use client";

import { Menu, ChevronDown, Bell, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ROLES } from "@/lib/nav-config";
import { useRole } from "./RoleContext";
import { SCHOOL } from "@/lib/mock-data";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { role, setRole } = useRole();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const current = ROLES.find((r) => r.id === role)!;

  async function handleSignOut() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-paper/90 backdrop-blur px-4 sm:px-6 h-16 no-print">
      <button onClick={onMenuClick} className="lg:hidden text-ink-soft hover:text-ink">
        <Menu size={20} />
      </button>

      <div className="hidden sm:block">
        <p className="text-sm font-medium text-ink">{SCHOOL.name}</p>
        <p className="text-[11px] text-ink-soft">
          {SCHOOL.term}, {SCHOOL.year} · {SCHOOL.county}
        </p>
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        <span className="hidden md:inline-flex stamp stamp-brass">Demo Preview</span>

        <button className="relative h-9 w-9 rounded-md border border-line flex items-center justify-center text-ink-soft hover:text-ink hover:border-line-strong">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-stamp-rust" />
        </button>

        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 h-9 pl-2.5 pr-2 rounded-md border border-line hover:border-line-strong bg-surface"
          >
            <div className="h-6 w-6 rounded-full bg-spine text-paper text-[11px] flex items-center justify-center font-medium">
              {current.label.slice(0, 1)}
            </div>
            <span className="hidden sm:block text-xs text-ink font-medium">{current.label}</span>
            <ChevronDown size={14} className="text-ink-soft" />
          </button>
          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute right-0 mt-2 w-72 bg-surface border border-line rounded-lg shadow-lg z-20 p-1.5">
                <p className="px-2.5 py-1.5 text-[10.5px] uppercase tracking-[0.14em] text-ink-soft">
                  Preview as role
                </p>
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setRole(r.id);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-md text-sm flex flex-col ${
                      r.id === role ? "bg-brass-dim text-ink" : "hover:bg-paper-dim text-ink"
                    }`}
                  >
                    <span className="font-medium">{r.label}</span>
                    <span className="text-[11px] text-ink-soft">{r.blurb}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    void handleSignOut();
                  }}
                  className="mt-2 flex w-full items-center justify-between rounded-md border border-line bg-paper px-2.5 py-2 text-left text-sm text-ink hover:border-line-strong"
                >
                  <span>Sign out</span>
                  <LogOut size={14} className="text-ink-soft" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
