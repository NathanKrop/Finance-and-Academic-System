import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";
import { getStaffClient, NotesAssignmentsApiError, withApiResponse } from "@/lib/academic/notes-assignments-api";

export async function POST(request: NextRequest) {
  return withApiResponse(async () => {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) throw new NotesAssignmentsApiError("A file upload is required", 400);
    if (file.size === 0 || file.size > 15 * 1024 * 1024) {
      throw new NotesAssignmentsApiError("File must be between 1 byte and 15 MB", 400);
    }
    const allowedTypes = new Set([
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/webp",
    ]);
    if (!allowedTypes.has(file.type)) throw new NotesAssignmentsApiError("Unsupported file type", 400);

    const { supabase, userId } = await getStaffClient();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100) || "attachment";
    const storageKey = `${userId}/${randomUUID()}-${safeName}`;
    const { error } = await supabase.storage.from("notes-assignments").upload(storageKey, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) throw new NotesAssignmentsApiError("File upload failed", 500);
    const { data, error: signedUrlError } = await supabase.storage
      .from("notes-assignments")
      .createSignedUrl(storageKey, 60 * 60);
    if (signedUrlError || !data) throw new NotesAssignmentsApiError("Unable to create file access URL", 500);
    return { fileName: file.name, contentType: file.type, size: file.size, fileRef: storageKey, signedUrl: data.signedUrl };
  }, 201);
}
