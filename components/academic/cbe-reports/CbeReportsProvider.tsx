"use client";

import { createContext, useContext, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { useExaminationsData } from "@/components/academic/examinations/ExaminationsProvider";
import { useRegistrationData } from "@/components/academic/registration/RegistrationProvider";
import { getRubric } from "@/lib/academic/cbe-grading";
import { mapSavedAssessmentMarks } from "@/lib/academic/cbe-report-data";
import { getCbeReportMockData } from "@/lib/academic/cbe-reports-mock";

const STORAGE_KEY = "kendi-cbe-reports-v1";

export type CbeReportRouteFilters = Record<string, string | number | boolean>;
export type CbeReportExamOption = { id: string; title: string; year: number; term: string; grades: string[]; startDate?: string };

type CbeReportsContextValue = {
  students: Array<{ id: string; admNo: string; name: string; grade: string; stream: string; pathway: string; gender: string; teacher: string }>;
  marks: Array<{ admNo: string; examId: string; year: number; term: string; exam: string; subject: string; score: number; grade: string }>;
  streams: string[];
  grades: string[];
  examOptions: CbeReportExamOption[];
  years: number[];
  subjectPathways: Record<string, string[]>;
  subjects: string[];
  pathways: string[];
  isPreviewData: boolean;
  filters: Record<string, CbeReportRouteFilters>;
  setFilter: (route: string, key: string, value: string | number | boolean) => void;
  setFilters: Dispatch<SetStateAction<Record<string, CbeReportRouteFilters>>>;
  ready: boolean;
};

const CbeReportsContext = createContext<CbeReportsContextValue | null>(null);

export function CbeReportsProvider({ children }: { children: React.ReactNode }) {
  const { data: regData, ready: registrationReady } = useRegistrationData();
  const { data: examData, ready: examinationsReady } = useExaminationsData();
  const [filters, setFilters] = useState<Record<string, CbeReportRouteFilters>>({});
  const [filtersReady, setFiltersReady] = useState(false);
  const ready = registrationReady && examinationsReady && filtersReady;

  useEffect(() => {
    let restoredFilters: Record<string, CbeReportRouteFilters> = {};
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object") {
          restoredFilters = parsed;
        }
      }
    } catch {
      restoredFilters = {};
    }

    queueMicrotask(() => {
      setFilters(restoredFilters);
      setFiltersReady(true);
    });
  }, []);

  useEffect(() => {
    if (ready) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    }
  }, [filters, ready]);

  const fallback = useMemo(() => getCbeReportMockData(), []);
  const isPreviewData = ready && regData.students.length === 0;

  const students = useMemo(() => {
    if (!ready) return [];

    const mapped = isPreviewData
      ? fallback.students
      : regData.students.filter((student) => student.curriculum === "CBE");
    return mapped.map((student) => {
      const streamId = "streamId" in student ? student.streamId : undefined;
      const streamName = typeof streamId === "string"
        ? regData.streams.find((stream) => stream.id === streamId)?.name ?? "UNKNOWN"
        : "stream" in student
          ? student.stream
          : "UNKNOWN";

      const grade = "gradeAdmitted" in student
        ? student.gradeAdmitted || student.formAdmitted
        : student.grade;

      const teacherName = typeof streamId === "string"
        ? regData.teachers.find((teacher) => teacher.id === regData.streams.find((stream) => stream.id === streamId)?.teacherId)?.name ?? "Class Teacher"
        : "teacher" in student
          ? student.teacher
          : "Class Teacher";

      return {
        id: student.id,
        admNo: student.admNo,
        name: student.name,
        grade,
        stream: streamName,
        pathway: student.pathway,
        gender: student.gender,
        teacher: teacherName,
      };
    });
  }, [fallback.students, isPreviewData, ready, regData.streams, regData.students, regData.teachers]);

  const marks = useMemo(() => isPreviewData
    ? fallback.marks
    : mapSavedAssessmentMarks(
      examData.assessmentMarks,
      examData.exams.filter((exam) => !exam.archivedAt),
      (score) => getRubric(score).label,
    ), [examData.assessmentMarks, examData.exams, fallback.marks, isPreviewData]);

  const streams = useMemo(() => Array.from(new Set(students.map((student) => student.stream))).filter(Boolean), [students]);
  const grades = useMemo(() => Array.from(new Set(students.map((student) => student.grade))).filter(Boolean), [students]);
  const examOptions = useMemo<CbeReportExamOption[]>(() => {
    if (isPreviewData) {
      const grouped = new Map<string, CbeReportExamOption>();
      marks.forEach((mark) => {
        const key = mark.examId;
        const grade = students.find((student) => student.admNo === mark.admNo)?.grade;
        const existing = grouped.get(key);
        if (!existing) {
          grouped.set(key, { id: mark.examId, title: mark.exam, year: mark.year, term: mark.term, grades: grade ? [grade] : [] });
        } else if (grade && !existing.grades.includes(grade)) {
          grouped.set(key, { ...existing, grades: [...existing.grades, grade] });
        }
      });
      return Array.from(grouped.values());
    }

    return examData.exams
      .filter((exam) => !exam.archivedAt)
      .map((exam) => ({ id: exam.id, title: exam.title, year: exam.year, term: exam.term, grades: exam.forms, startDate: exam.startDate }));
  }, [examData.exams, isPreviewData, marks, students]);
  const years = useMemo(() => {
    const availableYears = Array.from(new Set(examOptions.map((exam) => exam.year))).sort((first, second) => second - first);
    return availableYears.length ? availableYears : [new Date().getFullYear()];
  }, [examOptions]);
  const pathways = useMemo(() => ["All Pathways", "STEM", "Social Sciences", "Arts & Sports Science"], []);
  const subjects = useMemo(() => {
    const configuredSubjects = isPreviewData
      ? marks.map((mark) => mark.subject)
      : regData.subjectsCbe.map((subject) => subject.name);
    return Array.from(new Set(configuredSubjects)).filter(Boolean).sort((first, second) => first.localeCompare(second));
  }, [isPreviewData, marks, regData.subjectsCbe]);
  const subjectPathways = useMemo(() => {
    if (!isPreviewData) {
      return Object.fromEntries(regData.subjectsCbe.map((subject) => [subject.name, subject.pathways]));
    }

    const pathwaysBySubject = new Map<string, Set<string>>();
    marks.forEach((mark) => {
      const studentPathway = students.find((student) => student.admNo === mark.admNo)?.pathway;
      if (!studentPathway) return;
      const pathwaysForSubject = pathwaysBySubject.get(mark.subject) ?? new Set<string>();
      pathwaysForSubject.add(studentPathway);
      pathwaysBySubject.set(mark.subject, pathwaysForSubject);
    });
    return Object.fromEntries(Array.from(pathwaysBySubject, ([subject, subjectValues]) => [subject, Array.from(subjectValues)]));
  }, [isPreviewData, marks, regData.subjectsCbe, students]);

  const setFilter = (route: string, key: string, value: string | number | boolean) => {
    setFilters((current) => ({
      ...current,
      [route]: {
        ...(current[route] ?? {}),
        [key]: value,
      },
    }));
  };

  const value = useMemo<CbeReportsContextValue>(
    () => ({
      students,
      marks,
      streams,
      grades,
      examOptions,
      years,
      subjectPathways,
      subjects,
      pathways,
      isPreviewData,
      filters,
      setFilter,
      setFilters,
      ready,
    }),
    [examOptions, filters, grades, isPreviewData, marks, pathways, ready, streams, students, subjectPathways, subjects, years],
  );

  return <CbeReportsContext.Provider value={value}>{children}</CbeReportsContext.Provider>;
}

export function useCbeReports() {
  const context = useContext(CbeReportsContext);
  if (!context) {
    throw new Error("useCbeReports must be used within CbeReportsProvider");
  }
  return context;
}
