export const ACADEMIC_TERMS = ["Term 1", "Term 2", "Term 3"] as const;
export type AcademicTerm = (typeof ACADEMIC_TERMS)[number];

export const CURRENT_ACADEMIC_YEAR = new Date().getFullYear();

export const ACADEMIC_YEARS = Array.from(
  { length: 5 },
  (_, index) => CURRENT_ACADEMIC_YEAR - 2 + index,
);
