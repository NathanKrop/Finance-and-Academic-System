import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createTransactionStore } from "@/lib/transaction-store";
import { hasDemoSessionCookie } from "@/lib/demo-auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const voidReason = String(body.void_reason ?? "").trim();
  if (!voidReason) {
    return NextResponse.json({ error: "void_reason is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const isDemoSession = process.env.NODE_ENV !== "production" && await hasDemoSessionCookie(request.headers.get("cookie"));
  if (isDemoSession) {
    const data = await createTransactionStore().voidTransaction(id, voidReason);
    return data
      ? NextResponse.json({ data })
      : NextResponse.json({ error: "Transaction not found or already voided" }, { status: 404 });
  }
  if (!supabase || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: "Supabase is required for production transaction access" }, { status: 503 });
  }

  const { data: user } = await supabase.auth.getUser();
  const staffId = user.user?.id;

  // Void, never delete — append-only enforcement
  const { data, error } = await supabase
    .from("transactions")
    .update({
      voided: true,
      void_reason: voidReason,
      voided_by: staffId,
      voided_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("voided", false) // Prevent double-voiding
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Transaction not found or already voided" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}