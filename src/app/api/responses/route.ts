import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, validatePayload } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const payload = validatePayload(body);
  if (!payload) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    // Supabase未設定でも診断自体は使えるようにしておく
    return NextResponse.json({ id: null, saved: false });
  }

  const { data, error } = await supabase
    .from("diagnosis_responses")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    console.error("insert error:", error.message);
    return NextResponse.json({ error: "save failed" }, { status: 500 });
  }

  return NextResponse.json({ id: data.id, saved: true });
}
