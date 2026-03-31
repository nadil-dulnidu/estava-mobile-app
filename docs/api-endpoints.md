# Estava API Endpoints

**Base URL:** `/api`

---

## 1. Authentication (Shared Module)

| Method | Endpoint | Description | Auth | Role | Input | Output |
|--------|----------|-------------|------|------|-------|--------|
| POST | `/auth/register` | Register new user | ✗ | - | fullName, email, password, role | token, user |
| POST | `/auth/login` | Login user | ✗ | - | email, password | token, user |
| GET | `/auth/me` | Get current user | ✓ | any | - | user |
| POST | `/auth/logout` | Logout (invalidate token) | ✓ | any | - | success |
| PATCH | `/auth/password` | Change password | ✓ | any | currentPassword, newPassword | success |

---

## 2. Property Management

**Module Owner:** Member 1  
**Base Route:** `/properties`

| Method | Endpoint | Description | Auth | Role | Input | Output |
|--------|----------|-------------|------|------|-------|--------|
| POST | `/properties` | Create property | ✓ | seller, admin | title, description, price, location, propertyType, bedrooms, bathrooms, landSize, floorArea, features, imageUrls | property |
| GET | `/properties` | List all properties (with filters) | ✗ | - | query: propertyType, location, minPrice, maxPrice, bedrooms, listingStatus, search | [property] |
| GET | `/properties/me` | List my properties (seller) | ✓ | seller | - | [property] |
| GET | `/properties/:id` | Get single property | ✗ | - | - | property |
| PATCH | `/properties/:id` | Update property | ✓ | seller (owner), admin | title, description, price, location, bedrooms, bathrooms, features | property |
| DELETE | `/properties/:id` | Delete property | ✓ | seller (owner), admin | - | success |
| PATCH | `/properties/:id/status` | Change listing status | ✓ | seller (owner), admin | listingStatus | property |
| POST | `/properties/:id/images` | Upload property images | ✓ | seller (owner), admin | formData: files[] | [imageUrl] |
| DELETE | `/properties/:id/images/:imageUrl` | Remove property image | ✓ | seller (owner), admin | - | success |

---

## 3. Favorites / Wishlist Management

**Module Owner:** Member 2  
**Base Route:** `/favorites`

| Method | Endpoint | Description | Auth | Role | Input | Output |
|--------|----------|-------------|------|------|-------|--------|
| POST | `/favorites` | Add property to favorites | ✓ | buyer | propertyId, note, priorityLevel | favorite |
| GET | `/favorites` | Get my favorites | ✓ | buyer | query: page, limit, sortBy | [favorite] |
| GET | `/favorites/:id` | Get favorite details | ✓ | buyer (owner) | - | favorite |
| PATCH | `/favorites/:id` | Update favorite note/priority | ✓ | buyer (owner) | note, priorityLevel | favorite |
| DELETE | `/favorites/:id` | Remove from favorites | ✓ | buyer (owner) | - | success |
| GET | `/properties/:propertyId/favorites/count` | Get favorite count for property | ✗ | - | - | { count } |

---

## 4. Inquiry / Contact Management

**Module Owner:** Member 3  
**Base Route:** `/inquiries`

| Method | Endpoint | Description | Auth | Role | Input | Output |
|--------|----------|-------------|------|------|-------|--------|
| POST | `/inquiries` | Send inquiry about property | ✓ | buyer | propertyId, subject, message, contactNumber | inquiry |
| GET | `/inquiries/sent` | Get my sent inquiries | ✓ | buyer | query: page, limit, status | [inquiry] |
| GET | `/inquiries/received` | Get inquiries about my properties | ✓ | seller | query: page, limit, status | [inquiry] |
| GET | `/inquiries/:id` | Get inquiry details | ✓ | buyer (sender), seller (agent), admin | - | inquiry |
| PATCH | `/inquiries/:id` | Update inquiry status | ✓ | seller (agent), admin | inquiryStatus | inquiry |
| DELETE | `/inquiries/:id` | Delete inquiry | ✓ | buyer (sender), admin | - | success |
| GET | `/properties/:propertyId/inquiries` | Get all inquiries for property | ✓ | seller (owner), admin | - | [inquiry] |
| POST | `/inquiries/:id/reply` | Add reply message to inquiry | ✓ | seller (agent), admin | message | inquiry |

---

## 5. Appointment / Visit Booking Management

**Module Owner:** Member 4  
**Base Route:** `/appointments`

