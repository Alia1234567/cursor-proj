# Calendar Statistics Dashboard

A production-ready web application that securely connects to Google Calendar, fetches calendar events, and displays insightful statistics for customizable date ranges.

## 🏗️ Architecture Overview

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   React     │ ──────► │   Express    │ ──────► │   Google     │
│  Frontend   │         │   Backend    │         │   Calendar   │
│  (Vite)     │ ◄────── │  (Node.js)   │ ◄────── │     API      │
└─────────────┘         └──────────────┘         └──────────────┘
     │                        │
     │                        │
     └── JWT Cookie ──────────┘
```

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Ant Design for UI components
- @ant-design/plots for data visualization
- React Router for navigation

**Backend:**
- Node.js with Express
- TypeScript
- Prisma ORM with PostgreSQL
- Google APIs (googleapis)
- JWT for session management
- Cookie-based authentication

## 🔐 OAuth 2.0 Flow

The application uses Google OAuth 2.0 for secure authentication:

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Google

    User->>Frontend: Click "Sign in with Google"
    Frontend->>Backend: GET /auth/google
    Backend->>Google: Redirect to OAuth consent screen
    User->>Google: Grant permissions
    Google->>Backend: Redirect with authorization code
    Backend->>Google: Exchange code for tokens
    Google->>Backend: Return access & refresh tokens
    Backend->>Backend: Store tokens (PostgreSQL)
    Backend->>Backend: Generate JWT
    Backend->>Frontend: Set JWT in HttpOnly cookie
    Frontend->>Frontend: Redirect to dashboard
    Frontend->>Backend: GET /api/calendar/stats (with cookie)
    Backend->>Backend: Verify JWT
    Backend->>Google: Fetch calendar events
    Google->>Backend: Return events
    Backend->>Backend: Aggregate statistics
    Backend->>Frontend: Return stats
```

### Why Backend Aggregation?

1. **Security**: Google API credentials (client secret) never exposed to browser
2. **Performance**: Single API call vs multiple frontend requests
3. **Efficiency**: Fetch once, aggregate server-side
4. **Centralized Logic**: Business logic in one place, easier to maintain

## 📁 Project Structure

```
calendar-dashboard/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx          # Main dashboard component
│   │   │   ├── DateRangeSelector.tsx   # Date range picker
│   │   │   └── StatCards.tsx           # Statistics cards & charts
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx           # Login page
│   │   │   └── DashboardPage.tsx       # Protected dashboard page
│   │   ├── services/
│   │   │   └── api.ts                  # API client
│   │   ├── hooks/
│   │   │   └── useAuth.ts              # Authentication hook
│   │   ├── App.tsx                     # Root component
│   │   └── main.tsx                    # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.routes.ts          # OAuth routes
│   │   │   └── calendar.routes.ts     # Calendar API routes
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts      # JWT verification
│   │   │   └── errorHandler.middleware.ts
│   │   ├── lib/
│   │   │   └── prisma.ts               # Prisma client
│   │   ├── services/
│   │   │   ├── googleAuth.service.ts   # OAuth logic
│   │   │   ├── calendar.service.ts     # Calendar API client
│   │   │   ├── statsAggregator.service.ts # Statistics calculation
│   │   │   └── tokenStorage.service.ts # Token storage (PostgreSQL)
│   │   ├── utils/
│   │   │   └── jwt.util.ts             # JWT generation/verification
│   │   ├── app.ts                      # Express app setup
│   │   └── server.ts                   # Server entry point
│   ├── prisma/
│   │   └── schema.prisma               # Database schema
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Google Cloud Project with Calendar API enabled
- Google OAuth 2.0 credentials

### 1. PostgreSQL Setup

Create a PostgreSQL database:

```bash
# Using psql or any PostgreSQL client
createdb calendar_dashboard

# Or with Docker
docker run -d --name postgres-calendar -e POSTGRES_PASSWORD=password -e POSTGRES_DB=calendar_dashboard -p 5432:5432 postgres:15
```

Your `DATABASE_URL` format: `postgresql://USER:PASSWORD@localhost:5432/calendar_dashboard`

### 2. Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google Calendar API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Authorized redirect URIs:
     - `http://localhost:5000/auth/callback` (development)
     - `https://yourdomain.com/auth/callback` (production)
   - Save the **Client ID** and **Client Secret**

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file (copy from env.example)
# Edit .env and add:
# - GOOGLE_CLIENT_ID
# - GOOGLE_CLIENT_SECRET
# - JWT_SECRET
# - DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/calendar_dashboard
# - GOOGLE_REDIRECT_URI=http://localhost:5000/auth/callback
# - FRONTEND_URL=http://localhost:5173
# - BACKEND_PORT=5000

# Create database tables
npm run db:push
# Or for migrations: npm run db:migrate

# Run in development mode
npm run dev

# Or build and run in production
npm run build
npm start
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (optional for development)
# VITE_API_BASE_URL= (leave empty, Vite proxy handles it)

# Run in development mode
npm run dev

