// reference-diagnosis.html から移植した診断データ。文言は変更しないこと。

export type QuestionKey =
  | "permission"
  | "domain"
  | "usage"
  | "feeling"
  | "priority"
  | "platform"
  | "strength";

export type Answers = {
  permission?: string;
  domain?: string;
  usage?: number;
  feeling?: number;
  priority?: string;
  platform?: string;
  strength?: string;
};

export type ResultTypeId = "A" | "B" | "C" | "D" | "E" | "F";

export interface Question {
  key: QuestionKey;
  text: string;
  options: { label: string; value: string | number }[];
}

export const questions: Question[] = [
  {
    key: "permission",
    text: "お仕事でAIを使うこと、今どんな感じですか？",
    options: [
      { label: "会社でも自由に使ってOK", value: "free" },
      { label: "会社ではNGだけど個人なら使える", value: "personal_only" },
      { label: "正直ルールがよくわからない", value: "unsure" },
      { label: "使わない方がいい雰囲気", value: "restricted" },
    ],
  },
  {
    key: "domain",
    text: "普段のお仕事に一番近いのは？",
    options: [
      { label: "事務・管理系のお仕事", value: "office" },
      { label: "人と接する・対人支援のお仕事", value: "people" },
      { label: "企画・クリエイティブ系のお仕事", value: "creative" },
      { label: "専門職(士業・医療・福祉など)", value: "specialist" },
      { label: "経営・マネジメント", value: "management" },
    ],
  },
  {
    key: "usage",
    text: "今のAI活用レベルは？",
    options: [
      { label: "聞いたことはあるけど使ったことない", value: 0 },
      { label: "たまに調べ物で使うくらい", value: 1 },
      { label: "仕事でそこそこ使っている", value: 2 },
      { label: "がっつり使いこなしている", value: 3 },
    ],
  },
  {
    key: "feeling",
    text: "AIに対する今の気持ちに近いのは？",
    options: [
      { label: "正直ちょっと怖い・不安", value: 0 },
      { label: "興味はあるけど時間がない", value: 1 },
      { label: "得意そう、もっと使いたい", value: 2 },
      { label: "使えないと逆に不安になってきた", value: 3 },
    ],
  },
  {
    key: "priority",
    text: "普段のお仕事で、一番時間がかかっている・大変だと感じることは？",
    options: [
      { label: "資料・提案書づくり", value: "doc" },
      { label: "情報収集・リサーチ", value: "research" },
      { label: "メール・チャット対応", value: "comm" },
      { label: "会議準備・議事録まとめ", value: "meeting" },
      { label: "SNS発信・画像づくり", value: "sns" },
      { label: "エクセルなどのデータ入力・集計", value: "data" },
      { label: "アンケート作成・集計分析", value: "survey" },
    ],
  },
  {
    key: "platform",
    text: "普段よく使っているのはどちらですか？",
    options: [
      { label: "Google系(Gmail・スプレッドシートなど)", value: "google" },
      { label: "Microsoft系(Outlook・Excel・Teamsなど)", value: "microsoft" },
      { label: "両方使っている", value: "both" },
      { label: "特にこだわりはない", value: "either" },
    ],
  },
  {
    key: "strength",
    text: "自分の得意なことに近いのは？",
    options: [
      { label: "人と話すこと・聴くこと", value: "talk" },
      { label: "コツコツ丁寧に作業すること", value: "steady" },
      { label: "発想やアイデアを出すこと", value: "idea" },
      { label: "整理整頓・段取り", value: "organize" },
      { label: "新しいことを学ぶこと", value: "learn" },
    ],
  },
];

export interface ResultType {
  name: string;
  catch: string;
  strength: string;
  growth: string;
  tools: string[];
  action: string;
}

