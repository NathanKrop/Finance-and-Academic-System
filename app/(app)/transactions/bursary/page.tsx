import { HandCoins } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Form";
import { DataTable } from "@/components/ui/DataTable";
import { kes } from "@/lib/format";
import { STUDENTS } from "@/lib/mock-data";

const BURSARIES = [
  { id: "b1", ref: "BRS-2026-014", source: "NG-CDF", admNo: "SS2115", amount: 15000, date: "2026-05-06" },
  { id: "b2", ref: "BRS-2026-015", source: "County Bursary Board", admNo: "SS2114", amount: 8000, date: "2026-05-09" },
  { id: "b3", ref: "BRS-2026-016", source: "NG-CDF", admNo: "SS2116", amount: 12000, date: "2026-05-14" },
];

export default function BursaryPage() {
  const student = STUDENTS[3];
  const bursaries = BURSARIES.map((bursary) => ({
    ...bursary,
    student: STUDENTS.find((item) => item.admNo === bursary.admNo)?.name ?? "",
  }));

  return (
    <div>
      <PageHeader
        eyebrow="Transactions · 02"
        title="Bursary RCT"
        subtitle="Credit a bursary or scholarship disbursement directly to a student's account."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <Card>
          <CardHeader eyebrow="New disbursement" title="Bursary RCT" />
          <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Adm No" required><Input defaultValue={student.admNo} className="figures" /></Field>
            <Field label="Student Name"><Input defaultValue={student.name} readOnly className="bg-paper-dim" /></Field>
            <Field label="Bursary Source" required>
              <Select defaultValue="">
                <option value="" disabled>Select source</option>
                <option>NG-CDF</option>
                <option>County Bursary Board</option>
                <option>Higher Education Loans Board</option>
                <option>School Bursary Fund</option>
                <option>Well-wisher / Alumni</option>
              </Select>
            </Field>
            <Field label="Amount (KES)" required><Input type="number" placeholder="0.00" className="figures font-medium" /></Field>
            <Field label="Reference / Award No." required><Input placeholder="e.g. CDF/2026/0114" className="figures" /></Field>
            <Field label="Date Received" required><Input type="date" defaultValue="2026-05-21" /></Field>
            <div className="sm:col-span-2 flex justify-end pt-2">
              <Button variant="primary" icon={HandCoins}>Record disbursement</Button>
            </div>
          </form>
        </Card>

        <Card className="h-fit">
          <CardHeader eyebrow="Applies to balance" title="Current balance" />
          <p className={`figures text-2xl font-medium ${student.balance > 0 ? "text-stamp-rust" : "text-stamp-green"}`}>{kes(student.balance)}</p>
          <p className="text-xs text-ink-soft mt-1.5">Adm {student.admNo} · {student.classroom} {student.stream}</p>
        </Card>
      </div>

      <Card className="mt-5" padded={false}>
        <div className="p-5 pb-0">
          <CardHeader eyebrow="This term" title="Recent bursary disbursements" />
        </div>
        <DataTable
          keyField={(b) => b.id}
          rows={bursaries}
          columns={[
            { header: "Ref", render: (b) => <span className="figures text-xs">{b.ref}</span> },
            { header: "Source", render: (b) => <span className="text-xs text-ink-soft">{b.source}</span> },
            { header: "Student", render: (b) => <span className="text-sm">{b.student} <span className="text-ink-soft figures text-xs">(Adm {b.admNo})</span></span> },
            { header: "Date", render: (b) => <span className="figures text-xs text-ink-soft">{b.date}</span> },
            { header: "Amount", align: "right", render: (b) => <span className="figures text-sm font-medium">{kes(b.amount)}</span> },
          ]}
        />
      </Card>
    </div>
  );
}
