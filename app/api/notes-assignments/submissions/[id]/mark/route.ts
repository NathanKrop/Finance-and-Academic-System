import { NextRequest } from "next/server";
import {
  getStaffClient,
  markSubmission,
  NotesAssignmentsApiError,
  readJsonObject,
  withApiResponse,
} from "@/lib/academic/notes-assignments-api";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiResponse(async () => {
    const { id } = await params;
    const body = await readJsonObject(request);
    if (body.perQuestionScores !== undefined && (!Array.isArray(body.perQuestionScores) || body.perQuestionScores.some((score) => typeof score !== "number" || score < 0))) {
      throw new NotesAssignmentsApiError("perQuestionScores must contain non-negative numbers", 400);
    }
    if (body.total !== undefined && (typeof body.total !== "number" || !Number.isFinite(body.total) || body.total < 0)) {
      throw new NotesAssignmentsApiError("total must be a non-negative number", 400);
    }
    if (body.comment !== undefined && typeof body.comment !== "string") {
      throw new NotesAssignmentsApiError("comment must be a string", 400);
    }
    if (body.perQuestionScores === undefined && body.total === undefined && body.comment === undefined) {
      throw new NotesAssignmentsApiError("Provide scores, total, or comment to mark the submission", 400);
    }
    const { supabase } = await getStaffClient();
    return markSubmission(supabase, id, body);
  });
}
