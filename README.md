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
2. Implement Property Management module first.
3. Add shared validation layer and consistent response schema for all modules.
4. Add tests per module owner (API + mobile integration).
