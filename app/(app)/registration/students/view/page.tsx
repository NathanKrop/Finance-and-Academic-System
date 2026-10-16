"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ArrowLeft, Printer, MessageSquareText, Save } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Form";
import { DataTable } from "@/components/ui/DataTable";
import { StatusStamp } from "@/components/ui/Stamp";
import { kes } from "@/lib/format";
import { CLASSROOMS, HOUSES, SCHOOL, STREAMS } from "@/lib/mock-data";

type Reference = { id: string; name: string };

type StudentDetail = {
  id: string;
  adm_no: string;
  upi_no: string | null;
  full_name: string;
  gender: string;
  classroom_id: string | null;
  stream_id: string | null;
  status: string;
  house_id: string | null;
  guardian_name: string | null;
  guardian_phone_primary: string | null;
  date_admitted: string | null;
  is_boarder: boolean;
  classrooms?: { name: string } | null;
  streams?: { name: string } | null;
  houses?: { name: string } | null;
};

type StudentTransaction = {
  id: string;
  receipt_no: string;
  amount: number;
  term: string;
  academic_year: number;
  transaction_date: string;
  ref_no: string | null;
  voided: boolean;
  vote_heads?: { name: string } | null;
  payment_types?: { name: string } | null;
};

function StudentViewContent() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get("id") ?? "";
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [transactions, setTransactions] = useState<StudentTransaction[]>([]);
  const [classrooms, setClassrooms] = useState<Reference[]>(CLASSROOMS);
  const [streams, setStreams] = useState<Reference[]>(STREAMS);
  const [houses, setHouses] = useState<Reference[]>(HOUSES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  async function saveStudent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!student) return;

    setSaving(true);
    setSaveMessage("");
    setSaveError("");

    const formData = new FormData(event.currentTarget);
    const houseId = String(formData.get("house_id") ?? "");
    const response = await fetch(`/api/students/${encodeURIComponent(student.id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: formData.get("full_name"),
        gender: formData.get("gender"),
        classroom_id: formData.get("classroom_id"),
        stream_id: formData.get("stream_id"),
        house_id: houseId || null,
        is_boarder: Boolean(houseId),
        status: formData.get("status"),
        guardian_name: formData.get("guardian_name"),
        guardian_phone_primary: formData.get("guardian_phone_primary"),
      }),
    }).catch(() => null);

    if (!response) {
      setSaveError("Could not save changes. Check your connection and try again.");
      setSaving(false);
      return;
    }

    const result = await response.json();
    if (!response.ok || !result.data) {
      setSaveError(result.error ?? "Could not save student changes.");
      setSaving(false);
      return;
    }

    setStudent(result.data);
    setSaveMessage("Student record updated.");
    setSaving(false);
  }

  useEffect(() => {
    async function loadReferences() {
      try {
        const response = await fetch("/api/reference");
        if (!response.ok) return;
        const result: { data?: { classrooms?: Reference[]; streams?: Reference[]; houses?: Reference[] } } = await response.json();
        if (result.data?.classrooms) setClassrooms(result.data.classrooms);
        if (result.data?.streams) setStreams(result.data.streams);
        if (result.data?.houses) setHouses(result.data.houses);
      } catch {
        return;
      }
    }

    void loadReferences();
  }, []);

  useEffect(() => {
    async function loadStudent() {
      if (!studentId) {
        setLoading(false);
        setStudent(null);
        setTransactions([]);
        return;
      }

      try {
        const response = await fetch(`/api/students/${encodeURIComponent(studentId)}`);
        const result = await response.json();
        const record = result.data ?? null;
        setStudent(record);
        if (record) {
          try {
            const transactionResponse = await fetch(`/api/transactions?student_id=${encodeURIComponent(record.id)}`);
            if (transactionResponse.ok) {
              const transactionResult: { data?: StudentTransaction[] } = await transactionResponse.json();
              setTransactions(transactionResult.data ?? []);
            } else {
              setTransactions([]);
            }
          } catch {
            setTransactions([]);
          }
        }
      } catch {
        setStudent(null);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    }

    void loadStudent();
  }, [studentId]);

  if (loading) {
    return <div className="text-sm text-ink-soft">Loading student record…</div>;
  }

  if (!student) {
    return (
      <div>
        <Link href="/registration/students" className="inline-flex items-center gap-1.5 text-xs text-ink-soft hover:text-ink mb-3">
          <ArrowLeft size={13} /> Back to students
        </Link>
        <Card>
          <p className="p-5 text-sm text-ink-soft">No student record selected.</p>
        </Card>
      </div>
    );
  }

  const status = (student.status ?? "active").replace(/^./, (char) => char.toUpperCase());
  const paid = transactions
    .filter((transaction) => !transaction.voided && transaction.term === SCHOOL.term && transaction.academic_year === SCHOOL.year)
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
  const classroomName = student.classrooms?.name
    ?? classrooms.find((classroom) => classroom.id === student.classroom_id)?.name
    ?? student.classroom_id
    ?? "—";
  const streamName = student.streams?.name
    ?? streams.find((stream) => stream.id === student.stream_id)?.name
    ?? student.stream_id
    ?? "—";
  const houseName = student.houses?.name
    ?? houses.find((house) => house.id === student.house_id)?.name
    ?? student.house_id;

  return (
    <div>
      <Link href="/registration/students" className="inline-flex items-center gap-1.5 text-xs text-ink-soft hover:text-ink mb-3">
        <ArrowLeft size={13} /> Back to students
      </Link>
      <PageHeader
        eyebrow={`Adm No ${student.adm_no} · ${student.upi_no ?? "—"}`}
        title={student.full_name}
        subtitle={`${classroomName} ${streamName} · ${student.is_boarder ? `Boarder, ${houseName ?? "House"}` : "Day scholar"}`}
        actions={
          <>
            <Link href="/fees-admin/statements">
              <Button variant="outline" icon={Printer}>Print Statement</Button>
            </Link>
            <Link href="/messages/bulk-sms">
              <Button variant="outline" icon={MessageSquareText}>Message Guardian</Button>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <p className="text-[11px] uppercase tracking-[0.12em] text-ink-soft mb-1.5">Status</p>
          <StatusStamp status={status} />
        </Card>
        <Card>
          <p className="text-[11px] uppercase tracking-[0.12em] text-ink-soft mb-1.5">Total Paid — Term</p>
          <p className="figures text-lg font-medium text-stamp-green">{kes(paid)}</p>
        </Card>
        <Card>
          <p className="text-[11px] uppercase tracking-[0.12em] text-ink-soft mb-1.5">Outstanding Balance</p>
          <p className="text-sm font-medium text-ink-soft">Requires active fee structure</p>
        </Card>
        <Card>
          <p className="text-[11px] uppercase tracking-[0.12em] text-ink-soft mb-1.5">Date Admitted</p>
          <p className="figures text-lg font-medium">{student.date_admitted ?? "—"}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5">
        <Card>
          <CardHeader eyebrow="Editable record" title="Student details" />
          <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={saveStudent}>
            <Field label="Full Name"><Input name="full_name" defaultValue={student.full_name} required /></Field>
            <Field label="Gender">
              <Select name="gender" defaultValue={student.gender} required><option>Male</option><option>Female</option></Select>
            </Field>
            <Field label="Classroom">
              <Select name="classroom_id" defaultValue={student.classroom_id ?? ""}>
                {student.classroom_id && !classrooms.some((classroom) => classroom.id === student.classroom_id) && (
                  <option value={student.classroom_id}>{student.classrooms?.name ?? student.classroom_id}</option>
                )}
                {classrooms.map((classroom) => <option key={classroom.id} value={classroom.id}>{classroom.name}</option>)}
              </Select>
            </Field>
            <Field label="Stream">
              <Select name="stream_id" defaultValue={student.stream_id ?? ""}>
                <option value="">Select stream</option>
                {student.stream_id && !streams.some((stream) => stream.id === student.stream_id) && (
                  <option value={student.stream_id}>{student.streams?.name ?? student.stream_id}</option>
                )}
                {streams.map((stream) => <option key={stream.id} value={stream.id}>{stream.name}</option>)}
              </Select>
            </Field>
            <Field label="House">
              <Select name="house_id" defaultValue={student.house_id ?? ""}>
                <option value="">Day scholar</option>
                {student.house_id && !houses.some((house) => house.id === student.house_id) && (
                  <option value={student.house_id}>{student.houses?.name ?? student.house_id}</option>
                )}
                {houses.map((house) => <option key={house.id} value={house.id}>{house.name}</option>)}
              </Select>
            </Field>
            <Field label="Status">
              <Select name="status" defaultValue={student.status}>
                <option value="active">Active</option><option value="left">Left</option><option value="graduated">Graduated</option><option value="transferred">Transferred</option>
              </Select>
            </Field>
            <Field label="Guardian Name"><Input name="guardian_name" defaultValue={student.guardian_name ?? ""} /></Field>
            <Field label="Guardian Phone"><Input name="guardian_phone_primary" defaultValue={student.guardian_phone_primary ?? ""} className="figures" /></Field>
            {saveError && <p role="alert" className="sm:col-span-2 text-xs text-stamp-rust">{saveError}</p>}
            {saveMessage && <p role="status" className="sm:col-span-2 text-xs text-stamp-green">{saveMessage}</p>}
            <div className="sm:col-span-2 flex justify-end pt-1">
              <Button variant="primary" icon={Save} type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="h-fit">
          <p className="text-xs font-medium text-ink-soft uppercase tracking-[0.1em] mb-2.5">Photo</p>
          <div className="aspect-square rounded-md bg-paper-dim border border-line flex items-center justify-center text-2xl font-display text-ink-soft">
            {student.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
        </Card>
      </div>

      <Card className="mt-5" padded={false}>
        <div className="p-5 pb-0">
          <CardHeader eyebrow="Append-only ledger" title="Transaction history" subtitle="Receipts are retained when voided; a balance also requires an active fee structure." />
        </div>
        <DataTable
          keyField={(t) => t.id}
          rows={transactions}
          columns={[
            { header: "Receipt", render: (t) => <span className="figures text-xs">{t.receipt_no}</span> },
            { header: "Vote Head", render: (t) => <span className="text-xs">{t.vote_heads?.name ?? "—"}</span> },
            { header: "Payment Type", render: (t) => <span className="text-xs text-ink-soft">{t.payment_types?.name ?? "—"}</span> },
            { header: "Ref No.", render: (t) => <span className="figures text-xs text-ink-soft">{t.ref_no ?? "—"}</span> },
            { header: "Date", render: (t) => <span className="figures text-xs text-ink-soft">{t.transaction_date}</span> },
            { header: "Amount", align: "right", render: (t) => <span className="figures text-sm font-medium">{kes(t.amount)}</span> },
            { header: "Status", align: "right", render: (t) => <StatusStamp status={t.voided ? "Void" : "Paid"} /> },
          ]}
        />
      </Card>
    </div>
  );
}

export default function ViewStudentPage() {
  return (
    <Suspense fallback={<div className="text-sm text-ink-soft">Loading student record…</div>}>
      <StudentViewContent />
    </Suspense>
  );
}
