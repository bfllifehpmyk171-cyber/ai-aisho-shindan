"use client";

import { useCallback, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { resultTypes, ResultTypeId } from "@/lib/quiz-data";

const TIME_SINK_LABELS: Record<string, string> = {
  doc: "資料・提案書",
  research: "リサーチ",
  comm: "メール・チャット",
  meeting: "会議・議事録",
  sns: "SNS・画像",
  data: "データ入力・集計",
  survey: "アンケート",
};

const PLATFORM_LABELS: Record<string, string> = {
  google: "Google系",
  microsoft: "Microsoft系",
  both: "両方",
  either: "こだわりなし",
};

interface Stats {
  total: number;
  byType: Record<string, number>;
  byTimeSink: Record<string, number>;
  byPlatform: Record<string, number>;
  followupCount: number;
  eventTags: string[];
}

function toChartData(
  counts: Record<string, number>,
  labels: Record<string, string>,
  order?: string[]
) {
  const keys = order ?? Object.keys(counts).sort();
  return keys
    .filter((k) => order || counts[k] !== undefined)
    .map((k) => ({ name: labels[k] ?? k, count: counts[k] ?? 0 }));
}

export default function AdminPage() {
  const [passcode, setPasscode] = useState("");
  const [authed, setAuthed] = useState(false);
  const [eventFilter, setEventFilter] = useState("all");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchStats = useCallback(
    async (pass: string, event: string) => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/admin/stats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ passcode: pass, event }),
        });
        if (res.status === 401) {
          setError("パスコードが違います");
          setAuthed(false);
          return;
        }
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(
            data.error === "supabase not configured"
              ? "Supabaseが未設定です(.env.localを確認してください)"
              : "データの取得に失敗しました"
          );
          return;
        }
        setStats(await res.json());
        setAuthed(true);
      } catch {
        setError("通信エラーが発生しました");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const typeData = stats
    ? (["A", "B", "C", "D", "E", "F"] as ResultTypeId[]).map((t) => ({
        name: `${t}:${resultTypes[t].name}`,
        count: stats.byType[t] ?? 0,
      }))
    : [];

  return (
    <div className="app" style={{ maxWidth: 720 }}>
      <div className="brand-mark">Me-Cherish presents</div>
      <div className="card">
        <div className="eyebrow">ADMIN DASHBOARD</div>
        <h1 className="title" style={{ fontSize: 24 }}>
          回答集計ダッシュボード
        </h1>

        {!authed ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchStats(passcode, eventFilter);
            }}
          >
            <div className="subtitle">パスコードを入力してください。</div>
            <input
              className="text-input"
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="パスコード"
              autoFocus
            />
            {error && (
              <div className="section-text" style={{ color: "var(--rose-deep)", marginBottom: 10 }}>
                {error}
              </div>
            )}
            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? "確認中…" : "ログイン"}
            </button>
          </form>
        ) : stats ? (
          <>
            <div className="section-label" style={{ marginTop: 8 }}>
              イベントで絞り込み
            </div>
            <select
              className="text-input"
              value={eventFilter}
              onChange={(e) => {
                setEventFilter(e.target.value);
                fetchStats(passcode, e.target.value);
              }}
            >
              <option value="all">すべて</option>
              {stats.eventTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>

            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <div className="section-block" style={{ flex: 1, marginBottom: 0, textAlign: "center" }}>
                <div className="section-label">総回答数</div>
                <div className="result-name" style={{ fontSize: 32 }}>
                  {stats.total}
                </div>
              </div>
              <div className="section-block" style={{ flex: 1, marginBottom: 0, textAlign: "center" }}>
                <div className="section-label">フォロー導線クリック</div>
                <div className="result-name" style={{ fontSize: 32 }}>
                  {stats.followupCount}
                  <span style={{ fontSize: 15, color: "var(--ink-soft)" }}>
                    件(
                    {stats.total > 0
                      ? Math.round((stats.followupCount / stats.total) * 100)
                      : 0}
                    %)
                  </span>
                </div>
              </div>
            </div>

            <div className="section-block">
              <div className="section-label">タイプ別(A〜F)</div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={typeData} margin={{ top: 8, right: 8, left: -20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E3D7C8" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#B5677A" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="section-block">
              <div className="section-label">時間がかかっている業務別</div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={toChartData(stats.byTimeSink, TIME_SINK_LABELS, [
                    "doc", "research", "comm", "meeting", "sns", "data", "survey",
                  ])}
                  margin={{ top: 8, right: 8, left: -20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E3D7C8" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8A9A7E" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="section-block">
              <div className="section-label">ツール環境別</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={toChartData(stats.byPlatform, PLATFORM_LABELS, [
                    "google", "microsoft", "both", "either",
                  ])}
                  margin={{ top: 8, right: 8, left: -20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E3D7C8" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8F4657" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <button
              className="secondary-btn"
              onClick={() => fetchStats(passcode, eventFilter)}
              disabled={loading}
            >
              {loading ? "更新中…" : "最新データに更新"}
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
