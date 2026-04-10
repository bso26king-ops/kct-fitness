# KCT Fitness Backend

A comprehensive Node.js/Express fitness API with Prisma ORM, JWT authentication, Stripe payments, OpenAI integration, and Firebase notifications.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite (local), PostgreSQL (production)
- **ORM**: Prisma
- **Authentication**: JWT + Bcrypt
- **Payments**: Stripe
- **Storage**: Cloudinary
- **AI**: OpenAI API
- **Notifications**: Firebase Cloud Messaging
- **Email**: Nodemailer

## Project Structure

```
src/
├── controllers/     # Business logic
├── routes/         # API endpoints
├── middleware/     # Express middleware
├── services/       # Utility services (trials, etc)
├── utils/          # Helper functions (JWT, email, badges)
├── lib/            # Third-party service wrappers
└── index.js        # App entry point
```

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your API keys:
```bash
cp .env.example .env
```

Key variables to configure:
- `DATABASE_URL` - SQLite for dev (file:./dev.db), PostgreSQL for prod
- `JWT_SECRET` & `JWT_REFRESH_SECRET` - Generate strong secrets
- `STRIPE_SECRET_KEY` & `STRIPE_PRICE_ID` - Get from Stripe Dashboard
- `CLOUDINARY_*` - Get from Cloudinary account
- `OPENAI_API_KEY` - Get from OpenAI
- `FIREBASE_*` - Download service account JSON
- `SMTP_*` - Configure for email sending

### 3. Setup Database
```bash
npm run prisma:generate
npm run prisma:migrate
```

For local development with SQLite:
```bash
npm run prisma:studio  # Open Prisma Studio UI
```

### 4. Start Development Server
```bash
npm run dev
```

Server runs on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/refresh` - Get new access token
- `POST /api/auth/logout` - Logout (revoke refresh token)
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/me` - Get current user profile
- `PATCH /api/auth/profile` - Update user preferences

### Workouts
- `GET /api/workouts` - List all workouts (paginated)
- `GET /api/workouts/:id` - Get workout details
- `POST /api/workouts` - Create custom workout (auth)
- `PUT /api/workouts/:id` - Update workout (auth)
- `DELETE /api/workouts/:id` - Delete workout (auth)
- `POST /api/workouts/generate/ai` - Generate AI workout (auth)

### Exercises
- `GET /api/exercises` - List exercises with filters
- `GET /api/exercises/:id` - Get exercise details
- `GET /api/exercises/:id/alternatives` - Get similar exercises
- `POST /api/exercises` - Create exercise (admin)
- `PUT /api/exercises/:id` - Update exercise (admin)
- `DELETE /api/exercises/:id` - Delete exercise (admin)

### Progress
- `POST /api/progress/log` - Log completed workout (auth)
- `GET /api/progress` - Get user stats & progress (auth)
- `POST /api/progress/photos` - Upload progress photo (auth)
- `GET /api/progress/photos` - Get user photos (auth)

### Groups
- `GET /api/groups` - List all groups
- `POST /api/groups` - Create group (auth)
- `GET /api/groups/:id` - Get group details
- `POST /api/groups/:groupId/join` - Join group (auth)
- `GET /api/groups/:groupId/feed` - Get group leaderboard (auth)
- `POST /api/groups/:groupId/messages` - Post group message (auth)

### Leaderboards
- `GET /api/leaderboards/global` - Global leaderboard
- `GET /api/leaderboards/groups/:groupId` - Group leaderboard
- `GET /api/leaderboards/workouts/:workoutId` - Workout leaderboard
- `GET /api/leaderboards/challenges/:challengeId` - Challenge leaderboard

### Challenges
- `GET /api/challenges` - List challenges
- `GET /api/challenges/:id` - Get challenge details
- `POST /api/challenges` - Create challenge (auth)
- `POST /api/challenges/:id/attempt` - Submit challenge score (auth)

### Sessions
- `GET /api/sessions` - List scheduled sessions
- `POST /api/sessions` - Schedule workout session (auth)
- `GET /api/sessions/:sessionId/leaderboard` - Session leaderboard

### Subscriptions
- `POST /api/subscriptions/checkout` - Create checkout session (auth)
- `POST /api/subscriptions/cancel` - Cancel subscription (auth)
- `GET /api/subscriptions/status` - Get subscription status (auth)
- `POST /api/subscriptions/webhook` - Stripe webhook (no auth)

