import { NextRequest, NextResponse } from "next/server";
import { createStudentStore, DuplicateAdmissionNumberError } from "@/lib/student-store";
import { createClient } from "@/lib/supabase/server";
import { hasDemoSessionCookie } from "@/lib/demo-auth";

async function shouldUseLocalStudentStore(request: NextRequest) {
  return process.env.NODE_ENV !== "production"
    && await hasDemoSessionCookie(request.headers.get("cookie"));
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  if (!supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || await shouldUseLocalStudentStore(request)) {
    const store = createStudentStore();
    const data = await store.getStudentById(id);

    if (!data) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ data });
  }

  const { data, error } = await supabase
    .from("students")
    .select("*, classrooms(name), streams(name), houses(name), families(name)")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  return NextResponse.json({ data });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const supabase = await createClient();

  if (!supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || await shouldUseLocalStudentStore(request)) {
    const store = createStudentStore();
    try {
      const data = await store.updateStudent(id, body);
      return NextResponse.json({ data });
    } catch (error) {
      if (error instanceof DuplicateAdmissionNumberError) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      if (error instanceof Error && error.message.includes("not found")) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 });
      }
      throw error;
    }
  }

  const { data: user } = await supabase.auth.getUser();
  const staffId = user.user?.id;

  const { data, error } = await supabase
    .from("students")
    .update({ ...body, updated_by: staffId })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Admission number already exists" }, { status: 409 });
    }
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  if (!supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || await shouldUseLocalStudentStore(request)) {
    const store = createStudentStore();
    const data = await store.archiveStudent(id);

    return data
      ? NextResponse.json({ success: true, data })
      : NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const { data: user } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("students")
    .update({ status: "left", updated_by: user.user?.id })
    .eq("id", id)
    .select("id, status")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data });
}