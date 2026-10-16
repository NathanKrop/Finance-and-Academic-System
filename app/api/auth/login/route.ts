import { NextRequest, NextResponse } from "next/server";
import { createDemoSessionToken, DEMO_EMAIL, DEMO_SESSION_COOKIE, isDemoCredentials, isDemoLoginEnabled } from "@/lib/demo-auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "A valid JSON request body is required" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "A valid JSON object is required" }, { status: 400 });
  }
  const { email, password } = body as { email?: unknown; password?: unknown };

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  if (isDemoLoginEnabled() && isDemoCredentials(email, password)) {
    const response = NextResponse.json({
      data: {
        user: {
          id: "demo-user",
          email: DEMO_EMAIL,
          role: "super_admin",
        },
        demo: true,
      },
    });
    response.cookies.set(DEMO_SESSION_COOKIE, await createDemoSessionToken(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 8 * 60 * 60,
    });
    return response;
  }

  const supabase = await createClient();

  if (!supabase) {
    return NextResponse.json(
      { error: isDemoLoginEnabled() ? "Invalid demo credentials" : "Authentication service is not configured" },
      { status: isDemoLoginEnabled() ? 401 : 503 }
    );
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: String(email),
    password: String(password),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  return NextResponse.json({ data });
}
