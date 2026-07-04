import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

// 同一event_tag内で「あなたと同じタイプの人の割合」を返す。
// 回答件数が5件未満のときは show: false(非表示)にする。
export async function GET(req: NextRequest) {
  const event = req.nextUrl.searchParams.get("event") || "general";
  const type = req.nextUrl.searchParams.get("type") || "";
  if (!/^[A-F]$/.test(type)) {
    return NextResponse.json({ show: false });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ show: false });
  }

  const [totalRes, sameRes] = await Promise.all([
    supabase
      .from("diagnosis_responses")
      .select("id", { count: "exact", head: true })
      .eq("event_tag", event),
    supabase
      .from("diagnosis_responses")
      .select("id", { count: "exact", head: true })
      .eq("event_tag", event)
      .eq("result_type", type),
  ]);

  const total = totalRes.count ?? 0;
  const same = sameRes.count ?? 0;

  if (totalRes.error || sameRes.error || total < 5) {
    return NextResponse.json({ show: false });
  }

  return NextResponse.json({
    show: true,
    total,
    same,
    percent: Math.round((same / total) * 100),
  });
}
