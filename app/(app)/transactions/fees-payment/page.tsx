"use client";

import { useEffect, useState } from "react";
import { Save, Zap } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Form";
import { DataTable } from "@/components/ui/DataTable";
import { kes } from "@/lib/format";
import { SCHOOL, CLASSROOMS, STREAMS, VOTE_HEADS, PAYMENT_TYPES, BANK_ACCOUNTS } from "@/lib/mock-data";

type StudentRecord = {
  id: string;
  adm_no: string;
  full_name: string;
  classroom_id: string | null;
  stream_id: string | null;
  classrooms?: { name: string } | null;
  streams?: { name: string } | null;
};

type VoteHeadOption = { id: string; name: string; type: string };
type PaymentTypeOption = { id: string; name: string };
type BankAccountOption = { id: string; bank: string; type?: string; purpose?: string };

type ReceiptRecord = {
  id: string;
  receipt_no: string;
  amount: number;
  transaction_date: string;
  voided: boolean;
  vote_heads?: { name: string } | null;
};

export default function FeesPaymentPage() {
  const [voteHeads, setVoteHeads] = useState<VoteHeadOption[]>(VOTE_HEADS);
  const [paymentTypes, setPaymentTypes] = useState<PaymentTypeOption[]>(PAYMENT_TYPES);
  const [bankAccounts, setBankAccounts] = useState<BankAccountOption[]>(BANK_ACCOUNTS);
  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [recent, setRecent] = useState<ReceiptRecord[]>([]);
  const [paidTerm, setPaidTerm] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    adm_no: "",
    vote_head: VOTE_HEADS.find((voteHead) => voteHead.type === "Receipt")?.id ?? "",
    amount: "",
    payment_type: "",
    bank_account: "",
    ref_no: "",
    transaction_date: new Date().toISOString().split("T")[0],
  });
  const feeVoteHeads = voteHeads.filter((voteHead) => voteHead.type === "Receipt");

  useEffect(() => {
    async function loadReferences() {
      try {
        const response = await fetch("/api/reference");
        if (!response.ok) return;
        const result: {
          data?: {
            vote_heads?: VoteHeadOption[];
            payment_types?: PaymentTypeOption[];
            bank_accounts?: BankAccountOption[];
          };
        } = await response.json();
        if (!result.data) return;

        const nextVoteHeads = result.data.vote_heads ?? VOTE_HEADS;
        const nextPaymentTypes = result.data.payment_types ?? PAYMENT_TYPES;
        const nextBankAccounts = result.data.bank_accounts ?? BANK_ACCOUNTS;
        setVoteHeads(nextVoteHeads);
        setPaymentTypes(nextPaymentTypes);
        setBankAccounts(nextBankAccounts);
        setForm((previous) => ({
          ...previous,
          vote_head: nextVoteHeads.find((item) => item.id === previous.vote_head)?.id
            ?? nextVoteHeads.find((item) => item.type === "Receipt")?.id
            ?? "",
          payment_type: nextPaymentTypes.find((item) => item.id === previous.payment_type)?.id
            ?? nextPaymentTypes[0]?.id
            ?? "",
          bank_account: nextBankAccounts.find((item) => item.id === previous.bank_account)?.id
            ?? nextBankAccounts[0]?.id
            ?? "",
        }));
      } catch {
        return;
      }
    }

    void loadReferences();
  }, []);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const studentRes = await fetch(`/api/students?q=${encodeURIComponent(form.adm_no)}`);
      const studentData: { data?: StudentRecord[] } = await studentRes.json();

      const foundStudent = studentData.data?.find((item) => item.adm_no === form.adm_no.trim());
      if (!studentRes.ok || !foundStudent) {
        setError(`No student found with admission number ${form.adm_no}`);
        setLoading(false);
        return;
      }

      setStudent(foundStudent);

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: foundStudent.id,
          term: SCHOOL.term,
          academic_year: SCHOOL.year,
          vote_head_id: form.vote_head,
          amount: Number(form.amount),
          payment_type_id: form.payment_type,
          bank_account_id: form.bank_account || null,
          ref_no: form.ref_no,
          transaction_date: form.transaction_date,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to record payment");
        setLoading(false);
        return;
      }

      setSuccess(`Payment recorded. Receipt No: ${data.data.receipt_no}`);
      try {
        const historyResponse = await fetch(
          `/api/transactions?student_id=${encodeURIComponent(foundStudent.id)}&term=${encodeURIComponent(SCHOOL.term)}&academic_year=${SCHOOL.year}&voided=false`
        );
        if (historyResponse.ok) {
          const history: { data?: ReceiptRecord[] } = await historyResponse.json();
          const receipts = history.data ?? [];
          setRecent(receipts.slice(0, 4));
          setPaidTerm(receipts.reduce((total, receipt) => total + (receipt.voided ? 0 : Number(receipt.amount)), 0));
        }
      } catch {
        setRecent((current) => [data.data, ...current].slice(0, 4));
        setPaidTerm((current) => current + Number(data.data.amount));
      }

      setForm((prev) => ({ ...prev, amount: "", ref_no: "" }));
      setLoading(false);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Transactions · 02"
        title="Fees Payment"
        subtitle="Look up by Adm No to auto-fill the student, then record the amount received."
        actions={
          <span className="stamp stamp-brass">
            <Zap size={11} /> F10 to submit
          </span>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
        <Card>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4 items-end pb-5 border-b border-line">
              <Field label="Adm No" required>
                <Input
                  className="figures font-medium"
                  autoFocus
                  value={form.adm_no}
                  onChange={(e) => update("adm_no", e.target.value)}
                  required
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Student Name">
                  <Input value={student?.full_name ?? ""} readOnly className="bg-paper-dim" />
                </Field>
                <Field label="Class">
                  <Input
                    value={[
                      student?.classrooms?.name ?? CLASSROOMS.find((item) => item.id === student?.classroom_id)?.name ?? student?.classroom_id,
                      student?.streams?.name ?? STREAMS.find((item) => item.id === student?.stream_id)?.name ?? student?.stream_id,
                    ].filter(Boolean).join(" · ")}
                    readOnly
                    className="bg-paper-dim"
                  />
                </Field>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Vote Head" required>
                <Select
                  value={form.vote_head}
                  onChange={(e) => update("vote_head", e.target.value)}
                  required
                >
                  {feeVoteHeads.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                </Select>
              </Field>
              <Field label="Amount (KES)" required>
                <Input
                  type="number"
                  placeholder="0.00"
                  className="figures font-medium"
                  value={form.amount}
                  onChange={(e) => update("amount", e.target.value)}
                  required
                />
              </Field>
              <Field label="Payment Type" required>
                <Select
                  value={form.payment_type}
                  onChange={(e) => update("payment_type", e.target.value)}
                  required
                >
                  <option value="" disabled>Select payment type</option>
                  {paymentTypes.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>
              </Field>
              <Field label="Bank Account" required>
                <Select
                  value={form.bank_account}
                  onChange={(e) => update("bank_account", e.target.value)}
                  required
                >
                  <option value="" disabled>Select bank account</option>
                  {bankAccounts.map((b) => <option key={b.id} value={b.id}>{b.bank} — {b.type ?? b.purpose}</option>)}
                </Select>
              </Field>
              <Field label="Ref No." required hint="M-Pesa code, cheque no. or deposit slip no.">
                <Input
                  placeholder="e.g. QFT8K2LM01"
                  className="figures"
                  value={form.ref_no}
                  onChange={(e) => update("ref_no", e.target.value)}
                  required
                />
              </Field>
              <Field label="Transaction Date" required>
                <Input
                  type="date"
                  value={form.transaction_date}
                  onChange={(e) => update("transaction_date", e.target.value)}
                  required
                />
              </Field>
            </div>

            {error && (
              <p className="text-xs text-stamp-rust bg-stamp-rust/10 border border-stamp-rust/30 rounded-md px-3 py-2">
                {error}
              </p>
            )}
            {success && (
              <p className="text-xs text-spine bg-spine/10 border border-spine/30 rounded-md px-3 py-2">
                {success}
              </p>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button variant="primary" size="md" icon={Save} type="submit" disabled={loading}>
                {loading ? "Saving…" : "Record Payment"}
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-5">
          <Card className="bg-spine text-paper border-spine">
            <p className="text-[11px] uppercase tracking-[0.16em] text-paper/60 mb-1.5">Paid This Term</p>
            <p className="figures text-3xl font-medium mb-1">{kes(paidTerm)}</p>
            <p className="text-xs text-paper/60">Outstanding balance depends on the active fee structure.</p>
            <div className="perforated mt-4 pt-3 flex items-center justify-between text-xs">
              <span className="text-paper/60">Latest receipt</span>
              <span className="figures text-paper">{recent[0]?.receipt_no ?? "—"}</span>
            </div>
          </Card>

          <Card>
            <CardHeader eyebrow="Recent for this student" title="Last 4 receipts" />
            <DataTable
              dense
              keyField={(t) => t.id}
              rows={recent}
              columns={[
                { header: "Receipt", render: (t) => <span className="figures text-xs">{t.receipt_no}</span> },
                { header: "Vote Head", render: (t) => <span className="text-xs text-ink-soft">{t.vote_heads?.name ?? "—"}</span> },
                { header: "Amount", align: "right", render: (t) => <span className="figures text-xs font-medium">{kes(t.amount)}</span> },
              ]}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}