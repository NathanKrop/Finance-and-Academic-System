export type SchoolTerm = "Term 1" | "Term 2" | "Term 3";

export type GradeBand = "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D+" | "D" | "D-" | "E";

export type ReportComment = {
  principal: string;
  teacher: string;
};

export type SubjectCommentMap = Record<string, string>;

export type SubjectGradeMap = Record<GradeBand, string>;

export type SchoolCalendarEntry = {
  term: SchoolTerm;
  year: number;
  closingDate: string;
  nextOpening: string;
};

export type SettingsState = {
  currentTerm: SchoolTerm;
  currentYear: number;
  overallMarks: Record<string, number[]>;
  subjectRanking: Record<string, Record<string, number>>;
  reportComments: Record<GradeBand, ReportComment>;
  subjectComments: Record<string, SubjectCommentMap>;
  subjectGrading: Record<string, Record<string, number>>;
  openingClosingDates: SchoolCalendarEntry[];
  feesArrears: Record<string, Record<string, number>>;
  studentsPortal: Record<string, { year: number; term: SchoolTerm; exam: string }>;
};

export const SETTINGS_VERSION = 1;

export const DEFAULT_OVERALL_MARKS: Record<string, number[]> = {
  "Form 1": [80, 75, 70, 65, 60, 50, 45, 40, 35, 30, 20, 0],
  "Form 2": [80, 75, 70, 65, 60, 50, 50, 40, 35, 30, 20, 0],
  "Form 3": [80, 75, 70, 65, 60, 50, 50, 40, 35, 30, 20, 0],
  "Form 4": [80, 75, 70, 65, 60, 50, 50, 40, 35, 30, 20, 0],
};

export const DEFAULT_SUBJECT_RANKING: Record<string, Record<string, number>> = {
  "Group 1": { "Form 1": 3, "Form 2": 3, "Form 3": 3, "Form 4": 3 },
  "Group 2": { "Form 1": 2, "Form 2": 2, "Form 3": 2, "Form 4": 2 },
  "Group 3": { "Form 1": 1, "Form 2": 1, "Form 3": 1, "Form 4": 1 },
  "Any Other Best": { "Form 1": 1, "Form 2": 1, "Form 3": 1, "Form 4": 1 },
};

export const DEFAULT_REPORT_COMMENTS: Record<GradeBand, ReportComment> = {
  A: { principal: "Excellent work. Keep it up.", teacher: "Quite impressive. Keep up the good work." },
  "A-": { principal: "Very good scores. Aim at A plain.", teacher: "Well done. Aim at scoring grade A." },
  "B+": { principal: "Good work but aim higher, you have the potential.", teacher: "Good work but aim higher for higher grades." },
  B: { principal: "Good, but aim higher, you are capable of more.", teacher: "Good work but aim higher, you have the potential." },
  "B-": { principal: "Good work but aim higher, you are capable of more.", teacher: "Good work but aim higher, you have the potential." },
  "C+": { principal: "Average but work harder, you can do much better.", teacher: "Average work, work harder than this, you can improve." },
  C: { principal: "Average but work harder, you are capable of more.", teacher: "Average, but work harder, there is a lot of room to improve." },
  "C-": { principal: "You can do much better than this, you have the ability.", teacher: "You are capable of doing better than this." },
  "D+": { principal: "You have the potential to do better; you must put in more effort.", teacher: "You need to work harder for better results." },
  D: { principal: "You must work harder; seek help from your teachers.", teacher: "You need to work harder; you have the ability." },
  "D-": { principal: "You must change your attitude towards your work.", teacher: "Not impressive. You need to improve." },
  E: { principal: "Your attitude to your work is not right; you must change.", teacher: "Your work is not impressive, you must work much harder." },
};

