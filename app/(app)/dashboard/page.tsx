"use client";

import Link from "next/link";
import { Wallet, AlertTriangle, Users, Receipt, ArrowUpRight, Plus, Upload, MessageSquareText } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { StatusStamp } from "@/components/ui/Stamp";
import { BarChart, HorizontalBar } from "@/components/charts/BarChart";
import { kes } from "@/lib/format";
import {
  SCHOOL,
  TRANSACTIONS,
  DEFAULTERS,
  COLLECTIONS_BY_DAY,
  COLLECTIONS_BY_TYPE,
  CLASSROOMS,
} from "@/lib/mock-data";
import { useRole } from "@/components/layout/RoleContext";

export default function DashboardPage() {
  const { role } = useRole();
  const totalCollected = COLLECTIONS_BY_TYPE.reduce((s, c) => s + c.amount, 0);
  const totalStudents = CLASSROOMS.reduce((s, c) => s + c.students, 0);
  const totalDefaultBalance = DEFAULTERS.reduce((s, d) => s + d.balance, 0);

  return (
    <div>
      <PageHeader
        eyebrow={`${SCHOOL.term} · ${SCHOOL.year}`}
        title="Dashboard"
        subtitle={`Overview for ${SCHOOL.name}. Figures reflect the current term to date.`}
        actions={
          role !== "head_teacher" && (
            <>
              <Link href="/transactions/fees-payment">
                <Button variant="primary" icon={Plus}>
                  Record Payment
                </Button>
              </Link>
              <Link href="/registration/bulk-upload">
                <Button variant="outline" icon={Upload}>
                  Bulk Upload
                </Button>
              </Link>
            </>
          )
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Collected — Term to Date" value={kes(totalCollected)} hint="Across all payment types" icon={Wallet} tone="green" />
        <StatCard label="Outstanding Balances" value={kes(totalDefaultBalance)} hint={`${DEFAULTERS.length} students in arrears`} icon={AlertTriangle} tone="rust" />
        <StatCard label="Active Students" value={totalStudents.toLocaleString()} hint="Grade 10" icon={Users} />
        <StatCard label="Receipts Issued" value={TRANSACTIONS.filter((t) => !t.voided).length.toString()} hint="This term, excluding voided" icon={Receipt} tone="brass" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader
            eyebrow="Reports · 04"
            title="Daily collections"
            subtitle="Fees banked and reconciled, last 8 posting days"
            actions={
              <Link href="/reports/collections" className="text-xs font-medium text-spine hover:underline flex items-center gap-1">
                Full report <ArrowUpRight size={13} />
              </Link>
            }
          />
          <BarChart data={COLLECTIONS_BY_DAY.map((d) => ({ label: d.date, value: d.amount }))} />
        </Card>

        <Card>
          <CardHeader eyebrow="By payment type" title="Collection mix" />
          <HorizontalBar
            data={COLLECTIONS_BY_TYPE.map((c) => ({ label: c.type, value: c.amount }))}
            formatValue={(v) => kes(v)}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2" padded={false}>
          <div className="p-5 pb-0">
            <CardHeader
              eyebrow="Transactions · 02"
              title="Recent receipts"
              actions={
                <Link href="/transactions/fees-payment" className="text-xs font-medium text-spine hover:underline flex items-center gap-1">
                  Fees Payment <ArrowUpRight size={13} />
                </Link>
              }
            />
          </div>
          <DataTable
            keyField={(t) => t.id}
            rows={TRANSACTIONS.slice(0, 6)}
            columns={[
              { header: "Receipt", render: (t) => <span className="figures text-xs">{t.receiptNo}</span> },
              {
                header: "Student",
                render: (t) => (
                  <div>
                    <p className="text-sm">{t.studentName}</p>
                    <p className="text-[11px] text-ink-soft">
                      Adm {t.studentAdm} · {t.classroom}
                    </p>
                  </div>
                ),
              },
              { header: "Vote Head", render: (t) => <span className="text-xs text-ink-soft">{t.voteHead}</span> },
              { header: "Amount", align: "right", render: (t) => <span className="figures text-sm font-medium">{kes(t.amount)}</span> },
              { header: "Status", align: "right", render: (t) => <StatusStamp status={t.voided ? "Void" : "Paid"} /> },
            ]}
          />
        </Card>

        <Card>
          <CardHeader
            eyebrow="Defaulters"
            title="Top outstanding"
            actions={
              <Link href="/reports/defaulters" className="text-xs font-medium text-spine hover:underline flex items-center gap-1">
                View list <ArrowUpRight size={13} />
              </Link>
            }
          />
          <ul className="space-y-3">
            {DEFAULTERS.slice(0, 5).map((d) => (
              <li key={d.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-ink">{d.name}</p>
                  <p className="text-[11px] text-ink-soft">
                    Adm {d.admNo} · {d.classroom}
                  </p>
                </div>
                <span className="figures text-stamp-rust font-medium">{kes(d.balance)}</span>
              </li>
            ))}
          </ul>
          <Link href="/messages/bulk-sms" className="mt-4 block">
            <Button variant="outline" size="sm" icon={MessageSquareText} className="w-full">
              Send balance reminders
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
