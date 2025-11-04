import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiFootballService } from "@/services/api-football/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status"); // upcoming, live, completed
    const season = parseInt(searchParams.get("season") || new Date().getFullYear().toString());

    let matches;

    if (status === "live") {
      // Get live match
      matches = await prisma.match.findMany({
        where: {
          matchState: "LIVE",
        },
        orderBy: { kickoffTime: "desc" },
        take: 1,
      });

      // If no live match in DB, check API
      if (matches.length === 0) {
        const liveMatch = await apiFootballService.getLiveMatch();
        if (liveMatch) {
          // Sync to database
          matches = [await syncMatchFromApi(liveMatch)];
        }
      }
    } else if (status === "upcoming") {
      matches = await prisma.match.findMany({
        where: {
          kickoffTime: { gte: new Date() },
          matchState: { in: ["SCHEDULED", "CHECK_IN_OPEN"] },
        },
        orderBy: { kickoffTime: "asc" },
        take: 10,
      });
    } else if (status === "completed") {
      matches = await prisma.match.findMany({
        where: {
          matchState: { in: ["COMPLETED", "ARCHIVED"] },
          season,
        },
        orderBy: { kickoffTime: "desc" },
        take: 20,
      });
    } else {
      // Get all matches for the season
      matches = await prisma.match.findMany({
        where: { season },
        orderBy: { kickoffTime: "desc" },
        take: 50,
      });
    }

    return NextResponse.json({ matches });
  } catch (error) {
    console.error("Get matches error:", error);
    return NextResponse.json(
      { error: "Failed to get matches" },
      { status: 500 }
    );
  }
}

// Helper function to sync match from API to database
async function syncMatchFromApi(apiMatch: any) {
  const isHome = apiMatch.teams.home.id === 42;
  const opponent = isHome ? apiMatch.teams.away : apiMatch.teams.home;

  return await prisma.match.upsert({
    where: { apiFixtureId: apiMatch.fixture.id },
    update: {
      matchStatus: apiMatch.fixture.status.short,
      arsenalScore: isHome ? apiMatch.goals.home : apiMatch.goals.away,
      opponentScore: isHome ? apiMatch.goals.away : apiMatch.goals.home,
      matchEvents: apiMatch.events || [],
    },
    create: {
      apiFixtureId: apiMatch.fixture.id,
      season: apiMatch.league.season,
      competitionId: apiMatch.league.id,
      competitionName: apiMatch.league.name,
      opponentTeamId: opponent.id,
      opponentName: opponent.name,
      opponentLogo: opponent.logo,
      homeAway: isHome ? "HOME" : "AWAY",
      venueName: apiMatch.fixture.venue.name,
      venueCity: apiMatch.fixture.venue.city,
      matchDate: new Date(apiMatch.fixture.date),
      kickoffTime: new Date(apiMatch.fixture.date),
      matchStatus: apiMatch.fixture.status.short,
      matchState: "SCHEDULED",
      arsenalScore: isHome ? apiMatch.goals.home : apiMatch.goals.away,
      opponentScore: isHome ? apiMatch.goals.away : apiMatch.goals.home,
      checkInOpenTime: new Date(new Date(apiMatch.fixture.date).getTime() - 5 * 60 * 1000),
    },
  });
}
