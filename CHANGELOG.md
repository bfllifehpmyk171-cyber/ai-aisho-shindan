# CHANGELOG

## 2026-07-05(夜間作業)

### 修正

- **Vercel 404 の根本原因を特定・修正着手**
  - 原因: GitHub リモートの main が、リポジトリ作成時に自動生成された「README.md + .gitignore のみのコミット(ac778a2)」のままで、アプリ本体のコードが一度もプッシュされていなかった。Vercel はその空同然のリポジトリをビルドしていたため 404 になっていた(環境変数は無関係)。
  - 対応: リモートの初期コミットをローカルへマージ(`--allow-unrelated-histories -X ours`、ローカルのファイルを優先)。force-push は破壊的なので避け、通常のプッシュで反映する方針にした。
  - **未完了**: プッシュ時に GitHub のトークン認証エラーが発生(旧トークンが失効)。新しい Personal Access Token が必要 → TODO.md 参照。

- **`/qr` ページの lint エラー修正**(`react-hooks/set-state-in-effect`)
  - `useEffect` 内の `setBaseUrl(window.location.origin)` を `useSyncExternalStore` に置き換え。SSR時は空文字を返すためハイドレーション不一致もなし。表示・動作は変更なし。

### 追加

- **Vitest によるテスト導入**(`npm test`)
  - `src/lib/quiz-data.test.ts`: 診断ロジック `computeType` の全境界値(comfort ≤1 → A、≥5 → E、中間は domain 分岐)、`comboTags` / `comboPlatformText` / `permissionNote` の分岐、データ整合性(質問7問・タイプ6種・priority 全選択肢に comboMap / promptExamples が存在)を検証。23件すべて合格。
  - devDependency に `vitest` を追加。本番バンドルには影響しない。

### 見送り(判断理由つき)

- **指示3「質問文言・結果パターンのバリエーション追加」は着手せず**
  - プロジェクト方針「文言・ロジックは docs/reference-diagnosis.html から移植したもので変更禁止」と矛盾するため。保守的判断として現状維持とし、TODO.md に要確認事項として記録した。

### 検証結果

- `npm run build` ✓(全8ルート生成)
- `npm run lint` ✓(エラー0)
- `npm test` ✓(23件合格)
- ローカルプレビュー(スマホ幅 375px)で診断を最後まで完走 ✓、結果表示 ✓、プロンプトコピー ✓、/qr の QR 生成 ✓、コンソールエラーなし ✓
