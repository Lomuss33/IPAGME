import type { NetworkStoryId, SessionStats } from "@/app/types";

const STORAGE_KEY = "ipagme-session";
const NETWORK_WINDOW_KEY = "ipagme-network-window";

export const defaultStats: SessionStats = {
  score: 0,
  streak: 0,
  correctAnswers: 0,
  totalAnswers: 0,
  difficulty: "mixed",
};

export function loadSessionStats() {
  if (typeof window === "undefined") {
    return defaultStats;
  }

  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaultStats;
  }

  try {
    const parsed = JSON.parse(raw) as SessionStats;
    return {
      ...defaultStats,
      ...parsed,
    };
  } catch {
    return defaultStats;
  }
}

export function saveSessionStats(stats: SessionStats) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export function loadSelectedNetworkStory(defaultStoryId: NetworkStoryId) {
  if (typeof window === "undefined") {
    return defaultStoryId;
  }

  const raw = window.localStorage.getItem(NETWORK_WINDOW_KEY);
  if (!raw) {
    return defaultStoryId;
  }

  try {
    const parsed = JSON.parse(raw) as { selectedStoryId?: NetworkStoryId };
    return parsed.selectedStoryId ?? defaultStoryId;
  } catch {
    return defaultStoryId;
  }
}

export function saveSelectedNetworkStory(selectedStoryId: NetworkStoryId) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(NETWORK_WINDOW_KEY, JSON.stringify({ selectedStoryId }));
}
