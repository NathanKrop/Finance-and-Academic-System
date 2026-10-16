import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasDemoSessionCookie } from "@/lib/demo-auth";
import { BANK_ACCOUNTS, CLASSROOMS, HOUSES, PAYMENT_TYPES, STREAMS, VOTE_HEADS } from "@/lib/mock-data";

export async function GET(request: Request) {
  const supabase = await createClient();
  const useDemoReferences = process.env.NODE_ENV !== "production"
    && await hasDemoSessionCookie(request.headers.get("cookie"));

  if (useDemoReferences) {
    return NextResponse.json({
      data: {
        classrooms: CLASSROOMS,
        streams: STREAMS,
        vote_heads: VOTE_HEADS,
        payment_types: PAYMENT_TYPES,
        bank_accounts: BANK_ACCOUNTS,
        houses: HOUSES,
      },
    });
  }

  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const [classrooms, streams, voteHeads, paymentTypes, bankAccounts, houses] =
    await Promise.all([
      supabase.from("classrooms").select("*").order("sort_order"),
      supabase.from("streams").select("*, classrooms(name)").order("name"),
      supabase.from("vote_heads").select("*").order("code"),
      supabase.from("payment_types").select("*").order("name"),
      supabase.from("bank_accounts").select("*").order("bank"),
      supabase.from("houses").select("*").order("name"),
    ]);

  const errors = [classrooms, streams, voteHeads, paymentTypes, bankAccounts, houses]
    .map((r) => r.error)
    .filter(Boolean);

  if (errors.length > 0) {
    return NextResponse.json({ error: errors[0]!.message }, { status: 500 });
  }

  return NextResponse.json({
    data: {
      classrooms: classrooms.data,
      streams: streams.data,
      vote_heads: voteHeads.data,
      payment_types: paymentTypes.data,
      bank_accounts: bankAccounts.data,
      houses: houses.data,
    },
  });
}