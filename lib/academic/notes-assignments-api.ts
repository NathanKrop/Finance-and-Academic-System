import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { PORTAL_URL } from "@/lib/academic/autoLogin";
import { createClient } from "@/lib/supabase/server";

export type AssignmentQuestion = {
  id: string;
  text: string;
  marks: number;
  type: "text" | "choice";
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

type SupabaseClient = NonNullable<Awaited<ReturnType<typeof createClient>>>;
type Row = Record<string, unknown>;

export class NotesAssignmentsApiError extends Error {
  constructor(message: string, readonly status = 500) {
    super(message);
    this.name = "NotesAssignmentsApiError";
  }
}

export async function withApiResponse<T>(operation: () => Promise<T>, status = 200) {
  try {
    return NextResponse.json({ data: await operation() }, { status });
  } catch (error) {
    if (error instanceof NotesAssignmentsApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "The request could not be completed" }, { status: 500 });
  }
}

export async function getStaffClient() {
  const supabase = await createClient();
  if (!supabase) throw new NotesAssignmentsApiError("Supabase not configured", 503);

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new NotesAssignmentsApiError("Authentication required", 401);
  return { supabase, userId: data.user.id };
}

async function getPublicClient() {
  const supabase = await createClient();
  if (!supabase) throw new NotesAssignmentsApiError("Supabase not configured", 503);
  return supabase;
}

export async function readJsonObject(request: Request): Promise<Row> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new NotesAssignmentsApiError("A valid JSON request body is required", 400);
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new NotesAssignmentsApiError("A JSON object is required", 400);
  }
  return body as Row;
}

export function requiredString(body: Row, key: string) {
  const value = body[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new NotesAssignmentsApiError(`${key} is required`, 400);
  }
  return value.trim();
}

export function requiredYear(body: Row) {
  const year = body.year;
  if (typeof year !== "number" || !Number.isInteger(year) || year < 2000 || year > 2200) {
    throw new NotesAssignmentsApiError("year must be a valid academic year", 400);
  }
  return year;
}

