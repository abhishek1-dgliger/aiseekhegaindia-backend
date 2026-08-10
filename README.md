# Backend (NestJS)

NestJS API with MongoDB and Google OAuth (GCP OAuth 2.0 client).

## Setup

1. Copy env file:

```bash
cp .env.example .env
```

2. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/):

   - APIs & Services → Credentials → Create Credentials → OAuth client ID
   - Application type: **Web application**
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - `http://localhost:4000`
   - Authorized redirect URI:
     - `http://localhost:4000/api/auth/google/callback`
   - Paste Client ID and Client Secret into `.env` as `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
   - Set a strong `JWT_SECRET`

3. Start MongoDB locally (default URI in `.env.example`).

4. Install and run:

```bash
npm install
npm run dev
```

API runs at [http://localhost:4000](http://localhost:4000).

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Health check |
| GET | `/api/auth/google` | Start Google OAuth |
| GET | `/api/auth/google/callback` | OAuth callback (sets JWT cookie) |
| GET | `/api/auth/me` | Current user (requires cookie) |
| POST | `/api/auth/logout` | Clear auth cookie |
