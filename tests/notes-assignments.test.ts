import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const portalsSource = fs.readFileSync(new URL("../lib/academic/portals.ts", import.meta.url), "utf8");
const providerSource = fs.readFileSync(new URL("../components/academic/notes-assignments/NotesAssignmentsProvider.tsx", import.meta.url), "utf8");

test("Notes & Assignments portal is registered and built in the academic shell", () => {
  assert.match(portalsSource, /key:\s*"notes-assignments"/);
  assert.match(portalsSource, /status:\s*"built"/);
  assert.match(portalsSource, /Post Assignments/);
  assert.match(portalsSource, /Parents Auto-login Link|Generate\/Send Parents Auto-Login Link/);
});

test("Notes & Assignments provider includes namespaced stores and token helpers", () => {
  assert.match(providerSource, /na:/);
  assert.match(providerSource, /assignments/);
  assert.match(providerSource, /notes/);
  assert.match(providerSource, /autoLoginLinks/);
  assert.match(providerSource, /api\/notes-assignments\/auto-login-links/);
});

test("Notes & Assignments API route structure is scaffolded for the real module workflow", () => {
  const expectedRoutes = [
    "app/api/notes-assignments/assignments/route.ts",
    "app/api/notes-assignments/assignments/[id]/route.ts",
    "app/api/notes-assignments/notes/route.ts",
    "app/api/notes-assignments/notes/[id]/route.ts",
    "app/api/notes-assignments/submissions/route.ts",
    "app/api/notes-assignments/submissions/[id]/mark/route.ts",
    "app/api/notes-assignments/auto-login-links/route.ts",
    "app/api/notes-assignments/auto-login-links/[id]/revoke/route.ts",
    "app/api/notes-assignments/uploads/route.ts",
    "app/api/notes-assignments/parent/login/route.ts",
    "app/api/notes-assignments/sms/send/route.ts",
  ];

  for (const relativePath of expectedRoutes) {
    const fullPath = new URL(`../${relativePath}`, import.meta.url);
    assert.ok(fs.existsSync(fullPath), `Missing route scaffold: ${relativePath}`);
  }
});

test("Notes & Assignments API uses Supabase persistence and server-side token hashing", () => {
  const apiSource = fs.readFileSync(new URL("../lib/academic/notes-assignments-api.ts", import.meta.url), "utf8");
  const migrationSource = fs.readFileSync(new URL("../supabase/migrations/20261013000000_notes_assignments.sql", import.meta.url), "utf8");

  assert.match(apiSource, /createClient/);
  assert.doesNotMatch(apiSource, /moduleState/);
  assert.match(apiSource, /createHash\("sha256"\)/);
  assert.match(apiSource, /randomBytes\(/);
  assert.match(migrationSource, /create table if not exists notes_assignments/);
  assert.match(migrationSource, /notes_assignment_auto_login_links/);
  assert.match(migrationSource, /verify_notes_assignment_token/);
});
