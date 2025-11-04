import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { redis, CACHE_KEYS, CACHE_TTL } from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "check-ins"; // check-ins, streaks, predictions
    const scope = searchParams.get("scope") || "global"; // global, country, city
    const region = searchParams.get("region"); // For country or city filtering
    const limit = parseInt(searchParams.get("limit") || "100");

    const cacheKey = CACHE_KEYS.LEADERBOARD(`${type}:${scope}:${region || "all"}`);

    // Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    let leaderboard;

    if (type === "check-ins") {
      leaderboard = await getCheckInsLeaderboard(scope, region, limit);
    } else if (type === "streaks") {
      leaderboard = await getStreaksLeaderboard(scope, region, limit);
    } else if (type === "predictions") {
      leaderboard = await getPredictionsLeaderboard(scope, region, limit);
    } else if (type === "achievements") {
      leaderboard = await getAchievementsLeaderboard(scope, region, limit);
    } else {
      return NextResponse.json(
        { error: "Invalid leaderboard type" },
        { status: 400 }
      );
    }

    // Cache for 1 minute
    await redis.setex(cacheKey, CACHE_TTL.LEADERBOARD, JSON.stringify({ leaderboard }));

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Failed to get leaderboard" },
      { status: 500 }
    );
  }
}

async function getCheckInsLeaderboard(scope: string, region: string | null, limit: number) {
  const where: any = {};

  if (scope === "country" && region) {
    where.locationCountry = region;
  } else if (scope === "city" && region) {
    where.locationCity = region;
  }

  return await prisma.userStats.findMany({
    where,
    select: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          profilePhoto: true,
          locationCountry: true,
        },
      },
      totalCheckIns: true,
    },
    orderBy: {
      totalCheckIns: "desc",
    },
    take: limit,
  });
}

async function getStreaksLeaderboard(scope: string, region: string | null, limit: number) {
  const where: any = {};

  if (scope === "country" && region) {
    where.user = { locationCountry: region };
  } else if (scope === "city" && region) {
    where.user = { locationCity: region };
  }

  return await prisma.userStats.findMany({
    where,
    select: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          profilePhoto: true,
          locationCountry: true,
        },
      },
      currentStreak: true,
      longestStreak: true,
    },
    orderBy: {
      currentStreak: "desc",
    },
    take: limit,
  });
}

async function getPredictionsLeaderboard(scope: string, region: string | null, limit: number) {
  const where: any = {};

  if (scope === "country" && region) {
    where.user = { locationCountry: region };
  } else if (scope === "city" && region) {
    where.user = { locationCity: region };
  }

  return await prisma.userStats.findMany({
    where,
    select: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          profilePhoto: true,
          locationCountry: true,
        },
      },
      totalPredictionPoints: true,
      predictionAccuracyPercentage: true,
    },
    orderBy: {
      totalPredictionPoints: "desc",
    },
    take: limit,
  });
}

async function getAchievementsLeaderboard(scope: string, region: string | null, limit: number) {
  const where: any = {};

  if (scope === "country" && region) {
    where.user = { locationCountry: region };
  } else if (scope === "city" && region) {
    where.user = { locationCity: region };
  }

  return await prisma.userStats.findMany({
    where,
    select: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          profilePhoto: true,
          locationCountry: true,
        },
      },
      totalAchievements: true,
    },
    orderBy: {
      totalAchievements: "desc",
    },
    take: limit,
  });
}
