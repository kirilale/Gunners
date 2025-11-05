import { prisma } from '@/lib/db';
import { apiFootballService } from '@/services/api-football/client';
import { generateBadgesForMatch } from '@/lib/badges/generator';
import { calculateAllPredictionPoints } from '@/lib/predictions/calculator';
import { checkAndAwardAchievements } from '@/lib/achievements/tracker';

export class MatchStateManager {
  /**
   * Update all match states based on current time and API data
   */
  async updateAllMatchStates() {
    console.log('🔄 Starting match state update...');

    const now = new Date();

    // Get all non-archived matches
    const matches = await prisma.match.findMany({
      where: {
        matchState: {
          notIn: ['ARCHIVED'],
        },
      },
      orderBy: {
        kickoffTime: 'asc',
      },
    });

    console.log(`📋 Found ${matches.length} matches to check`);

    for (const match of matches) {
      await this.updateMatchState(match.id);
    }

    console.log('✅ Match state update complete');
  }

  /**
   * Update a single match state
   */
  async updateMatchState(matchId: string) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) return;

    const now = new Date();
    const newState = this.determineMatchState(match, now);

    if (newState !== match.matchState) {
      console.log(`🔄 Transitioning match ${match.id} from ${match.matchState} to ${newState}`);

      await prisma.match.update({
        where: { id: matchId },
        data: { matchState: newState },
      });

      // Handle state transition side effects
      await this.handleStateTransition(match, newState);
    }

    // If match is live or recently finished, sync with API
    if (newState === 'LIVE' || newState === 'CHECK_IN_OPEN') {
      await this.syncLiveMatchData(match);
    }
  }

  /**
   * Determine what state a match should be in
   */
  private determineMatchState(match: any, now: Date): string {
    const kickoff = new Date(match.kickoffTime);
    const fiveMinsBefore = new Date(kickoff.getTime() - 5 * 60 * 1000);
    const fiveMinsAfter = new Date(kickoff.getTime() + (90 + 15 + 5) * 60 * 1000); // 90 min + 15 stoppage + 5 grace
    const twentyFourHoursAfter = new Date(kickoff.getTime() + 24 * 60 * 60 * 1000);

    // ARCHIVED - 24+ hours after match
    if (match.matchStatus === 'FT' && now > twentyFourHoursAfter) {
      return 'ARCHIVED';
    }

    // COMPLETED - Badges generated, waiting for archive
    if (match.matchStatus === 'FT' && match.badgesGenerated) {
      return 'COMPLETED';
    }

    // POST_MATCH_PROCESSING - Match finished, need to generate badges
    if (match.matchStatus === 'FT' && !match.badgesGenerated) {
      return 'POST_MATCH_PROCESSING';
    }

    // LIVE - Match in progress
    if (['1H', '2H', 'HT', 'ET', 'P'].includes(match.matchStatus)) {
      return 'LIVE';
    }

    // CHECK_IN_OPEN - 5 mins before kickoff to kickoff
    if (now >= fiveMinsBefore && now < kickoff) {
      return 'CHECK_IN_OPEN';
    }

    // SCHEDULED - Before check-in window opens
    return 'SCHEDULED';
  }

  /**
   * Handle side effects when state changes
   */
  private async handleStateTransition(match: any, newState: string) {
    switch (newState) {
      case 'CHECK_IN_OPEN':
        await this.onCheckInOpen(match);
        break;

      case 'LIVE':
        await this.onMatchLive(match);
        break;

      case 'POST_MATCH_PROCESSING':
        await this.onMatchFinished(match);
        break;

      case 'COMPLETED':
        await this.onMatchCompleted(match);
        break;

      case 'ARCHIVED':
        await this.onMatchArchived(match);
        break;
    }
  }

  /**
   * When check-in window opens
   */
  private async onCheckInOpen(match: any) {
    console.log(`🎟️ Check-in window opened for ${match.opponentName}`);

    await prisma.match.update({
      where: { id: match.id },
      data: {
        checkInOpenTime: new Date(),
      },
    });

    // TODO: Send notifications to users
  }

  /**
   * When match goes live
   */
  private async onMatchLive(match: any) {
    console.log(`⚽ Match is LIVE: Arsenal vs ${match.opponentName}`);

    // TODO: Broadcast via Socket.io
  }

  /**
   * When match finishes
   */
  private async onMatchFinished(match: any) {
    console.log(`🏁 Match finished: Arsenal vs ${match.opponentName}`);

    // Close check-in window
    await prisma.match.update({
      where: { id: match.id },
      data: {
        checkInCloseTime: new Date(),
      },
    });

    // Calculate prediction points
    console.log('🔮 Calculating prediction points...');
    await calculateAllPredictionPoints(match.id);

    // Generate badges
    console.log('🏅 Generating badges...');
    await generateBadgesForMatch(match.id);

    // Check for new achievements for all users who checked in
    const checkIns = await prisma.checkIn.findMany({
      where: { matchId: match.id },
      select: { userId: true },
    });

    console.log(`🏆 Checking achievements for ${checkIns.length} users...`);
    for (const checkIn of checkIns) {
      await checkAndAwardAchievements(checkIn.userId);
    }

    console.log('✅ Post-match processing complete');
  }

  /**
   * When match is fully processed
   */
  private async onMatchCompleted(match: any) {
    console.log(`✅ Match completed: Arsenal vs ${match.opponentName}`);
    // All processing done, waiting for archive
  }

  /**
   * When match is archived
   */
  private async onMatchArchived(match: any) {
    console.log(`📦 Match archived: Arsenal vs ${match.opponentName}`);
    // TODO: Clear map data, move to cold storage
  }

  /**
   * Sync live match data from API-Football
   */
  private async syncLiveMatchData(match: any) {
    try {
      const liveData = await apiFootballService.getFixtureById(match.apiFixtureId);

      if (!liveData) return;

      const isHome = liveData.teams.home.id === 42;

      await prisma.match.update({
        where: { id: match.id },
        data: {
          matchStatus: liveData.fixture.status.short,
          arsenalScore: isHome ? liveData.goals.home : liveData.goals.away,
          opponentScore: isHome ? liveData.goals.away : liveData.goals.home,
          result: this.calculateResult(
            isHome ? liveData.goals.home : liveData.goals.away,
            isHome ? liveData.goals.away : liveData.goals.home,
            liveData.fixture.status.short
          ),
        },
      });

      console.log(`📡 Synced live data: ${liveData.goals.home} - ${liveData.goals.away}`);
    } catch (error) {
      console.error('Failed to sync live match data:', error);
    }
  }

  private calculateResult(arsenalScore: number | null, opponentScore: number | null, status: string): string | null {
    if (status !== 'FT') return null;
    if (arsenalScore === null || opponentScore === null) return null;

    if (arsenalScore > opponentScore) return 'WIN';
    if (arsenalScore < opponentScore) return 'LOSS';
    return 'DRAW';
  }
}

export const matchStateManager = new MatchStateManager();
