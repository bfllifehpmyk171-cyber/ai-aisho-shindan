# AI×わたし 相性診断

Me-Cherish の AI活用診断Webアプリ。8つの質問に答えると6タイプのいずれかの診断結果が表示されます。
2026/7/11 北九州女性リーダー向けセミナーで配布、その後はMe-Cherishコミュニティで継続利用。

- フレームワーク:Next.js(App Router)+ TypeScript + Tailwind CSS
- データベース:Supabase(回答データのみ保存。個人情報は保存しない)
- ホスティング:Vercel

## ページ構成

| パス | 内容 |
| --- | --- |
| `/` | 診断本体(`?event=タグ名` でイベントタグ付き回答になる。未指定は `general`) |
| `/qr` | 配布用QRコード作成(管理者用) |
| `/admin` | 集計ダッシュボード(パスコード保護、rechartsグラフ) |

## 1. Supabaseのセットアップ

1. [supabase.com](https://supabase.com) にログインして「New project」で新規プロジェクトを作成
   (Region は Northeast Asia (Tokyo) がおすすめ。Database Password は控えておく)
2. 左メニューの **SQL Editor** を開き、[`supabase/schema.sql`](supabase/schema.sql) の内容を貼り付けて **Run**
3. 左メニューの **Project Settings → API** から以下の2つをコピー
   - `Project URL` → 環境変数 `NEXT_PUBLIC_SUPABASE_URL`
   - `service_role` の secret キー → 環境変数 `SUPABASE_SERVICE_ROLE_KEY`
     (**service_roleキーは絶対に公開しない**。このアプリではサーバー側のAPIルートだけが使います)

テーブル作成SQL(`supabase/schema.sql` と同じ内容):

```sql
create table if not exists public.diagnosis_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event_tag text not null default 'general',
  nickname text,
  permission text,
  domain text,
  usage_level int,
  feeling_level int,
  time_sink text,
  strength text,
  platform text,
  result_type text,
  wants_followup boolean not null default false
);

create index if not exists idx_diagnosis_responses_event_tag
  on public.diagnosis_responses (event_tag);

alter table public.diagnosis_responses enable row level security;
```

RLSを有効にして公開ポリシーを作らないため、anonキーからは読み書きできません。
読み書きはすべてアプリのAPIルート(サーバー側)がservice_roleキーで行います。

## 2. ローカルでの動作確認

前提:Node.js 22(このMacでは `~/.local/node22` にインストール済み。ターミナルを開き直せばPATHが通っています)

```bash
cd /Users/tsunodamayuka/Desktop/mecherish-ai-shindan/ai-compatibility-quiz
npm install        # 初回のみ
npm run dev
```

ブラウザで <http://localhost:3000> を開く。

- `.env.local` に Supabase の URL とキーを記入すると回答が保存されるようになります
  (未記入でも診断自体は動きます。保存だけスキップされます)
- イベントタグ付きの動作確認:<http://localhost:3000/?event=test>
- 管理画面:<http://localhost:3000/admin>(パスコードは `.env.local` の `ADMIN_PASSCODE`)

`.env.local` の項目([`.env.local.example`](.env.local.example) 参照):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=(service_roleのsecretキー)
NEXT_PUBLIC_LINE_URL=https://lin.ee/nArfnrF
NEXT_PUBLIC_INSTAGRAM_URL=https://www.instagram.com/me.cherish_official/
ADMIN_PASSCODE=(好きなパスコード)
```

## 3. Vercelへのデプロイ手順

1. GitHubにリポジトリを作成し、このフォルダをpush
   ```bash
   cd /Users/tsunodamayuka/Desktop/mecherish-ai-shindan/ai-compatibility-quiz
   git add -A && git commit -m "AI×わたし 相性診断"
   # GitHubで空のリポジトリを作成後:
   git remote add origin https://github.com/<ユーザー名>/ai-compatibility-quiz.git
   git push -u origin main
   ```
2. [vercel.com](https://vercel.com) にGitHubアカウントでログイン → **Add New → Project** → リポジトリを選択
3. **Environment Variables** に `.env.local` と同じ5つの変数を登録
   (`SUPABASE_SERVICE_ROLE_KEY` と `ADMIN_PASSCODE` は特に間違えずに)
4. **Deploy** を押す → `https://<プロジェクト名>.vercel.app` が発行される
5. 発行されたURLで `/qr` を開き、`kitakyushu_seminar_20260711` などのイベントタグでQRコードを作成して配布物に貼る

デプロイ後の確認チェックリスト:

- [ ] スマホの実機で診断を最後まで完了できる
- [ ] コピペ用プロンプトの「コピー」ボタンが動く
- [ ] SupabaseのTable Editorで `diagnosis_responses` に回答が入っている
- [ ] LINE・Instagramボタンを押すと `wants_followup` が `true` になる
- [ ] `/admin` にパスコードでログインでき、グラフが表示される
- [ ] 結果画像(9:16)がダウンロードできる

## 実装メモ

- 質問文・診断ロジック・結果文言・マスコットSVGは `docs/reference-diagnosis.html` から忠実に移植(文言変更禁止)
- 技術仕様は `docs/spec.md` を参照
- 「同じタイプの人の割合」は同一イベントタグ内の回答が **5件以上** のときだけ表示
- 結果シェア画像はWebフォント埋め込みが重いため html-to-image ではなく Canvas API で直接描画
- ニックネームは任意入力。氏名・連絡先は一切保存しない設計
