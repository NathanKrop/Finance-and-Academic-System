import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createStudentStore } from "@/lib/student-store";
import { createTransactionStore, DuplicateTransactionReferenceError, type TransactionRecord } from "@/lib/transaction-store";
import { BANK_ACCOUNTS, PAYMENT_TYPES, VOTE_HEADS } from "@/lib/mock-data";
import { hasDemoSessionCookie } from "@/lib/demo-auth";
import { toWords } from "number-to-words";

async function canUseLocalLedger(request: NextRequest) {
  return process.env.NODE_ENV !== "production"
    && await hasDemoSessionCookie(request.headers.get("cookie"));
}

async function withLocalRelations(transaction: TransactionRecord) {
  const student = await createStudentStore().getStudentById(transaction.student_id);
  return {
    ...transaction,
    students: student ? { full_name: student.full_name, adm_no: student.adm_no } : null,
    vote_heads: { name: VOTE_HEADS.find((item) => item.id === transaction.vote_head_id)?.name ?? "Unknown" },
    payment_types: { name: PAYMENT_TYPES.find((item) => item.id === transaction.payment_type_id)?.name ?? "Unknown" },
    bank_accounts: transaction.bank_account_id
      ? { bank: BANK_ACCOUNTS.find((item) => item.id === transaction.bank_account_id)?.bank ?? "Unknown" }
      : null,
  };
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("student_id");
  const term = searchParams.get("term");
  const academicYear = searchParams.get("academic_year");
  const voided = searchParams.get("voided");

  const useLocalLedger = await canUseLocalLedger(request);
  if (useLocalLedger) {
    const transactions = await createTransactionStore().listTransactions({
      student_id: studentId ?? undefined,
      term: term ?? undefined,
      academic_year: academicYear ? Number(academicYear) : undefined,
      voided: voided === null ? undefined : voided === "true",
    });
    return NextResponse.json({ data: await Promise.all(transactions.map(withLocalRelations)) });
  }
  if (!supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: "Supabase is required for production transaction access" }, { status: 503 });
  }

  let query = supabase
    .from("transactions")
    .select("*, students(full_name, adm_no), vote_heads(name), payment_types(name), bank_accounts(bank)");

  if (studentId) query = query.eq("student_id", studentId);
  if (term) query = query.eq("term", term);
  if (academicYear) query = query.eq("academic_year", Number(academicYear));
  if (voided !== null) query = query.eq("voided", voided === "true");

  const { data, error } = await query.order("transaction_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const {
    student_id,
    term,
    academic_year,
    vote_head_id,
    amount,
    payment_type_id,
    bank_account_id,
    ref_no,
    transaction_date,
  } = body;

  // Validate required fields
  if (!student_id || !term || academic_year == null || String(academic_year).trim() === "" || !Number.isInteger(Number(academic_year)) || !vote_head_id || !payment_type_id || !String(ref_no ?? "").trim()) {
    return NextResponse.json(
      { error: "student_id, term, academic_year, vote_head_id, amount, payment_type_id, and ref_no are required" },
      { status: 400 }
    );
  }

  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return NextResponse.json(
      { error: "Amount must be greater than zero" },
      { status: 400 }
    );
  }

  const useLocalLedger = await canUseLocalLedger(request);
  if (useLocalLedger) {
    const student = await createStudentStore().getStudentById(String(student_id));
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const amountInWords = `${toWords(Math.floor(parsedAmount))} shillings${
      parsedAmount % 1 !== 0 ? ` and ${Math.round((parsedAmount % 1) * 100)} cents` : ""
    }`;
    try {
      const transaction = await createTransactionStore().createTransaction({
        ...body,
        amount: parsedAmount,
        amount_in_words: amountInWords,
      });
      return NextResponse.json({ data: await withLocalRelations(transaction) }, { status: 201 });
    } catch (error) {
      if (error instanceof DuplicateTransactionReferenceError) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      throw error;
    }
  }
  if (!supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: "Supabase is required for production transaction access" }, { status: 503 });
  }

  const { data: user } = await supabase.auth.getUser();
  const staffId = user.user?.id;

  // Generate amount in words server-side
  const amountInWords = `${toWords(Math.floor(amount))} shillings${
    amount % 1 !== 0 ? ` and ${Math.round((amount % 1) * 100)} cents` : ""
  }`;

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      student_id,
      term,
      academic_year,
      vote_head_id,
      amount: parsedAmount,
      amount_in_words: amountInWords,
      payment_type_id,
      bank_account_id,
      ref_no,
      transaction_date: transaction_date || new Date().toISOString().split("T")[0],
      recorded_by: staffId,
    })
    .select("*, students(full_name, adm_no), vote_heads(name), payment_types(name)")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Payment reference already recorded for this payment type" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data }, { status: 201 });
}