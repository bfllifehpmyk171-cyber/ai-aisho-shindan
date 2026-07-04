import { createClient, SupabaseClient } from "@supabase/supabase-js";

// サーバー側専用のSupabaseクライアント。
// service_roleキーはクライアントに公開してはいけないため、APIルート内でのみ使用する。
// 環境変数が未設定の間(ローカル動作確認など)はnullを返し、保存をスキップできるようにする。
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

const ALLOWED_PERMISSION = ["free", "personal_only", "unsure", "restricted"];
const ALLOWED_DOMAIN = ["office", "people", "creative", "specialist", "management"];
const ALLOWED_TIME_SINK = ["doc", "research", "comm", "meeting", "sns", "data", "survey"];
const ALLOWED_STRENGTH = ["talk", "steady", "idea", "organize", "learn"];
const ALLOWED_PLATFORM = ["google", "microsoft", "both", "either"];
const ALLOWED_RESULT = ["A", "B", "C", "D", "E", "F"];

export interface ResponsePayload {
  event_tag: string;
  nickname: string | null;
  permission: string;
  domain: string;
  usage_level: number;
  feeling_level: number;
  time_sink: string;
  strength: string;
  platform: string;
  result_type: string;
}

// 想定外の値・過剰な長さのデータを保存しないためのバリデーション
export function validatePayload(body: unknown): ResponsePayload | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;

  const eventTag = typeof b.event_tag === "string" ? b.event_tag.slice(0, 100) : "general";
  const nickname =
    typeof b.nickname === "string" && b.nickname.trim()
      ? b.nickname.trim().slice(0, 20)
      : null;

  const usage = Number(b.usage_level);
  const feeling = Number(b.feeling_level);

  if (
    !ALLOWED_PERMISSION.includes(b.permission as string) ||
    !ALLOWED_DOMAIN.includes(b.domain as string) ||
    !Number.isInteger(usage) || usage < 0 || usage > 3 ||
    !Number.isInteger(feeling) || feeling < 0 || feeling > 3 ||
    !ALLOWED_TIME_SINK.includes(b.time_sink as string) ||
    !ALLOWED_STRENGTH.includes(b.strength as string) ||
    !ALLOWED_PLATFORM.includes(b.platform as string) ||
    !ALLOWED_RESULT.includes(b.result_type as string)
  ) {
    return null;
  }

  return {
    event_tag: eventTag || "general",
    nickname,
    permission: b.permission as string,
    domain: b.domain as string,
    usage_level: usage,
    feeling_level: feeling,
    time_sink: b.time_sink as string,
    strength: b.strength as string,
    platform: b.platform as string,
    result_type: b.result_type as string,
  };
}
