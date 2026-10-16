export type SeedSubmissionInput = {
  assignmentId: string;
  admNo: string;
  name: string;
  answers?: string[];
  submittedAt?: string;
  status?: "unmarked" | "marked";
  comment?: string;
};

export function seedMockSubmissions(submissions: SeedSubmissionInput[]) {
  return submissions.map((submission, index) => ({
    id: `submission-${submission.assignmentId}-${submission.admNo}-${index}`,
    assignmentId: submission.assignmentId,
    admNo: submission.admNo,
    name: submission.name,
    answers: submission.answers ?? ["Sample response"],
    submittedAt: submission.submittedAt ?? new Date().toISOString(),
    status: submission.status ?? "unmarked",
    perQuestionScores: submission.answers ? submission.answers.map(() => 0) : [0],
    total: 0,
    comment: submission.comment ?? "",
  }));
}
