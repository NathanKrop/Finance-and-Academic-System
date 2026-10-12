export type CbeMockStudent = {
  id: string;
  admNo: string;
  name: string;
  gender: "Male" | "Female";
  grade: string;
  stream: string;
  pathway: string;
  teacher: string;
};

export type CbeMockMarks = {
  id: string;
  admNo: string;
  examId: string;
  year: number;
  term: string;
  exam: string;
  subject: string;
  score: number;
  grade: string;
};

export const CBE_REPORT_MOCK_STUDENTS: CbeMockStudent[] = [
  { id: "cbe-preview-001", admNo: "CBE-001", name: "Faith Njeri", gender: "Female", grade: "Grade 10", stream: "STEM ROOM 1", pathway: "STEM", teacher: "Dennis Kiptoo" },
];

export const CBE_REPORT_MOCK_MARKS: CbeMockMarks[] = [
  { id: "cbe-mark-preview-001", admNo: "CBE-001", examId: "preview-grade10-midterm-2026-term3", year: 2026, term: "Term 3", exam: "Mid Term Exam", subject: "Mathematics", score: 80, grade: "EE1" },
];

export function getCbeReportMockData() {
  return {
    students: CBE_REPORT_MOCK_STUDENTS,
    marks: CBE_REPORT_MOCK_MARKS,
  };
}
