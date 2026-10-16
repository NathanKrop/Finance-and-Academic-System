import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export type TransactionRecord = {
  id: string;
  receipt_no: string;
  student_id: string;
  term: string;
  academic_year: number;
  vote_head_id: string;
  amount: number;
  amount_in_words: string;
  payment_type_id: string;
  bank_account_id: string | null;
  ref_no: string | null;
  transaction_date: string;
  recorded_by: string | null;
  voided: boolean;
  void_reason: string | null;
  voided_by: string | null;
  voided_at: string | null;
  created_at: string;
};

export type TransactionFilters = {
  student_id?: string;
  term?: string;
  academic_year?: number;
  voided?: boolean;
};

export class DuplicateTransactionReferenceError extends Error {
  constructor() {
    super("Payment reference already recorded for this payment type");
    this.name = "DuplicateTransactionReferenceError";
  }
}

const writeQueues = new Map<string, Promise<void>>();

export function createTransactionStore(storagePath = resolve(process.cwd(), "data", "transactions.json")) {
  async function withLock<T>(operation: () => Promise<T>): Promise<T> {
    const previous = writeQueues.get(storagePath) ?? Promise.resolve();
    let release = () => {};
    const current = new Promise<void>((resolveLock) => {
      release = resolveLock;
    });
    const queued = previous.then(() => current);
    writeQueues.set(storagePath, queued);
    await previous;

    try {
      return await operation();
    } finally {
      release();
      if (writeQueues.get(storagePath) === queued) writeQueues.delete(storagePath);
    }
  }

  async function loadStore(): Promise<TransactionRecord[]> {
    await mkdir(dirname(storagePath), { recursive: true });
    try {
      const contents = await readFile(storagePath, "utf8");
      const parsed = JSON.parse(contents) as TransactionRecord[];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      await writeFile(storagePath, "[]", "utf8");
      return [];
    }
  }

  async function saveStore(records: TransactionRecord[]) {
    await writeFile(storagePath, JSON.stringify(records, null, 2), "utf8");
  }

  async function listTransactions(filters: TransactionFilters = {}): Promise<TransactionRecord[]> {
    return withLock(async () => {
      const records = await loadStore();
      return records
        .filter((record) => !filters.student_id || record.student_id === filters.student_id)
        .filter((record) => !filters.term || record.term === filters.term)
        .filter((record) => filters.academic_year === undefined || record.academic_year === filters.academic_year)
        .filter((record) => filters.voided === undefined || record.voided === filters.voided)
        .sort((a, b) => b.transaction_date.localeCompare(a.transaction_date) || b.created_at.localeCompare(a.created_at));
    });
  }

  async function createTransaction(input: Record<string, unknown>): Promise<TransactionRecord> {
    const amount = Number(input.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Amount must be greater than zero");
    }

    const studentId = String(input.student_id ?? "").trim();
    const term = String(input.term ?? "").trim();
    const voteHeadId = String(input.vote_head_id ?? "").trim();
    const paymentTypeId = String(input.payment_type_id ?? "").trim();
    const referenceNumber = String(input.ref_no ?? "").trim();
    const academicYearValue = input.academic_year;
    const academicYear = Number(input.academic_year);
    if (!studentId || !term || !voteHeadId || !paymentTypeId || academicYearValue == null || String(academicYearValue).trim() === "" || !Number.isInteger(academicYear)) {
      throw new Error("Student, term, academic year, vote head, and payment type are required");
    }
    if (!referenceNumber) {
      throw new Error("Payment reference is required");
    }

    return withLock(async () => {
      const records = await loadStore();
      if (referenceNumber && records.some((record) =>
        !record.voided
        && record.payment_type_id === paymentTypeId
        && record.ref_no?.trim().toLowerCase() === referenceNumber.toLowerCase()
      )) {
        throw new DuplicateTransactionReferenceError();
      }
      const lastReceiptNumber = records.reduce((maximum, record) => {
        const match = record.receipt_no.match(/^DEV-RCT-(\d+)$/);
        return match ? Math.max(maximum, Number(match[1])) : maximum;
      }, 0);
      const now = new Date().toISOString();
      const record: TransactionRecord = {
        id: randomUUID(),
        receipt_no: `DEV-RCT-${String(lastReceiptNumber + 1).padStart(4, "0")}`,
        student_id: studentId,
        term,
        academic_year: academicYear,
        vote_head_id: voteHeadId,
        amount,
        amount_in_words: String(input.amount_in_words ?? ""),
        payment_type_id: paymentTypeId,
        bank_account_id: input.bank_account_id ? String(input.bank_account_id) : null,
        ref_no: referenceNumber || null,
        transaction_date: String(input.transaction_date ?? new Date().toISOString().slice(0, 10)),
        recorded_by: input.recorded_by ? String(input.recorded_by) : null,
        voided: false,
        void_reason: null,
        voided_by: null,
        voided_at: null,
        created_at: now,
      };

      await saveStore([...records, record]);
      return record;
    });
  }

  async function voidTransaction(id: string, reason: string): Promise<TransactionRecord | null> {
    return withLock(async () => {
      const records = await loadStore();
      const recordIndex = records.findIndex((record) => record.id === id && !record.voided);
      if (recordIndex < 0) return null;

      const updatedRecord = {
        ...records[recordIndex],
        voided: true,
        void_reason: reason,
        voided_at: new Date().toISOString(),
      };
      const nextRecords = records.map((record, index) => index === recordIndex ? updatedRecord : record);
      await saveStore(nextRecords);
      return updatedRecord;
    });
  }

  return { listTransactions, createTransaction, voidTransaction };
}
