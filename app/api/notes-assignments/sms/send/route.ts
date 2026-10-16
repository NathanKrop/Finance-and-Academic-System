import { NextRequest } from "next/server";
import { getStaffClient, NotesAssignmentsApiError, readJsonObject, requiredString, withApiResponse } from "@/lib/academic/notes-assignments-api";

export async function POST(request: NextRequest) {
  return withApiResponse(async () => {
    const body = await readJsonObject(request);
    if (!Array.isArray(body.recipients) || body.recipients.length === 0 || body.recipients.length > 500) {
      throw new NotesAssignmentsApiError("recipients must contain between 1 and 500 messages", 400);
    }
    for (const recipient of body.recipients) {
      if (typeof recipient !== "object" || recipient === null || Array.isArray(recipient)) {
        throw new NotesAssignmentsApiError("Each recipient must include a phone and message", 400);
      }
      requiredString(recipient as Record<string, unknown>, "phone");
      requiredString(recipient as Record<string, unknown>, "message");
    }
    await getStaffClient();
    throw new NotesAssignmentsApiError("SMS provider is not configured", 503);
  });
}