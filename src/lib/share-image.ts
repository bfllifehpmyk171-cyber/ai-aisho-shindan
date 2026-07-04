// 診断結果のシェア画像(Instagramストーリー比率 1080x1920)をCanvasで生成する。
// html-to-imageは日本語Webフォントのサブセット埋め込みに時間がかかりすぎるため、
// ページに読み込み済みのフォントをそのまま使えるCanvas描画を採用している。

import type { ResultType } from "./quiz-data";

const MASCOT_SVG = `<svg width="360" height="360" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="50" cy="88" rx="26" ry="6" fill="#E3D7C8" opacity="0.5"/>
  <path d="M28 34 Q22 14 34 18 Q38 26 36 36 Z" fill="#B5677A"/>
  <path d="M72 34 Q78 14 66 18 Q62 26 64 36 Z" fill="#B5677A"/>
  <circle cx="50" cy="52" r="30" fill="#FBF6EF" stroke="#B5677A" stroke-width="2.5"/>
  <circle cx="40" cy="50" r="3.2" fill="#3A332E"/>
  <circle cx="60" cy="50" r="3.2" fill="#3A332E"/>
  <path d="M42 60 Q50 66 58 60" stroke="#3A332E" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <circle cx="30" cy="58" r="4" fill="#F0DCE0"/>
  <circle cx="70" cy="58" r="4" fill="#F0DCE0"/>
  <path d="M78 30 L80 36 L86 38 L80 40 L78 46 L76 40 L70 38 L76 36 Z" fill="#8A9A7E"/>
</svg>`;

function fontFamily(cssVar: string, fallback: string): string {
  const v = getComputedStyle(document.body).getPropertyValue(cssVar).trim();
  return v || fallback;
}

function loadMascot(): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(
      new Blob([MASCOT_SVG], { type: "image/svg+xml" })
    );
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}

function wrapJa(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const lines: string[] = [];
  let line = "";
  for (const ch of text) {
    if (ctx.measureText(line + ch).width > maxWidth && line) {
      lines.push(line);
      line = ch;
    } else {
      line += ch;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function generateShareImage(
  result: ResultType,
  nickname?: string
): Promise<string> {
  const serif = fontFamily("--font-shippori-mincho", "'Shippori Mincho', serif");
  const sans = fontFamily("--font-noto-sans-jp", "'Noto Sans JP', sans-serif");

  // 使用するサイズのフォントを、実際に描画する文字列を渡して事前に読み込む
  // (日本語フォントはunicode-rangeで分割されているため、文字列を渡さないと必要なサブセットが読み込まれない)
  const allText = `${result.name}${result.catch}${nickname ?? ""}AI×わたし 相性診断さんの診断結果あなたに合うAIの使い方、見つけよう`;
  await Promise.all([
    document.fonts.load(`700 88px ${serif}`, allText),
    document.fonts.load(`500 64px ${serif}`, allText),
    document.fonts.load(`400 36px ${sans}`, allText),
    document.fonts.load(`700 30px ${sans}`, allText),
  ]).catch(() => {});

  const W = 1080;
  const H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // 背景(アイボリーのグラデーション)
  const grad = ctx.createRadialGradient(W * 0.2, 0, 100, W * 0.2, 0, H * 1.1);
  grad.addColorStop(0, "#FDF9F3");
  grad.addColorStop(0.6, "#FBF6EF");
  grad.addColorStop(1, "#F3EAE0");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // ブランドマーク
  ctx.fillStyle = "#8F4657";
  ctx.font = `500 34px ${serif}`;
  ctx.fillText("M e - C h e r i s h   p r e s e n t s", W / 2, 190);

  // タイトル
  ctx.fillStyle = "#3A332E";
  ctx.font = `500 64px ${serif}`;
  ctx.fillText("AI×わたし 相性診断", W / 2, 300);

  // マスコット
  const mascot = await loadMascot();
  ctx.drawImage(mascot, (W - 360) / 2, 380, 360, 360);

  // バッジ
  const badgeText = nickname ? `${nickname}さんの診断結果` : "わたしの診断結果";
  ctx.font = `700 30px ${sans}`;
  const badgeW = ctx.measureText(badgeText).width + 88;
  ctx.fillStyle = "#E6EBDF";
  roundRect(ctx, (W - badgeW) / 2, 810, badgeW, 78, 39);
  ctx.fill();
  ctx.fillStyle = "#6D7F60";
  ctx.fillText(badgeText, W / 2, 810 + 40);

  // タイプ名
  ctx.fillStyle = "#8F4657";
  ctx.font = `700 88px ${serif}`;
  const nameLines = wrapJa(ctx, result.name, W - 160);
  let y = 990;
  for (const line of nameLines) {
    ctx.fillText(line, W / 2, y);
    y += 112;
  }

  // キャッチコピー(白カード)
  ctx.font = `400 36px ${sans}`;
  const catchLines = wrapJa(ctx, result.catch, W - 300);
  const cardH = catchLines.length * 62 + 110;
  const cardY = y + 30;
  ctx.fillStyle = "rgba(143,70,87,0.08)";
  roundRect(ctx, 90 + 6, cardY + 10, W - 180, cardH, 44);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  roundRect(ctx, 90, cardY, W - 180, cardH, 44);
  ctx.fill();
  ctx.strokeStyle = "#E3D7C8";
  ctx.lineWidth = 3;
  roundRect(ctx, 90, cardY, W - 180, cardH, 44);
  ctx.stroke();

  ctx.fillStyle = "#6B5F56";
  let cy = cardY + 78;
  for (const line of catchLines) {
    ctx.fillText(line, W / 2, cy);
    cy += 62;
  }

  // フッター
  ctx.fillStyle = "#6B5F56";
  ctx.font = `400 30px ${sans}`;
  ctx.fillText("あなたに合うAIの使い方、見つけよう 🌸", W / 2, cardY + cardH + 120);

  return canvas.toDataURL("image/png");
}