export const resultTypes: Record<ResultTypeId, ResultType> = {
  A: {
    name: "はじめの一歩さん",
    catch:
      "AIとはまだ「知り合ったばかり」。だからこそ、この先の伸びしろが一番大きいタイプです。",
    strength:
      "食わず嫌いをせず、今日ここに来て試してみようとしている時点で、実はもう最初の一歩を踏み出しています。素直に試せることは大きな強みです。",
    growth:
      "「難しそう」「失敗したくない」という気持ちが、一歩を小さくブレーキさせがち。完璧を目指さず、まず1つだけ質問してみるところから始めましょう。",
    tools: ["ChatGPT", "Claude", "Gemini"],
    action:
      "スマホでChatGPT・Claude・Geminiのどれか1つを開き、「今日困っていること」をそのまま話しかけてみてください。どれを選んでも大丈夫、それだけで十分な第一歩です。",
  },
  B: {
    name: "効率化ハンター",
    catch: "目の前の業務を「早く・正確に」片付けたい、実務派タイプです。",
    strength:
      "何にAIを使うと楽になるか、業務のポイントを見極める力があります。ムダな作業を見つけるセンスは立派な強みです。",
    growth:
      "AIに任せきりにして、最終チェックを飛ばしてしまうと信頼を落とすことも。「下書きはAI、仕上げは自分」の線引きを持つと安心です。",
    tools: ["Claude", "ChatGPT", "Gemini(Google Workspace)"],
    action:
      "次に資料を作るとき、最初の下書きをAIに任せてみてください。ゼロから作るより格段に早くなります。",
  },
  C: {
    name: "発想ブースターさん",
    catch: "アイデアを広げるのが得意な、企画・クリエイティブタイプです。",
    strength:
      "AIを「壁打ち相手」として使うのが一番向いています。突飛なアイデアも臆せず出せる柔軟さは大きな武器です。",
    growth:
      "アイデアが広がりすぎて、まとまらなくなることも。AIに「3つに絞って」「一番現実的なのはどれ？」と聞く癖をつけると収束しやすくなります。",
    tools: ["Claude", "ChatGPT", "Canva AI"],
    action:
      "次の企画で、AIに「全く違う方向性を3つ出して」と頼んでみてください。自分では出てこない視点が手に入ります。",
  },
  D: {
    name: "信頼の伴走者さん",
    catch:
      "人と向き合う仕事だからこそ、AIとの向き合い方にも慎重さがあるタイプです。",
    strength:
      "情報の扱いに慎重で、相手を大切にする姿勢そのものが専門職としての信頼につながっています。",
    growth:
      "「使ってはいけない気がする」という思い込みで一歩が止まりがち。まずは業務外の個人利用や学習目的から、小さく試してみて大丈夫です。",
    tools: ["Claude", "ChatGPT(個人利用から)"],
    action:
      "仕事の情報は使わず、まず「自分の勉強のため」にAIへ質問してみてください。使用感をつかむだけで十分な収穫です。",
  },
  E: {
    name: "使いこなし発信者さん",
    catch:
      "すでにAIを味方につけている、頼れる存在です。次は「仕組み化」のフェーズです。",
    strength:
      "使いこなす力はすでに十分。次のステージは、それを自分だけでなく周りにも広げていくことです。",
    growth:
      "便利さが当たり前になり、周りと差がついていることに気づきにくいことも。知っていることを言葉にして共有すると、あなた自身の価値にもなります。",
    tools: ["Claude Code", "Claude Cowork", "Zapier/Make(自動化連携)"],
    action:
      "繰り返しやっている作業を1つ選んで、AIに「仕組み化」してもらいましょう。それが再現性のある資産になります。",
  },
  F: {
    name: "経営ナビゲーターさん",
    catch:
      "全体を見て判断する立場だからこそ、AIを「意思決定の相棒」にできるタイプです。",
    strength:
      "複数の情報を整理して判断する力があるので、AIに情報をまとめさせてから最終判断する、という使い方が非常に相性がいいです。",
    growth:
      "自分で全部把握していないと不安になり、AIに任せる範囲を狭めがち。まずは資料の下読み・要約からAIに任せてみましょう。",
    tools: ["Claude", "Gemini(Google Workspace)", "ChatGPT"],
    action:
      "次の会議前に、関連資料をAIに読み込ませて要点を3つにまとめてもらってください。判断のスピードが変わります。",
  },
};

export function computeType(answers: Answers): ResultTypeId {
  const comfort = (answers.usage ?? 0) + (answers.feeling ?? 0);
  if (comfort <= 1) return "A";
  if (comfort >= 5) return "E";
  switch (answers.domain) {
    case "office":
      return "B";
    case "creative":
      return "C";
    case "people":
    case "specialist":
      return "D";
    case "management":
      return "F";
    default:
      return "B";
  }
}

export const comboMap: Record<
  string,
  { google: string; microsoft: string; common: string }
