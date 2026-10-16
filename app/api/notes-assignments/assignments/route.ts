import { NextRequest } from "next/server";
import {
  createAssignment,
  getStaffClient,
  listAssignments,
  NotesAssignmentsApiError,
  readJsonObject,
  requiredString,
  requiredYear,
  withApiResponse,
} from "@/lib/academic/notes-assignments-api";

export async function GET(request: NextRequest) {
  return withApiResponse(async () => {
    const { supabase } = await getStaffClient();
    const { searchParams } = new URL(request.url);
    return listAssignments(supabase, {
      subject: searchParams.get("subject"),
      form: searchParams.get("form"),
    });
  });
}

export async function POST(request: NextRequest) {
  return withApiResponse(async () => {
    const body = await readJsonObject(request);
    const form = requiredString(body, "form");
    const subject = requiredString(body, "subject");
    const term = requiredString(body, "term");
    const year = requiredYear(body);
    if (!Array.isArray(body.streams) || !Array.isArray(body.questions)) {
      throw new NotesAssignmentsApiError("streams and questions must be arrays", 400);
    }
    if (typeof body.totalMarks !== "number" || !Number.isFinite(body.totalMarks) || body.totalMarks < 0) {
      throw new NotesAssignmentsApiError("totalMarks must be a non-negative number", 400);
    }
    const { supabase, userId } = await getStaffClient();
    return createAssignment(supabase, userId, {
      form,
      subject,
      streams: body.streams as string[],
      instructions: typeof body.instructions === "string" ? body.instructions : "",
      questions: body.questions as never[],
      totalMarks: body.totalMarks,
      term,
      year,
    });
  }, 201);
}
