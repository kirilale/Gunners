import axios, { AxiosInstance } from 'axios';
import { redis, CACHE_KEYS, CACHE_TTL } from '@/lib/redis';

class ApiFootballService {
  private client: AxiosInstance;
  private readonly ARSENAL_TEAM_ID = 42;
  private readonly PREMIER_LEAGUE_ID = 39;
  private readonly CHAMPIONS_LEAGUE_ID = 2;
  private readonly FA_CUP_ID = 45;
  private readonly CARABAO_CUP_ID = 48;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://v3.football.api-sports.io',
      headers: {
        'x-rapidapi-key': process.env.API_FOOTBALL_KEY || '',
        'x-rapidapi-host': process.env.API_FOOTBALL_HOST || 'v3.football.api-sports.io',
      },
    });
  }

  /**
   * Get Arsenal fixtures for a season
   */
  async getArsenalFixtures(season: number = 2025) {
    const cacheKey = CACHE_KEYS.FIXTURES(season);

    // Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const response = await this.client.get('/fixtures', {
        params: {
          team: this.ARSENAL_TEAM_ID,
          season,
          timezone: 'Europe/London',
        },
      });

      const fixtures = response.data.response;

      // Cache for 1 hour
      await redis.setex(cacheKey, CACHE_TTL.FIXTURES, JSON.stringify(fixtures));

      return fixtures;
    } catch (error) {
      console.error('Error fetching Arsenal fixtures:', error);
      throw error;
    }
  }

  /**
   * Get live Arsenal match
   */
  async getLiveMatch() {
    const cacheKey = CACHE_KEYS.LIVE_MATCH;

    // Try cache first (30 second TTL)
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const response = await this.client.get('/fixtures', {
        params: {
          live: 'all',
          team: this.ARSENAL_TEAM_ID,
          timezone: 'Europe/London',
        },
      });

      const liveMatch = response.data.response[0] || null;

      // Cache for 30 seconds
      if (liveMatch) {
        await redis.setex(cacheKey, CACHE_TTL.LIVE_MATCH, JSON.stringify(liveMatch));
      }

      return liveMatch;
    } catch (error) {
      console.error('Error fetching live match:', error);
      throw error;
    }
  }

  /**
   * Get match events (goals, cards, substitutions)
   */
  async getMatchEvents(fixtureId: number) {
    try {
      const response = await this.client.get('/fixtures/events', {
        params: {
          fixture: fixtureId,
        },
      });

      return response.data.response;
    } catch (error) {
      console.error('Error fetching match events:', error);
      throw error;
    }
  }

  /**
   * Get Premier League standings
   */
  async getPremierLeagueStandings(season: number = 2025) {
    const cacheKey = CACHE_KEYS.STANDINGS(season);

    // Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const response = await this.client.get('/standings', {
        params: {
          season,
          league: this.PREMIER_LEAGUE_ID,
        },
      });

      const standings = response.data.response[0]?.league?.standings[0] || [];

      // Cache for 1 hour
      await redis.setex(cacheKey, CACHE_TTL.STANDINGS, JSON.stringify(standings));

      return standings;
    } catch (error) {
      console.error('Error fetching standings:', error);
      throw error;
    }
  }

  /**
   * Get Arsenal squad
   */
  async getArsenalSquad() {
    const cacheKey = CACHE_KEYS.SQUAD;

    // Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const response = await this.client.get('/players/squads', {
        params: {
          team: this.ARSENAL_TEAM_ID,
        },
      });

      const squad = response.data.response[0]?.players || [];

      // Cache for 1 week
      await redis.setex(cacheKey, CACHE_TTL.SQUAD, JSON.stringify(squad));

      return squad;
    } catch (error) {
      console.error('Error fetching squad:', error);
      throw error;
    }
  }

  /**
   * Get specific fixture by ID
   */
  async getFixtureById(fixtureId: number) {
    try {
      const response = await this.client.get('/fixtures', {
        params: {
          id: fixtureId,
          timezone: 'Europe/London',
        },
      });

      return response.data.response[0] || null;
    } catch (error) {
      console.error('Error fetching fixture:', error);
      throw error;
    }
  }

  /**
   * Clear all caches
   */
  async clearAllCaches() {
    const keys = await redis.keys('arsenal:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}

export const apiFootballService = new ApiFootballService();
export default apiFootballService;
