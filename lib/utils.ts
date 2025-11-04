import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to user's local timezone
 */
export function formatMatchDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Calculate time until match
 */
export function getTimeUntilMatch(matchDate: Date | string): string {
  const d = typeof matchDate === 'string' ? new Date(matchDate) : matchDate;
  const now = new Date();
  const diff = d.getTime() - now.getTime();

  if (diff < 0) return 'Match started';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * Check if check-in window is open
 */
export function isCheckInWindowOpen(matchDate: Date | string): boolean {
  const d = typeof matchDate === 'string' ? new Date(matchDate) : matchDate;
  const now = new Date();
  const fiveMinsBefore = new Date(d.getTime() - 5 * 60 * 1000);
  const fiveMinsAfter = new Date(d.getTime() + (90 + 5 + 5) * 60 * 1000); // 90 min match + 5 min after

  return now >= fiveMinsBefore && now <= fiveMinsAfter;
}

/**
 * Calculate prediction points
 */
export function calculatePredictionPoints(
  predicted: { arsenal: number; opponent: number; firstScorer?: string },
  actual: { arsenal: number; opponent: number; firstScorer?: string }
): { points: number; result: 'exact' | 'outcome' | 'wrong' } {
  // Exact score
  if (predicted.arsenal === actual.arsenal && predicted.opponent === actual.opponent) {
    const basePoints = 10;
    const bonusPoints = predicted.firstScorer === actual.firstScorer ? 5 : 0;
    return { points: basePoints + bonusPoints, result: 'exact' };
  }

  // Correct outcome
  const predictedOutcome =
    predicted.arsenal > predicted.opponent ? 'win' :
    predicted.arsenal < predicted.opponent ? 'loss' : 'draw';
  const actualOutcome =
    actual.arsenal > actual.opponent ? 'win' :
    actual.arsenal < actual.opponent ? 'loss' : 'draw';

  if (predictedOutcome === actualOutcome) {
    return { points: 5, result: 'outcome' };
  }

  return { points: 0, result: 'wrong' };
}
