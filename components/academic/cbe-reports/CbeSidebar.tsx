import Link from "next/link";
import { usePathname } from "next/navigation";

export type CbeSidebarItem = {
  label: string;
  href: string;
};

export function CbeSidebar({ items }: { items: CbeSidebarItem[] }) {
  const pathname = usePathname();

  return (
    <aside className="rounded-2xl border border-academic-line bg-[#1f2e2d] p-3 text-white shadow-lg" style={{ backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}>
      <nav className="space-y-2">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-center rounded-full px-4 py-3 text-center font-serif text-base tracking-wide transition ${
                active ? "bg-[#bfe7ea] text-[#1b2a2c] shadow-sm" : "bg-[#2d4b57] text-white hover:bg-[#364f5c]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
