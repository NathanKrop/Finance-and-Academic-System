import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const source = fs.readFileSync(new URL("../lib/academic/portals.ts", import.meta.url), "utf8");

test("Settings portal is enabled with the expected sidebar items", () => {
  assert.match(source, /key:\s*"settings"/);
  assert.match(source, /status:\s*"built"/);
  assert.match(source, /Subject grading/);
  assert.match(source, /Students Portal/);
});

test("Settings provider defaults include app-wide calendar values", () => {
  const defaultsSource = fs.readFileSync(new URL("../lib/academic/settings-defaults.ts", import.meta.url), "utf8");
  assert.match(defaultsSource, /currentTerm/);
  assert.match(defaultsSource, /currentYear/);
  assert.match(defaultsSource, /Term 3/);
});
