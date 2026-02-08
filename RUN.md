# How to Run

## Quick start (no PostgreSQL)

Uses in-memory storage. `DATABASE_URL` in .env is set to a placeholder for build only.

1. **Add Google credentials** to `backend/.env`:
   - Get from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
   - Optionally change `JWT_SECRET` to a random string

2. **Start backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   Backend runs on http://localhost:5000 (uses in-memory storage)

3. **Start frontend** (in a new terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend runs on http://localhost:5173

4. Open http://localhost:5173 and click "Sign in with Google"

---

## With PostgreSQL

1. **Start PostgreSQL:**
   ```bash
   docker-compose up -d
   ```

2. **Update `backend/.env`** - change DATABASE_URL to:
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5433/calendar_dashboard
   ```
   (Port 5433 - docker-compose uses this to avoid conflict with other PostgreSQL on 5432)

3. **Create tables:**
   ```bash
   cd backend
   npm run db:push
   ```

4. **Start backend and frontend** (same as above)
