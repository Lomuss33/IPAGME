import type { CalculatorResult, Difficulty, PowerTableRow, QuizQuestion, SessionStats } from "@/app/types";

export const difficultyLabels: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  mixed: "Mixed",
};

export function getAccuracy(stats: SessionStats) {
  if (stats.totalAnswers === 0) {
    return 0;
  }
  return Math.round((stats.correctAnswers / stats.totalAnswers) * 100);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function powerTableSlice(rows: PowerTableRow[], visibleBits: number) {
  return rows.filter((row) => row.exponent < visibleBits);
}

export function prefixToSubnetMask(prefix: number) {
  const octets = Array.from({ length: 4 }, (_, octetIndex) => {
    const remainingBits = Math.max(0, Math.min(8, prefix - octetIndex * 8));

    if (remainingBits === 0) {
      return 0;
    }

    return 256 - 2 ** (8 - remainingBits);
  });

  return octets.join(".");
}

export function prefixToWildcardMask(prefix: number) {
  const subnetMaskOctets = prefixToSubnetMask(prefix).split(".").map(Number);
  return subnetMaskOctets.map((octet) => 255 - octet).join(".");
}

export function wildcardShortcut(visibleBits: number) {
  const hostBits = Math.max(1, 32 - visibleBits);
  const focusValue = 2 ** Math.min(hostBits, 8) - 1;

  return {
    prefix: visibleBits,
    mask: prefixToSubnetMask(visibleBits),
    wildcard: prefixToWildcardMask(visibleBits),
    focusValue,
  };
}

export function buildMaskBits(prefix: number) {
  return Array.from({ length: 32 }, (_, index) => (index < prefix ? "1" : "0"));
}

export function octetBitState(prefix: number, octetIndex: number, bitIndex: number) {
  const globalBit = octetIndex * 8 + bitIndex;
  return globalBit < prefix ? "network" : "host";
}

export function nextSeed() {
  return Date.now() ^ Math.floor(Math.random() * 100000);
}

export function describeSubnetWindow(question: QuizQuestion | CalculatorResult) {
  return `${question.network} - ${question.broadcast}`;
}

export function makeScoreIncrement(streak: number) {
  return 100 + Math.min(streak, 5) * 15;
}
