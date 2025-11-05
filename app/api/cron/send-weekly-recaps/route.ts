import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { emailService } from "@/services/email/resend";

/**
 * Cron endpoint to send weekly recap emails
 *
 * Runs every Sunday at 6 PM to send users their weekly activity summary
 *
 * For Vercel Cron, add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/send-weekly-recaps",
 *     "schedule": "0 18 * * 0"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🕐 Cron job started: send-weekly-recaps');
    const startTime = Date.now();

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get all users with weekly recap enabled
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
        userSettings: {
          emailNotifications: {
            path: ['weeklyRecap'],
            equals: true,
          },
        },
        // Only send to users who have been active in the past month
        updatedAt: {
          gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        userSettings: {
          select: {
            quietHoursStart: true,
            quietHoursEnd: true,
          },
        },
        userStats: {
          select: {
            currentStreak: true,
            totalPredictionPoints: true,
          },
        },
      },
    });

    if (users.length === 0) {
      console.log('✅ No users opted in for weekly recaps');
      return NextResponse.json({
        success: true,
        message: 'No users to send recaps to',
        count: 0,
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`📧 Sending weekly recaps to ${users.length} users`);

    let totalEmailsSent = 0;
    let totalErrors = 0;

    // Get matches from the past week for context
    const weekMatches = await prisma.match.findMany({
      where: {
        matchDate: {
          gte: oneWeekAgo,
          lte: now,
        },
        matchState: {
          in: ['COMPLETED', 'ARCHIVED'],
        },
      },
      select: {
        id: true,
        opponentName: true,
        arsenalScore: true,
        opponentScore: true,
        result: true,
      },
    });

    // Process users in batches
    const batchSize = 50;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);

      await Promise.allSettled(
        batch.map(async (user) => {
          try {
            // Check quiet hours
            const currentHour = now.getHours();
            const settings = user.userSettings;

            if (settings?.quietHoursStart && settings?.quietHoursEnd) {
              const [startHour] = settings.quietHoursStart.split(':').map(Number);
              const [endHour] = settings.quietHoursEnd.split(':').map(Number);

              if (
                (startHour < endHour && currentHour >= startHour && currentHour < endHour) ||
                (startHour > endHour && (currentHour >= startHour || currentHour < endHour))
              ) {
                console.log(`⏰ Skipping ${user.email} - in quiet hours`);
                return;
              }
            }

            // Get user's weekly activity
            const [checkIns, badges, predictions] = await Promise.all([
              prisma.checkIn.count({
                where: {
                  userId: user.id,
                  createdAt: {
                    gte: oneWeekAgo,
                  },
                },
              }),

              prisma.badge.count({
                where: {
                  userId: user.id,
                  earnedTimestamp: {
                    gte: oneWeekAgo,
                  },
                },
              }),

              prisma.prediction.findMany({
                where: {
                  userId: user.id,
                  submittedAt: {
                    gte: oneWeekAgo,
                  },
                  pointsEarned: {
                    not: null,
                  },
                },
                select: {
                  pointsEarned: true,
                },
              }),
            ]);

            const predictionPoints = predictions.reduce(
              (sum, p) => sum + (p.pointsEarned || 0),
              0
            );

            // Skip users with no activity this week
            if (checkIns === 0 && badges === 0 && predictions.length === 0) {
              console.log(`⏭️  Skipping ${user.email} - no activity this week`);
              return;
            }

            // Format matches for email
            const matches = weekMatches.map((match) => ({
              opponent: match.opponentName,
              result: match.result || 'TBD',
              score: `${match.arsenalScore ?? '-'} - ${match.opponentScore ?? '-'}`,
            }));

            await emailService.sendWeeklyRecap(
              user.email,
              user.displayName || user.username,
              {
                checkIns,
                badgesEarned: badges,
                predictionPoints,
                currentStreak: user.userStats?.currentStreak || 0,
                matches,
              }
            );

            totalEmailsSent++;
          } catch (error) {
            console.error(`❌ Failed to send recap to ${user.email}:`, error);
            totalErrors++;
          }
        })
      );

      // Brief pause between batches
      if (i + batchSize < users.length) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Cron job completed in ${duration}ms`);
    console.log(`✅ Sent ${totalEmailsSent} weekly recaps (${totalErrors} errors)`);

    return NextResponse.json({
      success: true,
      message: `Sent ${totalEmailsSent} weekly recaps`,
      totalUsers: users.length,
      emailsSent: totalEmailsSent,
      errors: totalErrors,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Cron job failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Allow POST as well for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
