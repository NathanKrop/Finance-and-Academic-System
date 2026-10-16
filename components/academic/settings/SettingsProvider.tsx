"use client";

import { createContext, useContext, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { SETTINGS_DEFAULTS, type SettingsState, type SchoolTerm } from "@/lib/academic/settings-defaults";

const STORAGE_KEY = "settings:portal-v1";

type SettingsContextValue = {
  state: SettingsState;
  ready: boolean;
  setState: Dispatch<SetStateAction<SettingsState>>;
  setSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  updateCalendar: (entry: { term: SchoolTerm; year: number; closingDate: string; nextOpening: string }) => void;
  resetToDefaults: () => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SettingsState>(SETTINGS_DEFAULTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let restored = SETTINGS_DEFAULTS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<SettingsState>;
        restored = {
          ...SETTINGS_DEFAULTS,
          ...parsed,
          overallMarks: { ...SETTINGS_DEFAULTS.overallMarks, ...(parsed.overallMarks ?? {}) },
          subjectRanking: { ...SETTINGS_DEFAULTS.subjectRanking, ...(parsed.subjectRanking ?? {}) },
          reportComments: { ...SETTINGS_DEFAULTS.reportComments, ...(parsed.reportComments ?? {}) },
          subjectComments: { ...SETTINGS_DEFAULTS.subjectComments, ...(parsed.subjectComments ?? {}) },
          subjectGrading: { ...SETTINGS_DEFAULTS.subjectGrading, ...(parsed.subjectGrading ?? {}) },
          openingClosingDates: parsed.openingClosingDates ?? SETTINGS_DEFAULTS.openingClosingDates,
          studentsPortal: { ...SETTINGS_DEFAULTS.studentsPortal, ...(parsed.studentsPortal ?? {}) },
        };
      }
    } catch {
      restored = SETTINGS_DEFAULTS;
    }

    queueMicrotask(() => {
      setState(restored);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (ready) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [ready, state]);

  const setSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setState((current) => ({ ...current, [key]: value }));
  };

  const updateCalendar = (entry: { term: SchoolTerm; year: number; closingDate: string; nextOpening: string }) => {
    setState((current) => {
      const rows = current.openingClosingDates.filter((item) => !(item.term === entry.term && item.year === entry.year));
      return {
        ...current,
        openingClosingDates: [...rows, entry].sort((first, second) => {
          if (first.year !== second.year) return first.year - second.year;
          return ["Term 1", "Term 2", "Term 3"].indexOf(first.term) - ["Term 1", "Term 2", "Term 3"].indexOf(second.term);
        }),
      };
    });
  };

  const resetToDefaults = () => setState(SETTINGS_DEFAULTS);

  const value = useMemo<SettingsContextValue>(() => ({
    state,
    ready,
    setState,
    setSetting,
    updateCalendar,
    resetToDefaults,
  }), [ready, state]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettingsData() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettingsData must be used within SettingsProvider");
  }
  return context;
}
