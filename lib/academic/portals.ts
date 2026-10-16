import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  BookOpenCheck,
  ClipboardCheck,
  FileBarChart,
  History,
  MessageSquareText,
  NotebookPen,
  Settings2,
  UserRoundPlus,
} from "lucide-react";
import { getCbeSettingsSidebar } from "@/lib/academic/cbe-settings";

export type AcademicSidebarItem = {
  label: string;
  href: string;
  badge?: string;
};

export type AcademicPortal = {
  key: string;
  label: string;
  icon: LucideIcon;
  basePath: string;
  isNew: boolean;
  status: "built" | "soon";
  sidebar: AcademicSidebarItem[];
};

const registrationPath = "/academic/registration";
const examinationsPath = "/academic/examinations";
const settingsPath = "/academic/settings";

export const ACADEMIC_PORTALS: AcademicPortal[] = [
  {
    key: "registration",
    label: "Registration",
    icon: UserRoundPlus,
    basePath: registrationPath,
    isNew: false,
    status: "built",
    sidebar: [
      { label: "Student's Reg (CBE)", href: `${registrationPath}/students/new-cbe`, badge: "CBE" },
      { label: "Student's Excel Upload (CBE)", href: `${registrationPath}/students/upload-cbe`, badge: "CBE" },
      { label: "Teachers Reg.", href: `${registrationPath}/teachers` },
      { label: "Streams Reg.", href: `${registrationPath}/streams` },
      { label: "Subject Reg. (CBE)", href: `${registrationPath}/subjects-cbe`, badge: "CBE" },
      { label: "House/family Reg.", href: `${registrationPath}/houses-families` },
      { label: "School Details", href: `${registrationPath}/school-details` },
      { label: "View/ Edit Student List", href: `${registrationPath}/students` },
      { label: "View/ Edit Student Pics", href: `${registrationPath}/student-photos` },
      { label: "Bulk Student Edit", href: `${registrationPath}/bulk-edit` },
    ],
  },
  {
    key: "examinations",
    label: "Examinations",
    icon: ClipboardCheck,
    basePath: examinationsPath,
    isNew: false,
    status: "built",
    sidebar: [
      { label: "Schedule Exams", href: `${examinationsPath}/schedule` },
      { label: "Students Portal", href: `${examinationsPath}/students-portal` },
      { label: "Marks Entry (Subject)", href: `${examinationsPath}/marks/subject` },
      { label: "Marks Entry (Paper)", href: `${examinationsPath}/marks/paper` },
      { label: "Marks Entry (Student)", href: `${examinationsPath}/marks/student` },
      { label: "Assign Subjs to Students", href: `${examinationsPath}/assign/students` },
      { label: "Assign Subjs using Exam", href: `${examinationsPath}/assign/using-exam` },
      { label: "Assign Subjects to Teachers per Stream", href: `${examinationsPath}/teachers/per-stream` },
      { label: "Assign Subjects to Teachers per Teacher", href: `${examinationsPath}/teachers/per-teacher` },
      { label: "Set Exam Contribution", href: `${examinationsPath}/contribution` },
      { label: "Contacts/Marks List", href: `${examinationsPath}/lists` },
    ],
  },
  {
    key: "settings",
    label: "Settings",
    icon: Settings2,
    basePath: settingsPath,
    isNew: false,
    status: "built",
    sidebar: [
      { label: "Subject grading", href: `${settingsPath}/subject-grading` },
      { label: "Subjects ranking per form", href: `${settingsPath}/subjects-ranking` },
      { label: "Overall Marks grading", href: `${settingsPath}/overall-grading` },
      { label: "Report form comments", href: `${settingsPath}/report-form-comments` },
      { label: "Subjects comments", href: `${settingsPath}/subjects-comments` },
      { label: "Fees Arrears", href: `${settingsPath}/fees-arrears` },
      { label: "Opening/Closing date", href: `${settingsPath}/opening-closing-date` },
      { label: "Pictures Upload", href: `${settingsPath}/pictures-upload` },
      { label: "Change password", href: `${settingsPath}/change-password` },
      { label: "Promotion/Demotion", href: `${settingsPath}/promotion-demotion` },
      { label: "Set Term/Year", href: `${settingsPath}/set-term-year` },
      { label: "ClassTeacher Promotion", href: `${settingsPath}/class-teacher-promotion` },
      { label: "Students Portal", href: `${settingsPath}/students-portal` },
    ],
  },
  { key: "cbe-settings", label: "CBE Settings", icon: BookOpenCheck, basePath: "/academic/cbe-settings", isNew: true, status: "built", sidebar: getCbeSettingsSidebar() },
  { key: "oldgrading", label: "OldGrading", icon: History, basePath: "/academic/oldgrading", isNew: false, status: "soon", sidebar: [] },
  {
    key: "cbe-reports",
    label: "CBE Reports",
    icon: FileBarChart,
    basePath: "/academic/cbe-reports",
    isNew: true,
    status: "built",
    sidebar: [
      { label: "End-term Reports", href: "/academic/cbe-reports/end-term-reports" },
      { label: "Subject Analysis Marks", href: "/academic/cbe-reports/subject-analysis-marks" },
      { label: "Marks Correction Sheet", href: "/academic/cbe-reports/marks-correction-sheet" },
      { label: "Subject Champ./Cert", href: "/academic/cbe-reports/subject-champions" },
      { label: "Rank Stud. per Subjects", href: "/academic/cbe-reports/rank-students-by-subject" },
      { label: "Subjects Grade count", href: "/academic/cbe-reports/subjects-grade-count" },
    ],
  },
  {
    key: "notes-assignments",
    label: "Notes & Assignments",
    icon: NotebookPen,
    basePath: "/academic/notes-assignments",
    isNew: false,
    status: "built",
    sidebar: [
      { label: "Post Assignments", href: "/academic/notes-assignments/post-assignments" },
      { label: "Post Study Notes", href: "/academic/notes-assignments/post-study-notes" },
      { label: "View Unmarked Assignments", href: "/academic/notes-assignments/view-unmarked-assignments" },
      { label: "Marked Assignments", href: "/academic/notes-assignments/marked-assignments" },
      { label: "Parents Auto-login Link", href: "/academic/notes-assignments/generate-send-parents-auto-login-link" },
    ],
  },
  { key: "clearance", label: "Clearance", icon: BadgeCheck, basePath: "/academic/clearance", isNew: true, status: "soon", sidebar: [] },
  { key: "message", label: "Message (SMS)", icon: MessageSquareText, basePath: "/academic/message", isNew: false, status: "soon", sidebar: [] },
];

export function academicPortalForPath(pathname: string): AcademicPortal {
  return ACADEMIC_PORTALS.find(
    (portal) => pathname === portal.basePath || pathname.startsWith(`${portal.basePath}/`),
  ) ?? ACADEMIC_PORTALS[0];
}