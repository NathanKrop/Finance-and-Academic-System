import { NextRequest } from "next/server";
import { getStaffClient, revokeAutoLoginLink, withApiResponse } from "@/lib/academic/notes-assignments-api";

export async function PATCH(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiResponse(async () => {
    const { id } = await params;
    const { supabase } = await getStaffClient();
    return revokeAutoLoginLink(supabase, id);
  });
}
