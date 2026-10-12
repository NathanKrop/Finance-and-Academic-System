export type CbeReportStudent = {
  id: string;
  admNo: string;
  name: string;
  grade: string;
  stream: string;
  pathway: string;
  gender: string;
  teacher: string;
};

export type CbeReportMark = {
  admNo: string;
  examId: string;
  year: number;
  term: string;
  exam: string;
  subject: string;
  score: number;
  grade: string;
};

export type CbeReportScope = {
  grade: string;
  stream?: string;
  pathway?: string;
  year: number;
  term: string;
  examId?: string;
  exam: string;
  studentQuery?: string;
};

export type CbeReportRow = CbeReportStudent & {
  marks: CbeReportMark[];
  total: number;
  mean: number;
};

export function getCompetitionRanks<T>(rows: T[], getScore: (row: T) => number): number[] {
  const ranks: number[] = [];
  rows.forEach((row, index) => {
    ranks.push(index === 0 || getScore(row) !== getScore(rows[index - 1]) ? index + 1 : ranks[index - 1]);
  });
  return ranks;
}

export function getCbeReportRows(
  students: CbeReportStudent[],
  marks: CbeReportMark[],
  scope: CbeReportScope,
): CbeReportRow[] {
  const query = scope.studentQuery?.trim().toLowerCase() ?? "";

  return students
    .filter((student) => {
      const queryMatches = !query
        || student.admNo.toLowerCase().includes(query)
        || student.name.toLowerCase().includes(query);

      return student.grade === scope.grade
        && (!scope.stream || student.stream === scope.stream)
        && (!scope.pathway || scope.pathway === "All Pathways" || student.pathway === scope.pathway)
        && queryMatches;
    })
    .map((student) => {
      const studentMarks = marks.filter((mark) => mark.admNo === student.admNo
        && mark.year === scope.year
        && mark.term === scope.term
        && (!scope.examId || mark.examId === scope.examId)
        && mark.exam === scope.exam);
      const total = studentMarks.reduce((sum, mark) => sum + mark.score, 0);

      return {
        ...student,
        marks: studentMarks,
        total,
        mean: studentMarks.length > 0 ? total / studentMarks.length : 0,
      };
    });
}
