-- AI×わたし 相性診断:回答保存テーブル
-- SupabaseのSQL Editorにこのファイルの内容を貼り付けて実行してください。

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

-- 集計用インデックス
create index if not exists idx_diagnosis_responses_event_tag
  on public.diagnosis_responses (event_tag);

-- RLS(行レベルセキュリティ)を有効化。
-- 公開ポリシーは作らない = anonキーからは読み書き不可。
-- アプリのAPIルート(サーバー側)が service_role キーで読み書きする。
alter table public.diagnosis_responses enable row level security;
