import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const tempDir = mkdtempSync(join(tmpdir(), "kendi-students-"));

test("student store can create, list, and update records", async () => {
  const { createStudentStore } = await import(new URL("../lib/student-store.ts", import.meta.url).href);
  const store = createStudentStore(join(tempDir, "students.json"));

  const created = await store.createStudent({
    adm_no: "4235",
    upi_no: "KE1023456F1",
    full_name: "Mwendwa Kamau",
    gender: "Female",
    classroom_id: "g10",
    stream_id: "s1",
    is_boarder: true,
    house_id: "h1",
    guardian_name: "Mary Kamau",
    guardian_phone_primary: "0712345678",
    status: "active",
  });

  assert.equal(created.adm_no, "4235");
  assert.equal(created.full_name, "Mwendwa Kamau");

  const list = await store.listStudents({ q: "Mwendwa" });
  assert.equal(list.length, 1);

  const updated = await store.updateStudent(created.id, {
    guardian_name: null,
    house_id: null,
    is_boarder: false,
  });

  assert.equal(updated.guardian_name, null);
  assert.equal(updated.house_id, null);
  assert.equal(updated.is_boarder, false);
  assert.equal(updated.updated_at !== created.updated_at, true);

  const duplicate = await store.createStudent({
    adm_no: "4236",
    full_name: "Second Student",
    gender: "Female",
    guardian_phone_primary: "0712345679",
  });
  await assert.rejects(
    store.updateStudent(duplicate.id, { adm_no: created.adm_no }),
    /already exists/
  );

  const concurrentCreates = await Promise.allSettled([
    store.createStudent({ adm_no: "5000", full_name: "Concurrent One", gender: "Female" }),
    store.createStudent({ adm_no: "5000", full_name: "Concurrent Two", gender: "Female" }),
  ]);
  assert.equal(concurrentCreates.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal((await store.listStudents({ q: "5000" })).length, 1);

  const archived = await store.archiveStudent(duplicate.id);
  assert.equal(archived?.status, "left");
  assert.equal((await store.getStudentById(duplicate.id))?.status, "left");

  rmSync(tempDir, { recursive: true, force: true });
});
