"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Answers, QuestionKey, questions } from "@/lib/quiz-data";
import { Mascot } from "./Mascot";
import { ResultView } from "./ResultView";

type Step =
  | { kind: "start" }
  | { kind: "question"; index: number }
  | { kind: "nickname" }
  | { kind: "result" };

// 質問7問 + ニックネーム入力 = 8ステップ
const TOTAL_STEPS = questions.length + 1;

export function Quiz() {
  const searchParams = useSearchParams();
  const eventTag = searchParams.get("event") || "general";

  const [step, setStep] = useState<Step>({ kind: "start" });
  const [answers, setAnswers] = useState<Answers>({});
  const [nickname, setNickname] = useState("");

  const progress =
    step.kind === "start"
      ? 0
      : step.kind === "question"
        ? (step.index / TOTAL_STEPS) * 100
        : step.kind === "nickname"
          ? (questions.length / TOTAL_STEPS) * 100
          : 100;

  const selectAnswer = (key: QuestionKey, value: string | number) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    if (step.kind !== "question") return;
    if (step.index < questions.length - 1) {
      setStep({ kind: "question", index: step.index + 1 });
    } else {
      setStep({ kind: "nickname" });
    }
  };

  const goBack = () => {
    if (step.kind === "question" && step.index > 0) {
      setStep({ kind: "question", index: step.index - 1 });
    } else if (step.kind === "nickname") {
      setStep({ kind: "question", index: questions.length - 1 });
    }
  };

  const restart = () => {
    setAnswers({});
    setNickname("");
    setStep({ kind: "start" });
  };

  return (
    <div className="app">
      <div className="brand-mark">Me-Cherish presents</div>
      <div className="progress-wrap">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>

      {step.kind === "start" && (
        <div className="card">
          <div className="eyebrow">MECHERISH DIAGNOSTIC</div>
          <Mascot
            message="こんにちは！いっしょに、あなたに合うAIの使い方を見つけましょう🌸"
            size={60}
          />
          <h1 className="title">
            AI×わたし
            <br />
            相性診断
          </h1>
          <div className="subtitle">
            8つの質問に答えるだけで、あなたに合ったAIとの付き合い方がわかります。難しく考えず、直感で選んでみてください。
          </div>
          <button
            className="start-btn"
            onClick={() => setStep({ kind: "question", index: 0 })}
          >
            はじめる ✨
          </button>
        </div>
      )}

      {step.kind === "question" && (
        <div className="card">
          <div className="q-number">
            Q{step.index + 1} / {TOTAL_STEPS}
          </div>
          <div className="q-text">{questions[step.index].text}</div>
          <div>
            {questions[step.index].options.map((opt) => {
              const key = questions[step.index].key;
              const selected = answers[key] === opt.value;
              return (
                <button
                  key={String(opt.value)}
                  className={`option-btn${selected ? " selected" : ""}`}
                  onClick={() => selectAnswer(key, opt.value)}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          {step.index > 0 && (
            <div className="nav-row">
              <button className="back-link" onClick={goBack}>
                ← 前の質問へ
              </button>
            </div>
          )}
        </div>
      )}

      {step.kind === "nickname" && (
        <div className="card">
          <div className="q-number">
            Q{TOTAL_STEPS} / {TOTAL_STEPS}
          </div>
          <div className="q-text">
            最後に、呼ばれたいお名前(ニックネーム)を教えてください
          </div>
          <div className="subtitle" style={{ marginBottom: 14 }}>
            任意です。本名でなくてOK。結果画面で使わせていただきます🌸
          </div>
          <input
            className="text-input"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="例:まゆ、みーちゃん など"
            maxLength={20}
            enterKeyHint="done"
          />
          <button className="primary-btn" onClick={() => setStep({ kind: "result" })}>
            診断結果を見る ✨
          </button>
          <div className="nav-row">
            <button className="back-link" onClick={goBack}>
              ← 前の質問へ
            </button>
          </div>
        </div>
      )}

      {step.kind === "result" && (
        <ResultView
          answers={answers}
          nickname={nickname.trim()}
          eventTag={eventTag}
          onRestart={restart}
        />
      )}
    </div>
  );
}