# Build for production
npm run build
npm run preview
```

## 🔒 Security Best Practices

### Environment Variables

**Never commit `.env` files to version control!**

- ✅ Use `.env.example` as a template
- ✅ Add `.env` to `.gitignore`
- ✅ Use strong, random secrets in production
- ❌ Never expose `GOOGLE_CLIENT_SECRET` to frontend
- ❌ Never commit secrets to GitHub

### Authentication Security

1. **JWT in HttpOnly Cookies**
   - Prevents XSS attacks (JavaScript cannot access)
   - Automatically sent with requests
   - Secure flag in production (HTTPS only)

2. **CORS Configuration**
   - Only allows requests from frontend origin
   - Credentials enabled for cookie support

3. **Token Storage**
   - Google OAuth tokens stored server-side only in PostgreSQL
   - Tokens persist across server restarts

### Why Frontend Never Talks Directly to Google API?

1. **Client Secret Protection**: OAuth client secret must remain on server
2. **Token Security**: Access tokens should never be exposed to browser
3. **Centralized Control**: All API calls go through backend for security policies
4. **Rate Limiting**: Easier to implement rate limiting on backend

## 📊 Features

### Dashboard Statistics

- **Total Events**: Count of all calendar events in date range
- **Average Duration**: Average meeting duration (formatted)
- **Solo vs Guest Meetings**: Breakdown of meetings with/without attendees
- **Busiest Day**: Day of week with most events
- **Visualizations**: Pie charts and bar charts using Ant Design Plots

### Date Range Selection

- **Preset Options**: Last 7 days, Last 30 days
- **Custom Range**: Date picker for any date range (max 365 days)
- **Real-time Updates**: Statistics update automatically on range change

## 🧪 Testing

### Manual Testing Checklist

1. **OAuth Flow**
   - [ ] Click "Sign in with Google"
   - [ ] Complete Google consent screen
   - [ ] Verify redirect to dashboard
   - [ ] Check JWT cookie is set

2. **Calendar Statistics**
   - [ ] Select "Last 7 Days" - verify stats load
   - [ ] Select "Last 30 Days" - verify stats update
   - [ ] Select custom date range - verify stats update
   - [ ] Verify all stat cards display correctly
   - [ ] Verify charts render properly

3. **Error Handling**
   - [ ] Test with invalid date range
   - [ ] Test with no events in range
   - [ ] Test logout functionality
   - [ ] Test expired token handling

## 🚢 Deployment

### Backend Deployment (Render/Railway/Vercel)

1. **Environment Variables** (set in platform dashboard):
   ```
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   JWT_SECRET=your-jwt-secret
   DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
   GOOGLE_REDIRECT_URI=https://your-backend.com/auth/callback
   FRONTEND_URL=https://your-frontend.com
   NODE_ENV=production
   PORT=5000
   ```

2. **Build Command**: `npm run build`
3. **Start Command**: `npm start`

### Frontend Deployment (Vercel/Netlify)

1. **Environment Variables**:
   ```
   VITE_API_BASE_URL=https://your-backend.com
   ```

2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`

### Important Notes

- Update Google OAuth redirect URI to production URL
- Ensure HTTPS is enabled (required for Secure cookies)
- Use strong, random secrets in production
- PostgreSQL is used for OAuth token storage (persistent across restarts)

## 🐛 Troubleshooting

### Common Issues

1. **"Authentication required" error**
   - Check JWT cookie is being set
   - Verify CORS is configured correctly
   - Ensure `withCredentials: true` in axios config

2. **OAuth callback fails**
   - Verify redirect URI matches Google Console configuration
   - Check environment variables are set correctly
   - Ensure backend is accessible from Google

3. **No events showing**
   - Verify user has calendar events in selected date range
   - Check Google Calendar API is enabled
   - Review backend logs for API errors

4. **CORS errors**
   - Verify `FRONTEND_URL` matches actual frontend URL
   - Check CORS middleware configuration
   - Ensure credentials are enabled

## 📝 API Endpoints

### Authentication

- `GET /auth/google` - Initiate OAuth login
- `GET /auth/callback` - OAuth callback handler
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user info

### Calendar

- `GET /api/calendar/stats?startDate=ISO&endDate=ISO` - Get calendar statistics (protected)

### Health Check

- `GET /health` - Server health check

## 🎯 Interview Discussion Points

### Architecture Decisions

1. **Why JWT in HttpOnly cookies?**
   - Prevents XSS attacks
   - Automatic inclusion in requests
   - Server-side validation

2. **Why backend aggregation?**
   - Security (protect API credentials)
   - Performance (single API call)
   - Centralized business logic

3. **Why in-memory token storage?**
   - Simple for demo/prototype
   - Production should use Redis or database
   - Tokens lost on server restart (acceptable for demo)

4. **Error Handling Strategy**
   - Try-catch in all async routes
   - Standardized error responses
   - Frontend error boundaries
   - User-friendly error messages

### Security Considerations

- Client secret never exposed
- JWT expiration and refresh
- CORS restrictions
- Input validation
- HTTPS in production

## 📄 License

MIT

## 👤 Author

Built as a production-ready, interview-ready project demonstrating full-stack development skills.


