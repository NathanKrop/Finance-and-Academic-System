"use client";

import { createContext, useContext, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { INITIAL_REGISTRATION_DATA, type RegistrationData } from "@/lib/academic/registration-data";

const STORAGE_KEY = "kendi-academic-registration-preview-v1";

const RegistrationContext = createContext<{
  data: RegistrationData;
  setData: Dispatch<SetStateAction<RegistrationData>>;
  ready: boolean;
} | null>(null);

function isRegistrationData(value: unknown): value is Partial<RegistrationData> {
  return typeof value === "object" && value !== null;
}

export function RegistrationProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState(INITIAL_REGISTRATION_DATA);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let restoredData = INITIAL_REGISTRATION_DATA;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (isRegistrationData(parsed)) {
          restoredData = {
            ...INITIAL_REGISTRATION_DATA,
            ...parsed,
            school: { ...INITIAL_REGISTRATION_DATA.school, ...parsed.school },
          };
        }
      }
    } catch {
      restoredData = INITIAL_REGISTRATION_DATA;
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
    <RegistrationContext.Provider value={{ data, setData, ready }}>
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistrationData() {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error("useRegistrationData must be used within RegistrationProvider");
  }
  return context;
}