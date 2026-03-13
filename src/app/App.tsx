import { startTransition, useEffect, useState } from "react";
import type { KeyboardEvent } from "react";
import { messages } from "@/app/messages";
import { loadSessionStats, saveSessionStats } from "@/app/storage";
import type { AnswerResult, CalculatorResult, Difficulty, HelperTab, PowerTableRow, QuizQuestion, SessionStats } from "@/app/types";
import { CcnaCompareCard } from "@/components/CcnaCompareCard";
import { CcnaQuickRefCard } from "@/components/CcnaQuickRefCard";
import { IpTermsCard } from "@/components/IpTermsCard";
import { OsiTcpModelCard } from "@/components/OsiTcpModelCard";
import { makeScoreIncrement, nextSeed } from "@/app/utils";
import { PowerTableCard } from "@/components/PowerTableCard";
import { NetworkWindow } from "@/components/NetworkWindow";
import { QuizCard } from "@/components/QuizCard";
import { RoutingStudyCard } from "@/components/RoutingStudyCard";
import { SecurityServicesCard } from "@/components/SecurityServicesCard";
import { SwitchingControlCard } from "@/components/SwitchingControlCard";
import { ToolPanel } from "@/components/ToolPanel";
import { WanTechCard } from "@/components/WanTechCard";
import { calculateSubnet, evaluateAnswer, generateQuestion, getPowerTable } from "@/wasm/subnetEngine";

function initialStats() {
  return loadSessionStats();
}

export function App() {
  const [stats, setStats] = useState<SessionStats>(initialStats);
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<AnswerResult | null>(null);
  const [powerRows, setPowerRows] = useState<PowerTableRow[]>([]);
  const [powerBits, setPowerBits] = useState(8);
  const [activeTab, setActiveTab] = useState<HelperTab>("visualizer");
  const [calculatorInput, setCalculatorInput] = useState("10.44.199.3/20");
  const [calculatorResult, setCalculatorResult] = useState<CalculatorResult | null>(null);
  const [calculatorError, setCalculatorError] = useState<string | null>(null);
  const [engineError, setEngineError] = useState<string | null>(null);
  const [isBooting, setIsBooting] = useState(true);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    saveSessionStats(stats);
  }, [stats]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const [table, initialQuestion, initialCalculation] = await Promise.all([
          getPowerTable(32),
          generateQuestion(nextSeed(), stats.difficulty, "ipv4"),
          calculateSubnet(calculatorInput, "ipv4"),
        ]);

        if (cancelled) {
          return;
        }

        startTransition(() => {
          setPowerRows(table);
          setQuestion(initialQuestion);
          setCalculatorResult(initialCalculation);
          setCalculatorError(null);
          setEngineError(null);
        });
      } catch (error) {
        if (!cancelled) {
          setEngineError(error instanceof Error ? error.message : "Failed to load the subnet engine.");
        }
      } finally {
        if (!cancelled) {
          setIsBooting(false);
          setIsLoadingQuestion(false);
        }
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  async function fetchQuestion(nextDifficulty: Difficulty) {
    setIsLoadingQuestion(true);
    try {
      const nextQuestion = await generateQuestion(nextSeed(), nextDifficulty, "ipv4");
      startTransition(() => {
        setQuestion(nextQuestion);
        setAnswer("");
        setFeedback(null);
        setEngineError(null);
      });
    } catch (error) {
      setEngineError(error instanceof Error ? error.message : "Failed to generate a subnet question.");
    } finally {
      setIsLoadingQuestion(false);
    }
  }

  async function handleSubmit() {
    if (!question || !answer.trim()) {
      return;
    }

    setIsChecking(true);
    try {
      const result = await evaluateAnswer(question, answer);
      setFeedback(result);
      setStats((current) => {
        const nextCorrectAnswers = current.correctAnswers + (result.isCorrect ? 1 : 0);
        const nextTotalAnswers = current.totalAnswers + 1;
        const nextStreak = result.isCorrect ? current.streak + 1 : 0;
        const nextScore = result.isCorrect ? current.score + makeScoreIncrement(nextStreak) : current.score;

        return {
          ...current,
          score: nextScore,
          streak: nextStreak,
          correctAnswers: nextCorrectAnswers,
          totalAnswers: nextTotalAnswers,
        };
      });
    } catch (error) {
      setEngineError(error instanceof Error ? error.message : "Failed to evaluate the submitted answer.");
    } finally {
      setIsChecking(false);
    }
  }

  async function handleNextQuestion() {
    await fetchQuestion(stats.difficulty);
  }

  async function handleDifficultyChange(difficulty: Difficulty) {
    setStats((current) => ({ ...current, difficulty }));
    await fetchQuestion(difficulty);
  }

  async function handleCalculator() {
    setIsCalculating(true);
    try {
      const result = await calculateSubnet(calculatorInput, "ipv4");
      setCalculatorResult(result);
      setCalculatorError(null);
    } catch (error) {
      setCalculatorResult(null);
      setCalculatorError(error instanceof Error ? error.message : "Failed to calculate the requested subnet.");
    } finally {
      setIsCalculating(false);
    }
  }

  function handleAnswerKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && !feedback) {
      event.preventDefault();
      void handleSubmit();
    }
  }

  function handleCalculatorKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleCalculator();
    }
  }

  let statusCopy = "Ready";
  if (engineError) {
    statusCopy = engineError;
  } else if (isBooting) {
    statusCopy = messages.loadingEngine;
  } else if (isLoadingQuestion) {
    statusCopy = messages.loadingQuestion;
  }

  return (
    <div className="app-shell">
      <div className="app-shell__ambient app-shell__ambient--left" />
      <div className="app-shell__ambient app-shell__ambient--right" />

      <div className="app-frame">
        <div className="title-line">{messages.brand}</div>

        <main className="workspace-grid">
          <section className="workspace-grid__primary">
            <QuizCard
              question={question}
              answer={answer}
              onAnswerChange={setAnswer}
              onAnswerKeyDown={handleAnswerKeyDown}
              onSubmit={() => void handleSubmit()}
              onNext={() => void handleNextQuestion()}
              isChecking={isChecking}
              isLoadingQuestion={isLoadingQuestion}
              feedback={feedback}
              stats={stats}
              status={statusCopy}
              onDifficultyChange={handleDifficultyChange}
            />
          </section>

          <aside className="workspace-grid__secondary">
            <ToolPanel
              activeTab={activeTab}
              onTabChange={setActiveTab}
              question={question}
              calculatorInput={calculatorInput}
              onCalculatorInputChange={setCalculatorInput}
              onCalculatorInputKeyDown={handleCalculatorKeyDown}
              onCalculate={() => void handleCalculator()}
              calculatorResult={calculatorResult}
              calculatorError={calculatorError}
              calculatorBusy={isCalculating}
            />
          </aside>

          <div className="workspace-grid__full">
            <NetworkWindow />
          </div>

          <section className="workspace-grid__helpers helper-grid">
            <PowerTableCard rows={powerRows} visibleBits={powerBits} onVisibleBitsChange={setPowerBits} />
            <IpTermsCard question={question} />
            <CcnaQuickRefCard />
            <CcnaCompareCard />
            <OsiTcpModelCard />
            <RoutingStudyCard question={question} />
            <SwitchingControlCard />
            <SecurityServicesCard />
            <WanTechCard />
          </section>
        </main>
      </div>
    </div>
  );
}
