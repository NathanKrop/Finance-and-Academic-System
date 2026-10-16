import { DEFAULT_REPORT_COMMENTS, DEFAULT_SUBJECT_COMMENTS, DEFAULT_OVERALL_MARKS } from "@/lib/academic/settings-defaults";

export const GRADE_ORDER = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "E"] as const;
export type GradeValue = (typeof GRADE_ORDER)[number];

export function getOverallGrade(formLevel: string, score: number): string {
  const thresholds = DEFAULT_OVERALL_MARKS[formLevel] ?? DEFAULT_OVERALL_MARKS["Form 1"];
  let grade: string = "E";

  for (let index = 0; index < thresholds.length; index += 1) {
    if (score >= thresholds[index]) {
      grade = GRADE_ORDER[index];
      break;
    }
  }

  return grade;
}

export function getFormComment(meanGrade: string) {
  const key = meanGrade as keyof typeof DEFAULT_REPORT_COMMENTS;
  return DEFAULT_REPORT_COMMENTS[key] ?? DEFAULT_REPORT_COMMENTS["E"];
}

export function getAutoComment(subject: string, grade: string) {
  const comment = DEFAULT_SUBJECT_COMMENTS[subject]?.[grade as keyof typeof DEFAULT_REPORT_COMMENTS];
  return comment ?? getFormComment(grade).teacher;
}
