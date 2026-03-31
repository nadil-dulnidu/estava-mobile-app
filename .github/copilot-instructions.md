# Estava Mobile App - Copilot Project Instructions

## Project Context

- Project title: Estava Real Estate Management App
- Domain: property buying, selling, and renting
- Team size: 6 members
- Assignment duration: 8 weeks

## Mandatory Technology Stack

- Mobile frontend: React Native
- Backend API: Node.js + Express.js
- Database: MongoDB (MongoDB Atlas preferred)

Do not propose alternative primary stacks for core implementation unless explicitly asked.

## University Requirements To Always Enforce

- Implement authentication with:
	- registration
	- login
	- password hashing
	- JWT authentication
	- protected routes
- Backend must be hosted online for final demo.
- Mobile app must connect to hosted backend API.
- Do not rely on localhost-only final architecture.
- Follow RESTful API design, proper folder structure, middleware, status codes, and centralized error handling.
- Avoid hardcoded data in the final app.
- Use form validation on both frontend and backend.

## Functional Scope (Core Modules)

Build and maintain these modules as the default product scope:

1. Property Management
2. Favorites / Wishlist Management
3. Inquiry / Contact Management
4. Appointment / Visit Booking Management
5. Reviews & Ratings Management
6. Notification Management

Authentication is a shared/common module across the team.

## Primary Actors

- Buyer/Renter
- Agent/Seller
- Admin

Use role-aware access control and API authorization checks.

## Docker Rules (Strict)

- Dockerize application services (backend and optional supporting app services) where useful.
- Do NOT dockerize MongoDB for this project.
- Always use external MongoDB (MongoDB Atlas) connection string via environment variables.
- Any Docker Compose setup must exclude a MongoDB container.

## Suggested Architecture Standards

- Backend layers: routes, controllers, services, models, middlewares, validators, config.
- Use Mongoose models with validation and useful indexes.
- Use secure middleware (helmet, cors, rate limiting as appropriate).
- Store secrets in environment variables only.
- Implement consistent API response and error formats.

## Delivery Artifacts

When asked for assignment deliverables, ensure guidance includes:

- problem statement
- system architecture diagram
- database schema diagram
- API endpoint table
- team responsibility breakdown
- hosted backend URL and live demo readiness

## Collaboration And Workload

- Keep module responsibilities clearly separable for 6 members.
- Prefer task decomposition by module ownership plus shared integration tasks.
- Include testing responsibility within each member module whenever planning.

## Copilot Response Behavior For This Repository

- For all future replies in this repository, align suggestions and implementation with this file.
- Prioritize practical, implementation-ready steps over generic advice.
- Preserve compatibility with React Native + Express + MongoDB architecture.
- If a request conflicts with mandatory assignment constraints, point out the conflict and suggest a compliant alternative.
- Add comments in code snippets to explain the rationale behind key implementation choices, especially where they relate to assignment requirements.