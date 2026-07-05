// quiz-data.ts の診断ロジックのテスト。
// 文言(質問文・結果文言)は reference-diagnosis.html 準拠で変更禁止のため、
// ここではロジックの分岐とデータの整合性のみを検証する。

import { describe, expect, it } from "vitest";
import {
  Answers,
  comboMap,
  comboPlatformText,
  comboTags,
  computeType,
  permissionNote,
  promptExamples,
  questions,
  resultTypes,
  timeSavings,
} from "./quiz-data";

describe("computeType", () => {
  it("comfort(usage+feeling)が1以下なら常にA(はじめの一歩さん)", () => {
    expect(computeType({ usage: 0, feeling: 0, domain: "management" })).toBe("A");
    expect(computeType({ usage: 1, feeling: 0, domain: "creative" })).toBe("A");
    expect(computeType({ usage: 0, feeling: 1, domain: "office" })).toBe("A");
  });

  it("comfortが5以上なら常にE(使いこなし発信者さん)", () => {
    expect(computeType({ usage: 2, feeling: 3, domain: "office" })).toBe("E");
    expect(computeType({ usage: 3, feeling: 2, domain: "people" })).toBe("E");
    expect(computeType({ usage: 3, feeling: 3, domain: "specialist" })).toBe("E");
  });

  it("comfortが2〜4のときはdomainで分岐する", () => {
    const mid: Answers = { usage: 1, feeling: 1 };
    expect(computeType({ ...mid, domain: "office" })).toBe("B");
    expect(computeType({ ...mid, domain: "creative" })).toBe("C");
    expect(computeType({ ...mid, domain: "people" })).toBe("D");
    expect(computeType({ ...mid, domain: "specialist" })).toBe("D");
    expect(computeType({ ...mid, domain: "management" })).toBe("F");
  });

  it("comfort境界値: 2はdomain分岐、4もdomain分岐", () => {
    expect(computeType({ usage: 2, feeling: 0, domain: "creative" })).toBe("C");
    expect(computeType({ usage: 2, feeling: 2, domain: "management" })).toBe("F");
  });

  it("domainが未回答・未知の値ならB(効率化ハンター)にフォールバック", () => {
    expect(computeType({ usage: 1, feeling: 1 })).toBe("B");
    expect(computeType({ usage: 1, feeling: 1, domain: "unknown" })).toBe("B");
  });

  it("usage/feelingが未回答なら0扱いでA", () => {
    expect(computeType({})).toBe("A");
    expect(computeType({ domain: "management" })).toBe("A");
  });
});

describe("comboTags", () => {
  it("Google系ならGeminiが先頭に付く", () => {
    expect(comboTags("google")).toEqual(["Gemini", "Claude", "ChatGPT"]);
  });

  it("Microsoft系ならCopilotが先頭に付く", () => {
    expect(comboTags("microsoft")).toEqual(["Copilot", "Claude", "ChatGPT"]);
  });

  it("両方ならGemini・Copilot両方が付く", () => {
    expect(comboTags("both")).toEqual(["Gemini", "Copilot", "Claude", "ChatGPT"]);
  });

  it("こだわりなし・未回答ならClaude/ChatGPTのみ", () => {
    expect(comboTags("either")).toEqual(["Claude", "ChatGPT"]);
    expect(comboTags(undefined)).toEqual(["Claude", "ChatGPT"]);
  });
});

describe("comboPlatformText", () => {
  it("Google系ならgoogle向け文言を返す", () => {
    expect(comboPlatformText("doc", "google")).toBe(comboMap.doc.google);
  });

  it("Microsoft系ならmicrosoft向け文言を返す", () => {
    expect(comboPlatformText("comm", "microsoft")).toBe(comboMap.comm.microsoft);
  });

  it("両方なら両文言をスペース連結する", () => {
    expect(comboPlatformText("meeting", "both")).toBe(
      `${comboMap.meeting.google} ${comboMap.meeting.microsoft}`
    );
  });

  it("snsはプラットフォーム別文言が空なので空文字を返す", () => {
    expect(comboPlatformText("sns", "google")).toBe("");
    expect(comboPlatformText("sns", "microsoft")).toBe("");
    expect(comboPlatformText("sns", "both")).toBe("");
  });

  it("priority未回答・未知なら空文字", () => {
    expect(comboPlatformText(undefined, "google")).toBe("");
    expect(comboPlatformText("unknown", "google")).toBe("");
  });

  it("こだわりなし(either)は共通文言のみに任せるため空文字", () => {
    expect(comboPlatformText("doc", "either")).toBe("");
  });
});

describe("permissionNote", () => {
  it("4つの回答すべてに対応する文言がある", () => {
    for (const value of ["free", "personal_only", "unsure", "restricted"]) {
      expect(permissionNote(value)).not.toBe("");
    }
  });

  it("未回答なら空文字", () => {
    expect(permissionNote(undefined)).toBe("");
    expect(permissionNote("unknown")).toBe("");
  });
});

describe("データ整合性", () => {
  it("質問は7問ある", () => {
    expect(questions).toHaveLength(7);
  });

  it("結果タイプはA〜Fの6種類で、必須項目が埋まっている", () => {
    const ids = Object.keys(resultTypes);
    expect(ids.sort()).toEqual(["A", "B", "C", "D", "E", "F"]);
    for (const t of Object.values(resultTypes)) {
      expect(t.name).not.toBe("");
      expect(t.catch).not.toBe("");
      expect(t.strength).not.toBe("");
      expect(t.growth).not.toBe("");
      expect(t.tools.length).toBeGreaterThan(0);
      expect(t.action).not.toBe("");
    }
  });

  it("priorityの全選択肢にcomboMapとpromptExamplesが存在する", () => {
    const priorityValues = questions
      .find((q) => q.key === "priority")!
      .options.map((o) => String(o.value));
    for (const v of priorityValues) {
      expect(comboMap[v], `comboMap.${v}`).toBeDefined();
      expect(promptExamples[v], `promptExamples.${v}`).toBeDefined();
    }
  });

  it("timeSavingsはsurvey以外のpriority選択肢をカバーしている(surveyは仕様上なし)", () => {
    for (const v of ["doc", "research", "comm", "meeting", "sns", "data"]) {
      expect(timeSavings[v], `timeSavings.${v}`).toBeDefined();
    }
  });

  it("domainの全選択肢がcomputeTypeで有効なタイプに割り当てられる", () => {
    const domainValues = questions
      .find((q) => q.key === "domain")!
      .options.map((o) => String(o.value));
    for (const d of domainValues) {
      const type = computeType({ usage: 1, feeling: 1, domain: d });
      expect(Object.keys(resultTypes)).toContain(type);
    }
  });
});
