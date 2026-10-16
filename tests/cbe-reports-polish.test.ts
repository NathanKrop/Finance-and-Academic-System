import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const source = fs.readFileSync(new URL("../components/academic/cbe-reports/CbeReportsPage.tsx", import.meta.url), "utf8");

test("CBE reports include a reset action and summary descriptions for the report shell", () => {
  assert.match(source, /Reset filters/);
  assert.match(source, /Summary/);
});

test("assessment marks upsert by exam, learner, and subject without discarding other marks", async () => {
  const { upsertAssessmentMarks } = await import(new URL("../lib/academic/examinations-data.ts", import.meta.url).href);
  const existing = [
    { id: "mark-a", examId: "exam-1", studentId: "student-1", admNo: "ADM-1", subjectRef: "math", subject: "Mathematics", score: 30, outOf: 50 },
    { id: "mark-b", examId: "exam-2", studentId: "student-1", admNo: "ADM-1", subjectRef: "math", subject: "Mathematics", score: 70, outOf: 100 },
  ];

  const result = upsertAssessmentMarks(existing, [
    { examId: "exam-1", studentId: "student-1", admNo: "ADM-1", subjectRef: "math", subject: "Mathematics", score: 42, outOf: 50 },
  ]);

  assert.equal(result.length, 2);
  assert.equal(result.find((mark) => mark.id === "mark-a")?.score, 42);
  assert.equal(result.find((mark) => mark.id === "mark-b")?.score, 70);
});

test("saved examination marks map to CBE report rows using exam metadata and normalized scores", async () => {
  const { getCbeReportRows, mapSavedAssessmentMarks } = await import(new URL("../lib/academic/cbe-report-data.ts", import.meta.url).href);
  const { getRubric } = await import(new URL("../lib/academic/cbe-grading.ts", import.meta.url).href);
  const result = mapSavedAssessmentMarks(
    [{ id: "mark-a", examId: "exam-1", studentId: "student-1", admNo: "ADM-1", subjectRef: "math", subject: "Mathematics", score: 42, outOf: 50 }],
    [{ id: "exam-1", title: "Midterm", year: 2026, term: "Term 2" }],
    (score) => getRubric(score).label,
  );

  assert.deepEqual(result, [{
    admNo: "ADM-1",
    examId: "exam-1",
    year: 2026,
    term: "Term 2",
    exam: "Midterm",
    subject: "Mathematics",
    score: 84,
    grade: "ME2",
  }]);

  const rows = getCbeReportRows(
    [{ id: "student-1", admNo: "ADM-1", name: "Amina", grade: "Grade 10", stream: "STEM A", pathway: "STEM", gender: "Female", teacher: "Teacher" }],
    result,
    { grade: "Grade 10", stream: "STEM A", year: 2026, term: "Term 2", examId: "exam-1", exam: "Midterm" },
  );
  assert.equal(rows[0].marks.length, 1);
  assert.equal(rows[0].total, 84);
  assert.equal(rows[0].mean, 84);
});

test("CBE report stream options only include streams belonging to the selected grade", async () => {
  const { getCbeReportStreams } = await import(new URL("../lib/academic/cbe-report-data.ts", import.meta.url).href);
  const students = [
    { id: "1", admNo: "A1", name: "A", grade: "Grade 10", stream: "STEM A", pathway: "STEM", gender: "Female", teacher: "T" },
    { id: "2", admNo: "A2", name: "B", grade: "Grade 10", stream: "STEM B", pathway: "STEM", gender: "Female", teacher: "T" },
    { id: "3", admNo: "A3", name: "C", grade: "Grade 11", stream: "STEM A", pathway: "STEM", gender: "Female", teacher: "T" },
  ];

  assert.deepEqual(getCbeReportStreams(students, "Grade 10"), ["STEM A", "STEM B"]);
});

test("student, subject, and KCSE mark-entry save handlers persist assessment records", () => {
  for (const relativePath of [
    "../components/academic/examinations/MarksEntryStudentPage.tsx",
    "../components/academic/examinations/MarksEntrySubjectPage.tsx",
    "../components/academic/examinations/KCSEEntryStudentPage.tsx",
  ]) {
    const pageSource = fs.readFileSync(new URL(relativePath, import.meta.url), "utf8");
    assert.match(pageSource, /assessmentMarks:\s*upsertAssessmentMarks/);
  }
});
