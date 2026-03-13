import type { KeyboardEvent } from "react";
import type { AnswerResult, Difficulty, QuizQuestion, SessionStats } from "@/app/types";
import { messages } from "@/app/messages";
import { difficultyLabels } from "@/app/utils";
import { StatBoard } from "@/components/StatBoard";

interface QuizCardProps {
  question: QuizQuestion | null;
  answer: string;
  onAnswerChange: (value: string) => void;
  onAnswerKeyDown: (value: KeyboardEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onNext: () => void;
  isChecking: boolean;
  isLoadingQuestion: boolean;
  feedback: AnswerResult | null;
  stats: SessionStats;
  status: string;
  onDifficultyChange: (difficulty: Difficulty) => void;
}

export function QuizCard({
  question,
  answer,
  onAnswerChange,
  onAnswerKeyDown,
  onSubmit,
  onNext,
  isChecking,
  isLoadingQuestion,
  feedback,
  stats,
  status,
  onDifficultyChange,
}: QuizCardProps) {
  return (
    <section className="quiz-card">
      <div className="quiz-card__titlebar">
        <div className="quiz-card__titlebar-main">
          <h2>Main quiz</h2>
          <div className="status-pill status-pill--compact">{status}</div>
        </div>
        <div className="difficulty-picker" aria-label="Difficulty picker">
          {Object.entries(difficultyLabels).map(([value, label]) => (
            <button
              key={value}
              className={`chip ${stats.difficulty === value ? "chip--active" : ""}`}
              type="button"
              onClick={() => onDifficultyChange(value as Difficulty)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <StatBoard stats={stats} status={status} onDifficultyChange={onDifficultyChange} embedded />

      <div className="quiz-card__header">
        <div>
          <h2>{messages.prompt}</h2>
        </div>
        <div className="quiz-card__badge">{question ? `${question.ip}/${question.prefix}` : "Waiting..."}</div>
      </div>

      <div className="question-banner">
        <p className="question-banner__label">Host address</p>
        <strong>{question ? `${question.ip}/${question.prefix}` : messages.loadingQuestion}</strong>
      </div>

      <label className="field-label" htmlFor="network-answer">
        {messages.answerLabel}
      </label>
      <div className="answer-row">
        <input
          id="network-answer"
          className="answer-input"
          type="text"
          value={answer}
          onChange={(event) => onAnswerChange(event.target.value)}
          onKeyDown={onAnswerKeyDown}
          placeholder={messages.answerPlaceholder}
          disabled={!question || isChecking || isLoadingQuestion || Boolean(feedback)}
          autoComplete="off"
          spellCheck={false}
        />
        <button
          className="primary-button"
          type="button"
          onClick={feedback ? onNext : onSubmit}
          disabled={
            feedback
              ? isLoadingQuestion
              : !question || !answer.trim() || isChecking || isLoadingQuestion
          }
        >
          {feedback ? (isLoadingQuestion ? messages.loadingQuestion : messages.next) : isChecking ? "Checking..." : messages.submit}
        </button>
      </div>

      <div className="quiz-card__meta">
        <span>Subnet mask: {question?.subnetMask ?? "..."}</span>
        <span>Block size: {question?.blockSize ?? "..."}</span>
        <span>Focus octet: {question?.focusOctet ?? "..."}</span>
      </div>

      {feedback ? (
        <div className={`feedback-card ${feedback.isCorrect ? "feedback-card--correct" : "feedback-card--wrong"}`}>
          <div className="feedback-card__heading">
            <strong>{feedback.isCorrect ? "Correct" : "Wrong"}</strong>
            <span>{feedback.isCorrect ? "Host bits cleared." : "Check the block size."}</span>
          </div>
          <div className="feedback-card__grid">
            <div>
              <p>Correct network</p>
              <strong>{feedback.correctNetwork}</strong>
            </div>
            <div>
              <p>Your normalized answer</p>
              <strong>{feedback.normalizedSubmitted || "Invalid input"}</strong>
            </div>
          </div>
          <p className="feedback-card__explanation">{feedback.explanation}</p>
        </div>
      ) : (
        <div className="quiz-tip">
          <p>Tip</p>
          <span>Zero the host bits.</span>
        </div>
      )}
    </section>
  );
}
