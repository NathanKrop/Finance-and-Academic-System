import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const tempDir = mkdtempSync(join(tmpdir(), "kendi-transactions-"));

test("transaction store records receipts, filters by student, and voids without deleting", async () => {
  const { createTransactionStore } = await import(new URL("../lib/transaction-store.ts", import.meta.url).href);
  const store = createTransactionStore(join(tempDir, "transactions.json"));
  const input = {
    student_id: "student-1",
    term: "Term 2",
    academic_year: 2026,
    vote_head_id: "vh1",
    amount: 1250,
    payment_type_id: "pt1",
    bank_account_id: "ba1",
    ref_no: "MPX-1001",
    transaction_date: "2026-10-14",
  };

  const first = await store.createTransaction(input);
  const second = await store.createTransaction({ ...input, student_id: "student-2", ref_no: "MPX-1002" });

  assert.equal(first.receipt_no, "DEV-RCT-0001");
  assert.equal(second.receipt_no, "DEV-RCT-0002");
  assert.equal((await store.listTransactions({ student_id: "student-1" })).length, 1);
  await assert.rejects(
    store.createTransaction({ ...input, student_id: "student-3" }),
    /already recorded/
  );

  const voided = await store.voidTransaction(first.id, "Duplicate payment");
  assert.equal(voided?.voided, true);
  assert.equal(voided?.void_reason, "Duplicate payment");
  assert.equal((await store.listTransactions({ student_id: "student-1" }))[0].voided, true);
  assert.equal(await store.voidTransaction(first.id, "Again"), null);
});

test("transaction store rejects invalid amounts and blank academic years", async () => {
  const { createTransactionStore } = await import(new URL("../lib/transaction-store.ts", import.meta.url).href);
  const store = createTransactionStore(join(tempDir, "invalid-transactions.json"));

  await assert.rejects(
    store.createTransaction({ student_id: "student-1", amount: 0 }),
    /greater than zero/
  );
  await assert.rejects(
    store.createTransaction({
      student_id: "student-1",
      term: "Term 2",
      academic_year: " ",
      vote_head_id: "vh1",
      amount: 100,
      payment_type_id: "pt1",
      ref_no: "MPX-1002",
    }),
    /academic year, vote head/
  );
  await assert.rejects(
    store.createTransaction({
      student_id: "student-1",
      term: "Term 2",
      academic_year: 2026,
      vote_head_id: "vh1",
      amount: 100,
      payment_type_id: "pt1",
    }),
    /Payment reference is required/
  );
});

test.after(() => rmSync(tempDir, { recursive: true, force: true }));
