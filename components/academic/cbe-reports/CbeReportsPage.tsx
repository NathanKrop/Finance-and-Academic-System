"use client";

import { useState } from "react";
import { useCbeReports, type CbeReportExamOption } from "@/components/academic/cbe-reports/CbeReportsProvider";
import { AdvancedOptionsPanel } from "@/components/academic/cbe-reports/AdvancedOptionsPanel";
import { FilterCard } from "@/components/academic/cbe-reports/FilterCard";
import { PrintableReport } from "@/components/academic/cbe-reports/PrintableReport";
import { ReportPlaceholder } from "@/components/academic/cbe-reports/ReportPlaceholder";
import { useRegistrationData } from "@/components/academic/registration/RegistrationProvider";
import { getCbeReportRows, getCompetitionRanks, type CbeReportMark, type CbeReportRow } from "@/lib/academic/cbe-report-data";
import { getRubric } from "@/lib/academic/cbe-grading";

const ROUTE_TITLES: Record<string, string> = {
  "end-term-reports": "End-term Reports",
  "subject-analysis-marks": "Subject Analysis Marks (Broadsheet)",
  "marks-correction-sheet": "Marks Correction Sheet",
  "subject-champions": "Subject Champ./Cert",
  "rank-students-by-subject": "Rank Stud. per Subjects",
  "subjects-grade-count": "Subjects Grade count",
};

const TERMS = ["Term 1", "Term 2", "Term 3"];

function getSelectedOption(value: string | number | boolean | undefined, options: string[], fallback: string) {
  const candidate = value === undefined ? fallback : String(value);
  return options.includes(candidate) ? candidate : options[0] ?? fallback;
}

function getSelectedYear(value: string | number | boolean | undefined, years: number[]) {
  const candidate = Number(value ?? years[0] ?? new Date().getFullYear());
  return years.includes(candidate) ? candidate : years[0] ?? candidate;
}

function getAvailableExams(examOptions: CbeReportExamOption[], grade: string, term: string, year: number) {
  return examOptions.filter((exam) => exam.year === year && exam.term === term && exam.grades.includes(grade));
}

function getExamOptionLabel(exam: CbeReportExamOption, options: CbeReportExamOption[]) {
  const hasDuplicateTitle = options.filter((option) => option.title === exam.title).length > 1;
  return hasDuplicateTitle ? `${exam.title} · ${exam.startDate ?? exam.id}` : exam.title;
}

function BuildTableCell({ children }: { children: React.ReactNode }) {
  return <td className="border border-academic-line px-2 py-2 align-top">{children}</td>;
}

function getSubjects(marks: CbeReportMark[]) {
  return Array.from(new Set(marks.map((mark) => mark.subject))).sort((first, second) => first.localeCompare(second));
}

function getRowSubjectMark(row: CbeReportRow, subject: string) {
  return row.marks.find((mark) => mark.subject === subject);
}

function ReportScope({ grade, stream, term, year, exam }: { grade: string; stream?: string; term: string; year: number; exam: string }) {
  return (
    <div className="mb-4 flex flex-wrap gap-x-5 gap-y-1 border-b border-academic-line pb-3 text-xs text-academic-ink-soft">
      <span><strong>Grade:</strong> {grade}</span>
      {stream && <span><strong>Stream:</strong> {stream}</span>}
      <span><strong>Term:</strong> {term}</span>
      <span><strong>Year:</strong> {year}</span>
      <span><strong>Exam:</strong> {exam}</span>
    </div>
  );
}

function NoMatchingMarks({ message = "No marks match these selections." }: { message?: string }) {
  return <div className="rounded-lg border border-dashed border-academic-line px-4 py-8 text-center text-sm text-academic-ink-soft">{message}</div>;
}

