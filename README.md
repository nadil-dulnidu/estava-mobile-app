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
1. Install dependencies:

```bash
npm install
```

1. Update `backend/.env` with your MongoDB Atlas URI and JWT secret.
1. Run development server:

```bash
npm run dev
```

Backend base URL: `http://localhost:5000/api`

Health check: `GET /api/health`

## Auth Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`

## Current Module Behavior (Phase 3)

- Properties support CRUD with owner/admin guardrails and `listingStatus` values `available`, `sold`, `rented`, and `delisted`.
- Delisted properties are hidden from buyer/public views, while owners can still view and manage their own delisted listings.
- Property creation supports `features` input, and the properties screen includes a top "Post Property" CTA.
- Inquiries support CRUD with agent response edit/clear behavior and buyer delete-after-reply handling, with professional delete confirmation copy in mobile UI.
- Appointments support update flows and actor-scoped soft-delete behavior, including delete eligibility for completed appointments.
- Favorites support note editing (update in CRUD) from the mobile UI using the existing favorites PATCH endpoint.
- Reviews support create/edit/delete flows; property detail displays average rating and provides a "Review this property" shortcut with preselected property in reviews.
- Property, inquiry, and appointment modules include stricter authorization and validation hardening.

## Mobile Setup

1. Open a terminal in `mobile/`
1. Install dependencies:

```bash
npm install
```

1. Create `.env` from `.env.example` and set:

```bash
EXPO_PUBLIC_API_BASE_URL=https://your-hosted-backend.example.com/api
```

For local Android emulator testing, fallback base URL is `http://10.0.2.2:5000/api`.

1. Start app:

```bash
npm start
```

## Standalone Android Build (No `expo start` Required)

Use this flow for final-demo distribution where the app runs as a standalone install.

1. Open a terminal in `mobile/`.
1. Log in once:

```bash
npx eas login
```

1. Build installable APK (internal distribution):

```bash
npm run build:android:apk
```

1. Install latest finished Android build on a connected emulator/device:

```bash
npm run install:android:latest
```

1. Build production Play Store artifact (AAB):

```bash
npm run build:android:aab
```

Notes:

- `mobile/eas.json` is configured with `EXPO_PUBLIC_API_BASE_URL=https://estava-mobile-app.onrender.com/api` for development, preview, and production profiles.
- Standalone APK/AAB builds do not require `expo start` to run.
- This is assignment-compliant because the mobile app points to a hosted backend API.

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
