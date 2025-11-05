import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Cron endpoint to permanently delete accounts after 24-hour grace period
 *
 * This should be called once per hour:
 * For Vercel Cron, add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/cleanup-deleted-accounts",
 *     "schedule": "0 * * * *"
 *   }]
 * }
 *
 * PRD: After 24 hours, permanently delete all user data (GDPR compliance)
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

    console.log('🕐 Cron job started: cleanup-deleted-accounts');
    const startTime = Date.now();

    // Find all users with deletedAt timestamp older than 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const usersToDelete = await prisma.user.findMany({
      where: {
        deletedAt: {
          lte: twentyFourHoursAgo,
        },
      },
      select: {
        id: true,
        email: true,
        username: true,
        deletedAt: true,
      },
    });

    if (usersToDelete.length === 0) {
      console.log('✅ No accounts to permanently delete');
      return NextResponse.json({
        success: true,
        message: 'No accounts to delete',
        count: 0,
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`🗑️  Found ${usersToDelete.length} accounts to permanently delete`);

    // Permanently delete each user (cascade will delete all related data)
    const deleteResults = await Promise.allSettled(
      usersToDelete.map(async (user) => {
        try {
          // Hard delete - Prisma cascade will delete all related records:
          // - CheckIns
          // - Badges
          // - Predictions
          // - Achievements
          // - UserStats
          // - UserSettings
          // - Sessions
          await prisma.user.delete({
            where: { id: user.id },
          });

          console.log(`✅ Permanently deleted user: ${user.email} (${user.id})`);
          return { success: true, userId: user.id };
        } catch (error) {
          console.error(`❌ Failed to delete user ${user.id}:`, error);
          return { success: false, userId: user.id, error };
        }
      })
    );

    const successCount = deleteResults.filter(
      (result) => result.status === 'fulfilled' && result.value.success
    ).length;

    const duration = Date.now() - startTime;
    console.log(`✅ Cron job completed in ${duration}ms`);
    console.log(`✅ Successfully deleted ${successCount}/${usersToDelete.length} accounts`);

    return NextResponse.json({
      success: true,
      message: `Permanently deleted ${successCount} accounts`,
      totalFound: usersToDelete.length,
      deleted: successCount,
      failed: usersToDelete.length - successCount,
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
