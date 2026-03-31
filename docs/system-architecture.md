# Estava System Architecture

This document is the assignment architecture deliverable for the Estava real estate mobile application.

## High-Level Architecture Diagram

```mermaid
flowchart TB
    subgraph Client[Mobile Client Layer]
        RN[React Native App\nExpo]
        Nav[Navigation + Screens]
        AuthCtx[Auth Context\nToken Handling]
        ApiClient[Axios API Client]
    end

    subgraph API[Backend API Layer - Node.js + Express]
        Router[REST Routes]
        Ctrls[Controllers]
        Services[Services]
        Validators[Validators]
        Middleware[Middlewares\nAuth, RBAC, Error Handler]
        Upload[Image Upload Pipeline\nMulter/Cloud Storage]
    end

    subgraph Data[Data Layer]
        Mongo[(MongoDB Atlas)]
    end

    subgraph Infra[Deployment Layer]
        Docker[Docker Container\nBackend Service Only]
        Host[Hosted Runtime\nRender/Railway/AWS]
    end

    RN --> Nav
    Nav --> AuthCtx
    AuthCtx --> ApiClient
    ApiClient --> Router

    Router --> Validators
    Router --> Middleware
    Router --> Ctrls
    Ctrls --> Services
    Services --> Mongo

    Ctrls --> Upload

    API --> Docker
    Docker --> Host

    note1[No MongoDB container\nUse external Atlas only]
    note1 -.-> Data
```

## Request Flow

1. User performs an action from the React Native app.
2. App sends HTTP request to hosted Express API using Axios.
3. Express routes apply validation and authentication middleware.
4. Controller delegates business logic to service layer.
5. Service layer reads/writes MongoDB Atlas using Mongoose models.
6. API returns standardized success/error response to mobile app.

## Authentication and Authorization Flow

```mermaid
sequenceDiagram
    participant U as User
    participant M as Mobile App
    participant A as Express API
    participant DB as MongoDB Atlas

    U->>M: Register/Login
    M->>A: POST /api/auth/register or /api/auth/login
    A->>DB: Create/find user and verify password hash
    DB-->>A: User record
    A-->>M: JWT + user payload
    M->>M: Store token in auth state

    U->>M: Access protected feature
    M->>A: Request with Authorization: Bearer <token>
    A->>A: Verify JWT and role permissions
    A->>DB: Execute module query
    DB-->>A: Data
    A-->>M: Protected response
```

## Assignment Compliance Mapping

- Mobile frontend: React Native
- Backend API: Node.js + Express.js
- Database: MongoDB Atlas
- Authentication: registration, login, hashing, JWT, protected routes
- Backend hosted online for final demo
- Mobile app connected to hosted API
- Docker usage: backend containerized only
- MongoDB excluded from Docker and connected externally

## Module Placement in Architecture

- Common module: Authentication
- Member modules:
  - Property Management
  - Favorites / Wishlist
  - Inquiry / Contact
  - Appointment / Visit Booking
  - Reviews & Ratings
  - Notification

All modules follow the same backend layering pattern: routes -> controllers -> services -> models with shared middleware and validators.

## Non-Functional Standards

- RESTful API design
- Centralized error handling
- Secure middleware (helmet, cors, rate limiting)
- Environment-based secrets and configuration
- Role-aware authorization checks for Buyer/Renter, Agent/Seller, Admin
