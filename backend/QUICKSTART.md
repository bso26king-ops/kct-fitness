# KCT Fitness Backend - Quick Start Guide

## 5-Minute Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup Database
```bash
npm run prisma:generate
npm run prisma:migrate
```

### Step 3: Configure Environment
Edit `.env` with your API keys (minimum required for testing):
```bash
# Required for local dev:
DATABASE_URL="file:./dev.db"
JWT_SECRET="dev-secret-key"
JWT_REFRESH_SECRET="dev-refresh-secret"

# Optional (features disabled if missing):
# STRIPE_SECRET_KEY, OPENAI_API_KEY, CLOUDINARY_*, FIREBASE_*, SMTP_*
```

### Step 4: Start Server
```bash
npm run dev
```

Server runs on `http://localhost:3000`

## Test the API

### 1. Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

Response includes `accessToken` and `refreshToken`.

### 2. Get Your Profile
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Create a Workout
```bash
curl -X POST http://localhost:3000/api/workouts \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chest Day",
    "description": "Upper body workout",
    "duration": 45,
    "difficulty": "INTERMEDIATE",
    "equipment": ["barbell", "dumbbell"],
    "exercises": [
      {
        "exerciseId": "EXERCISE_ID_HERE",
        "sets": 4,
        "reps": 8,
        "weight": 225,
        "restSeconds": 90
      }
    ]
  }'
```

### 4. Log a Workout
```bash
curl -X POST http://localhost:3000/api/progress/log \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "workoutId": "WORKOUT_ID_HERE",
    "duration": 45,
    "notes": "Great session!",
    "exerciseLogs": [
      {
        "exerciseId": "EXERCISE_ID_HERE",
        "setsCompleted": 4,
        "repsCompleted": 8,
        "weightUsed": 225
      }
    ]
  }'
```

### 5. View Health Check
```bash
curl http://localhost:3000/health
```

## Available Commands

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Open Prisma Studio (visual DB editor)
npm run prisma:studio
```

## Database Visualization

Open Prisma Studio to view/edit data:
```bash
npm run prisma:studio
```

Opens at `http://localhost:5555`

## Common Issues

### Database locked error
SQLite has single-writer limitation. Close Prisma Studio or other connections.

### Token expired
Access tokens expire in 15 minutes. Use refresh token to get new one:
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "YOUR_REFRESH_TOKEN"}'
```

### Optional services not configured
Missing API keys (Stripe, OpenAI, Firebase) won't break the server. Those endpoints will fail gracefully:
- AI workout generation needs OpenAI
- Payments need Stripe
- Notifications need Firebase
- Emails need SMTP

### Port already in use
Change port in `.env`:
```
PORT=3001
```

## API Documentation

Full API docs in `README.md`. Quick reference:

### Auth
- `POST /api/auth/register` - Sign up
- `POST /api/auth/login` - Sign in
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get profile

### Workouts
- `GET /api/workouts` - List workouts
- `POST /api/workouts` - Create workout
- `POST /api/workouts/generate/ai` - AI generation

### Progress
- `POST /api/progress/log` - Log workout
- `GET /api/progress` - Get stats
- `POST /api/progress/photos` - Upload photo

### Groups
- `GET /api/groups` - List groups
- `POST /api/groups` - Create group
- `POST /api/groups/:id/join` - Join group

### Leaderboards
- `GET /api/leaderboards/global` - Global rankings
- `GET /api/leaderboards/groups/:id` - Group rankings

### Admin
- `GET /api/admin/users` - List users (admin)
- `GET /api/admin/analytics` - Analytics (admin)

## Next Steps

1. Create some exercises in Prisma Studio
2. Create workouts with those exercises
3. Log workouts and track progress
4. Create groups and join them
5. Check leaderboards

See `README.md` for full documentation.

## Need Help?

- Check `README.md` for detailed docs
- Look at controller files for implementation details
- Review `.env.example` for all available configs
- Check Prisma Schema for data structure

Happy coding!
