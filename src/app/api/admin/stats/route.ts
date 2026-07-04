import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

interface ResponseRow {
  event_tag: string;
  result_type: string | null;
  time_sink: string | null;
  platform: string | null;
  wants_followup: boolean;
}

function countBy(rows: ResponseRow[], key: keyof ResponseRow): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    const v = String(row[key] ?? "unknown");
    counts[v] = (counts[v] ?? 0) + 1;
  }
  return counts;
}

export async function POST(req: NextRequest) {
  let body: { passcode?: string; event?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const passcode = process.env.ADMIN_PASSCODE;
  if (!passcode || body.passcode !== passcode) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "supabase not configured" }, { status: 503 });
  }

  let query = supabase
    .from("diagnosis_responses")
    .select("event_tag, result_type, time_sink, platform, wants_followup");
  if (body.event && body.event !== "all") {
    query = query.eq("event_tag", body.event);
  }

  const { data, error } = await query;
  if (error) {
    console.error("admin stats error:", error.message);
    return NextResponse.json({ error: "query failed" }, { status: 500 });
  }

  const rows = (data ?? []) as ResponseRow[];

  // イベントタグ一覧は絞り込みなしで取得(フィルターの選択肢用)
  const { data: tagData } = await supabase
    .from("diagnosis_responses")
    .select("event_tag");
  const eventTags = Array.from(
    new Set(((tagData ?? []) as { event_tag: string }[]).map((r) => r.event_tag))
  ).sort();

  return NextResponse.json({
    total: rows.length,
    byType: countBy(rows, "result_type"),
    byTimeSink: countBy(rows, "time_sink"),
    byPlatform: countBy(rows, "platform"),
    followupCount: rows.filter((r) => r.wants_followup).length,
    eventTags,
  });
}
