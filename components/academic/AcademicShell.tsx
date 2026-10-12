"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { ACADEMIC_PORTALS, academicPortalForPath } from "@/lib/academic/portals";

export function AcademicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const activePortal = academicPortalForPath(pathname);

  return (
    <div className="min-h-dvh bg-academic-paper text-academic-ink">
      <header className="sticky top-0 z-20 border-b border-academic-line bg-academic-surface/95 backdrop-blur">
        <div className="flex min-h-14 items-center gap-3 px-3 sm:px-5">
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-academic-ink-soft hover:bg-academic-paper lg:hidden"
            aria-label={mobileOpen ? "Close registration menu" : "Open registration menu"}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <nav aria-label="Academic portals" className="flex min-w-0 flex-1 gap-1 overflow-x-auto py-2">
            {ACADEMIC_PORTALS.map((portal) => {
              const active = portal.key === activePortal.key;
              const Icon = portal.icon;
              return (
                <Link
                  key={portal.key}
                  href={portal.basePath}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors ${
                    active
                      ? "bg-academic-accent text-white"
                      : "text-academic-ink-soft hover:bg-academic-paper hover:text-academic-ink"
                  }`}
                >
                  <Icon size={16} />
                  <span>{portal.label}</span>
                  {portal.isNew && (
                    <span className="rounded-sm bg-academic-new px-1.5 py-0.5 text-[9px] font-bold uppercase text-academic-ink">
                      New
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="hidden shrink-0 items-center gap-3 border-l border-academic-line pl-4 sm:flex">
            <div className="text-right leading-tight">
              <p className="text-xs font-semibold">Preview Staff</p>
              <p className="text-[10px] text-academic-ink-soft">Academic Admin · Preview</p>
            </div>
            <Link
              href="/login"
              aria-label="Sign out"
              title="Sign out"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-academic-line text-academic-ink-soft hover:bg-academic-paper hover:text-academic-ink"
            >
              <LogOut size={16} />
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-academic-line/70 px-4 py-2 sm:hidden">
          <span className="text-xs font-medium">Preview Staff · Academic Admin</span>
          <Link href="/login" className="flex items-center gap-1.5 text-xs text-academic-ink-soft">
            <LogOut size={14} /> Sign out
          </Link>
        </div>
      </header>

      <div className="flex min-h-[calc(100dvh-3.5rem)]">
        {mobileOpen && (
          <button
            type="button"
            aria-label="Close registration menu"
            className="fixed inset-0 z-30 bg-black/35 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
        <aside
          className={`fixed inset-y-0 left-0 z-40 mt-[6.5rem] w-[280px] border-r border-academic-line bg-academic-surface transition-transform duration-200 lg:sticky lg:top-14 lg:z-10 lg:mt-0 lg:h-[calc(100dvh-3.5rem)] lg:w-[272px] lg:translate-x-0 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-16 items-center gap-3 border-b border-academic-line px-5">
            <Image src="/Logo/school_logo.jpg" alt="School logo" width={36} height={36} className="h-9 w-9 rounded object-cover" />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold">ST. ELIZABETH GIRLS</p>
              <p className="text-[10px] text-academic-ink-soft">Academic workspace</p>
            </div>
          </div>
          <nav aria-label={`${activePortal.label} pages`} className="h-[calc(100%-4rem)] overflow-y-auto px-3 py-4">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-academic-ink-soft">
              {activePortal.label}
            </p>
            {activePortal.sidebar.length > 0 ? (
              <ul className="space-y-1">
                {activePortal.sidebar.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`flex min-h-10 items-center justify-between gap-2 rounded-md px-3 py-2 text-[13px] transition-colors ${
                          active
                            ? "bg-academic-accent-soft font-semibold text-academic-accent"
                            : "text-academic-ink-soft hover:bg-academic-paper hover:text-academic-ink"
                        }`}
                      >
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="rounded-sm bg-academic-new px-1.5 py-0.5 text-[9px] font-bold text-academic-ink">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="px-3 py-2 text-xs text-academic-ink-soft">Pages will appear here when this portal is built.</p>
            )}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
      </div>
    </div>
  );
}