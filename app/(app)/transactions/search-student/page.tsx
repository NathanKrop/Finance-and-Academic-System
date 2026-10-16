"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useState } from "react";
import { Search as SearchIcon, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Form";
import { DataTable } from "@/components/ui/DataTable";
import { StatusStamp } from "@/components/ui/Stamp";
import { CLASSROOMS, STREAMS } from "@/lib/mock-data";

type StudentRecord = {
  id: string;
  adm_no: string;
  full_name: string;
  status: string;
  guardian_phone_primary: string | null;
  classroom_id: string | null;
  stream_id: string | null;
  classrooms?: { name: string } | null;
  streams?: { name: string } | null;
};

export default function SearchStudentPage() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  useEffect(() => {
    async function loadStudents() {
      try {
        const response = await fetch("/api/students");
        const result: { data?: StudentRecord[] } = await response.json();
        if (response.ok) setStudents(result.data ?? []);
        else setLoadError("Could not load student records.");
      } catch {
        setLoadError("Could not load student records. Check your connection and try again.");
      } finally {
        setLoading(false);
      }
    }

    void loadStudents();
  }, []);

  const filteredStudents = students.filter((student) => [
    student.adm_no,
    student.full_name,
    student.guardian_phone_primary,
  ].some((value) => String(value ?? "").toLowerCase().includes(deferredQuery)));

  return (
    <div>
      <PageHeader
        eyebrow="Transactions · 02"
        title="Search Student"
        subtitle="Fast lookup by Adm No, name or guardian phone — for finance staff fielding a walk-in query."
      />

      <div className="relative max-w-xl mb-5">
        <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
        <Input
          placeholder="Search by Adm No, name, or guardian phone…"
          className="pl-10 py-3 text-base"
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <Card padded={false}>
        <DataTable
          keyField={(student) => student.id}
          rows={filteredStudents}
          columns={[
            { header: "Adm No", render: (student) => <span className="figures text-xs font-medium">{student.adm_no}</span> },
            { header: "Student", render: (student) => <span className="text-sm">{student.full_name}</span> },
            {
              header: "Class",
              render: (student) => <span className="text-xs text-ink-soft">{student.classrooms?.name ?? CLASSROOMS.find((item) => item.id === student.classroom_id)?.name ?? student.classroom_id ?? "—"} {student.streams?.name ?? STREAMS.find((item) => item.id === student.stream_id)?.name ?? student.stream_id}</span>,
            },
            { header: "Guardian Phone", render: (student) => <span className="figures text-xs text-ink-soft">{student.guardian_phone_primary ?? "—"}</span> },
            { header: "Status", align: "right", render: (student) => <StatusStamp status={student.status} /> },
            {
              header: "",
              align: "right",
              render: (student) => (
                <Link href={`/registration/students/view?id=${encodeURIComponent(student.id)}`} className="text-xs font-medium text-spine hover:underline inline-flex items-center gap-1">
                  Open <ArrowUpRight size={12} />
                </Link>
              ),
            },
          ]}
        />
        {loading && <p className="px-5 pb-4 text-xs text-ink-soft">Loading students…</p>}
        {loadError && <p role="alert" className="px-5 pb-4 text-xs text-stamp-rust">{loadError}</p>}
        {!loading && !loadError && filteredStudents.length === 0 && <p className="px-5 pb-4 text-xs text-ink-soft">No matching students found.</p>}
      </Card>
    </div>
  );
}
