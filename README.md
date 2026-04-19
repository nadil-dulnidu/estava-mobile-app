# Estava Mobile App

Real estate mobile application for buying, selling, and renting properties.

## Tech Stack

- Mobile: React Native (Expo)
- Backend: Node.js + Express.js
- Database: MongoDB Atlas

## Assignment Constraints Implemented

- JWT auth starter included (register/login)
- Password hashing included (`bcryptjs`)
- Protected-route middleware included
- Docker configured for backend only
- MongoDB is external (no MongoDB container)

## Project Structure

- `backend/` Express API
- `mobile/` React Native app
- `docs/` assignment docs and project plan
- `docker-compose.yml` backend container only

## Backend Setup

1. Open a terminal in `backend/`
2. Install dependencies:

```bash
npm install
```

3. Update `backend/.env` with your MongoDB Atlas URI and JWT secret.
4. Run development server:

```bash
npm run dev
```

Backend base URL: `http://localhost:5000/api`

Health check: `GET /api/health`

## Auth Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`

## Current Module Behavior (Phase 3)

- Properties support CRUD with owner/admin guardrails. `listingStatus` values are `available`, `sold`, `rented`, and `delisted`.
- Delisted properties are excluded from the public feed and remain manageable by owners/admins.
- Inquiries support CRUD with agent response edit/clear behavior and buyer delete-after-reply handling.
- Appointments support update flows and dual soft-delete semantics for buyer and agent views.
- Reviews support create/edit/delete flows, and property detail displays average review rating.
- Property, inquiry, and appointment modules include stricter authorization and validation hardening.

## Mobile Setup

1. Open a terminal in `mobile/`
2. Install dependencies:

```bash
npm install
```

3. Create `.env` from `.env.example` and set:

```bash
EXPO_PUBLIC_API_BASE_URL=https://your-hosted-backend.example.com/api
```

For local Android emulator testing, fallback base URL is `http://10.0.2.2:5000/api`.

4. Start app:

```bash
npm start
```

## Docker (Backend Only)

Run backend in Docker:

```bash
docker compose up --build
```

Notes:
- Compose intentionally excludes MongoDB.
- Backend connects to MongoDB Atlas using `MONGODB_URI` from `backend/.env`.

## Next Build Steps

1. Add role-aware `GET /api/auth/me` and profile management.
2. Add integration tests for CRUD flows and role-restricted update/delete paths.
3. Expand mobile UX for loading, empty, and error states across all module screens.
4. Finalize staging/production deployment validation for hosted backend + mobile connectivity.
