# Phase 3 Readiness Checklist

This checklist captures what is complete for Phase 2 and what must be done to enter Phase 3 (integration, testing, and deployment hardening).

## Current Phase 3 Behavior Snapshot (April 2026)

### Properties
- CRUD flow is expanded with owner/admin controls for status updates and deletion actions.
- `listingStatus` values: `available`, `sold`, `rented`, `delisted`.
- Delisted behavior: buyer/public feeds exclude delisted items while owner/admin users can still view and manage their own delisted listings.
- Property create flow supports `features` input, and the properties screen includes a top "Post Property" CTA.

### Inquiries
- CRUD flow includes response edit/clear capabilities for agent/admin users.
- `inquiryStatus` values: `pending`, `replied`, `closed`.
- Buyer delete-after-reply rule is enforced, with admin moderation override.
- Mobile delete confirmation copy is standardized to professional user-facing wording.

### Appointments
- CRUD flow includes appointment updates for schedule and status fields.
- `appointmentStatus` values: `pending`, `confirmed`, `completed`, `cancelled`.
- Delete behavior uses dual soft-delete semantics for buyer and agent perspectives, including completed-status side delete eligibility.

### Reviews
- Review CRUD supports edit behavior in addition to create and delete.
- Property detail views include average review display.
- Property detail includes a "Review this property" shortcut that opens reviews with preselected property context.

### Security Hardening
- Property, inquiry, and appointment services include tighter authorization and ownership checks.
- Validators for these modules include stronger update/delete and status-transition validation.

## Phase 2 Completion Status

Completed backend modules:
- Property Management
- Favorites / Wishlist Management
- Inquiry / Contact Management
- Appointment / Visit Booking Management
- Reviews & Ratings Management
- Notification Management

Cross-cutting completed items:
- JWT authentication and protected routes
- Role-aware authorization checks
- Centralized error handling and consistent API response format
- MongoDB Atlas integration via environment variables

## Required Before Phase 3 Starts

1. Backend integration checks
- Run a full endpoint smoke test for all modules in one script.
- Add seed data script for demo repeatability.

2. Mobile integration scope
- Connect mobile app to favorites, inquiries, appointments, reviews, and notifications APIs.
- Add loading, empty-state, and error-state handling to all module screens.

3. Test baseline
- Add API integration tests for auth + one happy path per module.
- Add at least one negative-path test per module (validation/authorization).

4. Security hardening
- Restrict CORS origin for deployed environments.
- Confirm strong JWT secret and rotate exposed credentials.
- Add request-size and upload constraints review for production.

5. Deployment readiness
- Validate Docker backend startup against Atlas in a clean environment.
- Prepare hosted backend environment variables in Render/Railway.
- Confirm mobile app points to hosted backend URL, not localhost.

## Phase 3 Entry Criteria

Move to Phase 3 once all are true:
- All six backend modules are reachable and stable.
- Mobile can execute at least one end-to-end user flow per module.
- API documentation reflects implemented behavior.
- Team owners can demo and explain their module responsibilities.

## Suggested First Phase 3 Tasks

1. Build a backend smoke test script under docs or scripts.
2. Implement mobile Favorites and Inquiries screens next.
3. Add deployment config for a staging backend URL.
4. Prepare a demo script for viva with module-by-module coverage.