import { NextRequest } from "next/server";
import { deleteNote, getNote, getStaffClient, readJsonObject, updateNote, withApiResponse } from "@/lib/academic/notes-assignments-api";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiResponse(async () => {
    const { id } = await params;
    const { supabase } = await getStaffClient();
    return getNote(supabase, id);
  });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiResponse(async () => {
    const { id } = await params;
    const body = await readJsonObject(request);
    const { supabase } = await getStaffClient();
    return updateNote(supabase, id, body);
  });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiResponse(async () => {
    const { id } = await params;
    const { supabase } = await getStaffClient();
    return deleteNote(supabase, id);
  });
}
