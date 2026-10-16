import { NextRequest } from "next/server";
import { NotesAssignmentsApiError, readJsonObject, requiredString, verifyParentToken, withApiResponse } from "@/lib/academic/notes-assignments-api";

export async function POST(request: NextRequest) {
  return withApiResponse(async () => {
    const body = await readJsonObject(request);
    const token = requiredString(body, "token");
    const validLink = await verifyParentToken(token);
    if (!validLink) throw new NotesAssignmentsApiError("Invalid or expired auto-login token", 401);
    return { ...validLink, valid: true };
  });
}