function EndTermReportsScreen({ route }: { route: string }) {
  const { students, marks, grades, streams, examOptions, years, filters, setFilter, ready } = useCbeReports();
  const { data: registration } = useRegistrationData();
  const routeFilters = (filters[route] ?? {}) as Record<string, string | number | boolean>;
  const [enabled, setEnabled] = useState(true);
  const [hideForm, setHideForm] = useState(false);
  const [generated, setGenerated] = useState(false);

  const year = getSelectedYear(routeFilters.year, years);
  const selectedGrade = getSelectedOption(routeFilters.grade, grades, "Grade 10");
  const selectedStream = getSelectedOption(routeFilters.stream, streams, "OXFORD");
  const studentFilter = String(routeFilters.student ?? "");
  const term = getSelectedOption(routeFilters.term, TERMS, "Term 3");
  const availableExams = getAvailableExams(examOptions, selectedGrade, term, year);
  const examId = getSelectedOption(routeFilters.exam, availableExams.map((option) => option.id), "");
  const selectedExam = availableExams.find((option) => option.id === examId);
  const exam = selectedExam?.title ?? "";
  const examLabel = selectedExam ? getExamOptionLabel(selectedExam, availableExams) : "";
  const useAutoComments = Boolean(routeFilters.useAutoComments ?? true);

  const requiredFilled = grades.includes(selectedGrade) && streams.includes(selectedStream) && TERMS.includes(term) && Boolean(selectedExam);
  const reportRows = getCbeReportRows(students, marks, {
    grade: selectedGrade,
    stream: selectedStream,
    year,
    term,
    examId,
    exam,
    studentQuery: studentFilter,
  });

  const handleGenerate = () => {
    if (!requiredFilled) return;
    setGenerated(true);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <FilterCard title="REPORT FORM" enabled={enabled} onToggle={setEnabled} showHideX onHideX={() => setHideForm((value) => !value)}>
        {!hideForm && (
          <>
            <div className="space-y-1">
              <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Year</label>
              <select value={year} disabled={!enabled} onChange={(event) => setFilter(route, "year", Number(event.target.value))} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink">
                {years.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Grade</label>
              <select value={selectedGrade} disabled={!enabled} onChange={(event) => setFilter(route, "grade", event.target.value)} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink">
                {grades.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Stream</label>
              <select value={selectedStream} disabled={!enabled} onChange={(event) => setFilter(route, "stream", event.target.value)} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink">
                {streams.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Student</label>
              <input value={studentFilter} disabled={!enabled} onChange={(event) => setFilter(route, "student", event.target.value)} placeholder="student's adm no." className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink" />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Term</label>
              <select value={term} disabled={!enabled} onChange={(event) => setFilter(route, "term", event.target.value)} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink">
                {TERMS.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Exam</label>
              <select value={examId} disabled={!enabled || !availableExams.length} onChange={(event) => setFilter(route, "exam", event.target.value)} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink">
                <option value="">{availableExams.length ? "Select exam" : "No exams for this grade, term and year"}</option>
                {availableExams.map((option) => <option key={option.id} value={option.id}>{getExamOptionLabel(option, availableExams)}</option>)}
              </select>
            </div>

            <button type="button" disabled={!enabled || !requiredFilled} onClick={handleGenerate} className="w-full rounded-md bg-green-700 px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.08em] text-white disabled:cursor-not-allowed disabled:opacity-50">
              Generate report
            </button>

            <label className="flex items-center gap-2 text-xs text-academic-ink-soft">
              <input type="checkbox" checked={useAutoComments} disabled={!enabled} onChange={(event) => setFilter(route, "useAutoComments", event.target.checked)} />
              Use automatic report comments
            </label>
          </>
        )}
      </FilterCard>

      <div className="min-w-0 rounded-2xl border border-academic-line bg-[#f8f7f3] p-4 shadow-sm">
        {!ready ? (
          <div className="h-32 animate-pulse rounded-xl bg-academic-paper" />
        ) : !generated ? (
          <ReportPlaceholder text="select each of the field on the fields provided to generate Report" />
        ) : reportRows.length === 0 ? (
          <NoMatchingMarks message="No students match this grade, stream and student search." />
        ) : (
          <PrintableReport title="CBE End-Term Report Cards">
            <ReportScope grade={selectedGrade} stream={selectedStream} term={term} year={year} exam={examLabel} />
            <div className="space-y-6">
              {reportRows.map((student) => (
                <article key={student.id} className="report-page space-y-4 border-b-2 border-dashed border-academic-line pb-6 last:border-b-0">
                  <div className="border-b border-academic-line pb-3 text-center">
                    <p className="font-display text-2xl font-semibold text-academic-ink">{registration.school.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-academic-ink-soft">Competency-Based Education · End-Term Report</p>
                    {registration.school.motto && <p className="mt-1 text-xs italic text-academic-ink-soft">{registration.school.motto}</p>}
                  </div>
                  <div className="grid gap-x-6 gap-y-2 text-sm md:grid-cols-2">
                    <p><strong>Learner:</strong> {student.name}</p>
                    <p><strong>Admission No:</strong> {student.admNo}</p>
                    <p><strong>Grade / Stream:</strong> {student.grade} / {student.stream}</p>
                    <p><strong>Pathway:</strong> {student.pathway || "Not recorded"}</p>
                    <p><strong>Class teacher:</strong> {student.teacher}</p>
                    <p><strong>Term / Year:</strong> {term} / {year}</p>
                  </div>
                  {student.marks.length === 0 ? <NoMatchingMarks message="No marks have been entered for this learner in the selected exam." /> : (
                    <div className="overflow-x-auto">
                      <table className="report-table min-w-full border-collapse text-left text-sm">
                        <thead><tr><th>Learning Area</th><th>Score</th><th>Rubric</th><th>Descriptor</th><th>Teacher Comment</th></tr></thead>
                        <tbody>
                          {student.marks.map((mark) => {
                            const rubric = getRubric(mark.score);
                            return <tr key={`${student.id}-${mark.subject}`}><BuildTableCell>{mark.subject}</BuildTableCell><BuildTableCell>{mark.score}%</BuildTableCell><BuildTableCell>{rubric.label}</BuildTableCell><BuildTableCell>{rubric.descriptor}</BuildTableCell><BuildTableCell>{useAutoComments ? `${rubric.descriptor} in ${mark.subject}.` : ""}</BuildTableCell></tr>;
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border border-academic-line p-3"><p className="text-xs font-semibold uppercase text-academic-ink-soft">Learning areas reported</p><p className="mt-1 font-mono text-lg">{student.marks.length}</p></div>
                    <div className="rounded-lg border border-academic-line p-3"><p className="text-xs font-semibold uppercase text-academic-ink-soft">Mean score</p><p className="mt-1 font-mono text-lg">{student.marks.length ? `${student.mean.toFixed(1)}% · ${getRubric(student.mean).label}` : "-"}</p></div>
                    <div className="rounded-lg border border-academic-line p-3"><p className="text-xs font-semibold uppercase text-academic-ink-soft">Class teacher comment</p><p className="mt-1 text-sm">{useAutoComments && student.marks.length ? getRubric(student.mean).descriptor : " "}</p></div>
                  </div>
                  <div className="grid gap-8 pt-4 text-xs md:grid-cols-2">
                    <p className="border-t border-academic-line pt-2">Class teacher signature</p>
                    <p className="border-t border-academic-line pt-2">Parent / guardian signature</p>
                  </div>
                </article>
              ))}
            </div>
          </PrintableReport>
        )}
      </div>
    </div>
  );
}

function SubjectAnalysisMarksScreen({ route }: { route: string }) {
  const { students, marks, grades, streams, examOptions, years, pathways, filters, setFilter } = useCbeReports();
  const routeFilters = (filters[route] ?? {}) as Record<string, string | number | boolean>;
  const [enabled, setEnabled] = useState(true);
  const [advancedOpen, setAdvancedOpen] = useState(true);
  const [generated, setGenerated] = useState(false);

  const selectedGrade = getSelectedOption(routeFilters.grade, grades, "Grade 10");
  const selectedStream = getSelectedOption(routeFilters.stream, streams, "OXFORD");
  const term = getSelectedOption(routeFilters.term, TERMS, "Term 3");
  const year = getSelectedYear(routeFilters.year, years);
  const availableExams = getAvailableExams(examOptions, selectedGrade, term, year);
  const examId = getSelectedOption(routeFilters.exam, availableExams.map((option) => option.id), "");
  const selectedExam = availableExams.find((option) => option.id === examId);
  const exam = selectedExam?.title ?? "";
  const examLabel = selectedExam ? getExamOptionLabel(selectedExam, availableExams) : "";
  const pathway = getSelectedOption(routeFilters.pathway, pathways, "All Pathways");
  const topStudents = Number(routeFilters.top ?? 20);
  const bottomStudents = Number(routeFilters.bottom ?? 20);
  const gender = String(routeFilters.gender ?? "Both");
  const useTopBottom = Boolean(routeFilters.useTopBottom ?? false);
  const requiredFilled = grades.includes(selectedGrade) && streams.includes(selectedStream) && TERMS.includes(term) && Boolean(selectedExam);
  const scopedRows = getCbeReportRows(students, marks, { grade: selectedGrade, stream: selectedStream, pathway, year, term, examId, exam })
    .filter((row) => gender === "Both" || (gender === "Boys" ? row.gender === "Male" : row.gender === "Female"))
    .sort((first, second) => second.mean - first.mean || first.name.localeCompare(second.name));
  const rankedRows = scopedRows.filter((row) => row.marks.length > 0);
  const rankPositions = getCompetitionRanks(rankedRows, (row) => row.mean);
  const rankByStudent = new Map(rankedRows.map((row, index) => [row.id, rankPositions[index]]));
  const selectedRows = new Map([
    ...rankedRows.slice(0, Math.max(0, topStudents)),
    ...rankedRows.slice(Math.max(0, rankedRows.length - bottomStudents)),
  ].map((row) => [row.id, row]));
  const rows = useTopBottom ? Array.from(selectedRows.values()) : scopedRows;
  const subjects = getSubjects(scopedRows.flatMap((row) => row.marks));

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <FilterCard title="MERIT LIST (MARKS)" enabled={enabled} onToggle={setEnabled}>
        <div className="space-y-1"><label className="text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Grade</label><select value={selectedGrade} disabled={!enabled} onChange={(event) => setFilter(route, "grade", event.target.value)} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink">{grades.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
        <div className="space-y-1"><label className="text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Stream</label><select value={selectedStream} disabled={!enabled} onChange={(event) => setFilter(route, "stream", event.target.value)} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink">{streams.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
        <div className="space-y-1"><label className="text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Term</label><select value={term} disabled={!enabled} onChange={(event) => setFilter(route, "term", event.target.value)} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink">{TERMS.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
        <div className="space-y-1"><label className="text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Year</label><select value={year} disabled={!enabled} onChange={(event) => setFilter(route, "year", Number(event.target.value))} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink">{years.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
        <div className="space-y-1"><label className="text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Exam</label><select value={examId} disabled={!enabled || !availableExams.length} onChange={(event) => setFilter(route, "exam", event.target.value)} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink"><option value="">{availableExams.length ? "Select exam" : "No exams for this grade, term and year"}</option>{availableExams.map((option) => <option key={option.id} value={option.id}>{getExamOptionLabel(option, availableExams)}</option>)}</select></div>
        <div className="space-y-1"><label className="text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Pathway</label><select value={pathway} disabled={!enabled} onChange={(event) => setFilter(route, "pathway", event.target.value)} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink">{pathways.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
        <button type="button" disabled={!enabled || !requiredFilled} onClick={() => setGenerated(true)} className="w-full rounded-md bg-green-700 px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.08em] text-white disabled:cursor-not-allowed disabled:opacity-50">Generate Merit List</button>
      </FilterCard>

      <div className="min-w-0 space-y-4">
        <AdvancedOptionsPanel collapsed={!advancedOpen} onToggle={() => setAdvancedOpen((value) => !value)}>
          <label className="flex items-center gap-2"><input type="checkbox" checked={useTopBottom} disabled={!enabled} onChange={(event) => setFilter(route, "useTopBottom", event.target.checked)} />Top/Bottom students</label>
          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1"><span>Show Top :</span><input type="number" min="0" value={topStudents} disabled={!enabled || !useTopBottom} onChange={(event) => setFilter(route, "top", Number(event.target.value || 0))} className="w-full rounded border border-academic-line bg-white px-2 py-1 font-mono" /></label>
            <label className="space-y-1"><span>Show Bottom :</span><input type="number" min="0" value={bottomStudents} disabled={!enabled || !useTopBottom} onChange={(event) => setFilter(route, "bottom", Number(event.target.value || 0))} className="w-full rounded border border-academic-line bg-white px-2 py-1 font-mono" /></label>
          </div>
          <label className="space-y-1"><span>Boys/girls only</span><select value={gender} disabled={!enabled} onChange={(event) => setFilter(route, "gender", event.target.value)} className="w-full rounded border border-academic-line bg-white px-2 py-1 font-mono"><option value="Both">Both</option><option value="Boys">Boys</option><option value="Girls">Girls</option></select></label>
        </AdvancedOptionsPanel>

        {!generated ? <ReportPlaceholder text="select each of the field on the fields provided to generate Report" /> : (
          <PrintableReport title="Subject Analysis Broadsheet" orientation="landscape">
            <ReportScope grade={selectedGrade} stream={selectedStream} term={term} year={year} exam={examLabel} />
            <div className="max-w-full min-w-0 overflow-x-auto">
              {!subjects.length ? <NoMatchingMarks /> : <table className="report-table min-w-full border-collapse text-left text-sm">
                <thead className="bg-academic-muted text-academic-ink">
                  <tr>
                    <th>Rank</th><th>Adm No.</th><th>Learner</th><th>Gender</th>
                    {subjects.map((subject) => <th key={subject}>{subject}</th>)}
                    <th>Entered</th><th>Total</th><th>Mean</th><th>Overall Rubric</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <BuildTableCell>{row.marks.length ? rankByStudent.get(row.id) : "-"}</BuildTableCell>
                      <BuildTableCell>{row.admNo}</BuildTableCell>
                      <BuildTableCell>{row.name}</BuildTableCell>
                      <BuildTableCell>{row.gender || "-"}</BuildTableCell>
                      {subjects.map((subject) => {
                        const mark = getRowSubjectMark(row, subject);
                        return <BuildTableCell key={subject}>{mark ? `${mark.score} · ${getRubric(mark.score).label}` : "-"}</BuildTableCell>;
                      })}
                      <BuildTableCell>{row.marks.length}/{subjects.length}</BuildTableCell>
                      <BuildTableCell>{row.marks.length ? row.total : "-"}</BuildTableCell>
                      <BuildTableCell>{row.marks.length ? row.mean.toFixed(1) : "-"}</BuildTableCell>
                      <BuildTableCell>{row.marks.length ? getRubric(row.mean).label : "-"}</BuildTableCell>
                    </tr>
                  ))}
                </tbody>
              </table>}
            </div>
          </PrintableReport>
        )}
      </div>
    </div>
  );
}

function MarksCorrectionSheetScreen({ route }: { route: string }) {
  const { students, marks, grades, streams, examOptions, years, pathways, filters, setFilter } = useCbeReports();
  const routeFilters = (filters[route] ?? {}) as Record<string, string | number | boolean>;
  const [enabled, setEnabled] = useState(true);
  const [generated, setGenerated] = useState(false);

  const selectedGrade = getSelectedOption(routeFilters.grade, grades, "Grade 10");
  const selectedStream = getSelectedOption(routeFilters.stream, streams, "OXFORD");
  const term = getSelectedOption(routeFilters.term, TERMS, "Term 3");
  const year = getSelectedYear(routeFilters.year, years);
  const availableExams = getAvailableExams(examOptions, selectedGrade, term, year);
  const examId = getSelectedOption(routeFilters.exam, availableExams.map((option) => option.id), "");
  const selectedExam = availableExams.find((option) => option.id === examId);
  const exam = selectedExam?.title ?? "";
  const examLabel = selectedExam ? getExamOptionLabel(selectedExam, availableExams) : "";
  const pathway = getSelectedOption(routeFilters.pathway, pathways, "All Pathways");
  const requiredFilled = grades.includes(selectedGrade) && streams.includes(selectedStream) && TERMS.includes(term) && Boolean(selectedExam);
  const correctionRows = getCbeReportRows(students, marks, { grade: selectedGrade, stream: selectedStream, pathway, year, term, examId, exam })
    .flatMap((student) => student.marks.map((mark) => ({ student, mark })))
    .sort((first, second) => first.student.admNo.localeCompare(second.student.admNo) || first.mark.subject.localeCompare(second.mark.subject));

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <FilterCard title="MARKS CORRECTION SHEET" enabled={enabled} onToggle={setEnabled}>
        <div className="space-y-1"><label className="text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Grade</label><select value={selectedGrade} disabled={!enabled} onChange={(event) => setFilter(route, "grade", event.target.value)} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink">{grades.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
        <div className="space-y-1"><label className="text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Stream</label><select value={selectedStream} disabled={!enabled} onChange={(event) => setFilter(route, "stream", event.target.value)} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink">{streams.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
        <div className="space-y-1"><label className="text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Term</label><select value={term} disabled={!enabled} onChange={(event) => setFilter(route, "term", event.target.value)} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink">{TERMS.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
        <div className="space-y-1"><label className="text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Year</label><select value={year} disabled={!enabled} onChange={(event) => setFilter(route, "year", Number(event.target.value))} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink">{years.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
        <div className="space-y-1"><label className="text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Exam</label><select value={examId} disabled={!enabled || !availableExams.length} onChange={(event) => setFilter(route, "exam", event.target.value)} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink"><option value="">{availableExams.length ? "Select exam" : "No exams for this grade, term and year"}</option>{availableExams.map((option) => <option key={option.id} value={option.id}>{getExamOptionLabel(option, availableExams)}</option>)}</select></div>
        <div className="space-y-1"><label className="text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Pathway</label><select value={pathway} disabled={!enabled} onChange={(event) => setFilter(route, "pathway", event.target.value)} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink">{pathways.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
        <button type="button" disabled={!enabled || !requiredFilled} onClick={() => setGenerated(true)} className="w-full rounded-md bg-green-700 px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.08em] text-white disabled:cursor-not-allowed disabled:opacity-50">Generate Marks List</button>
      </FilterCard>

      <div className="min-w-0 rounded-2xl border border-academic-line bg-[#f8f7f3] p-4 shadow-sm">
        {!generated ? <ReportPlaceholder text="select each of the field on the fields provided to generate Report" /> : (
          <PrintableReport title="Marks Correction Sheet" orientation="landscape">
            <ReportScope grade={selectedGrade} stream={selectedStream} term={term} year={year} exam={examLabel} />
            <div className="max-w-full min-w-0 overflow-x-auto">
              {correctionRows.length === 0 ? <NoMatchingMarks message="No entered marks are available to correct for this selection." /> : <table className="report-table min-w-full border-collapse text-left text-sm">
                <thead className="bg-academic-muted text-academic-ink">
                  <tr>
                    <th>Adm No.</th><th>Learner</th><th>Learning Area</th><th>Entered Score</th><th>Rubric</th><th>Corrected Score</th><th>Reason / Reference</th><th>Teacher Initials</th>
                  </tr>
                </thead>
                <tbody>
                  {correctionRows.map(({ student, mark }) => (
                    <tr key={`${student.id}-${mark.subject}`}>
                      <BuildTableCell>{student.admNo}</BuildTableCell>
                      <BuildTableCell>{student.name}</BuildTableCell>
                      <BuildTableCell>{mark.subject}</BuildTableCell>
                      <BuildTableCell>{mark.score}</BuildTableCell>
                      <BuildTableCell>{getRubric(mark.score).label}</BuildTableCell>
                      <BuildTableCell><span className="block h-6 min-w-14 border-b border-dotted border-academic-ink-soft" /></BuildTableCell>
                      <BuildTableCell><span className="block h-6 min-w-28 border-b border-dotted border-academic-ink-soft" /></BuildTableCell>
                      <BuildTableCell><span className="block h-6 min-w-16 border-b border-dotted border-academic-ink-soft" /></BuildTableCell>
                    </tr>
                  ))}
                </tbody>
              </table>}
            </div>
          </PrintableReport>
        )}
      </div>
    </div>
  );
}

function SubjectChampionsScreen({ route }: { route: string }) {
  const { students, marks, grades, examOptions, years, filters, setFilter } = useCbeReports();
  const { data: registration } = useRegistrationData();
  const routeFilters = (filters[route] ?? {}) as Record<string, string | number | boolean>;
  const [enabled, setEnabled] = useState(true);
  const [mode, setMode] = useState<"list" | "certificate">("list");
  const [generated, setGenerated] = useState(false);

  const grade = getSelectedOption(routeFilters.grade, grades, "Grade 10");
  const term = getSelectedOption(routeFilters.term, TERMS, "Term 3");
  const year = getSelectedYear(routeFilters.year, years);
  const availableExams = getAvailableExams(examOptions, grade, term, year);
  const examId = getSelectedOption(routeFilters.exam, availableExams.map((option) => option.id), "");
  const selectedExam = availableExams.find((option) => option.id === examId);
  const exam = selectedExam?.title ?? "";
  const examLabel = selectedExam ? getExamOptionLabel(selectedExam, availableExams) : "";
  const topX = Number(routeFilters.topX ?? 5);
  const topAbove = Number(routeFilters.topAbove ?? 50);
  const requiredFilled = grades.includes(grade) && TERMS.includes(term) && Boolean(selectedExam);
  const scopedRows = getCbeReportRows(students, marks, { grade, year, term, examId, exam });
  const subjects = getSubjects(scopedRows.flatMap((row) => row.marks));
  const subject = getSelectedOption(routeFilters.subject, ["All Subjects", ...subjects], "All Subjects");
  const championSubjects = subject === "All Subjects" ? subjects : [subject];
  const champions = championSubjects.flatMap((championSubject) => {
    const sorted = scopedRows
      .flatMap((student) => student.marks
        .filter((mark) => mark.subject === championSubject && mark.score >= topAbove)
        .map((mark) => ({ student, mark })))
      .sort((first, second) => second.mark.score - first.mark.score || first.student.name.localeCompare(second.student.name));
    const cutoffScore = sorted[Math.max(0, topX) - 1]?.mark.score;
    return sorted
      .filter((row, index) => index < topX || (cutoffScore !== undefined && row.mark.score === cutoffScore))
      .map((row) => ({
        ...row,
        subject: championSubject,
        position: sorted.findIndex((candidate) => candidate.mark.score === row.mark.score) + 1,
      }));
  });
  const subjectTopScores = subject === "All Subjects" ? [] : scopedRows
    .flatMap((student) => student.marks.filter((mark) => mark.subject === subject && mark.score >= topAbove).map((mark) => ({ student, mark })))
    .sort((first, second) => second.mark.score - first.mark.score);
  const tiedTopScores = subjectTopScores.filter((row) => row.mark.score === subjectTopScores[0]?.mark.score);
  const certificateChampion = tiedTopScores.length === 1 ? tiedTopScores[0] : undefined;

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <FilterCard title="SUBJECT CHAMPIONS" enabled={enabled} onToggle={setEnabled}>
        <div className="space-y-1"><label className="text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Grade</label><select value={grade} disabled={!enabled} onChange={(event) => setFilter(route, "grade", event.target.value)} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink">{grades.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
        <div className="space-y-1"><label className="text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Term</label><select value={term} disabled={!enabled} onChange={(event) => setFilter(route, "term", event.target.value)} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink">{TERMS.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
        <div className="space-y-1"><label className="text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Exam</label><select value={examId} disabled={!enabled || !availableExams.length} onChange={(event) => setFilter(route, "exam", event.target.value)} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink"><option value="">{availableExams.length ? "Select exam" : "No exams for this grade, term and year"}</option>{availableExams.map((option) => <option key={option.id} value={option.id}>{getExamOptionLabel(option, availableExams)}</option>)}</select></div>
        <div className="space-y-1"><label className="text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Subject</label><select value={subject} disabled={!enabled} onChange={(event) => setFilter(route, "subject", event.target.value)} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink"><option>All Subjects</option>{subjects.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
        <div className="space-y-1"><label className="text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Year</label><select value={year} disabled={!enabled} onChange={(event) => setFilter(route, "year", Number(event.target.value))} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink">{years.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
        <div className="grid grid-cols-2 gap-3"><label className="space-y-1"><span className="text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Top (x)</span><input type="number" min="1" value={topX} disabled={!enabled} onChange={(event) => setFilter(route, "topX", Number(event.target.value || 0))} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm" /></label><label className="space-y-1"><span className="text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Minimum score</span><input type="number" min="0" max="100" value={topAbove} disabled={!enabled} onChange={(event) => setFilter(route, "topAbove", Number(event.target.value || 0))} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm" /></label></div>
        <div className="space-y-2 text-sm"><label className="flex items-center gap-2"><input type="radio" checked={mode === "list"} onChange={() => setMode("list")} />View Champions List</label><label className="flex items-center gap-2"><input type="radio" checked={mode === "certificate"} onChange={() => setMode("certificate")} />View Champ. Certificate</label></div>
        <button type="button" disabled={!enabled || !requiredFilled} onClick={() => setGenerated(true)} className="w-full rounded-md bg-green-700 px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.08em] text-white disabled:cursor-not-allowed disabled:opacity-50">Generate report</button>
      </FilterCard>

      <div className="min-w-0 rounded-2xl border border-academic-line bg-[#f8f7f3] p-4 shadow-sm">
        {!generated ? <div className="flex min-h-[220px] items-center justify-center border border-dashed border-academic-line bg-academic-paper text-center text-sm text-academic-ink-soft"><div><p className="font-bold uppercase tracking-[0.12em] text-academic-ink">Generate Subject Champions report and certificates</p><p className="mt-2 italic text-academic-ink-soft">(select form, term, exam and year to View subject champions or print certificate)</p></div></div> : (
          <PrintableReport title={mode === "certificate" ? "Subject Champion Certificate" : "Subject Champions"}>
            <ReportScope grade={grade} term={term} year={year} exam={examLabel} />
            {mode === "certificate" ? (
              certificateChampion ? <div className="certificate-page rounded-lg border-2 border-academic-accent p-8 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-academic-accent">{registration.school.name}</p>
                <div className="mx-auto my-6 h-px max-w-sm bg-academic-line" />
                <p className="font-display text-3xl text-academic-ink">Certificate of Achievement</p>
                <p className="mt-6 text-sm text-academic-ink-soft">This certificate is presented to</p>
                <p className="mt-2 font-display text-4xl text-academic-ink">{certificateChampion.student.name}</p>
                <p className="mt-2 text-sm text-academic-ink-soft">for achieving the highest score in <strong>{subject}</strong>.</p>
                <div className="mt-8 grid gap-4 text-left text-sm md:grid-cols-3"><div><strong>Admission No:</strong> {certificateChampion.student.admNo}</div><div><strong>Score:</strong> {certificateChampion.mark.score}% · {getRubric(certificateChampion.mark.score).label}</div><div><strong>Term / Year:</strong> {term} / {year}</div></div>
                <div className="mt-12 grid gap-10 text-sm md:grid-cols-2"><p className="border-t border-academic-line pt-2">Class teacher signature</p><p className="border-t border-academic-line pt-2">Principal signature</p></div>
              </div> : <NoMatchingMarks message={tiedTopScores.length > 1 ? "The top score is tied. Resolve the tie before issuing a single-winner certificate." : "Choose a specific subject with at least one qualifying mark to issue its certificate."} />
            ) : (
              champions.length === 0 ? <NoMatchingMarks message="No students meet the minimum score for this subject and exam." /> : <div className="max-w-full min-w-0 overflow-x-auto"><table className="report-table min-w-full border-collapse text-left text-sm">
                <thead><tr><th>Subject</th><th>Position</th><th>Admission No.</th><th>Learner</th><th>Pathway</th><th>Score</th><th>Rubric</th><th>Class teacher</th></tr></thead>
                <tbody>{champions.map((row) => <tr key={`${row.subject}-${row.student.id}`}><BuildTableCell>{row.subject}</BuildTableCell><BuildTableCell>{row.position}</BuildTableCell><BuildTableCell>{row.student.admNo}</BuildTableCell><BuildTableCell>{row.student.name}</BuildTableCell><BuildTableCell>{row.student.pathway || "Not recorded"}</BuildTableCell><BuildTableCell>{row.mark.score}%</BuildTableCell><BuildTableCell>{getRubric(row.mark.score).label}</BuildTableCell><BuildTableCell>{row.student.teacher}</BuildTableCell></tr>)}</tbody>
              </table></div>
            )}
          </PrintableReport>
        )}
      </div>
    </div>
  );
}

function RankStudentsBySubjectScreen({ route }: { route: string }) {
  const { students, marks, grades, streams, examOptions, years, filters, setFilter } = useCbeReports();
  const routeFilters = (filters[route] ?? {}) as Record<string, string | number | boolean>;
  const [enabled, setEnabled] = useState(true);
  const [generated, setGenerated] = useState(false);

  const grade = getSelectedOption(routeFilters.grade, grades, "Grade 10");
  const stream = getSelectedOption(routeFilters.stream, streams, "OXFORD");
  const term = getSelectedOption(routeFilters.term, TERMS, "Term 3");
  const year = getSelectedYear(routeFilters.year, years);
  const availableExams = getAvailableExams(examOptions, grade, term, year);
  const examId = getSelectedOption(routeFilters.exam, availableExams.map((option) => option.id), "");
  const selectedExam = availableExams.find((option) => option.id === examId);
  const exam = selectedExam?.title ?? "";
  const examLabel = selectedExam ? getExamOptionLabel(selectedExam, availableExams) : "";
  const requiredFilled = grades.includes(grade) && streams.includes(stream) && TERMS.includes(term) && Boolean(selectedExam);
  const scopedRows = getCbeReportRows(students, marks, { grade, stream, year, term, examId, exam });
  const subjects = getSubjects(scopedRows.flatMap((row) => row.marks));
  const subject = getSelectedOption(routeFilters.subject, ["All Subjects", ...subjects], "All Subjects");
  const rankingRows = scopedRows
    .map((student) => {
      const subjectMarks = subject === "All Subjects"
        ? student.marks
        : student.marks.filter((mark) => mark.subject === subject);
      const total = subjectMarks.reduce((sum, mark) => sum + mark.score, 0);
      const score = subjectMarks.length ? total / subjectMarks.length : 0;
      return { student, subjectMarks, total, score };
    })
    .filter((row) => row.subjectMarks.length > 0)
    .sort((first, second) => second.score - first.score || first.student.name.localeCompare(second.student.name));
  const rankingPositions = getCompetitionRanks(rankingRows, (row) => row.score);

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <FilterCard title="RANK STUDENTS BY SUBJECT PERFORMANCE" enabled={enabled} onToggle={setEnabled}>
        <div className="space-y-1"><label className="text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Grade</label><select value={grade} disabled={!enabled} onChange={(event) => setFilter(route, "grade", event.target.value)} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink">{grades.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
        <div className="space-y-1"><label className="text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Stream</label><select value={stream} disabled={!enabled} onChange={(event) => setFilter(route, "stream", event.target.value)} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink">{streams.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
        <div className="space-y-1"><label className="text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Term</label><select value={term} disabled={!enabled} onChange={(event) => setFilter(route, "term", event.target.value)} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink">{TERMS.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
        <div className="space-y-1"><label className="text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Exam</label><select value={examId} disabled={!enabled || !availableExams.length} onChange={(event) => setFilter(route, "exam", event.target.value)} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink"><option value="">{availableExams.length ? "Select exam" : "No exams for this grade, term and year"}</option>{availableExams.map((option) => <option key={option.id} value={option.id}>{getExamOptionLabel(option, availableExams)}</option>)}</select></div>
        <div className="space-y-1"><label className="text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Subject</label><select value={subject} disabled={!enabled} onChange={(event) => setFilter(route, "subject", event.target.value)} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink"><option>All Subjects</option>{subjects.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
        <div className="space-y-1"><label className="text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Year</label><select value={year} disabled={!enabled} onChange={(event) => setFilter(route, "year", Number(event.target.value))} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink">{years.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
        <button type="button" disabled={!enabled || !requiredFilled} onClick={() => setGenerated(true)} className="w-full rounded-md bg-green-700 px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.08em] text-white disabled:cursor-not-allowed disabled:opacity-50">Generate report</button>
      </FilterCard>

      <div className="min-w-0 rounded-2xl border border-academic-line bg-[#f8f7f3] p-4 shadow-sm">
        {!generated ? <div className="flex min-h-[220px] items-center justify-center border border-dashed border-academic-line bg-academic-paper text-center text-sm text-academic-ink-soft"><div><p className="font-bold uppercase tracking-[0.12em] text-academic-ink">Rank students by subject performance</p><p className="mt-2 italic text-academic-ink-soft">(select form, stream, term exam and year to View and Print report)</p></div></div> : (
          <PrintableReport title="Ranked Subject Performance">
            <ReportScope grade={grade} stream={stream} term={term} year={year} exam={examLabel} />
            {rankingRows.length === 0 ? <NoMatchingMarks /> : <div className="max-w-full min-w-0 overflow-x-auto"><table className="report-table min-w-full border-collapse text-left text-sm">
              <thead><tr><th>Position</th><th>Admission No.</th><th>Learner</th><th>Stream</th><th>Pathway</th><th>{subject === "All Subjects" ? "Mean Score" : `${subject} Score`}</th><th>Rubric</th><th>Marks Entered</th></tr></thead>
              <tbody>{rankingRows.map((row, index) => <tr key={row.student.id}><BuildTableCell>{rankingPositions[index]}</BuildTableCell><BuildTableCell>{row.student.admNo}</BuildTableCell><BuildTableCell>{row.student.name}</BuildTableCell><BuildTableCell>{row.student.stream}</BuildTableCell><BuildTableCell>{row.student.pathway || "-"}</BuildTableCell><BuildTableCell>{row.score.toFixed(1)}%</BuildTableCell><BuildTableCell>{getRubric(row.score).label}</BuildTableCell><BuildTableCell>{row.subjectMarks.length}</BuildTableCell></tr>)}</tbody>
            </table></div>}
          </PrintableReport>
        )}
      </div>
    </div>
  );
}

function SubjectsGradeCountScreen({ route }: { route: string }) {
  const { students, marks, grades, streams, examOptions, years, subjects, subjectPathways, filters, setFilter } = useCbeReports();
  const routeFilters = (filters[route] ?? {}) as Record<string, string | number | boolean>;
  const [enabled, setEnabled] = useState(true);
  const [generated, setGenerated] = useState(false);

  const grade = getSelectedOption(routeFilters.grade, grades, "Grade 10");
  const stream = getSelectedOption(routeFilters.stream, streams, "OXFORD");
  const term = getSelectedOption(routeFilters.term, TERMS, "Term 3");
  const year = getSelectedYear(routeFilters.year, years);
  const availableExams = getAvailableExams(examOptions, grade, term, year);
  const examId = getSelectedOption(routeFilters.exam, availableExams.map((option) => option.id), "");
  const selectedExam = availableExams.find((option) => option.id === examId);
  const exam = selectedExam?.title ?? "";
  const examLabel = selectedExam ? getExamOptionLabel(selectedExam, availableExams) : "";
  const requiredFilled = grades.includes(grade) && streams.includes(stream) && TERMS.includes(term) && Boolean(selectedExam);
  const scopedRows = getCbeReportRows(students, marks, { grade, stream, year, term, examId, exam });
  const subjectCounts = subjects.map((subject) => {
    const allowedPathways = subjectPathways[subject] ?? [];
    const eligibleRows = allowedPathways.length > 0
      ? scopedRows.filter((row) => row.pathway && allowedPathways.includes(row.pathway))
      : scopedRows;
    const subjectMarks = eligibleRows.flatMap((row) => row.marks.filter((mark) => mark.subject === subject));
    const counts = { EE: 0, ME: 0, AE: 0, BE: 0 };
    subjectMarks.forEach((mark) => { counts[getRubric(mark.score).level] += 1; });
    const enteredStudents = new Set(subjectMarks.map((mark) => mark.admNo)).size;
    return { subject, ...counts, entered: subjectMarks.length, unmarkedRoster: Math.max(0, eligibleRows.length - enteredStudents) };
  });
  const totals = subjectCounts.reduce((total, row) => ({
    EE: total.EE + row.EE,
    ME: total.ME + row.ME,
    AE: total.AE + row.AE,
    BE: total.BE + row.BE,
    entered: total.entered + row.entered,
    unmarkedRoster: total.unmarkedRoster + row.unmarkedRoster,
  }), { EE: 0, ME: 0, AE: 0, BE: 0, entered: 0, unmarkedRoster: 0 });

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <FilterCard title="SUBJECTS GRADE COUNT ANALYSIS" enabled={enabled} onToggle={setEnabled}>
        <div className="space-y-1"><label className="text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Grade</label><select value={grade} disabled={!enabled} onChange={(event) => setFilter(route, "grade", event.target.value)} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink">{grades.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
        <div className="space-y-1"><label className="text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Stream</label><select value={stream} disabled={!enabled} onChange={(event) => setFilter(route, "stream", event.target.value)} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink">{streams.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
        <div className="space-y-1"><label className="text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Term</label><select value={term} disabled={!enabled} onChange={(event) => setFilter(route, "term", event.target.value)} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink">{TERMS.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
        <div className="space-y-1"><label className="text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Year</label><select value={year} disabled={!enabled} onChange={(event) => setFilter(route, "year", Number(event.target.value))} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink">{years.map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
        <div className="space-y-1"><label className="text-[11px] font-medium uppercase tracking-[0.08em] text-academic-ink-soft">Exam</label><select value={examId} disabled={!enabled || !availableExams.length} onChange={(event) => setFilter(route, "exam", event.target.value)} className="w-full rounded-md border border-academic-line bg-white px-3 py-2 text-sm text-academic-ink"><option value="">{availableExams.length ? "Select exam" : "No exams for this grade, term and year"}</option>{availableExams.map((option) => <option key={option.id} value={option.id}>{getExamOptionLabel(option, availableExams)}</option>)}</select></div>
        <button type="button" disabled={!enabled || !requiredFilled} onClick={() => setGenerated(true)} className="w-full rounded-md bg-green-700 px-4 py-2.5 text-sm font-semibold uppercase tracking-[0.08em] text-white disabled:cursor-not-allowed disabled:opacity-50">Generate report</button>
      </FilterCard>

      <div className="min-w-0 rounded-2xl border border-academic-line bg-[#f8f7f3] p-4 shadow-sm">
        {!generated ? <div className="flex min-h-[180px] items-center justify-center border-b border-academic-line text-center text-sm font-semibold uppercase tracking-[0.14em] text-academic-ink">View Subjects Rubric Count Analysis</div> : (
          <PrintableReport title="Subject Rubric Count Analysis">
            <ReportScope grade={grade} stream={stream} term={term} year={year} exam={examLabel} />
            {!subjects.length ? <NoMatchingMarks message="No CBE learning areas are configured in registration." /> : <div className="max-w-full min-w-0 overflow-x-auto"><table className="report-table min-w-full border-collapse text-left text-sm">
              <thead><tr><th>Learning Area</th><th>EE</th><th>ME</th><th>AE</th><th>BE</th><th>Marks Entered</th><th>Unmarked (Class Roster)</th></tr></thead>
              <tbody>
                {subjectCounts.map((row) => <tr key={row.subject}><BuildTableCell>{row.subject}</BuildTableCell><BuildTableCell>{row.EE}</BuildTableCell><BuildTableCell>{row.ME}</BuildTableCell><BuildTableCell>{row.AE}</BuildTableCell><BuildTableCell>{row.BE}</BuildTableCell><BuildTableCell>{row.entered}</BuildTableCell><BuildTableCell>{row.unmarkedRoster}</BuildTableCell></tr>)}
                <tr className="font-semibold"><BuildTableCell>All learning areas</BuildTableCell><BuildTableCell>{totals.EE}</BuildTableCell><BuildTableCell>{totals.ME}</BuildTableCell><BuildTableCell>{totals.AE}</BuildTableCell><BuildTableCell>{totals.BE}</BuildTableCell><BuildTableCell>{totals.entered}</BuildTableCell><BuildTableCell>{totals.unmarkedRoster}</BuildTableCell></tr>
              </tbody>
            </table></div>}
          </PrintableReport>
        )}
      </div>
    </div>
  );
}

export function CbeReportsPage({ route }: { route: string }) {
  const { students, ready } = useCbeReports();

  if (!ready) {
    return <div className="h-40 animate-pulse rounded-2xl border border-academic-line bg-academic-paper" />;
  }

  if (students.length === 0) {
    return (
      <div className="space-y-6">
        <header className="rounded-2xl border border-academic-line bg-academic-surface p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-academic-accent">Academic workspace</p>
          <h1 className="mt-2 font-display text-3xl text-academic-ink">{ROUTE_TITLES[route] ?? "CBE Reports"}</h1>
        </header>
        <ReportPlaceholder text="No CBE learners are registered for reporting." />
      </div>
    );
  }

  const content =
    route === "end-term-reports"
      ? <EndTermReportsScreen route={route} />
      : route === "subject-analysis-marks"
        ? <SubjectAnalysisMarksScreen route={route} />
        : route === "marks-correction-sheet"
          ? <MarksCorrectionSheetScreen route={route} />
          : route === "subject-champions"
            ? <SubjectChampionsScreen route={route} />
            : route === "rank-students-by-subject"
              ? <RankStudentsBySubjectScreen route={route} />
              : route === "subjects-grade-count"
                ? <SubjectsGradeCountScreen route={route} />
                : <div className="rounded-2xl border border-dashed border-academic-line bg-academic-paper p-6 text-sm text-academic-ink-soft">No screen is configured for this CBE Reports route.</div>;

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-academic-line bg-academic-surface p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-academic-accent">Academic workspace</p>
            <h1 className="mt-2 font-display text-3xl text-academic-ink">{ROUTE_TITLES[route] ?? "CBE Reports"}</h1>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-academic-line bg-[#20252a] px-3 py-2 text-sm text-white shadow-sm">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#d9d9d9] text-xs font-semibold text-[#1b2328]">M</span>
            <span>Mike</span>
          </div>
        </div>
      </header>
      {content}
    </div>
  );
}