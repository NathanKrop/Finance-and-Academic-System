import { NextRequest } from "next/server";
import {
  deleteAssignment,
  getAssignment,
  getStaffClient,
  readJsonObject,
  updateAssignment,
  withApiResponse,
} from "@/lib/academic/notes-assignments-api";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiResponse(async () => {
    const { id } = await params;
    const { supabase } = await getStaffClient();
    return getAssignment(supabase, id);
  });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiResponse(async () => {
    const { id } = await params;
    const body = await readJsonObject(request);
    const { supabase } = await getStaffClient();
    return updateAssignment(supabase, id, body);
  });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withApiResponse(async () => {
    const { id } = await params;
    const { supabase } = await getStaffClient();
    return deleteAssignment(supabase, id);
  });
}
