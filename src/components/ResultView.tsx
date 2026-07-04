"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Answers,
  comboMap,
  comboPlatformText,
  comboTags,
  computeType,
  permissionNote,
  promptExamples,
  resultTypes,
  timeSavings,
} from "@/lib/quiz-data";
import { Mascot } from "./Mascot";
import { generateShareImage } from "@/lib/share-image";

const LINE_URL = process.env.NEXT_PUBLIC_LINE_URL || "";
const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "";

interface Props {
  answers: Answers;
  nickname: string;
  eventTag: string;
  onRestart: () => void;
}

export function ResultView({ answers, nickname, eventTag, onRestart }: Props) {
  const type = computeType(answers);
  const r = resultTypes[type];
  const combo = answers.priority ? comboMap[answers.priority] : undefined;
  const promptText = (answers.priority && promptExamples[answers.priority]) || "";
  const timeSaving = answers.priority ? timeSavings[answers.priority] : undefined;

  const [copyLabel, setCopyLabel] = useState("このプロンプトをコピー");
  const [responseId, setResponseId] = useState<string | null>(null);
  const [typeShare, setTypeShare] = useState<{
    percent: number;
    total: number;
  } | null>(null);
  const [downloading, setDownloading] = useState(false);
  const savedRef = useRef(false);
  const followupSentRef = useRef(false);

  // 回答をSupabaseへ保存(個人情報は含まない)
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    (async () => {
      try {
        const res = await fetch("/api/responses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event_tag: eventTag,
            nickname: nickname || null,
            permission: answers.permission,
            domain: answers.domain,
            usage_level: answers.usage,
            feeling_level: answers.feeling,
            time_sink: answers.priority,
            strength: answers.strength,
            platform: answers.platform,
            result_type: type,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.id) setResponseId(data.id);
        }
      } catch {
        // 保存に失敗しても診断結果の表示は続行する
      }
      try {
        const res = await fetch(
          `/api/stats?event=${encodeURIComponent(eventTag)}&type=${type}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.show) setTypeShare({ percent: data.percent, total: data.total });
        }
      } catch {
        // 集計が取れない場合は非表示のまま
      }
    })();
  }, [answers, eventTag, nickname, type]);

  const copyPrompt = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(promptText);
    } catch {
      // http環境・古い端末向けフォールバック
      const ta = document.createElement("textarea");
      ta.value = promptText;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopyLabel("コピーしました！");
    setTimeout(() => setCopyLabel("このプロンプトをコピー"), 1800);
  }, [promptText]);

  const markFollowup = useCallback(() => {
    if (followupSentRef.current || !responseId) return;
    followupSentRef.current = true;
    fetch(`/api/responses/${responseId}/followup`, {
      method: "POST",
      keepalive: true,
    }).catch(() => {});
  }, [responseId]);

  const downloadShareImage = useCallback(async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const dataUrl = await generateShareImage(r, nickname);
      const link = document.createElement("a");
      link.download = "ai-aisho-shindan.png";
      link.href = dataUrl;
      link.click();
    } catch {
      alert("画像の生成に失敗しました。もう一度お試しください。");
    } finally {
      setDownloading(false);
    }
  }, [downloading, r, nickname]);

  return (
    <div className="card">
      <div className="result-badge">診断結果</div>
      <Mascot message="結果が出ました！あなたにぴったりの使い方、見ていきましょう✨" size={56} />
      {nickname && (
        <div className="q-number" style={{ marginBottom: 4 }}>
          {nickname}さんは…
        </div>
      )}
      <div className="result-name">{r.name}</div>
      <div className="result-catch">{r.catch}</div>

      <div className="section-block">
        <div className="section-label">✓ あなたの強み</div>
        <div className="section-text">{r.strength}</div>
      </div>

      <div className="section-block">
        <div className="section-label">◎ ここを伸ばすともっと良くなる点</div>
        <div className="section-text">{r.growth}</div>
      </div>

      <div className="section-block">
        <div className="section-label">あなたに合うAIの活かし方</div>
        <div className="section-text">
          {r.tools.map((t) => (
            <span className="tool-tag" key={t}>
              {t}
            </span>
          ))}
        </div>
        <div className="section-text" style={{ marginTop: 10 }}>
          {permissionNote(answers.permission)}
        </div>
      </div>

      <div className="section-block">
        <div className="section-label">
          その「時間がかかっている業務」、こう掛け合わせるとラクになります
        </div>
        <div className="section-text">
          {comboTags(answers.platform).map((t) => (
            <span className="tool-tag" key={t}>
              {t}
            </span>
          ))}
          {combo && (
            <div className="section-text" style={{ marginTop: 10 }}>
              {comboPlatformText(answers.priority, answers.platform)} {combo.common}
            </div>
          )}
          {timeSaving && (
            <div
              className="section-text"
              style={{ marginTop: 10, color: "var(--rose-deep)", fontWeight: 700 }}
            >
              ⏰ 浮く時間の目安:{timeSaving}(あくまで目安です)
            </div>
          )}
        </div>
      </div>

      {typeShare && (
        <div className="section-block" style={{ background: "var(--sage-pale)" }}>
          <div className="section-label" style={{ color: "var(--sage)" }}>
            📍 この会場でのあなたの位置
          </div>
          <div className="section-text">
            同じイベントで回答した{typeShare.total}人のうち、
            <b>{typeShare.percent}%</b>があなたと同じ「{r.name}」タイプでした。
          </div>
        </div>
      )}

      <div className="section-block">
        <div className="section-label">📋 今日から使えるコピペ用プロンプト</div>
        <div className="prompt-box">{promptText}</div>
        <button className="copy-btn" onClick={copyPrompt}>
          {copyLabel}
        </button>
      </div>

      <div className="section-block">
        <div className="section-label">🤝 AIを「秘書」にする3つのコツ</div>
        <div className="section-text">
          <b>①いつも同じ指示は覚えさせる</b>
          :「メールはこのトーンで」「資料はこの形式で」など、繰り返す指示はカスタム指示やメモリ機能に登録しておくと、毎回説明する手間がなくなります。
          <br />
          <br />
          <b>②背景情報を渡す</b>
          :優秀な秘書ほど「察して」動けるのは、事情を知っているから。AIも同じで、状況や目的を先に伝えるほど的確な提案が返ってきます。
          <br />
          <br />
          <b>③丸投げせず、最終判断は自分でする</b>
          :秘書は代わりに動いてくれますが、決めるのはあなた自身。AIの提案はたたき台として使うのが安全です。
        </div>
      </div>

      <div className="section-block">
        <div className="section-label">📈 マスターしていくロードマップ</div>
        <div className="roadmap-row">
          <div className="roadmap-item">
            <div className="roadmap-lv">Lv1</div>
            <div className="roadmap-text">
              <b>まずはここから</b>
              :ChatGPT・Claude・Geminiのどれか1つに、今日の悩みごとを話しかけてみる。
            </div>
          </div>
          <div className="roadmap-item">
            <div className="roadmap-lv">Lv2</div>
            <div className="roadmap-text">
              <b>慣れてきたら</b>
              :定型業務をテンプレ化し、同じ指示を毎回使い回す。資料作成ならCanvaと組み合わせる。
            </div>
          </div>
          <div className="roadmap-item">
            <div className="roadmap-lv">Lv3</div>
            <div className="roadmap-text">
              <b>マスターレベル</b>:Claude(相談・下書き)、Claude
              Cowork(資料横断・複数アプリ連携)、Claude
              Code(繰り返す作業の自動化)を使い分けて、仕組みそのものを作る。
            </div>
          </div>
        </div>
      </div>

      <div className="section-block">
        <div className="section-label">今日からできる一歩</div>
        <div className="section-text">{r.action}</div>
      </div>

      <button
        className="secondary-btn"
        onClick={downloadShareImage}
        disabled={downloading}
        style={{ marginTop: 8 }}
      >
        {downloading ? "画像を作成中…" : "📷 結果画像をダウンロード(ストーリーズ用)"}
      </button>

      {LINE_URL && (
        <a
          className="sns-btn sns-line"
          href={LINE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={markFollowup}
        >
          LINE公式アカウントで続きを受け取る
        </a>
      )}
      {INSTAGRAM_URL && (
        <a
          className="sns-btn sns-instagram"
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={markFollowup}
        >
          Instagramをフォローする
        </a>
      )}

      <button className="primary-btn" onClick={onRestart} style={{ marginTop: 8 }}>
        もう一度診断する
      </button>
      <div className="footer-note">
        この診断は、あなたに合うAIとの付き合い方を見つけるためのきっかけです。
        <br />
        もっと自分に合う使い方を知りたい方は、まゆまでお気軽に🌸
      </div>
    </div>
  );
}