| Method | Endpoint | Description | Auth | Role | Input | Output |
|--------|----------|-------------|------|------|-------|--------|
| POST | `/appointments` | Book property visit | ✓ | buyer | propertyId, date, time, visitPurpose | appointment |
| GET | `/appointments/my-bookings` | Get my booked appointments | ✓ | buyer | query: page, limit, status, date | [appointment] |
| GET | `/appointments/my-visits` | Get property visits (seller) | ✓ | seller | query: page, limit, status, propertyId, date | [appointment] |
| GET | `/appointments/:id` | Get appointment details | ✓ | buyer (creator), seller (owner), admin | - | appointment |
| PATCH | `/appointments/:id` | Update appointment status | ✓ | buyer (creator), seller (owner), admin | appointmentStatus | appointment |
| PATCH | `/appointments/:id/reschedule` | Reschedule appointment | ✓ | buyer (creator), seller (owner) | date, time | appointment |
| DELETE | `/appointments/:id` | Cancel appointment | ✓ | buyer (creator), seller (owner), admin | reason | success |
| GET | `/properties/:propertyId/available-slots` | Get available time slots for property | ✗ | - | date | [{ date, times: [] }] |
| GET | `/appointments/:id/reminder` | Send appointment reminder | ✓ | admin | - | success |

---

## 6. Reviews & Ratings Management

**Module Owner:** Member 5  
**Base Route:** `/reviews`

| Method | Endpoint | Description | Auth | Role | Input | Output |
|--------|----------|-------------|------|------|-------|--------|
| POST | `/reviews` | Submit review (property or agent) | ✓ | buyer | propertyId OR agentId, rating, comment | review |
| GET | `/reviews/properties/:propertyId` | Get reviews for property | ✗ | - | query: page, limit, sortBy | [review] |
| GET | `/reviews/agents/:agentId` | Get reviews for agent | ✗ | - | query: page, limit, sortBy | [review] |
| GET | `/reviews/mine` | Get my reviews | ✓ | buyer | - | [review] |
| GET | `/reviews/:id` | Get single review | ✗ | - | - | review |
| PATCH | `/reviews/:id` | Update own review | ✓ | buyer (author) | rating, comment | review |
| DELETE | `/reviews/:id` | Delete own review | ✓ | buyer (author), admin | - | success |
| GET | `/properties/:propertyId/rating` | Get average rating for property | ✗ | - | - | { averageRating, count } |
| GET | `/agents/:agentId/rating` | Get average rating for agent | ✗ | - | - | { averageRating, count } |
| POST | `/reviews/:id/helpful` | Mark review as helpful | ✓ | buyer | - | review |

---

## 7. Notification Management

**Module Owner:** Member 6  
**Base Route:** `/notifications`

| Method | Endpoint | Description | Auth | Role | Input | Output |
|--------|----------|-------------|------|------|-------|--------|
| GET | `/notifications` | Get my notifications | ✓ | any | query: page, limit, status, type | [notification] |
| GET | `/notifications/unread-count` | Get unread notification count | ✓ | any | - | { count } |
| PATCH | `/notifications/:id/read` | Mark notification as read | ✓ | any | - | notification |
| PATCH | `/notifications/read-all` | Mark all notifications as read | ✓ | any | - | success |
| DELETE | `/notifications/:id` | Delete notification | ✓ | any | - | success |
| DELETE | `/notifications` | Delete all notifications | ✓ | any | - | success |
| POST | `/notifications/subscribe` | Subscribe to push notifications | ✓ | any | deviceToken, platform | subscription |
| DELETE | `/notifications/unsubscribe` | Unsubscribe from push notifications | ✓ | any | deviceToken | success |

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response
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

### List Response
```json
{
  "success": true,
  "message": "Data retrieved",
  "data": [
    { ... },
    { ... }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

## Authentication

All protected endpoints require:
- Header: `Authorization: Bearer <token>`
- Token obtained from `/auth/login` or `/auth/register`

---

## Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **buyer** | Create/update/delete own favorites, inquiries, appointments, reviews. View all properties, inquiries, reviews. |
| **seller** | Create/update/delete own properties. Respond to inquiries. Manage appointments. View own property reviews. |
| **admin** | Full access to all endpoints. Moderate content. Manage users. View analytics. |

---

## Error Codes

| Code | Status | Example |
|------|--------|---------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input validation |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate entry (e.g., already favorited) |
| 500 | Server Error | Internal server error |

---

## Query Parameters (where applicable)

| Parameter | Type | Example |
|-----------|------|---------|
| page | Number | ?page=1 |
| limit | Number | ?limit=10 |
| sortBy | String | ?sortBy=createdAt:desc |
| search | String | ?search=apartment |
| status | String | ?status=pending |
| type | String | ?type=inquiry_reply |
| propertyType | String | ?propertyType=apartment |
| minPrice | Number | ?minPrice=5000 |
| maxPrice | Number | ?maxPrice=50000 |
| location | String | ?location=New+York |
| date | Date | ?date=2026-04-15 |