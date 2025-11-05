import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

/**
 * GDPR-compliant data export endpoint
 * Returns all user data in downloadable JSON format
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Fetch all user data
    const [profile, checkIns, badges, predictions, achievements, stats, settings] = await Promise.all([
      // User profile
      prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          profilePhoto: true,
          locationCountry: true,
          locationCity: true,
          favoritePlayer: true,
          supporterSince: true,
          bio: true,
          createdAt: true,
          updatedAt: true,
        },
      }),

      // Check-ins with match details
      prisma.checkIn.findMany({
        where: { userId: user.id },
        include: {
          match: {
            select: {
              opponentName: true,
              matchDate: true,
              competitionName: true,
              arsenalScore: true,
              opponentScore: true,
              result: true,
            },
          },
        },
        orderBy: { checkInTimestamp: 'desc' },
      }),

      // Badges
      prisma.badge.findMany({
        where: { userId: user.id },
        include: {
          match: {
            select: {
              opponentName: true,
              matchDate: true,
              competitionName: true,
            },
          },
        },
        orderBy: { earnedTimestamp: 'desc' },
      }),

      // Predictions
      prisma.prediction.findMany({
        where: { userId: user.id },
        include: {
          match: {
            select: {
              opponentName: true,
              matchDate: true,
              arsenalScore: true,
              opponentScore: true,
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
      }),

      // Achievements
      prisma.achievement.findMany({
        where: { userId: user.id },
        orderBy: { unlockTimestamp: 'desc' },
      }),

      // User stats
      prisma.userStats.findUnique({
        where: { userId: user.id },
      }),

      // User settings
      prisma.userSettings.findUnique({
        where: { userId: user.id },
      }),
    ]);

    // Prepare export data
    const exportData = {
      exportMetadata: {
        exportDate: new Date().toISOString(),
        userId: user.id,
        dataCompliance: "GDPR Article 15 - Right of Access",
        platform: "Arsenal Global Fan Engagement Platform",
      },
      profile,
      engagementData: {
        checkIns: {
          total: checkIns.length,
          data: checkIns,
        },
        badges: {
          total: badges.length,
          data: badges,
        },
        predictions: {
          total: predictions.length,
          data: predictions,
        },
        achievements: {
          total: achievements.length,
          data: achievements,
        },
      },
      statistics: stats,
      settings,
    };

    // Set headers for file download
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Content-Disposition', `attachment; filename="arsenal-fan-data-${user.id}-${Date.now()}.json"`);

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Data export error:", error);
    return NextResponse.json(
      { error: "Failed to export user data" },
      { status: 500 }
    );
  }
}
