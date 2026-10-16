"use client";

import { createContext, useContext, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";

export type AssignmentQuestionType = "text" | "choice";

export type AssignmentQuestion = {
  id: string;
  text: string;
  marks: number;
  type: AssignmentQuestionType;
  choices: string[];
  correctChoiceIndex: number | null;
  attachmentRef?: string | null;
};

export type AssignmentRecord = {
  id: string;
  form: string;
  subject: string;
  streams: string[];
  instructions: string;
  questions: AssignmentQuestion[];
  totalMarks: number;
  postedBy: string;
  postedAt: string;
  term: string;
  year: number;
};

export type NoteRecord = {
  id: string;
  className: string;
  subject: string;
  topic: string;
  instructions: string;
  fileRef?: string | null;
  postedBy: string;
  postedAt: string;
  term: string;
  year: number;
};

export type SubmissionRecord = {
  id: string;
  assignmentId: string;
  admNo: string;
  name: string;
  answers: string[];
  submittedAt: string;
  status: "unmarked" | "marked";
  perQuestionScores: number[];
  total: number;
  comment?: string;
};

export type AutoLoginLinkRecord = {
  id: string;
  admNo: string;
  createdAt: string;
  expiresAt: string;
  revoked: boolean;
  portal: "notes-assignments";
};

export type NotesAssignmentsState = {
  assignments: AssignmentRecord[];
  notes: NoteRecord[];
  submissions: SubmissionRecord[];
  autoLoginLinks: AutoLoginLinkRecord[];
};

const STORAGE_KEY = "na:state-v1";
const FILE_DB_NAME = "kendi-na-files";
const FILE_STORE_NAME = "files";

const DEFAULT_NOTES_ASSIGNMENTS_STATE: NotesAssignmentsState = {
  assignments: [],
  notes: [],
  submissions: [],
  autoLoginLinks: [],
};

const NotesAssignmentsContext = createContext<{
  state: NotesAssignmentsState;
  setState: Dispatch<SetStateAction<NotesAssignmentsState>>;
  ready: boolean;
  addAssignment: (assignment: AssignmentRecord) => void;
  updateAssignment: (id: string, assignment: AssignmentRecord) => void;
  deleteAssignment: (id: string) => void;
  addNote: (note: NoteRecord) => void;
  updateNote: (id: string, note: NoteRecord) => void;
  deleteNote: (id: string) => void;
  addSubmission: (submission: SubmissionRecord) => void;
  updateSubmission: (id: string, overrides: Partial<SubmissionRecord>) => void;
  generateAutoLoginLink: (admNo: string) => Promise<{ url: string; record: AutoLoginLinkRecord }>;
  revokeAutoLoginLink: (admNo: string) => Promise<void>;
  putFileBlob: (file: File) => Promise<string>;
  getFileBlob: (id: string) => Promise<Blob | null>;
  deleteFileBlob: (id: string) => Promise<void>;
} | null>(null);

function isNotesAssignmentsState(value: unknown): value is Partial<NotesAssignmentsState> {
  return typeof value === "object" && value !== null;
}

function createFileRecordId() {
  return globalThis.crypto?.randomUUID?.() ?? `file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function openFileStore(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      reject(new Error("IndexedDB is unavailable in this environment."));
      return;
    }

    const request = window.indexedDB.open(FILE_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(FILE_STORE_NAME)) {
        db.createObjectStore(FILE_STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Unable to open the file store."));
  });
}

export async function putFileBlob(file: File): Promise<string> {
  const db = await openFileStore();
  const fileId = createFileRecordId();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(FILE_STORE_NAME, "readwrite");
    transaction.objectStore(FILE_STORE_NAME).put({
      id: fileId,
      name: file.name,
      mimeType: file.type,
      size: file.size,
      createdAt: new Date().toISOString(),
      blob: file,
    });
    transaction.oncomplete = () => resolve(fileId);
    transaction.onerror = () => reject(transaction.error ?? new Error("Unable to store the file."));
  });
}

export async function getFileBlob(fileId: string): Promise<Blob | null> {
  const db = await openFileStore();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(FILE_STORE_NAME, "readonly");
    const request = transaction.objectStore(FILE_STORE_NAME).get(fileId);
    request.onsuccess = () => {
      const result = request.result as { blob?: Blob } | undefined;
      resolve(result?.blob ?? null);
    };
    request.onerror = () => reject(request.error ?? new Error("Unable to read the file."));
  });
}

export async function deleteFileBlob(fileId: string): Promise<void> {
  const db = await openFileStore();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(FILE_STORE_NAME, "readwrite");
    const request = transaction.objectStore(FILE_STORE_NAME).delete(fileId);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("Unable to delete the file."));
  });
}

export function NotesAssignmentsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<NotesAssignmentsState>(DEFAULT_NOTES_ASSIGNMENTS_STATE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let restoredState = DEFAULT_NOTES_ASSIGNMENTS_STATE;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (isNotesAssignmentsState(parsed)) {
          restoredState = {
            assignments: Array.isArray(parsed.assignments) ? parsed.assignments : [],
            notes: Array.isArray(parsed.notes) ? parsed.notes : [],
            submissions: Array.isArray(parsed.submissions) ? parsed.submissions : [],
            autoLoginLinks: Array.isArray(parsed.autoLoginLinks) ? parsed.autoLoginLinks : [],
          };
        }
      }
    } catch {
      restoredState = DEFAULT_NOTES_ASSIGNMENTS_STATE;
    }

    queueMicrotask(() => {
      setState(restoredState);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (ready) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [ready, state]);

  const addAssignment = (assignment: AssignmentRecord) => {
    setState((current) => ({ ...current, assignments: [assignment, ...current.assignments] }));
  };

  const updateAssignment = (id: string, assignment: AssignmentRecord) => {
    setState((current) => ({
      ...current,
      assignments: current.assignments.map((item) => (item.id === id ? assignment : item)),
    }));
  };

  const deleteAssignment = (id: string) => {
    setState((current) => ({
      ...current,
      assignments: current.assignments.filter((item) => item.id !== id),
      submissions: current.submissions.filter((item) => item.assignmentId !== id),
    }));
  };

  const addNote = (note: NoteRecord) => {
    setState((current) => ({ ...current, notes: [note, ...current.notes] }));
  };

  const updateNote = (id: string, note: NoteRecord) => {
    setState((current) => ({
      ...current,
      notes: current.notes.map((item) => (item.id === id ? note : item)),
    }));
  };

  const deleteNote = (id: string) => {
    setState((current) => ({
      ...current,
      notes: current.notes.filter((item) => item.id !== id),
    }));
  };

  const addSubmission = (submission: SubmissionRecord) => {
    setState((current) => ({ ...current, submissions: [submission, ...current.submissions] }));
  };

  const updateSubmission = (id: string, overrides: Partial<SubmissionRecord>) => {
    setState((current) => ({
      ...current,
      submissions: current.submissions.map((item) => (item.id === id ? { ...item, ...overrides } : item)),
    }));
  };

  const generateAutoLoginLink = async (admNo: string) => {
    const response = await fetch("/api/notes-assignments/auto-login-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admNo }),
    });
    const result = await response.json() as {
      data?: { record: AutoLoginLinkRecord; url: string };
      error?: string;
    };
    if (!response.ok || !result.data) {
      throw new Error(result.error ?? "Unable to generate the parent link.");
    }
    const { record, url } = result.data;

    setState((current) => ({
      ...current,
      autoLoginLinks: [record, ...current.autoLoginLinks.filter((item) => item.admNo !== admNo)],
    }));

    return { url, record };
  };

  const value = useMemo(() => {
    const revokeAutoLoginLink = async (admNo: string) => {
      const link = state.autoLoginLinks.find((item) => item.admNo === admNo && !item.revoked);
      if (!link) return;

      const response = await fetch(`/api/notes-assignments/auto-login-links/${encodeURIComponent(link.id)}/revoke`, {
        method: "PATCH",
      });
      const result = await response.json() as { data?: AutoLoginLinkRecord; error?: string };
      if (!response.ok || !result.data) {
        throw new Error(result.error ?? "Unable to revoke the parent link.");
      }

      setState((current) => ({
        ...current,
        autoLoginLinks: current.autoLoginLinks.map((item) => (item.id === link.id ? result.data! : item)),
      }));
    };

    return {
      state,
      setState,
      ready,
      addAssignment,
      updateAssignment,
      deleteAssignment,
      addNote,
      updateNote,
      deleteNote,
      addSubmission,
      updateSubmission,
      generateAutoLoginLink,
      revokeAutoLoginLink,
      putFileBlob,
      getFileBlob,
      deleteFileBlob,
    };
  }, [ready, state]);

  return <NotesAssignmentsContext.Provider value={value}>{children}</NotesAssignmentsContext.Provider>;
}

export function useNotesAssignments() {
  const context = useContext(NotesAssignmentsContext);
  if (!context) {
    throw new Error("useNotesAssignments must be used within NotesAssignmentsProvider");
  }
  return context;
}

