import type { KeyboardEvent } from "react";
import type { AnswerResult, CalculatorResult, Difficulty, HelperTab, PowerTableRow, QuizQuestion, SessionStats } from "@/app/types";
import { IpTermsCard } from "@/components/IpTermsCard";
import { PowerTableCard } from "@/components/PowerTableCard";
import { QuizCard } from "@/components/QuizCard";
import { ToolPanel } from "@/components/ToolPanel";

interface SubnetPracticePageProps {
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
  activeTab: HelperTab;
  onTabChange: (tab: HelperTab) => void;
  calculatorInput: string;
  onCalculatorInputChange: (value: string) => void;
  onCalculatorInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onCalculate: () => void;
  calculatorResult: CalculatorResult | null;
  calculatorError: string | null;
  calculatorBusy: boolean;
  powerRows: PowerTableRow[];
  powerBits: number;
  onPowerBitsChange: (value: number) => void;
}

export function SubnetPracticePage({
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
  activeTab,
  onTabChange,
  calculatorInput,
  onCalculatorInputChange,
  onCalculatorInputKeyDown,
  onCalculate,
  calculatorResult,
  calculatorError,
  calculatorBusy,
  powerRows,
  powerBits,
  onPowerBitsChange,
}: SubnetPracticePageProps) {
  return (
    <main className="workspace-grid">
      <section className="workspace-grid__primary">
        <QuizCard
          question={question}
          answer={answer}
          onAnswerChange={onAnswerChange}
          onAnswerKeyDown={onAnswerKeyDown}
          onSubmit={onSubmit}
          onNext={onNext}
          isChecking={isChecking}
          isLoadingQuestion={isLoadingQuestion}
          feedback={feedback}
          stats={stats}
          status={status}
          onDifficultyChange={onDifficultyChange}
        />
      </section>

      <aside className="workspace-grid__secondary">
        <ToolPanel
          activeTab={activeTab}
          onTabChange={onTabChange}
          question={question}
          calculatorInput={calculatorInput}
          onCalculatorInputChange={onCalculatorInputChange}
          onCalculatorInputKeyDown={onCalculatorInputKeyDown}
          onCalculate={onCalculate}
          calculatorResult={calculatorResult}
          calculatorError={calculatorError}
          calculatorBusy={calculatorBusy}
        />
      </aside>

      <section className="workspace-grid__helpers helper-grid">
        <PowerTableCard rows={powerRows} visibleBits={powerBits} onVisibleBitsChange={onPowerBitsChange} />
        <IpTermsCard question={question} />
      </section>
    </main>
  );
}
