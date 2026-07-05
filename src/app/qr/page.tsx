"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import QRCode from "qrcode";

const subscribeNoop = () => () => {};

// 配布用URLのQRコード生成ページ(管理者用)
export default function QRPage() {
  // SSR時は空文字、クライアントでは現在のオリジン(ハイドレーション不一致を避ける)
  const baseUrl = useSyncExternalStore(
    subscribeNoop,
    () => window.location.origin,
    () => ""
  );
  const [eventTag, setEventTag] = useState("kitakyushu_seminar_20260711");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const targetUrl = eventTag.trim()
    ? `${baseUrl}/?event=${encodeURIComponent(eventTag.trim())}`
    : `${baseUrl}/`;

  useEffect(() => {
    if (!canvasRef.current || !baseUrl) return;
    QRCode.toCanvas(canvasRef.current, targetUrl, {
      width: 320,
      margin: 2,
      color: { dark: "#3A332E", light: "#FFFFFF" },
    });
  }, [targetUrl, baseUrl]);

  const downloadQR = useCallback(() => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `qr_${eventTag.trim() || "general"}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  }, [eventTag]);

  return (
    <div className="app">
      <div className="brand-mark">Me-Cherish presents</div>
      <div className="card">
        <div className="eyebrow">ADMIN TOOL</div>
        <h1 className="title" style={{ fontSize: 24 }}>
          配布用QRコード作成
        </h1>
        <div className="subtitle">
          イベントタグを入力すると、そのイベント専用の診断URLとQRコードができます。回答は自動でこのタグ付きで記録されます。
        </div>

        <div className="section-label">イベントタグ(半角英数字とアンダースコア推奨)</div>
        <input
          className="text-input"
          type="text"
          value={eventTag}
          onChange={(e) => setEventTag(e.target.value)}
          placeholder="例:kitakyushu_seminar_20260711"
        />

        <div className="section-block" style={{ wordBreak: "break-all" }}>
          <div className="section-label">配布用URL</div>
          <div className="section-text" style={{ fontSize: 13.5 }}>
            {baseUrl ? targetUrl : "読み込み中…"}
          </div>
        </div>

        <div style={{ textAlign: "center", margin: "10px 0 16px" }}>
          <canvas
            ref={canvasRef}
            style={{ borderRadius: 12, border: "1px solid var(--line)", maxWidth: "100%" }}
          />
        </div>

        <button className="primary-btn" onClick={downloadQR}>
          QRコードをダウンロード(PNG)
        </button>
        <div className="footer-note">
          印刷物・スライドに貼って使ってください。
          <br />
          タグを分けると /admin でイベントごとの集計ができます。
        </div>
      </div>
    </div>
  );
}
