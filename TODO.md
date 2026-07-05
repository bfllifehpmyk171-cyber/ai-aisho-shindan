# TODO / 要確認事項

## 🔴 最優先(これが終わるまで本番は動かない)

- [ ] **GitHub の新しい Personal Access Token を作成してプッシュする**
  - 旧トークンが失効しており、アプリ本体のコードがまだ GitHub に上がっていない(= Vercel 404 の原因)。
  - 手順:
    1. https://github.com/settings/tokens →「Generate new token (classic)」
    2. スコープは `repo` にチェック → 生成されたトークン(`ghp_...`)をコピー
    3. Claude Code に「新しいトークンは ghp_xxx です」と伝える(プッシュまで代行します)
  - プッシュ後、Vercel が自動デプロイ → https://ai-aisho-shindan.vercel.app が表示されるはず。

## 🟡 本番デプロイ後の確認チェックリスト(README にも記載)

- [ ] スマホ実機で診断を最後まで完了できる
- [ ] Supabase の Table Editor で `diagnosis_responses` に回答が入る
- [ ] LINE・Instagram ボタン → `wants_followup` が true になる
- [ ] `/admin` にパスコードでログインできグラフ表示される
- [ ] `/qr` で `kitakyushu_seminar_20260711` タグの QR を作成・配布物に貼る
- [ ] 結果画像(9:16)がスマホでダウンロードできる

## 🟢 要確認(仕様の判断が必要なもの)

- [ ] **質問文言・結果パターンのバリエーション追加**(夜間作業指示3)
  - 「文言は reference-diagnosis.html から変更禁止」という方針と矛盾するため未着手。
  - 追加するなら「既存文言は変えず、新パターンを増やす」形が候補。まゆさんの判断待ち。
- [ ] **`timeSavings`(浮く時間の目安)に「アンケート作成・集計分析(survey)」の項目がない**
  - 現状 survey を選んだ人にだけ時短目安が表示されない。参照元 HTML の仕様どおりなら現状維持で OK。
- [ ] **share-image.ts(結果画像生成)のテスト**は Canvas/DOM 依存のため未作成。必要なら jsdom + モックで追加可能。

## メモ

- 旧トークン(ghp_LANA...)は失効済み。git remote の URL に埋め込まれた状態なので、新トークンで URL を更新する。
- セミナー本番: 2026/7/11(土)北九州。
