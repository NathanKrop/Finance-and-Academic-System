"use client";

import { createContext, useContext, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { INITIAL_EXAMINATIONS_DATA, type ExaminationsData } from "@/lib/academic/examinations-data";

const STORAGE_KEY = "kendi-academic-examinations-v1";

const ExaminationsContext = createContext<{
  data: ExaminationsData;
  setData: Dispatch<SetStateAction<ExaminationsData>>;
  ready: boolean;
} | null>(null);

function isExaminationsData(value: unknown): value is Partial<ExaminationsData> {
  return typeof value === "object" && value !== null;
}

export function ExaminationsProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState(INITIAL_EXAMINATIONS_DATA);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let restoredData = INITIAL_EXAMINATIONS_DATA;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (isExaminationsData(parsed)) {
          restoredData = {
            ...INITIAL_EXAMINATIONS_DATA,
            ...parsed,
            toolSettings: { ...INITIAL_EXAMINATIONS_DATA.toolSettings, ...(parsed.toolSettings ?? {}) },
            rankingCriteria: { ...INITIAL_EXAMINATIONS_DATA.rankingCriteria, ...(parsed.rankingCriteria ?? {}) },
          };
        }
      }
    } catch {
      restoredData = INITIAL_EXAMINATIONS_DATA;
    }

    queueMicrotask(() => {
      setData(restoredData);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (ready) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, ready]);

  return (
    <ExaminationsContext.Provider value={{ data, setData, ready }}>
      {children}
    </ExaminationsContext.Provider>
  );
}

export function useExaminationsData() {
  const context = useContext(ExaminationsContext);
  if (!context) {
    throw new Error("useExaminationsData must be used within ExaminationsProvider");
  }
  return context;
}
