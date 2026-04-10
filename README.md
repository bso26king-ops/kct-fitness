# KCT Fitness — Full Stack App

A complete fitness platform with mobile app, admin dashboard, and API backend.

---

## Stripe Setup (You have a key — wire it up here)

1. Open `backend/.env` and add your Stripe key: `STRIPE_SECRET_KEY=sk_test_YOUR_KEY`
2. Create a product + monthly price in your [Stripe Dashboard](https://dashboard.stripe.com/products)
3. Copy the `price_xxx` ID → `STRIPE_PRICE_ID=price_xxx` in `backend/.env`
4. For local webhook testing: `npx stripe listen --forward-to localhost:3000/api/subscriptions/webhook`
5. Copy the webhook signing secret → `STRIPE_WEBHOOK_SECRET=whsec_xxx`

---

## Project Structure

```
kct-fitness/
├── mobile/           # React Native + Expo mobile app
│   ├── src/
│   │   ├── screens/  # All screen components
│   │   ├── components/  # Reusable UI components
│   │   ├── services/    # API client and authentication
│   │   ├── context/     # Auth context
│   │   ├── navigation/  # Navigation structure
│   │   └── utils/       # Constants and utilities
│   ├── app.json      # Expo configuration
│   └── package.json
│
└── admin/            # React + Vite admin dashboard
    ├── src/
    │   ├── pages/    # All admin pages
    │   ├── components/
    │   │   ├── layout/  # Sidebar and layout
    │   │   └── ui/      # Reusable UI components
    │   ├── context/     # Auth context
    │   ├── services/    # API calls
    │   └── App.jsx
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

## Mobile App Setup

### Prerequisites
- Node.js 16+
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator or Android Emulator

### Installation

```bash
cd mobile
npm install
```

### Development

```bash
npm start          # Start Expo dev server
npm run ios        # Run on iOS Simulator
npm run android    # Run on Android Emulator
```

### Features

**Authentication**
- Login/Register with email and password
- Auto-login with stored token
- JWT token with refresh mechanism

**Onboarding**
- 5-step wizard: Skill level → Equipment → Duration → Goals → Groups
- Saves preferences to API

**Dashboard**
- User greeting and streak counter
- Suggested workout card
- Upcoming sessions list
- Group activity feed

**Workouts**
- AI-powered workout generator with customization
- Duration chips, equipment & muscle group selection
- Active workout tracking with set completion
- Rest timer between sets
- Weight tracking per set
- Workout completion summary with stats

**Progress Tracking**
- Weight trend line chart
- Progress photos by angle (Front/Side/Back)
- Personal records list
- Badges & achievements

**Social Features**
- Leaderboard (Global/Friends/Group)
- Challenges with participation
- Group messaging and activity feed
- Friend connections

**Profile**
- User stats dashboard
- Subscription status with trial countdown
- Account settings (skill level, equipment)
- Settings page with notification toggles

### Design System

All screens use the KCT Fitness color scheme:
- Primary: #0A0A0A (black)
- Secondary: #141414 (dark gray)
- Card: #1E1E1E (dark card)
- Accent: #0080FF (blue)
- Success: #00C853 (green)
- Warning: #FF6D00 (orange)
- Danger: #FF1744 (red)

## Admin Dashboard Setup

### Prerequisites
- Node.js 16+
- Running API server on `http://localhost:3000`

### Installation

```bash
cd admin
npm install
```

### Development

```bash
npm run dev      # Start Vite dev server on port 3001
```

### Production Build

```bash
npm run build    # Create production build
npm run preview  # Preview build locally
```

### Features

**Authentication**
- Admin login page
- JWT token management
- Protected routes

**Dashboard Overview**
- Key metrics (Users, Workouts, Rating, MRR)
- User growth line chart
- Weekly workouts bar chart
- Recent signups table

**Content Management**
- Exercise Library: Add/Edit/Delete exercises
- Workout Builder: Create workouts with drag-and-drop exercise selection
- Challenge Manager: Create and manage fitness challenges
- Group Manager: View and manage user groups with member lists

**User Management**
- User list with search and filtering (subscription status)
- Extend trial functionality
- Suspend/unsuspend accounts
- User detail modal with actions

**Scheduled Sessions**
- Create group workout sessions
- Assign workouts to groups
- Schedule dates and times

**Notifications**
- Send push notifications to targeted audiences
- Notification history log
- Filter by audience (All, Trial, Premium, Inactive)

**Analytics Dashboard**
- Multi-range date selector (7d, 30d, 90d, 1y)
- Active users trend (line chart)
- New users distribution (bar chart)
- Workouts completed (area chart)
- Key metrics (session duration, completion rate, churn)

**Subscription Management**
- MRR and ARR tracking
- Active subscription count
- Failed payment alerts
- Retry mechanisms

## API Integration

### Mobile API Endpoints
```
POST /api/auth/login              # User login
POST /api/auth/register           # User registration
GET  /api/auth/me                 # Get current user
POST /api/auth/logout             # Logout
POST /api/auth/refresh            # Refresh token

GET  /api/users/streak            # Get streak count
GET  /api/workouts/suggested      # Get suggested workout
GET  /api/sessions/upcoming       # Get upcoming sessions
GET  /api/groups/feed             # Get group feed

POST /api/workouts/generate       # Generate workout
POST /api/workouts/start          # Start workout
POST /api/workouts/complete       # Complete workout

GET  /api/progress/weight-history # Weight tracking
GET  /api/progress/photos         # Progress photos
GET  /api/progress/personal-records # PRs
GET  /api/progress/badges         # Badges

GET  /api/leaderboard             # Leaderboard data
GET  /api/challenges              # Active challenges
POST /api/challenges/{id}/attempt # Attempt challenge
GET  /api/groups                  # User's groups
GET  /api/groups/{id}/feed        # Group feed
```

### Admin API Endpoints
```
POST /api/admin/auth/login        # Admin login
GET  /api/admin/auth/me           # Get admin user
POST /api/admin/auth/logout       # Logout

GET  /api/exercises               # List exercises
POST /api/exercises               # Create exercise
PATCH /api/exercises/{id}         # Update exercise
DELETE /api/exercises/{id}        # Delete exercise

GET  /api/workouts                # List workouts
POST /api/workouts                # Create workout
PATCH /api/workouts/{id}          # Update workout
DELETE /api/workouts/{id}         # Delete workout

GET  /api/challenges              # List challenges
POST /api/challenges              # Create challenge
DELETE /api/challenges/{id}       # Delete challenge

GET  /api/admin/users             # List users
GET  /api/admin/users/{id}        # Get user details
POST /api/admin/users/{id}/extend-trial # Extend trial
POST /api/admin/users/{id}/suspend     # Suspend user

GET  /api/admin/analytics         # Analytics metrics
GET  /api/admin/analytics/user-growth
GET  /api/admin/analytics/workouts

POST /api/admin/notifications/send  # Send notification
GET  /api/admin/notifications/history
```

## Environment Variables

### Mobile (.env)
```
REACT_APP_API_URL=http://localhost:3000/api
```

### Admin (.env)
```
VITE_API_URL=http://localhost:3000/api
```

## Technology Stack

### Mobile
- React Native 0.73.4
- Expo 50.0
- React Navigation 6.x
- Zustand (state management)
- React Native Chart Kit
- Linear Gradient
- Async Storage

### Admin
- React 18.2
- Vite 5.1
- React Router 6.22
- TailwindCSS 3.4
- Recharts 2.12
- React Query 5.0
- Axios
- Zustand

## Color Theme

```css
:root {
  --bg-primary: #0A0A0A;
  --bg-secondary: #141414;
  --bg-card: #1E1E1E;
  --accent: #0080FF;
  --success: #00C853;
  --warning: #FF6D00;
  --danger: #FF1744;
  --text-primary: #FFFFFF;
  --text-secondary: #A0A0A0;
}
```

## Deployment

### Mobile
Deploy using:
- Expo Updates for OTA updates
- EAS Build for iOS/Android app builds
- App Store / Google Play for distribution

### Admin
Deploy using:
- Vercel, Netlify, or AWS S3
- Docker container
- Traditional web hosting

## Development Guidelines

1. **Code Style**: Use consistent naming conventions (camelCase for JS, kebab-case for CSS)
2. **Components**: Keep components small and focused on single responsibility
3. **API Calls**: Use API layer in services/ folder, not directly in components
4. **State Management**: Use Zustand for complex state, Context for auth
5. **Error Handling**: Always show user-friendly error messages
6. **Loading States**: Implement loading states for all async operations
7. **Responsive Design**: Ensure mobile app works on all device sizes

## Testing

Run tests with:
```bash
npm test
```

## License

All rights reserved. KCT Fitness (c) 2024