export const DEFAULT_SUBJECT_COMMENTS: Record<string, SubjectCommentMap> = {
  ENG: { A: "Excellent performance", "A-": "Very good performance", "B+": "Good, can do better", B: "Good, can do better", "B-": "Satisfactory", "C+": "Can do better", C: "Can do better", "C-": "Put more effort", "D+": "Can do better", D: "Can do better", "D-": "Put more effort", E: "Weak but can improve" },
  KIS: { A: "Excellent performance", "A-": "Very good performance", "B+": "Good, can do better", B: "Good, can do better", "B-": "Satisfactory", "C+": "Can do better", C: "Can do better", "C-": "Put more effort", "D+": "Can do better", D: "Can do better", "D-": "Put more effort", E: "Weak but can improve" },
  MAT: { A: "Excellent performance", "A-": "Very good performance", "B+": "Good, can do better", B: "Good, can do better", "B-": "Satisfactory", "C+": "Can do better", C: "Can do better", "C-": "Put more effort", "D+": "Can do better", D: "Can do better", "D-": "Put more effort", E: "Weak but can improve" },
  BIO: { A: "Excellent performance", "A-": "Very good performance", "B+": "Good, can do better", B: "Good, can do better", "B-": "Satisfactory", "C+": "Can do better", C: "Can do better", "C-": "Put more effort", "D+": "Can do better", D: "Can do better", "D-": "Put more effort", E: "Weak but can improve" },
  CHEM: { A: "Excellent performance", "A-": "Very good performance", "B+": "Good, can do better", B: "Good, can do better", "B-": "Satisfactory", "C+": "Can do better", C: "Can do better", "C-": "Put more effort", "D+": "Can do better", D: "Can do better", "D-": "Put more effort", E: "Weak but can improve" },
  PHY: { A: "Excellent performance", "A-": "Very good performance", "B+": "Good, can do better", B: "Good, can do better", "B-": "Satisfactory", "C+": "Can do better", C: "Can do better", "C-": "Put more effort", "D+": "Can do better", D: "Can do better", "D-": "Put more effort", E: "Weak but can improve" },
  CRE: { A: "Excellent performance", "A-": "Very good performance", "B+": "Good, can do better", B: "Good, can do better", "B-": "Satisfactory", "C+": "Can do better", C: "Can do better", "C-": "Put more effort", "D+": "Can do better", D: "Can do better", "D-": "Put more effort", E: "Weak but can improve" },
  GEO: { A: "Excellent performance", "A-": "Very good performance", "B+": "Good, can do better", B: "Good, can do better", "B-": "Satisfactory", "C+": "Can do better", C: "Can do better", "C-": "Put more effort", "D+": "Can do better", D: "Can do better", "D-": "Put more effort", E: "Weak but can improve" },
  HIST: { A: "Excellent performance", "A-": "Very good performance", "B+": "Good, can do better", B: "Good, can do better", "B-": "Satisfactory", "C+": "Can do better", C: "Can do better", "C-": "Put more effort", "D+": "Can do better", D: "Can do better", "D-": "Put more effort", E: "Weak but can improve" },
  AGRI: { A: "Excellent performance", "A-": "Very good performance", "B+": "Good, can do better", B: "Good, can do better", "B-": "Satisfactory", "C+": "Can do better", C: "Can do better", "C-": "Put more effort", "D+": "Can do better", D: "Can do better", "D-": "Put more effort", E: "Weak but can improve" },
  COMP: { A: "Excellent performance", "A-": "Very good performance", "B+": "Good, can do better", B: "Good, can do better", "B-": "Satisfactory", "C+": "Can do better", C: "Can do better", "C-": "Put more effort", "D+": "Can do better", D: "Can do better", "D-": "Put more effort", E: "Weak but can improve" },
  HSC: { A: "Excellent performance", "A-": "Very good performance", "B+": "Good, can do better", B: "Good, can do better", "B-": "Satisfactory", "C+": "Can do better", C: "Can do better", "C-": "Put more effort", "D+": "Can do better", D: "Can do better", "D-": "Put more effort", E: "Weak but can improve" },
  BST: { A: "Excellent performance", "A-": "Very good performance", "B+": "Good, can do better", B: "Good, can do better", "B-": "Satisfactory", "C+": "Can do better", C: "Can do better", "C-": "Put more effort", "D+": "Can do better", D: "Can do better", "D-": "Put more effort", E: "Weak but can improve" },
};

