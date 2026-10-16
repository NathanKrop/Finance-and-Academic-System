import { NextRequest, NextResponse } from "next/server";
import { createStudentStore, DuplicateAdmissionNumberError } from "@/lib/student-store";
import { createClient } from "@/lib/supabase/server";
import { hasDemoSessionCookie } from "@/lib/demo-auth";

async function shouldUseLocalStudentStore(request: NextRequest) {
  return process.env.NODE_ENV !== "production"
    && await hasDemoSessionCookie(request.headers.get("cookie"));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const classroomId = searchParams.get("classroom_id");
  const status = searchParams.get("status");

  const supabase = await createClient();

  if (!supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || await shouldUseLocalStudentStore(request)) {
    const store = createStudentStore();
    const data = await store.listStudents({ q: q ?? undefined, classroom_id: classroomId ?? undefined, status: status ?? undefined });
    return NextResponse.json({ data });
  }

  let query = supabase
    .from("students")
    .select("*, classrooms(name), streams(name), houses(name)");

  if (q) {
    query = query.or(`adm_no.ilike.%${q}%,full_name.ilike.%${q}%,upi_no.ilike.%${q}%`);
  }
  if (classroomId) {
    query = query.eq("classroom_id", classroomId);
  }
  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query.order("adm_no");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const {
    adm_no,
    upi_no,
    full_name,
    gender,
    date_of_birth,
    classroom_id,
    stream_id,
    form_admitted,
    date_admitted,
    is_boarder,
    house_id,
    family_id,
    kcpe_marks,
    kcpe_index_no,
    kcse_index_no,
    year_of_leaving,
    guardian_name,
    guardian_phone_primary,
    guardian_phone_secondary,
    county,
    division,
    location,
    sub_location,
    address,
    status,
  } = body;

  if (!adm_no || !full_name || !gender) {
    return NextResponse.json(
      { error: "adm_no, full_name, and gender are required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  if (!supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || await shouldUseLocalStudentStore(request)) {
    const store = createStudentStore();
    const existing = await store.listStudents({ q: String(adm_no) });
    if (existing.some((student) => student.adm_no === String(adm_no))) {
      return NextResponse.json({ error: `Admission number ${adm_no} already exists` }, { status: 409 });
    }

    try {
      const data = await store.createStudent({
      adm_no,
      upi_no,
      full_name,
      gender,
      date_of_birth,
      classroom_id,
      stream_id,
      form_admitted,
      date_admitted,
      is_boarder,
      house_id,
      family_id,
      kcpe_marks,
      kcpe_index_no,
      kcse_index_no,
      year_of_leaving,
      guardian_name,
      guardian_phone_primary,
      guardian_phone_secondary,
      county,
      division,
      location,
      sub_location,
      address,
      status: status || "active",
      });
      return NextResponse.json({ data }, { status: 201 });
    } catch (error) {
      if (error instanceof DuplicateAdmissionNumberError) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      throw error;
    }

  }

  const { data: existing } = await supabase
    .from("students")
    .select("id")
    .eq("adm_no", adm_no)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: `Admission number ${adm_no} already exists` },
      { status: 409 }
    );
  }

  const { data: user } = await supabase.auth.getUser();
  const staffId = user.user?.id;

  const { data, error } = await supabase
    .from("students")
    .insert({
      adm_no,
      upi_no,
      full_name,
      gender,
      date_of_birth,
      classroom_id,
      stream_id,
      form_admitted,
      date_admitted,
      is_boarder,
      house_id,
      family_id,
      kcpe_marks,
      kcpe_index_no,
      kcse_index_no,
      year_of_leaving,
      guardian_name,
      guardian_phone_primary,
      guardian_phone_secondary,
      county,
      division,
      location,
      sub_location,
      address,
      status: status || "active",
      created_by: staffId,
      updated_by: staffId,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Admission number already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data }, { status: 201 });
}