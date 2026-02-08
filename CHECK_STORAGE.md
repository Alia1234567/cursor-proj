# How to Check & View Stored Data

## Quick: Verify PostgreSQL is Running Successfully

| Step | Command / Check | Expected result |
|------|-----------------|-----------------|
| 1. Container running? | `docker ps` | See `calendar-dashboard-db` with status "Up" |
| 2. Database reachable? | `docker exec calendar-dashboard-db pg_isready -U postgres` | `postgres: accepting connections` |
| 3. App using PostgreSQL? | Open `http://localhost:5000/api/debug/storage` | `"mode": "postgresql"` |
| 4. Data persists? | Sign in → restart backend → refresh debug | `userCount` and `tokenCount` stay > 0 |
| 5. Visual browser | `npm run db:studio` in backend | See `User` and `OAuthToken` tables in Prisma Studio |

---

## 1. Which storage mode am I using?

**Current `.env`:** `DATABASE_URL=postgresql://localhost:5432/dummy` → **In-memory storage**

**To use PostgreSQL:** Change to `DATABASE_URL=postgresql://postgres:postgres@localhost:5433/calendar_dashboard` (after `docker-compose up -d`, port 5433)

---

## 2. Quick check – debug endpoint

With the backend running, open:

```
http://localhost:5000/api/debug/storage
```

This shows:
- **Storage mode:** in-memory or postgresql
- **User count** (PostgreSQL only)
- **Token count** (PostgreSQL only)

---

## 3. View data by storage mode

### In-memory storage (current setup)

- No UI; data lives in RAM only
- **Logout or restart** clears it
- No way to see stored tokens (they exist only in memory)
- Use the debug endpoint to confirm mode

### PostgreSQL storage

1. **Start PostgreSQL:**
   ```bash
   docker-compose up -d
   ```

2. **Update `backend/.env`:**
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5433/calendar_dashboard
   ```

3. **Create tables:**
   ```bash
   cd backend
   npm run db:push
   ```

4. **Restart backend** and sign in with Google

5. **Open Prisma Studio** (GUI for the database):
   ```bash
   cd backend
   npm run db:studio
   ```
   Opens at http://localhost:5555

6. **In Prisma Studio you can see:**
   - **User** – id, email, name, createdAt
   - **OAuthToken** – accessToken, refreshToken, expiryDate (linked to User)

---

## 4. Flow summary

| Step | Action | Where it happens |
|------|--------|------------------|
| 1 | Click "Sign in with Google" | Frontend |
| 2 | Google redirects to `/auth/callback` with code | Backend |
| 3 | Backend exchanges code for tokens | Backend → Google API |
| 4 | Tokens stored | `tokenStorage` (in-memory or PostgreSQL) |
| 5 | JWT set in cookie | Browser |
| 6 | `/api/calendar/stats` uses tokens | Backend fetches from storage, calls Google Calendar API |

---

## 5. How to verify storage

1. Start backend and frontend.
2. Open `http://localhost:5000/api/debug/storage` → check storage mode.
3. **In-memory:** Log in, then restart backend → tokens gone → confirms in-memory.
4. **PostgreSQL:** Log in, open Prisma Studio → confirm `User` and `OAuthToken` rows.

---

## 6. PostgreSQL verification – copy-paste commands

Run these in order to confirm everything works:

```bash
# 1. Is the PostgreSQL container running?
docker ps | grep calendar-dashboard-db

# 2. Is PostgreSQL accepting connections?
docker exec calendar-dashboard-db pg_isready -U postgres

# 3. Can you connect and list databases?
docker exec calendar-dashboard-db psql -U postgres -c "\l"

# 4. Does the calendar_dashboard database exist?
docker exec calendar-dashboard-db psql -U postgres -d calendar_dashboard -c "\dt"
```

**In browser:**
- `http://localhost:5000/api/debug/storage` → should show `"mode": "postgresql"`
- `http://localhost:5000/health` → should show `"status": "ok"`

**Backend startup logs should show:**
```
✅ Database connected (PostgreSQL)
🚀 Server started successfully!
```
