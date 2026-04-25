# Estava API Endpoints (Implemented)

Base URL: /api

## Authentication

| Method | Endpoint | Auth | Roles | Notes |
| --- | --- | --- | --- | --- |
| POST | /auth/register | No | Public | Register user with fullName, email, password, role |
| POST | /auth/login | No | Public | Login with email/password |

## Health

| Method | Endpoint | Auth | Roles | Notes |
| --- | --- | --- | --- | --- |
| GET | /health | No | Public | API health status |

## Properties

| Method | Endpoint | Auth | Roles | Notes |
| --- | --- | --- | --- | --- |
| POST | /properties | Yes | seller, admin | Create listing with optional image files and optional `features` array |
| GET | /properties | No | Public | List with optional filters/search; delisted items are hidden from buyer/public feed while owner-managed views can still include own delisted listings |
| GET | /properties/:id | No | Public | Get single property |
| PATCH | /properties/:id | Yes | owner seller, admin | Update listing fields, supports removeImageUrls and owner status control |
| DELETE | /properties/:id | Yes | owner seller, admin | Owner/admin deletion controls with lifecycle safety checks |

## Favorites / Wishlist

| Method | Endpoint | Auth | Roles | Notes |
| --- | --- | --- | --- | --- |
| POST | /favorites | Yes | any authenticated | Add property to favorites |
| GET | /favorites/me | Yes | any authenticated | List my favorites |
| PATCH | /favorites/:id | Yes | owner | Update note/priority |
| DELETE | /favorites/:id | Yes | owner | Remove favorite |

## Inquiries

| Method | Endpoint | Auth | Roles | Notes |
| --- | --- | --- | --- | --- |
| POST | /inquiries | Yes | any authenticated | Create inquiry about a property |
| GET | /inquiries/me | Yes | sender/agent/admin | List own related inquiries |
| PATCH | /inquiries/:id | Yes | sender/agent/admin | Update message/status and response content; agent/admin can edit or clear response |
| DELETE | /inquiries/:id | Yes | sender/admin | Buyer delete-after-reply behavior with admin override |

## Appointments

| Method | Endpoint | Auth | Roles | Notes |
| --- | --- | --- | --- | --- |
| POST | /appointments | Yes | any authenticated | Book visit for a property |
| GET | /appointments/me | Yes | buyer/agent/admin | List own related appointments |
| PATCH | /appointments/:id | Yes | buyer/agent/admin | Update date/time/status with role-aware validation |
| DELETE | /appointments/:id | Yes | buyer/agent/admin | Dual soft-delete semantics for buyer and agent views, including completed-status eligibility for side delete |

## Reviews

| Method | Endpoint | Auth | Roles | Notes |
| --- | --- | --- | --- | --- |
| POST | /reviews | Yes | any authenticated | Submit property rating/comment |
| GET | /reviews/property/:propertyId | No | Public | List property reviews and provide average rating for property detail views |
| PATCH | /reviews/:id | Yes | review owner/admin | Edit rating/comment |
| DELETE | /reviews/:id | Yes | review owner/admin | Delete review |

## Notifications

| Method | Endpoint | Auth | Roles | Notes |
| --- | --- | --- | --- | --- |
| POST | /notifications | Yes | admin | Create notification for a user |
| GET | /notifications/me | Yes | any authenticated | List my notifications |
| PATCH | /notifications/:id/read | Yes | owner/admin | Mark notification as read |
| DELETE | /notifications/:id | Yes | owner/admin | Delete notification |

## Status Values and Phase 3 Behavior Rules

### Properties (`listingStatus`)
- `available`
- `sold`
- `rented`
- `delisted`

Behavior notes:
- Delisted properties are excluded from buyer/public property feed results.
- Owner/admin users retain control to view/manage their own delisted listings and lifecycle actions.

### Inquiries (`inquiryStatus`)
- `pending`
- `replied`
- `closed`

Behavior notes:
- Agent/admin users can edit or clear inquiry response content.
- Buyer-side delete action is allowed after a reply, with admin moderation override.

### Appointments (`appointmentStatus`)
- `pending`
- `confirmed`
- `completed`
- `cancelled`

Behavior notes:
- Update actions allow schedule and status changes with role-aware checks.
- Delete behavior is actor-scoped soft delete for buyer and agent views, including completed appointments.

### Reviews
- Reviews support edit (`PATCH`) as part of CRUD behavior.
- Property detail review endpoints include average rating display.
- Mobile review-create flow can be launched from property detail with preselected `propertyId` context.

## Standard Response Format

Success:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Error:
```json
{
  "success": false,
  "message": "Error message",
  "error": {
    "statusCode": 400,
    "status": "fail"
  }
}
```
