export const EXAM_TYPES = ["Other", "CAT"] as const;
export type ExamType = (typeof EXAM_TYPES)[number] | "KCSE";

export const EXAM_TERMS = ["Term 1", "Term 2", "Term 3"] as const;
export type AcademicExamTerm = (typeof EXAM_TERMS)[number];

export type ExamFormSelection = "Grade 10" | "Grade 11" | string;

export type AcademicExam = {
  id: string;
  year: number;
  term: AcademicExamTerm;
  type: ExamType;
  title: string;
  startDate: string;
  endDate: string;
  outOf: number;
  marksDeadline: string;
  allowTeacherOutOf: boolean;
  forms: ExamFormSelection[];
  archivedAt: string | null;
  createdAt: string;
};

export type ExaminationsToolSettings = Record<string, boolean>;

export type ExaminationsData = {
  exams: AcademicExam[];
  toolSettings: ExaminationsToolSettings;
  rankingCriteria: Record<string, Record<string, Record<string, number>>>;
};

export function newExaminationId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `exam-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const INITIAL_EXAMINATIONS_DATA: ExaminationsData = {
  exams: [
    {
      id: "exam-opener-1",
      year: new Date().getFullYear(),
      term: "Term 1",
      type: "Other",
      title: "OPENER EXAM",
      startDate: "2026-01-12",
      endDate: "2026-01-16",
      outOf: 100,
      marksDeadline: "2026-01-18",
      allowTeacherOutOf: false,
      forms: ["Grade 10", "Grade 11"],
      archivedAt: null,
      createdAt: "2026-01-08",
    },
    {
      id: "exam-cat-1",
      year: new Date().getFullYear(),
      term: "Term 2",
      type: "CAT",
      title: "CAT 1",
      startDate: "2026-05-04",
      endDate: "2026-05-08",
      outOf: 50,
      marksDeadline: "2026-05-11",
      allowTeacherOutOf: true,
      forms: ["Grade 11"],
      archivedAt: null,
      createdAt: "2026-05-01",
    },
  ],
  toolSettings: {
    "exams.schedule": true,
    "exams.students_portal": true,
    "exams.marks_subject": true,
    "exams.marks_paper": true,
    "exams.marks_student": true,
  },
  rankingCriteria: {
    "Grade 10": {
      "Group 2": { "Col 1": 2, "Col 2": 2, "Col 3": 2, "Col 4": 2 },
      "Group 3": { "Col 1": 1, "Col 2": 1, "Col 3": 1, "Col 4": 1 },
      "Any Other Best": { "Col 1": 1, "Col 2": 1, "Col 3": 1, "Col 4": 1 },
    },
    "Grade 11": {
      "Group 2": { "Col 1": 2, "Col 2": 2, "Col 3": 2, "Col 4": 2 },
      "Group 3": { "Col 1": 1, "Col 2": 1, "Col 3": 1, "Col 4": 1 },
      "Any Other Best": { "Col 1": 1, "Col 2": 1, "Col 3": 1, "Col 4": 1 },
    },
  },
};
