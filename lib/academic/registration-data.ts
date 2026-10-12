export const STREAM_GRADES = ["Grade 10", "Grade 11"] as const;
export type StreamGrade = (typeof STREAM_GRADES)[number];

export const CBE_GRADES = ["Grade 10", "Grade 11"] as const;

export const CBE_PATHWAYS = ["STEM", "Social Sciences", "Arts & Sports Science"] as const;
export type CbePathway = (typeof CBE_PATHWAYS)[number];

export type Paper = { id: string; name: string; weight: number };

export type Teacher = {
  id: string;
  tscNo: string;
  name: string;
  initials: string;
  responsibility: string;
  subjects844: string[];
  subjectsCbe: string[];
  employmentType: "TSC" | "BOM" | "TP";
  deleted: boolean;
};

export type AcademicStream = {
  id: string;
  name: string;
  grade: StreamGrade;
  teacherId: string;
};

export type Subject844 = {
  id: string;
  code: string;
  abbreviation: string;
  name: string;
  group: string;
  hodId: string;
  papers: Paper[];
};

export type SubjectCbe = {
  id: string;
  name: string;
  abbreviation: string;
  pathways: CbePathway[];
  hodId: string;
};

export type House = { id: string; name: string; teacherId: string };
export type Family = { id: string; name: string; fatherId: string; motherId: string };

export type StudentStatus = "On session" | "Alumni/Completed" | "Transferred" | "Deleted";

export type Student = {
  id: string;
  admNo: string;
  name: string;
  curriculum: "844" | "CBE";
  streamId: string;
  gender: "Male" | "Female" | "";
  boarder: boolean;
  guardianName: string;
  dateAdmitted: string;
  formAdmitted: string;
  gradeAdmitted: string;
  phone: string;
  otherPhone: string;
  upiNo: string;
  houseId: string | null;
  dateOfBirth: string;
  kcseIndexNo: string;
  county: string;
  photoUrl: string;
  division: string;
  location: string;
  subLocation: string;
  address: string;
  yearOfLeaving: string;
  familyId: string | null;
  kcpeMarks: string;
  kcpeIndexNo: string;
  pathway: string;
  track: string;
  kjseaGrade: string;
  juniorSchool: string;
  status: StudentStatus;
};

export type SchoolDetails = {
  name: string;
  motto: string;
  poBox: string;
  town: string;
  website: string;
  email: string;
  mission: string;
  vision: string;
  phone1: string;
  phone2: string;
  logoUrl: string;
};

export type RegistrationData = {
  school: SchoolDetails;
  teachers: Teacher[];
  streams: AcademicStream[];
  subjects844: Subject844[];
  subjectsCbe: SubjectCbe[];
  houses: House[];
  families: Family[];
  students: Student[];
};

export function newRegistrationId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `reg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const INITIAL_REGISTRATION_DATA: RegistrationData = {
  school: {
    name: "ST. ELIZABETH GIRLS SENIOR SCHOOL",
    motto: "Elimu ni Ufunguo",
    poBox: "P.O. Box 214",
    town: "Meru",
    website: "",
    email: "info@st.elizabethgirls.ac.ke",
    mission: "",
    vision: "",
    phone1: "+254 712 345 678",
    phone2: "",
    logoUrl: "/Logo/school_logo.jpg",
  },
  teachers: [
    { id: "teacher-1", tscNo: "724501", name: "Caroline Njeri", initials: "C.N.", responsibility: "Deputy Principal", subjects844: [], subjectsCbe: ["English"], employmentType: "TSC", deleted: false },
    { id: "teacher-2", tscNo: "801623", name: "Beatrice Kilonzo", initials: "B.K.", responsibility: "H.O.D Languages", subjects844: [], subjectsCbe: ["Kiswahili"], employmentType: "TSC", deleted: false },
    { id: "teacher-3", tscNo: "T-019", name: "Dennis Kiptoo", initials: "D.K.", responsibility: "Class Teacher", subjects844: [], subjectsCbe: ["Mathematics"], employmentType: "BOM", deleted: false },
  ],
  streams: [
    { id: "stream-g10-stem", name: "STEM ROOM 1", grade: "Grade 10", teacherId: "teacher-3" },
  ],
  subjects844: [],
  subjectsCbe: [
    { id: "subject-cbe-math", name: "Mathematics", abbreviation: "Math", pathways: ["STEM"], hodId: "teacher-3" },
  ],
  houses: [
    { id: "house-kenya", name: "Kenya", teacherId: "teacher-2" },
    { id: "house-elgon", name: "Elgon", teacherId: "teacher-1" },
  ],
  families: [
    { id: "family-baraka", name: "Baraka", fatherId: "teacher-1", motherId: "teacher-2" },
  ],
  students: [],
};