function assertQuery<T>(result: { data: T | null; error: { code?: string; message: string } | null }) {
  if (result.error) {
    if (result.error.code === "PGRST116") throw new NotesAssignmentsApiError("Record not found", 404);
    throw new NotesAssignmentsApiError("Database operation failed", 500);
  }
  return result.data;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function mapAssignment(row: Row): AssignmentRecord {
  return {
    id: asString(row.id),
    form: asString(row.form),
    subject: asString(row.subject),
    streams: asStringArray(row.streams),
    instructions: asString(row.instructions),
    questions: Array.isArray(row.questions) ? row.questions as AssignmentQuestion[] : [],
    totalMarks: Number(row.total_marks ?? 0),
    postedBy: asString(row.posted_by),
    postedAt: asString(row.posted_at),
    term: asString(row.term),
    year: Number(row.year),
  };
}

function mapNote(row: Row): NoteRecord {
  return {
    id: asString(row.id),
    className: asString(row.class_name),
    subject: asString(row.subject),
    topic: asString(row.topic),
    instructions: asString(row.instructions),
    fileRef: typeof row.file_ref === "string" ? row.file_ref : null,
    postedBy: asString(row.posted_by),
    postedAt: asString(row.posted_at),
    term: asString(row.term),
    year: Number(row.year),
  };
}

function mapSubmission(row: Row): SubmissionRecord {
  return {
    id: asString(row.id),
    assignmentId: asString(row.assignment_id),
    admNo: asString(row.adm_no),
    name: asString(row.student_name),
    answers: Array.isArray(row.answers) ? row.answers as string[] : [],
    submittedAt: asString(row.submitted_at),
    status: row.status === "marked" ? "marked" : "unmarked",
    perQuestionScores: Array.isArray(row.per_question_scores) ? row.per_question_scores as number[] : [],
    total: Number(row.total ?? 0),
    comment: typeof row.comment === "string" ? row.comment : undefined,
  };
}

function mapAutoLoginLink(row: Row): AutoLoginLinkRecord {
  return {
    id: asString(row.id),
    admNo: asString(row.adm_no),
    createdAt: asString(row.created_at),
    expiresAt: asString(row.expires_at),
    revoked: Boolean(row.revoked_at),
    portal: "notes-assignments",
  };
}

export async function listAssignments(supabase: SupabaseClient, filters: { form?: string | null; subject?: string | null }) {
  let query = supabase.from("notes_assignments").select("*").order("posted_at", { ascending: false });
  if (filters.form) query = query.eq("form", filters.form);
  if (filters.subject) query = query.eq("subject", filters.subject);
  const data = assertQuery(await query);
  return (data ?? []).map((row) => mapAssignment(row as Row));
}

export async function createAssignment(supabase: SupabaseClient, userId: string, input: Omit<AssignmentRecord, "id" | "postedBy" | "postedAt">) {
  const result = await supabase.from("notes_assignments").insert({
    form: input.form,
    subject: input.subject,
    streams: input.streams,
    instructions: input.instructions,
    questions: input.questions,
    total_marks: input.totalMarks,
    posted_by: userId,
    term: input.term,
    year: input.year,
  }).select("*").single();
  return mapAssignment(assertQuery(result) as Row);
}

export async function getAssignment(supabase: SupabaseClient, id: string) {
  const result = await supabase.from("notes_assignments").select("*").eq("id", id).maybeSingle();
  const data = assertQuery(result);
  if (!data) throw new NotesAssignmentsApiError("Assignment not found", 404);
  return mapAssignment(data as Row);
}

export async function updateAssignment(supabase: SupabaseClient, id: string, input: Partial<AssignmentRecord>) {
  const changes: Row = {};
  if (input.form !== undefined) changes.form = input.form;
  if (input.subject !== undefined) changes.subject = input.subject;
  if (input.streams !== undefined) changes.streams = input.streams;
  if (input.instructions !== undefined) changes.instructions = input.instructions;
  if (input.questions !== undefined) changes.questions = input.questions;
  if (input.totalMarks !== undefined) changes.total_marks = input.totalMarks;
  if (input.term !== undefined) changes.term = input.term;
  if (input.year !== undefined) changes.year = input.year;
  const result = await supabase.from("notes_assignments").update(changes).eq("id", id).select("*").maybeSingle();
  const data = assertQuery(result);
  if (!data) throw new NotesAssignmentsApiError("Assignment not found", 404);
  return mapAssignment(data as Row);
}

export async function deleteAssignment(supabase: SupabaseClient, id: string) {
  const result = await supabase.from("notes_assignments").delete().eq("id", id).select("id").maybeSingle();
  const data = assertQuery(result);
  if (!data) throw new NotesAssignmentsApiError("Assignment not found", 404);
  return { deleted: true, id };
}

export async function listNotes(supabase: SupabaseClient, filters: { className?: string | null; subject?: string | null }) {
  let query = supabase.from("notes_study_notes").select("*").order("posted_at", { ascending: false });
  if (filters.className) query = query.eq("class_name", filters.className);
  if (filters.subject) query = query.eq("subject", filters.subject);
  const data = assertQuery(await query);
  return (data ?? []).map((row) => mapNote(row as Row));
}

export async function createNote(supabase: SupabaseClient, userId: string, input: Omit<NoteRecord, "id" | "postedBy" | "postedAt">) {
  const result = await supabase.from("notes_study_notes").insert({
    class_name: input.className,
    subject: input.subject,
    topic: input.topic,
    instructions: input.instructions,
    file_ref: input.fileRef ?? null,
    posted_by: userId,
    term: input.term,
    year: input.year,
  }).select("*").single();
  return mapNote(assertQuery(result) as Row);
}

export async function getNote(supabase: SupabaseClient, id: string) {
  const result = await supabase.from("notes_study_notes").select("*").eq("id", id).maybeSingle();
  const data = assertQuery(result);
  if (!data) throw new NotesAssignmentsApiError("Note not found", 404);
  return mapNote(data as Row);
}

export async function updateNote(supabase: SupabaseClient, id: string, input: Partial<NoteRecord>) {
  const changes: Row = {};
  if (input.className !== undefined) changes.class_name = input.className;
  if (input.subject !== undefined) changes.subject = input.subject;
  if (input.topic !== undefined) changes.topic = input.topic;
  if (input.instructions !== undefined) changes.instructions = input.instructions;
  if (input.fileRef !== undefined) changes.file_ref = input.fileRef;
  if (input.term !== undefined) changes.term = input.term;
  if (input.year !== undefined) changes.year = input.year;
  const result = await supabase.from("notes_study_notes").update(changes).eq("id", id).select("*").maybeSingle();
  const data = assertQuery(result);
  if (!data) throw new NotesAssignmentsApiError("Note not found", 404);
  return mapNote(data as Row);
}

export async function deleteNote(supabase: SupabaseClient, id: string) {
  const result = await supabase.from("notes_study_notes").delete().eq("id", id).select("id").maybeSingle();
  const data = assertQuery(result);
  if (!data) throw new NotesAssignmentsApiError("Note not found", 404);
  return { deleted: true, id };
}

export async function listSubmissions(supabase: SupabaseClient, filters: { assignmentId?: string | null; admNo?: string | null }) {
  let query = supabase.from("notes_assignment_submissions").select("*").order("submitted_at", { ascending: false });
  if (filters.assignmentId) query = query.eq("assignment_id", filters.assignmentId);
  if (filters.admNo) query = query.eq("adm_no", filters.admNo);
  const data = assertQuery(await query);
  return (data ?? []).map((row) => mapSubmission(row as Row));
}

export async function createSubmission(supabase: SupabaseClient, input: Omit<SubmissionRecord, "id" | "submittedAt" | "status" | "perQuestionScores" | "total">) {
  const result = await supabase.from("notes_assignment_submissions").insert({
    assignment_id: input.assignmentId,
    adm_no: input.admNo,
    student_name: input.name,
    answers: input.answers,
    comment: input.comment ?? null,
  }).select("*").single();
  return mapSubmission(assertQuery(result) as Row);
}

export async function markSubmission(supabase: SupabaseClient, id: string, input: { perQuestionScores?: number[]; total?: number; comment?: string }) {
  const changes: Row = { status: "marked" };
  if (input.perQuestionScores !== undefined) changes.per_question_scores = input.perQuestionScores;
  if (input.total !== undefined) changes.total = input.total;
  if (input.comment !== undefined) changes.comment = input.comment;
  const result = await supabase.from("notes_assignment_submissions").update(changes).eq("id", id).select("*").maybeSingle();
  const data = assertQuery(result);
  if (!data) throw new NotesAssignmentsApiError("Submission not found", 404);
  return mapSubmission(data as Row);
}

export function hashAutoLoginToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export async function listAutoLoginLinks(supabase: SupabaseClient, admNo?: string | null) {
  let query = supabase.from("notes_assignment_auto_login_links").select("*").order("created_at", { ascending: false });
  if (admNo) query = query.eq("adm_no", admNo);
  const data = assertQuery(await query);
  return (data ?? []).map((row) => mapAutoLoginLink(row as Row));
}

export async function issueAutoLoginLink(supabase: SupabaseClient, admNo: string) {
  const studentResult = await supabase.from("students").select("id, adm_no").eq("adm_no", admNo).maybeSingle();
  const student = assertQuery(studentResult) as Row | null;
  if (!student) throw new NotesAssignmentsApiError("Student not found", 404);

  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashAutoLoginToken(token);
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const revokeResult = await supabase
    .from("notes_assignment_auto_login_links")
    .update({ revoked_at: now })
    .eq("student_id", asString(student.id))
    .is("revoked_at", null);
  assertQuery(revokeResult);

  const insertResult = await supabase.from("notes_assignment_auto_login_links").insert({
    student_id: asString(student.id),
    adm_no: asString(student.adm_no),
    token_hash: tokenHash,
    expires_at: expiresAt,
  }).select("*").single();
  const record = mapAutoLoginLink(assertQuery(insertResult) as Row);
  const portalBase = process.env.NEXT_PUBLIC_PARENT_PORTAL_URL || PORTAL_URL;
  const url = new URL("/parent/login", portalBase);
  url.searchParams.set("t", token);
  return { record, url: url.toString() };
}

export async function revokeAutoLoginLink(supabase: SupabaseClient, id: string) {
  const result = await supabase
    .from("notes_assignment_auto_login_links")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id)
    .is("revoked_at", null)
    .select("*")
    .maybeSingle();
  const data = assertQuery(result);
  if (!data) throw new NotesAssignmentsApiError("Active auto-login link not found", 404);
  return mapAutoLoginLink(data as Row);
}

export async function verifyParentToken(token: string) {
  if (token.length < 40 || token.length > 128) return null;
  const supabase = await getPublicClient();
  const { data, error } = await supabase.rpc("verify_notes_assignment_token", {
    token_hash_input: hashAutoLoginToken(token),
  });
  if (error) throw new NotesAssignmentsApiError("Token verification failed", 500);
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  return {
    studentId: asString(row.student_id),
    studentName: asString(row.student_name),
    admNo: asString(row.adm_no),
  };
}