### Admin
- `GET /api/admin/users` - List all users (admin)
- `GET /api/admin/analytics` - Get analytics (admin)
- `POST /api/admin/notifications` - Send push notifications (admin)
- `GET /api/admin/subscriptions` - List subscriptions (admin)
- `PATCH /api/admin/users/:userId/role` - Update user role (admin)

## Authentication

All protected endpoints require Bearer token in Authorization header:
```
Authorization: Bearer <access_token>
```

Access tokens expire in 15 minutes. Use refresh tokens (7 day expiry) to get new access tokens:
```bash
POST /api/auth/refresh
{
  "refreshToken": "..."
}
```

## Key Features

### Trial Management
Users get a 14-day free trial on registration. The trial service (`src/services/trial.service.js`) checks daily for:
- Users with 4 days remaining (day 10) → sends notification
- Users with 1 day remaining (day 13) → final warning
- Expired trials (day 14+) → marks as EXPIRED

Set up daily cron job to call `checkAndNotifyTrials()`.

### AI Workout Generation
The `generateWorkout` endpoint:
1. Gets user's skill level and preferences
2. Fetches exercises matching criteria
3. Filters out exercises used in last 48 hours
4. Calls OpenAI to structure workout
5. Creates and saves the workout

### Badge System
Automatically awared for achievements:
- `FIRST_WORKOUT` - Complete first workout
- `TEN_WORKOUTS` - Complete 10 workouts
- `FIFTY_WORKOUTS` - Complete 50 workouts
- `CENTURY^WORKOUTS` - Complete 100 workouts
- `SEVEN_DAY_STREAK` - 7-day workout streak
- `THIRTY_DAY_STREAK` - 30-day workout streak
- `FIRST_PR` - First personal record

### Payment Processing
Stripe integration for subscriptions:
- Creates checkout session for trial ↚ premium upgrade
- Handles subscription events via webhooks
- Supports subscription cancellation
- Tracks subscription status

### Push Notifications
Firebase Cloud Messaging for real-time notifications:
- Trial expiration reminders
- Scheduled session invitations
- Challenge notifications
- Custom admin notifications

## Database Schema

### Core Models
- **User** - Users with trial/subscription status
- **Exercise** - Exercise library with variations
- **Workout** - Workout templates (custom or AI-generated)
- **WorkoutExercise** - Exercise-workout mapping

### Progress Tracking
- **UserWorkoutLog** - Completed workouts
- **ExerciseLog** - Individual exercise performance
- **ProgressPhoto** - Progress photos with metrics
- **Badge** - Earned achievements

### Social
- **Group** - User groups/teams
- **GroupMember** - Group membership with roles
- **Challenge** - Time-limited challenges
- **ScheduledSession** - Group workout sessions

### Leaderboards
- **Leaderboard** - Scores for global/group/workout/challenge leaderboards

### Auth
- **RefreshToken** - Stored refresh tokens for revocation

## Error Handling

All errors are caught and formatted consistently:
```json
{
  "error": "Error message",
  "details": [...]  // For validation errors
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad request (validation error)
- `401` - Unauthorized (no token)
- `403` - Forbidden (no permission)
- `404` - Not found
- `409` - Conflict (e.g., duplicate email)
- `500` - Server error

## Development Tips

### Debugging
Enable Prisma logging in development:
```javascript
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});
```

### Testing Emails
Nodemailer is configured for Gmail. To use:
1. Enable 2FA on Gmail account
2. Generate app-specific password
3. Set `SMTP_USER` and `SMTP_PASS`

Or use mock SMTP service like Ethereal for testing.

### Testing Stripe
Use Stripe test keys and test card numbers:
- `4242 4242 4242 4242` - Success
- `4000 0000 0000 0002` - Card declined
- `4000 0000 0000 0341` - 3D Secure

### Testing Firebase
Download service account JSON from Firebase Console and paste into `.env`:
```
FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n"
```

## Deployment

### Railway/Heroku
1. Set PostgreSQL database URL
2. Set all environment variables
3. Run migrations: `npm run prisma:migrate`
4. Deploy

### Environment-Specific Config
Development (SQLite):
```
DATABASE_URL="file:./dev.db"
NODE_ENV=development
```

Production (PostgreSQL):
```
DATABASE_URL="postgresql://user:password@host:port/dbname"
NODE_ENV=production
```

## License
	MIT
