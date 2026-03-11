import type { KeyboardEvent } from "react";
import type { CalculatorResult, HelperTab, QuizQuestion } from "@/app/types";
import { SplitVisualizer } from "@/components/SplitVisualizer";
import { SubnetCalculator } from "@/components/SubnetCalculator";

interface ToolPanelProps {
  activeTab: HelperTab;
  onTabChange: (tab: HelperTab) => void;
  question: QuizQuestion | null;
  calculatorInput: string;
  onCalculatorInputChange: (value: string) => void;
  onCalculatorInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onCalculate: () => void;
  calculatorResult: CalculatorResult | null;
  calculatorError: string | null;
  calculatorBusy: boolean;
}

export function ToolPanel({
  activeTab,
  onTabChange,
  question,
  calculatorInput,
  onCalculatorInputChange,
  onCalculatorInputKeyDown,
  onCalculate,
  calculatorResult,
  calculatorError,
  calculatorBusy,
}: ToolPanelProps) {
  return (
    <section className="tool-switcher">
      <div className="tool-tabs" role="tablist" aria-label="Subnet helpers">
        <button
          className={`tool-tab ${activeTab === "visualizer" ? "tool-tab--active" : ""}`}
          type="button"
          role="tab"
          aria-selected={activeTab === "visualizer"}
          onClick={() => onTabChange("visualizer")}
        >
          Split Visualizer
        </button>
        <button
          className={`tool-tab ${activeTab === "calculator" ? "tool-tab--active" : ""}`}
          type="button"
          role="tab"
          aria-selected={activeTab === "calculator"}
          onClick={() => onTabChange("calculator")}
        >
          Subnet Calculator
        </button>
      </div>

      {activeTab === "visualizer" ? (
        <SplitVisualizer question={question} />
      ) : (
        <SubnetCalculator
          input={calculatorInput}
          onInputChange={onCalculatorInputChange}
          onInputKeyDown={onCalculatorInputKeyDown}
          onSubmit={onCalculate}
          result={calculatorResult}
          error={calculatorError}
          isBusy={calculatorBusy}
        />
      )}
    </section>
  );
}
