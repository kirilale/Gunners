# Arsenal Global Fan Engagement Platform 🔴⚪

A web application that creates a unified, gamified experience for Arsenal FC supporters worldwide. Check in to matches, earn badges, compete on leaderboards, and connect with Gooners around the globe!

## Features

- **Virtual Match Check-ins**: Check in from anywhere in the world 5 minutes before kickoff
- **Live Global Map**: See Arsenal fans worldwide in real-time using Mapbox
- **Badge Collection**: Earn unique badges for every match you attend virtually
- **Achievements System**: Unlock achievements for attendance, predictions, and more
- **Match Predictions**: Predict scores and compete for points
- **Leaderboards**: Compete globally, regionally, or with friends
- **Lucky Charm Tracker**: See if Arsenal performs better when you're watching!
- **Personal Stats**: Track your supporter journey with comprehensive statistics
- **Streak System**: Maintain consecutive match attendance streaks
- **Real-time Updates**: Live scores and check-in updates via Socket.io

## Tech Stack

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **TailwindCSS** for styling
- **Shadcn/ui** for UI components
- **Mapbox GL JS** for interactive maps
- **Socket.io Client** for real-time updates

### Backend
- **Next.js API Routes** or **Express.js**
- **Prisma ORM** with PostgreSQL
- **Redis** for caching and pub/sub
- **Socket.io** for WebSocket connections
- **Better-auth** for passwordless authentication

### External Services
- **API-Football** - Live match data and fixtures
- **Resend** - Magic link authentication emails
- **AWS S3** - Profile photos and check-in images
- **Email Octopus** - Newsletter and bulk emails
- **Mapbox** - Interactive global map

### Deployment
- **Coolify** - Self-hosted deployment platform
- **Docker** - Containerization
- **PostgreSQL 16** - Database
- **Redis 7** - Cache and real-time layer

## Prerequisites

- Node.js 20+ and npm
- PostgreSQL 16+
- Redis 7+
- Docker and Docker Compose (optional)

### API Keys Required

