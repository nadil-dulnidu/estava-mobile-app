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
| POST | /properties | Yes | seller, admin | Create listing with optional image files |
| GET | /properties | No | Public | List with optional filters/search |
| GET | /properties/:id | No | Public | Get single property |
| PATCH | /properties/:id | Yes | owner seller, admin | Update listing, supports removeImageUrls |
| DELETE | /properties/:id | Yes | owner seller, admin | Delete listing and local uploaded images |

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
| PATCH | /inquiries/:id | Yes | sender/agent/admin | Update message or status |
| DELETE | /inquiries/:id | Yes | sender/admin | Delete inquiry |

## Appointments

| Method | Endpoint | Auth | Roles | Notes |
| --- | --- | --- | --- | --- |
| POST | /appointments | Yes | any authenticated | Book visit for a property |
| GET | /appointments/me | Yes | buyer/agent/admin | List own related appointments |
| PATCH | /appointments/:id | Yes | buyer/agent/admin | Update date/time/status |
| DELETE | /appointments/:id | Yes | buyer/admin | Cancel appointment |

## Reviews

| Method | Endpoint | Auth | Roles | Notes |
| --- | --- | --- | --- | --- |
| POST | /reviews | Yes | any authenticated | Submit property rating/comment |
| GET | /reviews/property/:propertyId | No | Public | List property reviews + average rating |
| PATCH | /reviews/:id | Yes | review owner/admin | Update rating/comment |
| DELETE | /reviews/:id | Yes | review owner/admin | Delete review |

## Notifications

| Method | Endpoint | Auth | Roles | Notes |
| --- | --- | --- | --- | --- |
| POST | /notifications | Yes | admin | Create notification for a user |
| GET | /notifications/me | Yes | any authenticated | List my notifications |
| PATCH | /notifications/:id/read | Yes | owner/admin | Mark notification as read |
| DELETE | /notifications/:id | Yes | owner/admin | Delete notification |

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
