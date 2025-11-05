import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { emailService } from "@/services/email/resend";
import { formatMatchDate } from "@/lib/utils";

/**
 * Cron endpoint to send match reminders
 *
 * Runs every 3 hours and sends reminders for:
 * - Matches happening in 24 hours
 * - Matches happening in 3 hours
 *
 * For Vercel Cron, add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/send-match-reminders",
 *     "schedule": "0 */3 * * *"
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

    console.log('🕐 Cron job started: send-match-reminders');
    const startTime = Date.now();

    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in3Hours = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    const in21Hours = new Date(now.getTime() + 21 * 60 * 60 * 1000);

    // Find matches happening in the next 24 hours
    const upcomingMatches = await prisma.match.findMany({
      where: {
        kickoffTime: {
          gte: in21Hours, // Between 21-24 hours away
          lte: in24Hours,
        },
        matchState: {
          in: ['SCHEDULED', 'CHECK_IN_OPEN'],
        },
      },
      select: {
        id: true,
        opponentName: true,
        competitionName: true,
        kickoffTime: true,
        venueName: true,
        venueCity: true,
      },
    });

    // Find matches happening in the next 3 hours (for last-minute reminders)
    const imminentMatches = await prisma.match.findMany({
      where: {
        kickoffTime: {
          gte: now,
          lte: in3Hours,
        },
        matchState: {
          in: ['SCHEDULED', 'CHECK_IN_OPEN'],
        },
      },
      select: {
        id: true,
        opponentName: true,
        competitionName: true,
        kickoffTime: true,
        venueName: true,
        venueCity: true,
      },
    });

    const allMatches = [...upcomingMatches, ...imminentMatches];

    if (allMatches.length === 0) {
      console.log('✅ No upcoming matches requiring reminders');
      return NextResponse.json({
        success: true,
        message: 'No matches requiring reminders',
        count: 0,
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`📧 Found ${allMatches.length} matches to send reminders for`);

    let totalEmailsSent = 0;
    let totalErrors = 0;

    // Process each match
    for (const match of allMatches) {
      try {
        // Get all users with match reminders enabled
        const users = await prisma.user.findMany({
          where: {
            deletedAt: null,
            userSettings: {
              emailNotifications: {
                path: ['matchReminders'],
                equals: true,
              },
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
          },
        });

        console.log(`📧 Sending ${users.length} reminders for ${match.opponentName}`);

        const hoursUntil = Math.round(
          (match.kickoffTime.getTime() - now.getTime()) / (1000 * 60 * 60)
        );

        // Send emails in batches to avoid rate limits
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

                  // Simple quiet hours check
                  if (
                    (startHour < endHour && currentHour >= startHour && currentHour < endHour) ||
                    (startHour > endHour && (currentHour >= startHour || currentHour < endHour))
                  ) {
                    console.log(`⏰ Skipping ${user.email} - in quiet hours`);
                    return;
                  }
                }

                await emailService.sendMatchReminder(
                  user.email,
                  user.displayName || user.username,
                  {
                    opponent: match.opponentName,
                    competition: match.competitionName,
                    kickoffTime: formatMatchDate(match.kickoffTime),
                    venue: match.venueName && match.venueCity
                      ? `${match.venueName}, ${match.venueCity}`
                      : match.venueName || 'TBD',
                    hoursUntil,
                  }
                );

                totalEmailsSent++;
              } catch (error) {
                console.error(`❌ Failed to send reminder to ${user.email}:`, error);
                totalErrors++;
              }
            })
          );

          // Brief pause between batches
          if (i + batchSize < users.length) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      } catch (error) {
        console.error(`❌ Error processing match ${match.id}:`, error);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Cron job completed in ${duration}ms`);
    console.log(`✅ Sent ${totalEmailsSent} reminders (${totalErrors} errors)`);

    return NextResponse.json({
      success: true,
      message: `Sent ${totalEmailsSent} match reminders`,
      matches: allMatches.length,
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
