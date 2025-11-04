import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { isCheckInWindowOpen } from "@/lib/utils";
import { z } from "zod";

const checkInSchema = z.object({
  matchId: z.string(),
  locationCountry: z.string(),
  locationCity: z.string(),
  locationLat: z.number().optional(),
  locationLng: z.number().optional(),
  statusMessage: z.string().max(100).optional(),
  photoUrl: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const data = checkInSchema.parse(body);

    // Get match
    const match = await prisma.match.findUnique({
      where: { id: data.matchId },
    });

    if (!match) {
      return NextResponse.json(
        { error: "Match not found" },
        { status: 404 }
      );
    }

    // Check if check-in window is open
    if (!isCheckInWindowOpen(match.kickoffTime)) {
      return NextResponse.json(
        { error: "Check-in window is not open" },
        { status: 400 }
      );
    }

    // Check if user already checked in
    const existing = await prisma.checkIn.findUnique({
      where: {
        userId_matchId: {
          userId: user.id,
          matchId: data.matchId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Already checked in to this match" },
        { status: 400 }
      );
    }

    // Create check-in
    const checkIn = await prisma.checkIn.create({
      data: {
        userId: user.id,
        matchId: data.matchId,
        locationCountry: data.locationCountry,
        locationCity: data.locationCity,
        locationLat: data.locationLat,
        locationLng: data.locationLng,
        statusMessage: data.statusMessage,
        photoUrl: data.photoUrl,
      },
    });

    // Update user stats - increment check-ins
    await updateUserStatsOnCheckIn(user.id);

    // Broadcast check-in to WebSocket clients
    // This will be handled by Socket.io

    return NextResponse.json({ checkIn });
  } catch (error) {
    console.error("Check-in error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid check-in data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to check in" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const searchParams = request.nextUrl.searchParams;
    const matchId = searchParams.get("matchId");

    if (matchId) {
      // Get check-ins for a specific match
      const checkIns = await prisma.checkIn.findMany({
        where: { matchId },
        include: {
          user: {
            select: {
              username: true,
              profilePhoto: true,
            },
          },
        },
        orderBy: { checkInTimestamp: "desc" },
      });

      return NextResponse.json({ checkIns });
    } else {
      // Get user's check-in history
      const checkIns = await prisma.checkIn.findMany({
        where: { userId: user.id },
        include: {
          match: true,
        },
        orderBy: { checkInTimestamp: "desc" },
        take: 50,
      });

      return NextResponse.json({ checkIns });
    }
  } catch (error) {
    console.error("Get check-ins error:", error);
    return NextResponse.json(
      { error: "Failed to get check-ins" },
      { status: 500 }
    );
  }
}

async function updateUserStatsOnCheckIn(userId: string) {
  const stats = await prisma.userStats.findUnique({
    where: { userId },
  });

  if (!stats) {
    await prisma.userStats.create({
      data: {
        userId,
        totalCheckIns: 1,
        currentStreak: 1,
        longestStreak: 1,
        lastCheckInDate: new Date(),
      },
    });
  } else {
    // Update stats
    const newCheckIns = stats.totalCheckIns + 1;

    // Calculate streak (simplified - proper streak calculation should check consecutive matches)
    const daysSinceLastCheckIn = stats.lastCheckInDate
      ? Math.floor((Date.now() - stats.lastCheckInDate.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    const currentStreak = daysSinceLastCheckIn <= 7 ? stats.currentStreak + 1 : 1;
    const longestStreak = Math.max(currentStreak, stats.longestStreak);

    await prisma.userStats.update({
      where: { userId },
      data: {
        totalCheckIns: newCheckIns,
        currentStreak,
        longestStreak,
        lastCheckInDate: new Date(),
        totalBadges: newCheckIns, // Badge will be generated post-match
      },
    });
  }
}
