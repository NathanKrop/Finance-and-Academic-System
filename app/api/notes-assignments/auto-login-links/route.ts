import { NextRequest } from "next/server";
import {
  getStaffClient,
  issueAutoLoginLink,
  listAutoLoginLinks,
  readJsonObject,
  requiredString,
  withApiResponse,
} from "@/lib/academic/notes-assignments-api";

export async function GET(request: NextRequest) {
  return withApiResponse(async () => {
    const { searchParams } = new URL(request.url);
    const { supabase } = await getStaffClient();
    return listAutoLoginLinks(supabase, searchParams.get("admNo"));
  });
}

export async function POST(request: NextRequest) {
  return withApiResponse(async () => {
    const body = await readJsonObject(request);
    const admNo = requiredString(body, "admNo");
    const { supabase } = await getStaffClient();
    return issueAutoLoginLink(supabase, admNo);
  }, 201);
}
