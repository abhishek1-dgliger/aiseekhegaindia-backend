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
   - Set `FRONTEND_URL` to the browser origin(s) allowed for CORS (e.g. `http://localhost:3000`, or comma-separated for multiple). The first origin is used for the post-login redirect.
   - GCP Authorized redirect URI must match `GOOGLE_CALLBACK_URL` exactly

3. Start MongoDB locally (default URI in `.env.example`).

4. Install and run:

```bash
npm install
npm run dev
```

API runs at [http://localhost:4000](http://localhost:4000).

## Auth session / cookies

- Session is an httpOnly JWT cookie (`COOKIE_NAME`, default `access_token`).
- CORS allowlist is `FRONTEND_URL` (comma-separated origins supported), with `credentials: true`.
- After Google login, the API redirects to the first `FRONTEND_URL` origin with `?auth=success`.
- For production when the frontend and API are on different sites, set:
  - `COOKIE_SAMESITE=none`
  - `COOKIE_SECURE=true`
  (These are the production defaults when the env vars are omitted.)

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Health check |
| GET | `/api/auth/google` | Start Google OAuth |
| GET | `/api/auth/google/callback` | OAuth callback (sets JWT cookie) |
| GET | `/api/auth/me` | Current user (requires cookie) |
| POST | `/api/auth/logout` | Clear auth cookie |
