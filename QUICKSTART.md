# Quick Start Guide

## Prerequisites

1. **Node.js 18+** installed
2. **Google Cloud Project** with Calendar API enabled
3. **OAuth 2.0 Credentials** from Google Cloud Console

## Step 1: Google Cloud Setup

1. Go to https://console.cloud.google.com/
2. Create/select a project
3. Enable "Google Calendar API"
4. Create OAuth 2.0 credentials:
   - Type: Web application
   - Redirect URI: `http://localhost:5000/auth/callback`
5. Copy Client ID and Client Secret

## Step 2: Backend Setup

```bash
cd backend
npm install

# Create .env file
# Copy from .env.example and fill in your values:
# - GOOGLE_CLIENT_ID
# - GOOGLE_CLIENT_SECRET
# - JWT_SECRET (use a random string)
# - GOOGLE_REDIRECT_URI=http://localhost:5000/auth/callback
# - FRONTEND_URL=http://localhost:5173
# - BACKEND_PORT=5000

npm run dev
```

Backend will run on http://localhost:5000

## Step 3: Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on http://localhost:5173

## Step 4: Test the Application

1. Open http://localhost:5173
2. Click "Sign in with Google"
3. Complete OAuth flow
4. View your calendar statistics!

## Troubleshooting

- **CORS errors**: Ensure FRONTEND_URL in backend .env matches frontend URL
- **OAuth errors**: Verify redirect URI matches Google Console configuration
- **No events**: Check that you have calendar events in the selected date range


