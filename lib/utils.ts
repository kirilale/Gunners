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
 * PRD: Opens 5 mins before kickoff, stays open during match, closes 5 mins after FT
 */
export function isCheckInWindowOpen(
  kickoffTime: Date | string,
  matchStatus?: string,
  matchFinishedAt?: Date | string
): boolean {
  const kickoff = typeof kickoffTime === 'string' ? new Date(kickoffTime) : kickoffTime;
  const now = new Date();
  const fiveMinsBefore = new Date(kickoff.getTime() - 5 * 60 * 1000);

  // Check-in hasn't opened yet (before 5 mins before kickoff)
  if (now < fiveMinsBefore) {
    return false;
  }

  // If no match status provided, use time-based fallback (assume 2-hour max)
  if (!matchStatus) {
    const maxWindowEnd = new Date(kickoff.getTime() + 120 * 60 * 1000);
    return now <= maxWindowEnd;
  }

  // If match hasn't finished, window is still open
  if (matchStatus !== 'FT' && matchStatus !== 'AET' && matchStatus !== 'PEN') {
    return true;
  }

  // Match has finished - check if within 5-minute grace period
  if (matchFinishedAt) {
    const finishedTime = typeof matchFinishedAt === 'string'
      ? new Date(matchFinishedAt)
      : matchFinishedAt;
    const fiveMinsAfterFT = new Date(finishedTime.getTime() + 5 * 60 * 1000);
    return now <= fiveMinsAfterFT;
  }

  // Fallback: If match is FT but no finishedAt time, close window
  return false;
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
