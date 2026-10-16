"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Upload, Users, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toolbar } from "@/components/ui/Toolbar";
import { Select } from "@/components/ui/Form";
import { DataTable } from "@/components/ui/DataTable";
import { StatusStamp } from "@/components/ui/Stamp";
import { kes } from "@/lib/format";
import { CLASSROOMS } from "@/lib/mock-data";

type StudentRow = {
  id: string;
  admNo: string;
  name: string;
  classroom: string;
  stream: string;
  isBoarder: boolean;
  house?: string;
  guardianPhone: string;
  balance: number;
  status: "Active" | "Left" | "Graduated" | "Transferred";
};

type StudentApiRecord = {
  id: string;
  adm_no: string;
  full_name: string;
  stream_id: string | null;
  is_boarder: boolean;
  house_id: string | null;
  guardian_phone_primary: string | null;
  status: StudentRow["status"] | "active" | "left" | "graduated" | "transferred";
};

export default function StudentsPage() {
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudents() {
      try {
        const response = await fetch("/api/students");
        const result = await response.json();
        const data: StudentApiRecord[] = Array.isArray(result.data) ? result.data : [];

        setRows(data.map((student) => ({
          id: student.id,
          admNo: student.adm_no,
          name: student.full_name,
          classroom: "Grade 10",
          stream: student.stream_id ?? "-",
          isBoarder: Boolean(student.is_boarder),
          house: student.house_id ?? undefined,
          guardianPhone: student.guardian_phone_primary ?? "-",
          balance: 0,
          status: (student.status ?? "active").charAt(0).toUpperCase() + String(student.status ?? "active").slice(1) as StudentRow["status"],
        })));
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    }

    void loadStudents();
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Registration · 01"
        title="View / Edit Students"
        subtitle="Search, filter and open any student record. Balances are computed live from the transactions ledger — never stored."
        actions={
          <>
            <Link href="/registration/bulk-upload">
              <Button variant="outline" icon={Upload}>
                Bulk Upload
              </Button>
            </Link>
            <Link href="/registration/students/new">
              <Button variant="primary" icon={Plus}>
                Register Student
              </Button>
            </Link>
          </>
        }
      />

      <Card padded={false}>
        <div className="p-5 pb-0">
          <Toolbar searchPlaceholder="Search by name or Adm No…">
            <Select className="w-auto" defaultValue="">
              <option value="">All classrooms</option>
              {CLASSROOMS.map((c) => (
                <option key={c.id}>{c.name}</option>
              ))}
            </Select>
            <Select className="w-auto" defaultValue="">
              <option value="">All statuses</option>
              <option>Active</option>
              <option>Left</option>
              <option>Graduated</option>
              <option>Transferred</option>
            </Select>
          </Toolbar>
        </div>

        {loading ? (
          <div className="p-5 text-sm text-ink-soft">Loading students…</div>
        ) : (
          <>
            <DataTable
              keyField={(s) => s.id}
              rows={rows}
              columns={[
                { header: "Adm No", render: (s) => <span className="figures text-xs font-medium">{s.admNo}</span> },
                {
                  header: "Student",
                  render: (s) => (
                    <Link href={`/registration/students/view?id=${encodeURIComponent(s.id)}`} className="flex items-center gap-2 group">
                      <span className="h-7 w-7 rounded-full bg-paper-dim text-ink-soft text-[11px] flex items-center justify-center font-medium shrink-0">
                        {s.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </span>
                      <span className="text-sm text-ink group-hover:text-spine group-hover:underline">{s.name}</span>
                    </Link>
                  ),
                },
                { header: "Class", render: (s) => <span className="text-xs text-ink-soft">{s.classroom} {s.stream}</span> },
                { header: "Boarding", render: (s) => <span className="text-xs text-ink-soft">{s.isBoarder ? s.house ?? "Boarder" : "Day scholar"}</span> },
                { header: "Guardian", render: (s) => <span className="text-xs text-ink-soft">{s.guardianPhone}</span> },
                {
                  header: "Balance",
                  align: "right",
                  render: () => <span className="figures text-sm font-medium text-stamp-green">{kes(0)}</span>,
                },
                { header: "Status", align: "right", render: (s) => <StatusStamp status={s.status} /> },
                {
                  header: "",
                  align: "right",
                  render: (s) => (
                    <Link href={`/registration/students/view?id=${encodeURIComponent(s.id)}`}>
                      <ChevronRight size={16} className="text-ink-soft" />
                    </Link>
                  ),
                },
              ]}
            />
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-line text-xs text-ink-soft">
              <span>
                Showing {rows.length} of {CLASSROOMS.reduce((s, c) => s + c.students, 0).toLocaleString()} students
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={13} /> Filtered view — refine with the filters above
              </span>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
