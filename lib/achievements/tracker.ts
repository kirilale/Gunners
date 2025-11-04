import { prisma } from "@/lib/db";

export type AchievementType =
  // Attendance
  | "GETTING_STARTED"
  | "COMMITTED_SUPPORTER"
  | "REGULAR"
  | "DIE_HARD"
  | "LEGENDARY"
  | "THE_INVINCIBLE"
  // Streaks
  | "ON_A_ROLL"
  | "DEDICATED"
  | "UNSTOPPABLE"
  | "LEGENDARY_STREAK"
  // Geographic
  | "LOCAL_HERO"
  | "NOMAD"
  | "GLOBETROTTER"
  | "WORLD_GOONER"
  // Predictions
  | "CLAIRVOYANT"
  | "FORTUNE_TELLER"
  | "ORACLE"
  | "NOSTRADAMUS"
  // Special
  | "DERBY_DAY_DEVOTEE"
  | "TROPHY_HUNTER"
  | "UNDEFEATED";

export interface Achievement {
  type: AchievementType;
  name: string;
  description: string;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  condition: (stats: any) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Attendance Achievements
  {
    type: "GETTING_STARTED",
    name: "Getting Started",
    description: "Check in to your first match",
    rarity: "COMMON",
    condition: (stats) => stats.totalCheckIns >= 1,
  },
  {
    type: "COMMITTED_SUPPORTER",
    name: "Committed Supporter",
    description: "Check in to 10 matches",
    rarity: "COMMON",
    condition: (stats) => stats.totalCheckIns >= 10,
  },
  {
    type: "REGULAR",
    name: "Regular",
    description: "Check in to 25 matches",
    rarity: "RARE",
    condition: (stats) => stats.totalCheckIns >= 25,
  },
  {
    type: "DIE_HARD",
    name: "Die Hard",
    description: "Check in to 50 matches",
    rarity: "EPIC",
    condition: (stats) => stats.totalCheckIns >= 50,
  },
  {
    type: "LEGENDARY",
    name: "Legendary",
    description: "Check in to 100 matches",
    rarity: "LEGENDARY",
    condition: (stats) => stats.totalCheckIns >= 100,
  },

  // Streak Achievements
  {
    type: "ON_A_ROLL",
    name: "On a Roll",
    description: "Maintain a 3-match streak",
    rarity: "COMMON",
    condition: (stats) => stats.currentStreak >= 3,
  },
  {
    type: "DEDICATED",
    name: "Dedicated",
    description: "Maintain a 5-match streak",
    rarity: "RARE",
    condition: (stats) => stats.currentStreak >= 5,
  },
  {
    type: "UNSTOPPABLE",
    name: "Unstoppable",
    description: "Maintain a 10-match streak",
    rarity: "EPIC",
    condition: (stats) => stats.currentStreak >= 10,
  },
  {
    type: "LEGENDARY_STREAK",
    name: "Legendary Streak",
    description: "Maintain a 20-match streak",
    rarity: "LEGENDARY",
    condition: (stats) => stats.currentStreak >= 20,
  },

  // Geographic Achievements
  {
    type: "LOCAL_HERO",
    name: "Local Hero",
    description: "Check in from the same city 10 times",
    rarity: "COMMON",
    condition: (stats) => {
      const cities = stats.citiesCheckedInFrom || [];
      // This is simplified - in real implementation, track frequency per city
      return cities.length >= 1;
    },
  },
  {
    type: "NOMAD",
    name: "Nomad",
    description: "Check in from 5 different cities",
    rarity: "RARE",
    condition: (stats) => {
      const cities = stats.citiesCheckedInFrom || [];
      return cities.length >= 5;
    },
  },
  {
    type: "GLOBETROTTER",
    name: "Globetrotter",
    description: "Check in from 3 different countries",
    rarity: "EPIC",
    condition: (stats) => {
      const countries = stats.countriesCheckedInFrom || [];
      return countries.length >= 3;
    },
  },

  // Prediction Achievements
  {
    type: "CLAIRVOYANT",
    name: "Clairvoyant",
    description: "Get 5 exact score predictions correct",
    rarity: "RARE",
    condition: (stats) => stats.exactPredictions >= 5,
  },
  {
    type: "FORTUNE_TELLER",
    name: "Fortune Teller",
    description: "Get 10 exact score predictions correct",
    rarity: "EPIC",
    condition: (stats) => stats.exactPredictions >= 10,
  },
  {
    type: "ORACLE",
    name: "Oracle",
    description: "Get 20 exact score predictions correct",
    rarity: "LEGENDARY",
    condition: (stats) => stats.exactPredictions >= 20,
  },
];

export async function checkAndAwardAchievements(userId: string) {
  const userStats = await prisma.userStats.findUnique({
    where: { userId },
  });

  if (!userStats) return;

  // Get user's current achievements
  const existingAchievements = await prisma.achievement.findMany({
    where: { userId },
    select: { achievementType: true },
  });

  const existingTypes = new Set(existingAchievements.map((a: any) => a.achievementType));

  // Get exact predictions count
  const exactPredictions = await prisma.prediction.count({
    where: {
      userId,
      predictionResult: "EXACT",
    },
  });

  const statsWithPredictions = {
    ...userStats,
    exactPredictions,
  };

  // Check each achievement
  for (const achievement of ACHIEVEMENTS) {
    // Skip if user already has this achievement
    if (existingTypes.has(achievement.type)) continue;

    // Check if user qualifies
    if (achievement.condition(statsWithPredictions)) {
      await prisma.achievement.create({
        data: {
          userId,
          achievementType: achievement.type,
          achievementName: achievement.name,
          achievementDescription: achievement.description,
          rarity: achievement.rarity,
        },
      });

      // Update user stats achievement count
      await prisma.userStats.update({
        where: { userId },
        data: {
          totalAchievements: { increment: 1 },
        },
      });

      console.log(`Achievement unlocked for user ${userId}: ${achievement.name}`);
    }
  }
}

export async function getUserAchievements(userId: string) {
  return await prisma.achievement.findMany({
    where: { userId },
    orderBy: { unlockTimestamp: "desc" },
  });
}

export function getAllAchievementsWithProgress(userStats: any) {
  const exactPredictions = 0; // Will be calculated from database
  const statsWithPredictions = { ...userStats, exactPredictions };

  return ACHIEVEMENTS.map((achievement) => ({
    ...achievement,
    unlocked: achievement.condition(statsWithPredictions),
    progress: calculateProgress(achievement, statsWithPredictions),
  }));
}

function calculateProgress(achievement: Achievement, stats: any): number {
  switch (achievement.type) {
    case "GETTING_STARTED":
      return Math.min(100, (stats.totalCheckIns / 1) * 100);
    case "COMMITTED_SUPPORTER":
      return Math.min(100, (stats.totalCheckIns / 10) * 100);
    case "REGULAR":
      return Math.min(100, (stats.totalCheckIns / 25) * 100);
    case "DIE_HARD":
      return Math.min(100, (stats.totalCheckIns / 50) * 100);
    case "LEGENDARY":
      return Math.min(100, (stats.totalCheckIns / 100) * 100);
    case "ON_A_ROLL":
      return Math.min(100, (stats.currentStreak / 3) * 100);
    case "DEDICATED":
      return Math.min(100, (stats.currentStreak / 5) * 100);
    case "UNSTOPPABLE":
      return Math.min(100, (stats.currentStreak / 10) * 100);
    case "LEGENDARY_STREAK":
      return Math.min(100, (stats.currentStreak / 20) * 100);
    default:
      return 0;
  }
}
