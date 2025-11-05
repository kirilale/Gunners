# Arsenal Global Fan Engagement Platform

A comprehensive web application for Arsenal FC supporters worldwide to connect, engage, and celebrate every match together.

## Features

### Core Functionality
- **Virtual Match Check-ins**: Check in from anywhere in the world 5 minutes before kickoff
- **Global Fan Map**: See Arsenal fans worldwide in real-time on an interactive Mapbox globe
- **Badge Collection**: Earn unique badges for every match attended (6 types: Standard, Derby, Clean Sheet, High Scoring, Comeback, Trophy)
- **Match Predictions**: Predict scores before kickoff and earn points for accuracy
- **Achievement System**: Unlock 25+ achievements across multiple categories
- **Lucky Charm Tracking**: Track Arsenal's performance when you check in vs when you don't
- **Leaderboards**: Compete globally, regionally, or with friends across multiple metrics
- **Personal Stats Dashboard**: Comprehensive statistics tracking check-ins, streaks, badges, and more

### Authentication
- Passwordless magic link authentication via email
- Google OAuth support
- Secure session management with httpOnly cookies

### Match Management
- Automated match state transitions (7 states)
- Live score updates from API-Football
- Cron-based automation for match lifecycle
- Real-time check-in windows

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis
- **Authentication**: Custom magic link + Better-auth
- **External APIs**:
  - API-Football for match data
  - Resend for email delivery
  - Mapbox GL JS for global maps
- **Storage**: AWS S3
- **Styling**: Tailwind CSS + shadcn/ui components
- **Deployment**: Vercel with Cron Jobs
- **Containerization**: Docker + Docker Compose

## Project Structure

```
arsenal-fan-platform/
├── app/                          # Next.js App Router pages
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── check-ins/            # Check-in management
│   │   ├── predictions/          # Prediction system
│   │   ├── matches/              # Match data
│   │   ├── leaderboards/         # Leaderboard queries
│   │   ├── user/                 # User management
│   │   └── cron/                 # Automated tasks
│   ├── auth/                     # Auth pages (login, verify)
│   ├── fixtures/                 # Fixture listings
│   ├── results/                  # Match results
│   ├── leaderboards/             # Leaderboard displays
│   ├── profile/                  # User profile
│   ├── settings/                 # User settings
│   └── page.tsx                  # Homepage
├── components/                   # React components
│   ├── ui/                       # Base UI components
│   ├── match/                    # Match-related components
│   ├── profile/                  # Profile components
│   └── settings/                 # Settings components
├── lib/                          # Utility libraries
│   ├── auth/                     # Auth utilities
│   ├── badges/                   # Badge generation
│   ├── achievements/             # Achievement tracking
│   ├── predictions/              # Prediction scoring
│   ├── db.ts                     # Prisma client
│   ├── redis.ts                  # Redis client
│   ├── utils.ts                  # Helper functions
│   └── match-state-manager.ts   # Match lifecycle automation
├── services/                     # External service integrations
│   ├── api-football/            # API-Football client
│   ├── email/                   # Resend email service
│   └── storage/                 # AWS S3 client
├── prisma/                      # Database schema and migrations
└── scripts/                     # Utility scripts
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Redis instance
- API keys for external services

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/arsenal_fans?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# Better-auth
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"

# Email (Resend)
RESEND_API_KEY="re_xxxxxxxxxxxxx"

# Email Octopus (optional)
EMAIL_OCTOPUS_API_KEY="your-email-octopus-api-key"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# API Football
API_FOOTBALL_KEY="your-api-football-key"
API_FOOTBALL_HOST="v3.football.api-sports.io"
ARSENAL_TEAM_ID="42"

# AWS S3
AWS_S3_BUCKET_NAME="arsenal-fan-platform"
AWS_ACCESS_KEY_ID="your-aws-access-key-id"
AWS_SECRET_ACCESS_KEY="your-aws-secret-access-key"
AWS_REGION="us-east-1"

# Mapbox
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN="your-mapbox-token"

# Analytics (optional)
NEXT_PUBLIC_UMAMI_TRACKING_ID="your-umami-tracking-id"
NEXT_PUBLIC_CLARITY_PROJECT_ID="your-clarity-project-id"

# Application
NODE_ENV="development"
PORT="3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Cron Jobs
CRON_SECRET="your-cron-secret-for-automated-tasks"
```

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd arsenal-fan-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate
```

4. Seed initial match data:
```bash
npm run db:seed
```

5. Start development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

### Using Docker

```bash
# Start all services (PostgreSQL, Redis, App)
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f app
```

## Database Schema

Key models:
- **User**: User accounts with profile information
- **Session**: Authentication sessions
- **Match**: Arsenal matches with state management
- **CheckIn**: User check-ins with location data
- **Badge**: Earned badges for each match
- **Prediction**: Score predictions with points
- **Achievement**: Unlocked achievements
- **UserStats**: Aggregated user statistics
- **UserSettings**: User preferences and privacy settings

## Match State Lifecycle

Matches progress through 7 states:
1. **SCHEDULED**: Match is scheduled, not yet open for check-in
2. **CHECK_IN_OPEN**: Check-in window opened (5 mins before kickoff)
3. **LIVE**: Match is in progress (1H, HT, 2H)
4. **POST_MATCH_PROCESSING**: Match ended, processing badges/achievements
5. **COMPLETED**: All processing done, ready for display
6. **ARCHIVED**: Old match archived for performance

State transitions are automated via `/api/cron/update-matches` endpoint.

## Automated Tasks (Cron Jobs)

### Vercel Cron Configuration

The application uses Vercel Cron Jobs defined in `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/update-matches",
    "schedule": "* * * * *"
  }]
}
```

This runs every minute to:
- Update match states
- Sync live match data from API-Football
- Generate badges after matches
- Award achievements
- Update user statistics

### Manual Trigger

You can also manually trigger the cron endpoint:

```bash
curl -X POST http://localhost:3000/api/cron/update-matches \
  -H "Authorization: Bearer your-cron-secret"
