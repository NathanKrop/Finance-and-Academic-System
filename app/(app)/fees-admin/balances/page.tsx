import Link from "next/link";
import { ArrowUpRight, Download } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toolbar } from "@/components/ui/Toolbar";
import { Select } from "@/components/ui/Form";
import { DataTable } from "@/components/ui/DataTable";
import { StatusStamp } from "@/components/ui/Stamp";
import { kes } from "@/lib/format";
import { STUDENTS, CLASSROOMS } from "@/lib/mock-data";

export default function BalancesPage() {
  const byClass = CLASSROOMS.map((c) => {
    const in_class = STUDENTS.filter((s) => s.classroom === c.name && s.status === "Active");
    const owed = in_class.reduce((s, st) => s + st.balance, 0);
    return { classroom: c.name, students: in_class.length, owed, collected: in_class.length * 26000 - owed };
  });

  return (
    <div>
      <PageHeader
        eyebrow="Fees Admin · 03"
        title="Student Balances"
        subtitle="Balances are computed live from the transactions ledger against each student's fee structure."
        actions={<Button variant="outline" icon={Download}>Export</Button>}
      />

      <Card padded={false} className="mb-5">
        <DataTable
          keyField={(c) => c.classroom}
          rows={byClass}
          columns={[
            { header: "Classroom", render: (c) => <span className="text-sm font-medium">{c.classroom}</span> },
            { header: "Active Students", align: "right", render: (c) => <span className="figures text-sm">{c.students}</span> },
            { header: "Collected", align: "right", render: (c) => <span className="figures text-sm text-stamp-green">{kes(c.collected)}</span> },
            { header: "Outstanding", align: "right", render: (c) => <span className="figures text-sm text-stamp-rust font-medium">{kes(c.owed)}</span> },
          ]}
        />
      </Card>

      <Card padded={false}>
        <div className="p-5 pb-0">
          <Toolbar searchPlaceholder="Search student…">
            <Select className="w-auto" defaultValue="">
              <option value="">All classrooms</option>
              {CLASSROOMS.map((c) => <option key={c.id}>{c.name}</option>)}
            </Select>
            <Select className="w-auto" defaultValue="owing">
              <option value="all">All balances</option>
              <option value="owing">Owing only</option>
            </Select>
          </Toolbar>
        </div>
        <DataTable
          keyField={(s) => s.id}
          rows={STUDENTS.filter((s) => s.status === "Active")}
          columns={[
            { header: "Adm No", render: (s) => <span className="figures text-xs">{s.admNo}</span> },
            { header: "Student", render: (s) => <span className="text-sm">{s.name}</span> },
            { header: "Class", render: (s) => <span className="text-xs text-ink-soft">{s.classroom} {s.stream}</span> },
            {
              header: "Balance",
              align: "right",
              render: (s) => (
                <span className={`figures text-sm font-medium ${s.balance > 0 ? "text-stamp-rust" : "text-stamp-green"}`}>{kes(s.balance)}</span>
              ),
            },
            { header: "", align: "right", render: (s) => <StatusStamp status={s.balance > 0 ? "Pending" : "Paid"} /> },
            {
              header: "",
              align: "right",
              render: () => (
                <Link href="/fees-admin/statements" className="text-xs font-medium text-spine hover:underline inline-flex items-center gap-1">
                  Statement <ArrowUpRight size={12} />
                </Link>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
