# Estava Real Estate Mobile App - Project Plan

## 1. Project Summary

Build a full-stack mobile app for buying, selling, and renting properties.

Required stack:
- Mobile: React Native
- Backend: Node.js + Express.js
- Database: MongoDB (Atlas)

Mandatory constraints from assignment:
- Backend must be hosted and reachable by mobile app
- Final demo must use live hosted backend (no localhost-only final demo)
- Authentication must include registration, login, password hashing, JWT, and protected routes
- Team size is 6, with clear module ownership and equal workload

## 2. Core Functional Scope

### Common Module (Shared): Authentication
- User registration
- User login
- Password hashing (bcrypt)
- JWT access tokens
- Protected API routes and role checks

### Member Modules (6 CRUD-focused modules)
1. Property Management
2. Favorites / Wishlist Management
3. Inquiry / Contact Management
4. Appointment / Visit Booking Management
5. Reviews & Ratings Management
6. Notification Management

## 3. Team Module Ownership (6 Members)

Suggested role split:
1. Member A - Property Management Lead
2. Member B - Favorites / Wishlist Lead
3. Member C - Inquiry / Contact Lead
4. Member D - Appointment / Visit Lead
5. Member E - Reviews & Ratings Lead
6. Member F - Notification + Image Upload + Deployment Lead

Cross-team shared tasks:
- Authentication APIs and middleware
- Navigation shell and app-level UI consistency
- API client, error handling, and form validation standards
- Final integration testing and viva preparation

## 4. Technical Architecture

## 4.1 Mobile (React Native)
- Framework: Expo (recommended for speed) or React Native CLI
- Navigation: React Navigation (stack + tabs)
- State: Context + reducer or Redux Toolkit
- Data fetching: Axios + centralized API service
- Form handling: React Hook Form + Zod/Yup validation
- Storage: SecureStore/AsyncStorage for token session handling

## 4.2 Backend (Node.js + Express)
- Layered structure:
  - src/config
  - src/models
  - src/controllers
  - src/services
  - src/routes
  - src/middlewares
  - src/utils
  - src/validators
- Security middleware:
  - helmet
  - cors
  - rate limiter
  - request validation middleware
- Auth:
  - bcrypt password hashing
  - JWT access tokens
  - role-based authorization (buyer/renter, agent/seller, admin)

## 4.3 Database (MongoDB)
- Use MongoDB Atlas (managed cloud)
- Mongoose models with indexes for high-read queries
- Seed script for demo data

## 5. Proposed Data Model

Main collections:
- users
- properties
- favorites
- inquiries
- appointments
- reviews
- notifications

Key relationships:
- Property belongs to seller/agent user
- Favorite links user + property
- Inquiry links sender user + property + target agent
- Appointment links user + property + agent
- Review links user + property or agent
- Notification belongs to user

## 6. API Design (High-level)

Authentication:
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

Properties:
- POST /api/properties
- GET /api/properties
- GET /api/properties/:id
- PATCH /api/properties/:id
- DELETE /api/properties/:id

Favorites:
- POST /api/favorites
- GET /api/favorites/me
- PATCH /api/favorites/:id
- DELETE /api/favorites/:id

Inquiries:
- POST /api/inquiries
- GET /api/inquiries/me
- PATCH /api/inquiries/:id
- DELETE /api/inquiries/:id

Appointments:
- POST /api/appointments
- GET /api/appointments/me
- PATCH /api/appointments/:id
- DELETE /api/appointments/:id

Reviews:
- POST /api/reviews
- GET /api/reviews/property/:propertyId
- PATCH /api/reviews/:id
- DELETE /api/reviews/:id

Notifications:
- POST /api/notifications
- GET /api/notifications/me
- PATCH /api/notifications/:id/read
- DELETE /api/notifications/:id

## 7. Mobile Screens (MVP)

- Auth: Login, Register
- Home: property feed + search + filters
- Property Details
- Favorites
- Inquiries (list + detail/chat-like thread)
- Appointments (book, reschedule, cancel)
- Reviews (view + add)
- Notifications
- Profile and role-specific actions
- Agent area: create/edit property listing

## 8. Docker Strategy (Do Not Dockerize MongoDB)

Use Docker for app services only:
- backend service containerized
- optional web/admin tools containerized later
- mongodb is NOT containerized, use MongoDB Atlas connection string via environment variable

Planned files:
- backend/Dockerfile
- backend/.dockerignore
- docker-compose.yml (backend only, maybe reverse proxy later)

Example compose approach:
- backend service:
  - build from backend Dockerfile
  - expose backend port
  - mount env file or pass environment vars
  - depends only on external MongoDB Atlas URI

Deployment alignment:
- local development can run backend in Docker
- production deployment can use Render/Railway with same env values

## 9. 8-Week Timeline

Week 1:
- Finalize scope, diagrams, API contract, task split
- Set up repo structure, coding standards, branching strategy

Week 2:
- Build authentication and base backend scaffolding
- Set up React Native navigation and API integration baseline

Week 3:
- Implement Property + Favorites modules
- Start image upload pipeline

Week 4:
- Implement Inquiry + Appointment modules
- Add input validation and robust error handling

Week 5:
- Implement Reviews + Notifications modules
- Add role-based restrictions and status transitions

Week 6:
- Integration sprint (all modules connected end-to-end)
- Seed demo data, polish UI, improve performance

Week 7:
- Testing sprint: API tests, UI tests, bug fixing
- Deploy hosted backend and test live mobile-to-API connectivity

Week 8:
- Final documentation and viva prep
- Rehearse module ownership explanation by each member

## 10. Quality and Testing Plan

Backend tests:
- Unit tests for services/helpers
- Integration tests for key API routes
- Validation and auth failure path tests

Mobile tests:
- Component tests for critical screens
- End-to-end smoke tests for core flows

Core user journeys to validate:
- Register/login and protected route access
- Search and filter properties
- Save favorites and remove them
- Send inquiry and receive response
- Book, update, and cancel appointment
- Leave/edit/remove review
- Receive and mark notifications

## 11. Required Assignment Deliverables

- Problem statement
- System architecture diagram
- Database schema diagram
- API endpoint table
- Team responsibility breakdown
- Hosted backend URL
- Live demo with mobile app connected to hosted backend

## 12. Risks and Mitigation

- Uneven contribution risk:
  - Mitigation: strict module ownership and weekly progress check-ins
- Integration conflicts:
  - Mitigation: contract-first API definitions and early merge policy
- Deployment issues:
  - Mitigation: deploy staging backend by Week 6, not at the end
- Viva readiness risk:
  - Mitigation: each member maintains module notes and demo scripts

## 13. Immediate Next Actions

1. Confirm exact module-owner mapping for all 6 members.
2. Create architecture diagram, schema diagram, and endpoint table in docs.
3. Scaffold backend and mobile projects in separate folders.
4. Add Docker assets for backend only (no MongoDB container).
5. Start implementing authentication and Property module first.