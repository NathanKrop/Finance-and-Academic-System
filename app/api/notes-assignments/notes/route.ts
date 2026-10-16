import { NextRequest } from "next/server";
import {
  createNote,
  getStaffClient,
  listNotes,
  NotesAssignmentsApiError,
  readJsonObject,
  requiredString,
  requiredYear,
  withApiResponse,
} from "@/lib/academic/notes-assignments-api";

export async function GET(request: NextRequest) {
  return withApiResponse(async () => {
    const { searchParams } = new URL(request.url);
    const { supabase } = await getStaffClient();
    return listNotes(supabase, {
      subject: searchParams.get("subject"),
      className: searchParams.get("className"),
    });
  });
}

export async function POST(request: NextRequest) {
  return withApiResponse(async () => {
    const body = await readJsonObject(request);
    const className = requiredString(body, "className");
    const subject = requiredString(body, "subject");
    const topic = requiredString(body, "topic");
    const term = requiredString(body, "term");
    const year = requiredYear(body);
    const { supabase, userId } = await getStaffClient();
    if (body.fileRef !== undefined && body.fileRef !== null && typeof body.fileRef !== "string") {
      throw new NotesAssignmentsApiError("fileRef must be a string", 400);
    }
    return createNote(supabase, userId, {
      className,
      subject,
      topic,
      instructions: typeof body.instructions === "string" ? body.instructions : "",
      fileRef: typeof body.fileRef === "string" ? body.fileRef : null,
      term,
      year,
    });
  }, 201);
}
