import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { DEMO_SESSION_COOKIE } from "@/lib/demo-auth";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set(DEMO_SESSION_COOKIE, "", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ success: true });
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}