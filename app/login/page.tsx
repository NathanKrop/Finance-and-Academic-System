"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShieldCheck, ArrowRight, Landmark, BookOpen } from "lucide-react";
import { SCHOOL } from "@/lib/mock-data";
import { Input, Field } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [portal, setPortal] = useState<"finance" | "academic">("finance");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Sign in failed");
        setLoading(false);
        return;
      }

      router.push(portal === "finance" ? "/dashboard" : "/academic/registration");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex">
      {/* Left: form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12 bg-paper">
        <div className="max-w-sm w-full mx-auto">
          <div className="flex items-center gap-2.5 mb-10">
            <div className="h-10 w-10 rounded-md bg-spine flex items-center justify-center overflow-hidden">
              <Image src="/Logo/school_logo.jpg" alt="School Logo" width={40} height={40} className="object-cover" />
            </div>
            <div className="leading-tight">
              <p className="font-display text-base text-ink">ST. ELIZABETH GIRLS SENIOR SCHOOL</p>
              <p className="text-[10.5px] text-ink-soft tracking-wide">Finance &amp; Academic System</p>
            </div>
          </div>

          <p className="figures text-[11px] uppercase tracking-[0.2em] text-brass mb-2">Staff Sign In</p>
          <h1 className="font-display text-2xl text-ink mb-1.5">Welcome back</h1>
          <p className="text-sm text-ink-soft mb-4">
            Choose a portal, then sign in with your staff account. Students and guardians do not have accounts.
          </p>
          {process.env.NODE_ENV !== "production" && (
            <div className="mb-6 rounded-md bg-brass-dim border border-brass/30 px-3.5 py-2.5">
              <p className="text-[11px] text-ink-soft leading-relaxed">
                <span className="font-medium text-ink">Demo access:</span>{" "}
                <span className="figures">admin@st.elizabethgirls.ac.ke</span> /{" "}
                <span className="figures">admin123</span>
              </p>
            </div>
          )}

          <fieldset className="mb-5 space-y-2">
            <legend className="text-xs font-medium text-ink-soft mb-2">Choose a portal</legend>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                aria-pressed={portal === "finance"}
                onClick={() => setPortal("finance")}
                className={`min-h-11 flex items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass ${
                  portal === "finance"
                    ? "border-spine bg-spine text-paper"
                    : "border-line-strong bg-surface text-ink-soft hover:border-spine hover:text-ink"
                }`}
              >
                <Landmark size={16} /> Finance
              </button>
              <button
                type="button"
                aria-pressed={portal === "academic"}
                onClick={() => setPortal("academic")}
                className={`min-h-11 flex items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass ${
                  portal === "academic"
                    ? "border-spine bg-spine text-paper"
                    : "border-line-strong bg-surface text-ink-soft hover:border-spine hover:text-ink"
                }`}
              >
                <BookOpen size={16} /> Academic
              </button>
            </div>
          </fieldset>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Field label="Staff email or username" required>
              <Input
                type="email"
                placeholder="e.g. c.njeri@st.elizabethgirls.ac.ke"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
            <Field label="Password" required>
              <Input
                type="password"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>

            {error && (
              <p className="text-xs text-stamp-rust bg-stamp-rust/10 border border-stamp-rust/30 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-ink-soft">
                <input type="checkbox" className="h-3.5 w-3.5 rounded border-line-strong accent-[var(--spine)]" />
                Keep me signed in
              </label>
              <a href="#" className="text-spine hover:underline font-medium">
                Forgot password?
              </a>
            </div>
            <Button variant="primary" className="w-full" size="md" type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign in to workspace"} <ArrowRight size={15} />
            </Button>
          </form>

          <div className="mt-8 flex items-start gap-2.5 rounded-md bg-brass-dim border border-brass/30 px-3.5 py-3">
            <ShieldCheck size={16} className="text-brass mt-0.5 shrink-0" />
            <p className="text-[11.5px] text-ink-soft leading-relaxed">
              Every sign-in and money-affecting action is written to the audit log with your staff ID, timestamp, and
              before/after values, per public-funds accountability requirements.
            </p>
          </div>

          <p className="text-[11px] text-ink-soft mt-8">
            {SCHOOL.name} · {SCHOOL.registration}
          </p>
        </div>
      </div>

      {/* Right: ledger visual */}
      <div className="hidden lg:flex flex-1 relative bg-spine overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px)", backgroundSize: "100% 2.25rem" }}
        />
        <div className="relative m-auto max-w-md px-10">
          <p className="figures text-[11px] uppercase tracking-[0.22em] text-brass-soft mb-4">
            Statement of Receipts & Payments
          </p>
          <p className="font-display text-3xl text-paper leading-snug mb-6">
            IPSAS cash-basis reporting, built into the ledger — not bolted on.
          </p>
          <div className="perforated pt-5 space-y-3">
            {[
              ["Tuition Fees", "4,210,300"],
              ["Boarding Fees", "2,680,900"],
              ["Bursary & Grants", "924,300"],
              ["Compensation of Employees", "(3,800,000)"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-paper/70">{label}</span>
                <span className="figures text-paper">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-center gap-2 stamp stamp-brass">Audit-ready</div>
        </div>
      </div>
    </div>
  );
}