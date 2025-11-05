import { NextRequest, NextResponse } from "next/server";
import { matchStateManager } from "@/lib/match-state-manager";

/**
 * Cron endpoint to update all match states
 *
 * This should be called:
 * - Every 1 minute during match days
 * - Every 30 seconds during live matches
 *
 * For Vercel Cron, add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/update-matches",
 *     "schedule": "* * * * *"
 *   }]
 * }
 *
 * Or use a service like cron-job.org
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authorization (optional but recommended)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🕐 Cron job started: update-matches');
    const startTime = Date.now();

    await matchStateManager.updateAllMatchStates();

    const duration = Date.now() - startTime;
    console.log(`✅ Cron job completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      message: 'Match states updated successfully',
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
