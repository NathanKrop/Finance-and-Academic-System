import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

import { CBE_SETTINGS_ROUTES, getCbeSettingsSidebar } from "../lib/academic/cbe-settings.ts";

test("CBE settings portal exposes the five required screens and is enabled", () => {
  assert.deepEqual(
    CBE_SETTINGS_ROUTES.map((item) => item.route),
    [
      "marks/subject",
      "assign/students",
      "teachers/per-stream",
      "teachers/per-teacher",
      "pathway-students",
    ],
  );

  assert.deepEqual(
    getCbeSettingsSidebar().map((item) => item.label),
    [
      "Marks Entry by Subject",
      "Assign Subjects to Students",
      "Assign Subjects to Teachers per Stream",
      "Assign Subjects to Teachers per Teacher",
      "Pathway Student List",
    ],
  );

  const portalSource = fs.readFileSync(new URL("../lib/academic/portals.ts", import.meta.url), "utf8");
  assert.match(portalSource, /key:\s*"cbe-settings"/);
  assert.match(portalSource, /status:\s*"built"/);
  assert.match(portalSource, /sidebar:\s*getCbeSettingsSidebar\(\)/);
});
