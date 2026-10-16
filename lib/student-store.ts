import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export type StudentStatus = "active" | "left" | "graduated" | "transferred";

export type StudentRecord = {
  id: string;
  adm_no: string;
  upi_no: string | null;
  full_name: string;
  gender: string;
  date_of_birth: string | null;
  classroom_id: string | null;
  stream_id: string | null;
  form_admitted: string | null;
  date_admitted: string | null;
  is_boarder: boolean;
  house_id: string | null;
  family_id: string | null;
  kcpe_marks: number | null;
  kcpe_index_no: string | null;
  kcse_index_no: string | null;
  year_of_leaving: number | null;
  guardian_name: string | null;
  guardian_phone_primary: string;
  guardian_phone_secondary: string | null;
  county: string | null;
  division: string | null;
  location: string | null;
  sub_location: string | null;
  address: string | null;
  status: StudentStatus;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type StudentListFilters = {
  q?: string;
  classroom_id?: string;
  status?: string;
};

export class DuplicateAdmissionNumberError extends Error {
  constructor() {
    super("Admission number already exists");
    this.name = "DuplicateAdmissionNumberError";
  }
}

const storeQueues = new Map<string, Promise<void>>();

const DEFAULT_STUDENTS: Array<Omit<StudentRecord, "id" | "created_at" | "updated_at"> & { id?: string }> = [
  {
    id: "stu-1001",
    adm_no: "1001",
    upi_no: "KE1001001A1",
    full_name: "Akinyi Wanjiku",
    gender: "Female",
    date_of_birth: "2012-04-14",
    classroom_id: "g10",
    stream_id: "stem-1",
    form_admitted: "10",
    date_admitted: "2026-01-05",
    is_boarder: false,
    house_id: null,
    family_id: null,
    kcpe_marks: 388,
    kcpe_index_no: "A1001",
    kcse_index_no: null,
    year_of_leaving: null,
    guardian_name: "Mary Wanjiku",
    guardian_phone_primary: "0712345678",
    guardian_phone_secondary: null,
    county: "Meru",
    division: "Imenti South",
    location: "Mitunguu",
    sub_location: "Kianjai",
    address: "P.O. Box 15, Mitunguu",
    status: "active",
    created_by: null,
    updated_by: null,
  },
  {
    id: "stu-1002",
    adm_no: "1002",
    upi_no: "KE1002002B2",
    full_name: "Brian Kibet",
    gender: "Male",
    date_of_birth: "2011-11-02",
    classroom_id: "g10",
    stream_id: "stem-2",
    form_admitted: "10",
    date_admitted: "2026-01-05",
    is_boarder: true,
    house_id: "h1",
    family_id: null,
    kcpe_marks: 396,
    kcpe_index_no: "A1002",
    kcse_index_no: null,
    year_of_leaving: null,
    guardian_name: "Peter Kibet",
    guardian_phone_primary: "0723456789",
    guardian_phone_secondary: "0734567890",
    county: "Elgeyo Marakwet",
    division: "Kapsowar",
    location: "Kapsowar",
    sub_location: "Mogil",
    address: "P.O. Box 22, Kapsowar",
    status: "active",
    created_by: null,
    updated_by: null,
  },
  {
    id: "stu-1003",
    adm_no: "1003",
    upi_no: "KE1003003C3",
    full_name: "Christine Muthoni",
    gender: "Female",
    date_of_birth: "2012-08-20",
    classroom_id: "g10",
    stream_id: "social-1",
    form_admitted: "10",
    date_admitted: "2025-11-12",
    is_boarder: false,
    house_id: null,
    family_id: null,
    kcpe_marks: 371,
    kcpe_index_no: "A1003",
    kcse_index_no: null,
    year_of_leaving: null,
    guardian_name: "Faith Muthoni",
    guardian_phone_primary: "0745678901",
    guardian_phone_secondary: null,
    county: "Meru",
    division: "Meru Central",
    location: "Mikinduri",
    sub_location: "Nkuene",
    address: "P.O. Box 76, Mikinduri",
    status: "active",
    created_by: null,
    updated_by: null,
  },
];

function normalizeStatus(value: unknown): StudentStatus {
  const normalized = String(value ?? "active").toLowerCase();
  if (normalized === "left") return "left";
  if (normalized === "graduated") return "graduated";
  if (normalized === "transferred") return "transferred";
  return "active";
}

function nullableString(input: Record<string, unknown>, field: string, existingValue?: string | null) {
  const value = input[field];
  if (value === undefined) return existingValue ?? null;
  return value === null ? null : String(value);
}

function toStudentRecord(input: Record<string, unknown>, existing?: Partial<StudentRecord>): StudentRecord {
  const now = new Date().toISOString();
  const base = existing ?? {};

  return {
    id: String(input.id ?? base.id ?? randomUUID()),
    adm_no: String(input.adm_no ?? base.adm_no ?? ""),
    upi_no: nullableString(input, "upi_no", base.upi_no),
    full_name: String(input.full_name ?? base.full_name ?? ""),
    gender: String(input.gender ?? base.gender ?? ""),
    date_of_birth: nullableString(input, "date_of_birth", base.date_of_birth),
    classroom_id: nullableString(input, "classroom_id", base.classroom_id),
    stream_id: nullableString(input, "stream_id", base.stream_id),
    form_admitted: nullableString(input, "form_admitted", base.form_admitted),
    date_admitted: nullableString(input, "date_admitted", base.date_admitted),
    is_boarder: Boolean(input.is_boarder ?? base.is_boarder ?? false),
    house_id: nullableString(input, "house_id", base.house_id),
    family_id: nullableString(input, "family_id", base.family_id),
    kcpe_marks: input.kcpe_marks === undefined ? base.kcpe_marks ?? null : input.kcpe_marks == null || input.kcpe_marks === "" ? null : Number(input.kcpe_marks),
    kcpe_index_no: nullableString(input, "kcpe_index_no", base.kcpe_index_no),
    kcse_index_no: nullableString(input, "kcse_index_no", base.kcse_index_no),
    year_of_leaving: input.year_of_leaving === undefined ? base.year_of_leaving ?? null : input.year_of_leaving == null || input.year_of_leaving === "" ? null : Number(input.year_of_leaving),
    guardian_name: nullableString(input, "guardian_name", base.guardian_name),
    guardian_phone_primary: String(input.guardian_phone_primary ?? base.guardian_phone_primary ?? ""),
    guardian_phone_secondary: nullableString(input, "guardian_phone_secondary", base.guardian_phone_secondary),
    county: nullableString(input, "county", base.county),
    division: nullableString(input, "division", base.division),
    location: nullableString(input, "location", base.location),
    sub_location: nullableString(input, "sub_location", base.sub_location),
    address: nullableString(input, "address", base.address),
    status: normalizeStatus(input.status ?? base.status ?? "active"),
    created_by: nullableString(input, "created_by", base.created_by),
    updated_by: nullableString(input, "updated_by", base.updated_by),
    created_at: base.created_at ?? now,
    updated_at: now,
  };
}

export function createStudentStore(storagePath = resolve(process.cwd(), "data", "students.json")) {
  async function withLock<T>(operation: () => Promise<T>): Promise<T> {
    const previous = storeQueues.get(storagePath) ?? Promise.resolve();
    let release = () => {};
    const current = new Promise<void>((resolveLock) => {
      release = resolveLock;
    });
    const queued = previous.then(() => current);
    storeQueues.set(storagePath, queued);
    await previous;

    try {
      return await operation();
    } finally {
      release();
      if (storeQueues.get(storagePath) === queued) storeQueues.delete(storagePath);
    }
  }

  async function ensureStore() {
    await mkdir(dirname(storagePath), { recursive: true });

    try {
      await readFile(storagePath, "utf8");
    } catch {
      const seed = DEFAULT_STUDENTS.map((student) => ({
        ...student,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      await writeFile(storagePath, JSON.stringify(seed, null, 2), "utf8");
    }
  }

  async function loadStore(): Promise<StudentRecord[]> {
    await ensureStore();
    const contents = await readFile(storagePath, "utf8");
    const parsed = JSON.parse(contents) as StudentRecord[];
    return Array.isArray(parsed) ? parsed : [];
  }

  async function saveStore(students: StudentRecord[]) {
    await ensureStore();
    await writeFile(storagePath, JSON.stringify(students, null, 2), "utf8");
  }

  async function listStudents(filters: StudentListFilters = {}): Promise<StudentRecord[]> {
    return withLock(async () => {
      const students = await loadStore();
      const query = (filters.q ?? "").trim().toLowerCase();
      const studentsFiltered = students.filter((student) => {
        const matchesQuery = !query || [
          student.adm_no,
          student.full_name,
          student.upi_no,
          student.guardian_name,
          student.guardian_phone_primary,
        ].some((value) => String(value ?? "").toLowerCase().includes(query));

        const matchesClassroom = !filters.classroom_id || student.classroom_id === filters.classroom_id;
        const matchesStatus = !filters.status || student.status === normalizeStatus(filters.status);

        return matchesQuery && matchesClassroom && matchesStatus;
      });

      return studentsFiltered.sort((a, b) => Number(a.adm_no) - Number(b.adm_no));
    });
  }

  async function getStudentById(id: string): Promise<StudentRecord | null> {
    return withLock(async () => {
      const students = await loadStore();
      return students.find((student) => student.id === id) ?? null;
    });
  }

  async function createStudent(input: Record<string, unknown>): Promise<StudentRecord> {
    return withLock(async () => {
      const students = await loadStore();
      const nextStudent = toStudentRecord({
        ...input,
        id: randomUUID(),
        created_by: input.created_by ?? null,
        updated_by: input.updated_by ?? null,
        status: input.status ?? "active",
      });
      if (students.some((student) => student.adm_no.trim().toLowerCase() === nextStudent.adm_no.trim().toLowerCase())) {
        throw new DuplicateAdmissionNumberError();
      }

      students.push(nextStudent);
      await saveStore(students);
      return nextStudent;
    });
  }

  async function updateStudent(id: string, updates: Record<string, unknown>): Promise<StudentRecord> {
    return withLock(async () => {
      const students = await loadStore();
      const index = students.findIndex((student) => student.id === id);

      if (index === -1) {
        throw new Error(`Student ${id} not found`);
      }

      const current = students[index];
      const updated = toStudentRecord({ ...current, ...updates }, current);
      if (students.some((student, studentIndex) =>
        studentIndex !== index
        && student.adm_no.trim().toLowerCase() === updated.adm_no.trim().toLowerCase()
      )) {
        throw new DuplicateAdmissionNumberError();
      }
      students[index] = updated;
      await saveStore(students);
      return updated;
    });
  }

  async function archiveStudent(id: string): Promise<StudentRecord | null> {
    return withLock(async () => {
      const students = await loadStore();
      const index = students.findIndex((student) => student.id === id);
      if (index < 0) return null;

      const archived = toStudentRecord({ ...students[index], status: "left" }, students[index]);
      const nextStudents = students.map((student, studentIndex) => studentIndex === index ? archived : student);
      await saveStore(nextStudents);
      return archived;
    });
  }

  return {
    listStudents,
    getStudentById,
    createStudent,
    updateStudent,
    archiveStudent,
  };
}
