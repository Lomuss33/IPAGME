import type { Difficulty, SessionStats } from "@/app/types";
import { difficultyLabels, formatNumber, getAccuracy } from "@/app/utils";

interface StatBoardProps {
  stats: SessionStats;
  status: string;
  onDifficultyChange: (difficulty: Difficulty) => void;
  embedded?: boolean;
}

const statMeta = [
  { key: "score", label: "Score" },
  { key: "streak", label: "Streak" },
  { key: "accuracy", label: "Accuracy" },
  { key: "totalAnswers", label: "Solved" },
] as const;

export function StatBoard({ stats, status, onDifficultyChange, embedded = false }: StatBoardProps) {
  const accuracy = getAccuracy(stats);

  return (
    <section className={`hud-panel ${embedded ? "hud-panel--embedded" : ""}`}>
      <div className="hud-panel__header">
        <div className="hud-panel__lead">
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
      <div className="stat-grid">
        {statMeta.map((item) => {
          const value =
            item.key === "accuracy"
              ? `${accuracy}%`
              : formatNumber(stats[item.key as keyof SessionStats] as number);

          return (
            <article className={`stat-card ${item.key === "streak" && stats.streak > 1 ? "stat-card--pulse" : ""}`} key={item.key}>
              <p>{item.label}</p>
              <strong>{value}</strong>
            </article>
          );
        })}
        <article className="stat-card stat-card--accent">
          <p>Mode</p>
          <strong>{difficultyLabels[stats.difficulty]}</strong>
        </article>
      </div>
    </section>
  );
}