```

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

Vercel will automatically:
- Build the application
- Generate Prisma client
- Set up cron jobs
- Deploy to production

### Environment-Specific Settings

**Production:**
- Set `NODE_ENV=production`
- Use production database and Redis URLs
- Enable all analytics
- Configure proper CORS settings
- Set secure `BETTER_AUTH_SECRET`

**Staging:**
- Use staging database
- Test cron jobs
- Validate API integrations

## API Documentation

### Authentication
- `POST /api/auth/login` - Send magic link
- `POST /api/auth/verify` - Verify token and create session
- `POST /api/auth/logout` - End session
- `GET /api/auth/me` - Get current user

### Matches
- `GET /api/matches?status=upcoming|live|completed` - Get matches
- `GET /api/matches/:id` - Get specific match

### Check-ins
- `POST /api/check-ins` - Create check-in
- `GET /api/check-ins?matchId=:id` - Get check-ins for match

### Predictions
- `POST /api/predictions` - Submit prediction
- `GET /api/predictions?matchId=:id` - Get user prediction

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/stats` - Get user statistics
- `GET /api/user/badges` - Get user badges
- `GET /api/user/settings` - Get user settings
- `PUT /api/user/settings` - Update settings
- `POST /api/user/delete` - Delete account

### Leaderboards
- `GET /api/leaderboards?type=check-ins|streaks|predictions|achievements&country=:code&city=:name`

## Development

### Database Management

```bash
# Open Prisma Studio
npm run db:studio

# Create migration
npm run db:migrate

# Reset database
npx prisma migrate reset

# Seed data
npm run db:seed
```

### Code Quality

```bash
# Run linter
npm run lint

# Run type check
npx tsc --noEmit

# Run build
npm run build
```

## Key Features Implementation

### Badge Generation
Badges are automatically generated when a match enters `POST_MATCH_PROCESSING` state. Badge types are determined by:
- Derby: vs Tottenham, Chelsea, Man Utd
- Clean Sheet: Arsenal doesn't concede
- High Scoring: 4+ goals scored
- Comeback: Win after being behind
- Trophy: Finals or significant matches
- Standard: All other matches

### Lucky Charm Calculation
Compares Arsenal's win rate when user checks in vs overall record:
```
Lucky Charm % = (Wins When Present / Total When Present) * 100
```

### Achievement System
25+ achievements across categories:
- Getting Started
- Attendance
- Streaks
- Global Citizen
- Predictions
- Lucky Charm

## Troubleshooting

### Build Issues

**Prisma Client Not Found:**
```bash
npm run db:generate
```

**Redis Connection Failed:**
Check `REDIS_URL` and ensure Redis is running

**Database Connection Failed:**
Verify `DATABASE_URL` and database is accessible

### API Issues

**API-Football Rate Limits:**
Free tier: 100 requests/day. Implement caching with Redis.

**Mapbox Not Loading:**
Check `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` is set and valid

**Emails Not Sending:**
Verify `RESEND_API_KEY` and sender domain is verified

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is proprietary and confidential.

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

## Roadmap

### Phase 1 (MVP) - Completed
- ✅ Authentication system
- ✅ Match check-ins
- ✅ Badge collection
- ✅ Predictions
- ✅ Achievements
- ✅ Leaderboards
- ✅ User profile
- ✅ Settings page
- ✅ Global fan map
- ✅ Automated match management

### Phase 2 (Planned)
- Socket.io real-time updates
- Push notifications
- Friends system
- Badge image generation
- Mobile app (React Native)
- Social features (comments, reactions)
- Match day polls and quizzes
- Video highlights integration

### Phase 3 (Future)
- Fan meetup coordination
- Merchandise integration
- Augmented reality features
- NFT badges (blockchain)
- AI-powered match insights
- Multi-language support

---

Built with ❤️ for Arsenal fans worldwide 🔴⚪