export const DEFAULT_SUBJECT_GRADING: Record<string, Record<string, number>> = {
  "Form 1": {
    ENG: 80, MAT: 75, KIS: 70, BIO: 65, CHEM: 60, PHY: 50, CRE: 45, GEO: 40, HIST: 35, AGRI: 30, COMP: 20,
  },
  "Form 2": {
    ENG: 80, MAT: 75, KIS: 70, BIO: 65, CHEM: 60, PHY: 50, CRE: 45, GEO: 40, HIST: 35, AGRI: 30, COMP: 20,
  },
  "Form 3": {
    ENG: 80, MAT: 75, KIS: 70, BIO: 65, CHEM: 60, PHY: 50, CRE: 45, GEO: 40, HIST: 35, AGRI: 30, COMP: 20,
  },
  "Form 4": {
    ENG: 80, MAT: 75, KIS: 70, BIO: 65, CHEM: 60, PHY: 50, CRE: 45, GEO: 40, HIST: 35, AGRI: 30, COMP: 20,
  },
};

export const SETTINGS_DEFAULTS: SettingsState = {
  currentTerm: "Term 3",
  currentYear: 2026,
  overallMarks: DEFAULT_OVERALL_MARKS,
  subjectRanking: DEFAULT_SUBJECT_RANKING,
  reportComments: DEFAULT_REPORT_COMMENTS,
  subjectComments: DEFAULT_SUBJECT_COMMENTS,
  subjectGrading: DEFAULT_SUBJECT_GRADING,
  openingClosingDates: [
    { term: "Term 3", year: 2022, closingDate: "2022-11-21", nextOpening: "2023-01-24" },
    { term: "Term 1", year: 2023, closingDate: "2023-04-19", nextOpening: "2023-05-09" },
    { term: "Term 2", year: 2023, closingDate: "2023-08-05", nextOpening: "2023-08-31" },
    { term: "Term 3", year: 2023, closingDate: "2023-10-20", nextOpening: "2024-01-09" },
    { term: "Term 1", year: 2024, closingDate: "2024-03-27", nextOpening: "2024-04-20" },
    { term: "Term 2", year: 2024, closingDate: "2024-08-01", nextOpening: "2024-08-27" },
    { term: "Term 3", year: 2024, closingDate: "2024-10-18", nextOpening: "2025-01-08" },
    { term: "Term 1", year: 2025, closingDate: "2025-03-28", nextOpening: "2025-04-29" },
    { term: "Term 2", year: 2025, closingDate: "2025-07-31", nextOpening: "2025-08-26" },
    { term: "Term 3", year: 2025, closingDate: "2025-10-17", nextOpening: "2026-01-06" },
    { term: "Term 1", year: 2026, closingDate: "2026-04-01", nextOpening: "2026-04-28" },
    { term: "Term 2", year: 2026, closingDate: "2026-08-05", nextOpening: "2026-08-25" },
  ],
  feesArrears: {},
  studentsPortal: {
    "Form 1": { year: 2022, term: "Term 3", exam: "END YEAR EXAM" },
    "Form 2": { year: 2022, term: "Term 3", exam: "END YEAR EXAM" },
    "Form 3": { year: 2022, term: "Term 3", exam: "END YEAR EXAM" },
    "Form 4": { year: 2022, term: "Term 3", exam: "END YEAR EXAM" },
    "Grade 10": { year: 2022, term: "Term 3", exam: "END YEAR EXAM" },
  },
};