1. **API-Football** - Get at [api-football.com](https://www.api-football.com/)
   - Recommended: Pro Plan ($19/month, 7,500 calls/day)

2. **Resend** - Get at [resend.com](https://resend.com/)
   - Free tier: 3,000 emails/month

3. **AWS S3** - Set up bucket at [aws.amazon.com](https://aws.amazon.com/)
   - Create bucket, IAM user with S3 permissions

4. **Mapbox** - Get token at [mapbox.com](https://www.mapbox.com/)
   - Free tier: 50,000 map loads/month

5. **Google OAuth** (optional) - Set up at [console.cloud.google.com](https://console.cloud.google.com/)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/arsenal-fan-platform.git
cd arsenal-fan-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your API keys and database credentials.

### 4. Set Up Database

Start PostgreSQL and Redis (or use Docker Compose):

```bash
# Using Docker Compose
docker-compose up -d postgres redis

# Or install locally on your machine
```

Generate Prisma client and run migrations:

```bash
npm run db:generate
npm run db:push
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Docker Deployment

### Using Docker Compose (Recommended for Development)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Using Coolify (Recommended for Production)

1. **Set up Coolify** on your VPS following [Coolify docs](https://coolify.io/docs)

2. **Create a new application** in Coolify dashboard:
   - Source: Connect your GitHub repository
   - Build Pack: Dockerfile
   - Port: 3000

3. **Add environment variables** in Coolify dashboard using values from `.env.example`

4. **Set up PostgreSQL** and **Redis** as Coolify managed services

5. **Deploy**: Coolify will automatically build and deploy on git push

## Project Structure

```
arsenal-fan-platform/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   ├── auth/                 # Authentication pages
│   ├── profile/              # User profile pages
│   ├── fixtures/             # Fixtures page
│   ├── results/              # Results page
│   ├── leaderboards/         # Leaderboards page
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Homepage
├── components/               # React components
│   ├── ui/                   # Shadcn/ui components
│   ├── auth/                 # Auth components
│   ├── match/                # Match-related components
│   ├── profile/              # Profile components
│   ├── leaderboards/         # Leaderboard components
│   └── badges/               # Badge components
├── lib/                      # Utilities and shared code
│   ├── auth/                 # Better-auth configuration
│   ├── db.ts                 # Prisma client
│   ├── redis.ts              # Redis client
│   └── utils.ts              # Utility functions
├── services/                 # External service integrations
│   ├── api-football/         # API-Football client
│   ├── email/                # Email services (Resend)
│   └── storage/              # AWS S3 service
├── types/                    # TypeScript type definitions
├── prisma/                   # Prisma schema and migrations
│   └── schema.prisma         # Database schema
├── public/                   # Static files
├── Dockerfile                # Docker configuration
├── docker-compose.yml        # Docker Compose for local dev
└── README.md                 # This file
```

## Database Schema

The platform uses PostgreSQL with the following main tables:

- **users** - User accounts and profiles
- **matches** - Arsenal fixtures and results
- **check_ins** - User check-ins to matches
- **badges** - Earned badges per user per match
- **predictions** - Match score predictions
- **achievements** - Unlocked achievements
- **user_stats** - Aggregated user statistics
- **user_settings** - Notification and privacy settings

See `prisma/schema.prisma` for the complete schema.

## API Endpoints

### Authentication
- `POST /api/auth/magic-link` - Send magic link email
- `GET /api/auth/verify` - Verify magic link token
- `POST /api/auth/google` - Google OAuth callback
- `POST /api/auth/logout` - Log out user

### Matches
- `GET /api/matches` - Get upcoming fixtures
- `GET /api/matches/:id` - Get specific match details
- `GET /api/matches/live` - Get currently live match

### Check-ins
- `POST /api/check-ins` - Check in to a match
- `GET /api/check-ins/:matchId` - Get check-ins for a match
- `GET /api/check-ins/user` - Get user's check-in history

### Predictions
- `POST /api/predictions` - Submit match prediction
- `GET /api/predictions/:matchId` - Get user's prediction for match

### Leaderboards
- `GET /api/leaderboards/check-ins` - Most check-ins leaderboard
- `GET /api/leaderboards/streaks` - Longest streak leaderboard
- `GET /api/leaderboards/predictions` - Prediction masters leaderboard

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/stats` - Get user statistics
- `DELETE /api/user/account` - Delete user account

## Environment Variables

See `.env.example` for a complete list of required environment variables.

### Critical Variables

```bash
DATABASE_URL=              # PostgreSQL connection string
REDIS_URL=                 # Redis connection string
BETTER_AUTH_SECRET=        # Auth secret key (generate random string)
RESEND_API_KEY=            # Resend API key for emails
API_FOOTBALL_KEY=          # API-Football API key
AWS_S3_BUCKET_NAME=        # S3 bucket name
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=  # Mapbox public token
```

## Development Workflow

### Running Locally

```bash
# Start database services
docker-compose up -d postgres redis

# Run migrations
npm run db:push

# Start dev server
npm run dev
```

### Database Management

```bash
# Generate Prisma client after schema changes
npm run db:generate

# Push schema changes to database
npm run db:push

# Create a new migration
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio
```

## Match State Lifecycle

The platform manages matches through 7 states:

1. **SCHEDULED** - Fixture announced, check-in not open
2. **CHECK_IN_OPEN** - 5 minutes before kickoff (window opens)
3. **LIVE** - Match in progress, check-ins still accepted
4. **POST_MATCH_PROCESSING** - 0-5 minutes after full-time (generating badges)
5. **COMPLETED** - All processing done, badges awarded
6. **ARCHIVED** - 24+ hours after completion (map cleared)

## Badge Types

- **STANDARD** - Regular match badge
- **DERBY** - North London Derby (gold border)
- **CLEAN_SHEET** - Arsenal didn't concede
- **HIGH_SCORING** - Arsenal scored 4+ goals
- **VICTORY** - Arsenal won the match
- **EUROPEAN** - European competition match

## Achievement Categories

### Attendance
- Getting Started, Committed Supporter, Regular, Die Hard, Legendary, The Invincible

### Streaks
- On a Roll, Dedicated, Unstoppable, Legendary Streak, The Faithful

### Geographic
- Local Hero, Nomad, Globetrotter, World Gooner

### Predictions
- Clairvoyant, Fortune Teller, Oracle, Nostradamus

### Special
- Derby Day Devotee, Trophy Hunter, Undefeated

## Contributing

This is a personal project. If you'd like to contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is not affiliated with Arsenal Football Club.

## Support

For issues and questions, please open an issue on GitHub.

## Roadmap

### Phase 1 (MVP) - Current
- ✅ Project setup and infrastructure
- ✅ Database schema
- ✅ API-Football integration
- 🚧 Authentication system
- 🚧 Check-in system
- 🚧 Badge generation
- 🚧 Leaderboards
- 🚧 Homepage and fixtures

### Phase 2 (Post-MVP)
- Friend system
- Private messaging
- Watch party finder
- Live match chat
- Enhanced social features

### Phase 3 (Future)
- Native mobile apps (iOS/Android)
- Virtual currency and rewards
- Merchandise integration
- Multi-language support

## Credits

- Arsenal FC logo and branding © Arsenal Football Club
- Match data powered by API-Football
- Maps powered by Mapbox
- Email delivery by Resend

---

**COYG!** 🔴⚪
