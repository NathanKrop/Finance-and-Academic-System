import { NextRequest } from "next/server";
import {
  createSubmission,
  getStaffClient,
  listSubmissions,
  NotesAssignmentsApiError,
  readJsonObject,
  requiredString,
  withApiResponse,
} from "@/lib/academic/notes-assignments-api";

export async function GET(request: NextRequest) {
  return withApiResponse(async () => {
    const { searchParams } = new URL(request.url);
    const { supabase } = await getStaffClient();
    return listSubmissions(supabase, {
      assignmentId: searchParams.get("assignmentId"),
      admNo: searchParams.get("admNo"),
    });
  });
}

export async function POST(request: NextRequest) {
  return withApiResponse(async () => {
    const body = await readJsonObject(request);
    const assignmentId = requiredString(body, "assignmentId");
    const admNo = requiredString(body, "admNo");
    const name = requiredString(body, "name");
    if (!Array.isArray(body.answers) || body.answers.some((answer) => typeof answer !== "string")) {
      throw new NotesAssignmentsApiError("answers must be a string array", 400);
    }
    const { supabase } = await getStaffClient();
    return createSubmission(supabase, {
      assignmentId,
      admNo,
      name,
      answers: body.answers,
      comment: typeof body.comment === "string" ? body.comment : undefined,
    });
  }, 201);
}