> = {
  doc: {
    google: "Gemini(Google Slides連携)がそのままスライド化まで進めてくれます。",
    microsoft:
      "Copilot(PowerPoint連携)が資料の下書きから仕上げまで一気通貫でできます。",
    common:
      "「資料作成がイマイチ」という声のほとんどは、いきなり完成文章を求めていることが原因です。①まず見出し構成だけ作らせる→②確認・修正してから本文を肉付けする、の2段階に分けると精度が一気に上がります。文章が固まったら、Canvaに読み込ませてデザインを整え、Canvaの「Magic Write」機能で見出しのキャッチコピー案を出すのもおすすめです。",
  },
  research: {
    google: "Gemini(Google検索連携)がその場で検索結果を要約してくれます。",
    microsoft: "Copilot(Bing連携)が検索から要約まで一気に対応します。",
    common:
      "Claudeは調べた内容の整理・レポート化が得意。幅広く比較したいときはChatGPTのDeep ResearchやPerplexityも便利です。",
  },
  comm: {
    google:
      "Gmailを使っているなら、Geminiが受信メールを読んでそのまま返信の下書きを作ってくれます。",
    microsoft:
      "Outlookなら、Copilotがメールの要約・返信下書きをその場で作成できます。",
    common:
      "ChatGPTやClaudeは、文面のトーン(丁寧・カジュアルなど)を細かく調整したいときに向いています。",
  },
  meeting: {
    google:
      "Google Meetの文字起こし機能とGeminiを組み合わせると、議事録が自動でまとまります。",
    microsoft:
      "Teamsの文字起こし機能とCopilotを組み合わせると、要点とタスクが自動整理されます。",
    common:
      "Otter.aiで録音を文字起こしし、ClaudeやNotion AIに読み込ませて要点整理・タスク化するのもおすすめです。",
  },
  sns: {
    google: "",
    microsoft: "",
    common:
      "Canvaの「Magic Write」機能で画像・デザインとキャプション文の両方を一気に作れます。ChatGPTやClaudeにキャプションを何パターンか考えてもらい、Canvaでデザインに流し込むと質が安定します。動画発信ならCapCutのAI編集機能も時短になります。",
  },
  data: {
    google:
      "Googleスプレッドシートなら、Geminiが関数作成や集計をその場で手伝ってくれます。",
    microsoft:
      "Excelなら、Copilotが関数作成・ピボットテーブルの提案までしてくれます。",
    common:
      "ChatGPTはデータ分析機能でグラフ化まで得意なので、報告資料への転用もスムーズです。",
  },
  survey: {
    google:
      "Googleフォームで集めた回答は、そのままGeminiでスプレッドシートを分析させると傾向が見えてきます。",
    microsoft:
      "Microsoft Formsで集めた回答は、Copilotに読み込ませると自由記述のコメントも分類・要約してくれます。",
    common:
      "質問文づくり自体もClaudeやChatGPTに相談すると、回答が集まりやすい聞き方に整えてもらえます。自由記述の分析はClaudeが得意です。",
  },
};

// spec.md「浮く時間の目安」(数値は目安として明記)
export const timeSavings: Record<string, string> = {
  doc: "1本あたり30分〜1時間の時短",
  research: "調べ物1回あたり15〜30分の時短",
  comm: "1日あたり10〜20分の時短",
  meeting: "会議1回あたり20〜30分の時短",
  sns: "投稿1本あたり20〜40分の時短",
  data: "集計作業1回あたり15〜30分の時短",
};

export const promptExamples: Record<string, string> = {
  doc: "【ステップ1:骨子だけ】\n「以下の情報をもとに、資料の見出し構成だけ3パターン考えてください。本文はまだ書かなくていいです。\n情報:〇〇」\n\n【ステップ2:肉付け】\n「①番の構成で、各見出しに300字程度の本文を追加してください。トーンは丁寧語でお願いします」",
  research:
    "「〇〇について、要点を5つにまとめてください。専門用語は避けて、初めて聞く人にもわかるように説明してください」",
  comm: "「以下のメール(または状況)に対する返信を、丁寧だけど堅すぎないトーンで3パターン作ってください。\n〇〇(状況を貼る)」",
  meeting:
    "「以下は会議の文字起こしです。①決まったこと②誰が何をいつまでにやるか③次回までの宿題、の3つに分けて整理してください。\n〇〇(文字起こしを貼る)」",
  sns: "「〇〇(商品・サービス名)のSNS投稿用キャプションを、親しみやすいトーンで3パターン作ってください。最後にハッシュタグも5つ提案してください」",
  data: "「このデータ(表を貼る)から、傾向を3つ読み取って、専門知識がない人にもわかる言葉で説明してください」",
  survey:
    "「このアンケートの自由記述回答(貼る)を、似た意見ごとにグループ分けして、それぞれの件数と代表的な意見を1つずつ教えてください」",
};

export function permissionNote(permission?: string): string {
  switch (permission) {
    case "free":
      return "会社でも自由に使えるとのことなので、そのまま仕事の資料作成にも取り入れてみてください。";
    case "personal_only":
      return "会社ではNGとのことなので、まずは個人のスマホ・PCで、仕事以外の場面から試すのがおすすめです。";
    case "unsure":
      return "ルールが曖昧なときは、まず個人利用の範囲(調べ物・学習目的)から始めると安心です。会社のルールは一度総務や上司に確認してみてもいいかもしれません。";
    case "restricted":
      return "職場での利用が難しい環境とのことなので、プライベートの時間で「自分のためのAI活用」から始めてみましょう。";
    default:
      return "";
  }
}

export function comboTags(platform?: string): string[] {
  const tags: string[] = [];
  if (platform === "google" || platform === "both") tags.push("Gemini");
  if (platform === "microsoft" || platform === "both") tags.push("Copilot");
  tags.push("Claude", "ChatGPT");
  return tags;
}

export function comboPlatformText(priority?: string, platform?: string): string {
  const c = priority ? comboMap[priority] : undefined;
  if (!c) return "";
  if (platform === "google" && c.google) return c.google;
  if (platform === "microsoft" && c.microsoft) return c.microsoft;
  if (platform === "both")
    return [c.google, c.microsoft].filter(Boolean).join(" ");
  return "";
}
