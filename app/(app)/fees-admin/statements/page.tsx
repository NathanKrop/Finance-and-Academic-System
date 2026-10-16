import { Printer, Download } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";
import { kes } from "@/lib/format";
import { SCHOOL, STUDENTS, TRANSACTIONS } from "@/lib/mock-data";

export default function StatementsPage() {
  const student = STUDENTS[6];
  const history = TRANSACTIONS.filter((t) => t.studentAdm === student.admNo);
  const totalCharged = 26800;

  return (
    <div>
      <PageHeader
        eyebrow="Fees Admin · 03"
        title="Fee Statements"
        subtitle="Generate a printable statement of account for any student."
        actions={
          <>
            <Button variant="outline" icon={Download}>Download PDF</Button>
            <Button variant="primary" icon={Printer}>Print</Button>
          </>
        }
      />

      <Card className="mb-5 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-4 items-end">
          <Field label="Adm No"><Input defaultValue={student.admNo} className="figures" /></Field>
          <Field label="Student"><Input defaultValue={student.name} readOnly className="bg-paper-dim" /></Field>
        </div>
      </Card>

      <Card className="max-w-2xl mx-auto">
        <div className="flex items-start justify-between border-b border-line pb-5 mb-5">
          <div>
            <p className="font-display text-lg text-ink">{SCHOOL.name}</p>
            <p className="text-xs text-ink-soft">{SCHOOL.address}</p>
            <p className="text-xs text-ink-soft">{SCHOOL.registration}</p>
          </div>
          <div className="text-right">
            <p className="figures text-[11px] uppercase tracking-[0.14em] text-brass">Statement of Account</p>
            <p className="figures text-xs text-ink-soft mt-1">{SCHOOL.term}, {SCHOOL.year}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div><p className="text-ink-soft text-xs">Student</p><p className="text-ink">{student.name}</p></div>
          <div><p className="text-ink-soft text-xs">Adm No.</p><p className="figures text-ink">{student.admNo}</p></div>
          <div><p className="text-ink-soft text-xs">Class</p><p className="text-ink">{student.classroom} {student.stream}</p></div>
          <div><p className="text-ink-soft text-xs">Guardian</p><p className="text-ink">{student.guardian}</p></div>
        </div>

        <table className="w-full text-sm mb-5">
          <thead>
            <tr className="border-b border-line text-[10.5px] uppercase tracking-[0.1em] text-ink-soft">
              <th className="text-left py-2">Date</th>
              <th className="text-left py-2">Description</th>
              <th className="text-right py-2">Charged</th>
              <th className="text-right py-2">Paid</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-line">
              <td className="py-2 figures text-xs text-ink-soft">2026-04-29</td>
              <td className="py-2 text-ink">Term 2 fee structure — {student.classroom}</td>
              <td className="py-2 text-right figures">{kes(totalCharged)}</td>
              <td className="py-2 text-right figures text-ink-soft">—</td>
            </tr>
            {(history.length ? history : TRANSACTIONS.slice(0, 3)).map((t) => (
              <tr key={t.id} className="border-b border-line last:border-0">
                <td className="py-2 figures text-xs text-ink-soft">{t.date}</td>
                <td className="py-2 text-ink">{t.voteHead} — {t.receiptNo}</td>
                <td className="py-2 text-right figures text-ink-soft">—</td>
                <td className="py-2 text-right figures">{kes(t.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="perforated pt-4 flex items-center justify-between">
          <span className="font-display text-base text-ink">Balance carried forward</span>
          <span className={`figures text-xl font-medium ${student.balance > 0 ? "text-stamp-rust" : "text-stamp-green"}`}>
            {kes(student.balance)}
          </span>
        </div>

        <p className="text-[11px] text-ink-soft mt-6 text-center">
          All fees are payable via Paybill 400211 or bank transfer. Retain this statement for your records.
        </p>
      </Card>
    </div>
  );
}
