import { prisma } from '../lib/db';
import { apiFootballService } from '../services/api-football/client';

async function seedMatches() {
  console.log('🔄 Fetching Arsenal fixtures from API-Football...');

  try {
    const currentSeason = new Date().getFullYear();
    const fixtures = await apiFootballService.getArsenalFixtures(currentSeason);

    console.log(`📥 Found ${fixtures.length} fixtures for ${currentSeason} season`);

    for (const fixture of fixtures) {
      const isHome = fixture.teams.home.id === 42;
      const opponent = isHome ? fixture.teams.away : fixture.teams.home;

      const matchData = {
        apiFixtureId: fixture.fixture.id,
        season: currentSeason,
        competitionId: fixture.league.id,
        competitionName: fixture.league.name,
        opponentTeamId: opponent.id,
        opponentName: opponent.name,
        opponentLogo: opponent.logo,
        homeAway: isHome ? 'HOME' : 'AWAY',
        venueName: fixture.fixture.venue.name,
        venueCity: fixture.fixture.venue.city,
        matchDate: new Date(fixture.fixture.date),
        kickoffTime: new Date(fixture.fixture.date),
        matchStatus: fixture.fixture.status.short,
        matchState: fixture.fixture.status.short === 'FT' ? 'COMPLETED' : 'SCHEDULED',
        arsenalScore: isHome ? fixture.goals.home : fixture.goals.away,
        opponentScore: isHome ? fixture.goals.away : fixture.goals.home,
        result: fixture.fixture.status.short === 'FT'
          ? calculateResult(
              isHome ? fixture.goals.home : fixture.goals.away,
              isHome ? fixture.goals.away : fixture.goals.home
            )
          : null,
        checkInOpenTime: new Date(new Date(fixture.fixture.date).getTime() - 5 * 60 * 1000),
        badgesGenerated: false,
      };

      await prisma.match.upsert({
        where: { apiFixtureId: fixture.fixture.id },
        update: matchData,
        create: matchData,
      });

      console.log(`✅ ${matchData.matchState} - Arsenal vs ${opponent.name} (${fixture.fixture.date})`);
    }

    console.log(`\n✨ Successfully seeded ${fixtures.length} matches!`);
  } catch (error) {
    console.error('❌ Error seeding matches:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function calculateResult(arsenalScore: number | null, opponentScore: number | null): string | null {
  if (arsenalScore === null || opponentScore === null) return null;
  if (arsenalScore > opponentScore) return 'WIN';
  if (arsenalScore < opponentScore) return 'LOSS';
  return 'DRAW';
}

seedMatches();
