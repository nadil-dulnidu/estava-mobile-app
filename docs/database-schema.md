# Estava Database Schema

## Collections Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User (Authentication)                    │
├─────────────────────────────────────────────────────────────────┤
│ _id: ObjectId (PK)                                              │
│ fullName: String                                                │
│ email: String (UNIQUE, INDEX)                                   │
│ password: String (hashed with bcrypt)                           │
│ role: Enum ["buyer", "seller", "admin"]                    │
│ createdAt: Date                                                  │
│ updatedAt: Date                                                  │
└─────────────────────────────────────────────────────────────────┘
           ▲                ▲                ▲              ▲
           │                │                │              │
        (createdBy)    (userId)        (userId)        (userId)
           │                │                │              │
┌──────────┴────────┐ ┌─────┴────────┐ ┌──────┴──────┐ ┌────┴──────────┐
│    Property       │ │  Favorite    │ │  Inquiry   │ │  Appointment  │
└───────────────────┘ └──────────────┘ └────────────┘ └───────────────┘
           ▲                                    ▲              ▲
           │                                    │              │
        (propertyId)                      (propertyId)   (propertyId)
           │                                    │              │
           └────────────┬──────────────────────┘              │
                        ▼                                     │
                  ┌──────────────┐                            │
                  │   Review     │────(propertyId)───────────┘
                  │              │
                  │ rating       │
                  │ comment      │
                  └──────────────┘

┌────────────────────────┐
│   Notification         │
├────────────────────────┤
│ _id: ObjectId (PK)     │
│ userId: ObjectId (FK)  │
│ title: String          │
│ message: String        │
│ type: String           │
│ status: String         │
│ createdAt: Date        │
└────────────────────────┘
```
```

---

## Collection Details

### 1. User
**Purpose:** Store user accounts (buyers, sellers, admins)

| Field | Type | Constraints | Index |
|-------|------|-------------|-------|
| _id | ObjectId | Primary Key | ✓ |
| fullName | String | Required, 2-120 chars | ✗ |
| email | String | Required, Unique | ✓ |
| password | String | Required, min 8 chars, hashed | ✗ |
| role | String | Enum: buyer, seller, admin | ✓ |
| createdAt | Date | Auto-set on create | ✓ |
| updatedAt | Date | Auto-set on update | ✗ |

**Indexes:** email (unique), role, createdAt

---

### 2. Property
**Purpose:** Store property listings with details, images, and status

| Field | Type | Constraints | Index |
|-------|------|-------------|-------|
| _id | ObjectId | Primary Key | ✓ |
| title | String | Required, 5-200 chars | ✓ |
| description | String | Required, min 20 chars | ✗ |
| price | Number | Required, ≥ 0 | ✓ |
| location | String | Required | ✓ |
| propertyType | String | Enum: house, apartment, land, villa, commercial | ✓ |
| bedrooms | Number | ≥ 0 | ✗ |
| bathrooms | Number | ≥ 0 | ✗ |
| areaSize | Number | In sqm | ✗ |
| features | [String] | Array of amenities | ✗ |
| imageUrls | [String] | Array of image URLs | ✗ |
| listingStatus | String | Enum: available, sold, rented, delisted | ✓ |
| createdBy | ObjectId | FK to User (owner/seller) | ✓ |
| createdAt | Date | Auto-set on create | ✓ |
| updatedAt | Date | Auto-set on update | ✗ |

**Indexes:** title, price, location, propertyType, listingStatus, createdBy, createdAt

---

### 3. Favorite
**Purpose:** Track user wishlist/favorite properties

| Field | Type | Constraints | Index |
|-------|------|-------------|-------|
| _id | ObjectId | Primary Key | ✓ |
| userId | ObjectId | FK to User, Required | ✓ |
| propertyId | ObjectId | FK to Property, Required | ✓ |
| note | String | Optional, max 500 chars | ✗ |
| priorityLevel | String | Enum: low, medium, high (default: medium) | ✗ |
| createdAt | Date | Auto-set on create | ✓ |

**Indexes:** (userId, propertyId) compound unique, userId, propertyId

---

### 4. Inquiry
**Purpose:** Store messages between buyers and agents about properties

| Field | Type | Constraints | Index |
|-------|------|-------------|-------|
| _id | ObjectId | Primary Key | ✓ |
| propertyId | ObjectId | FK to Property, Required | ✓ |
| senderUserId | ObjectId | FK to User (buyer), Required | ✓ |
| agentId | ObjectId | FK to User (seller/agent), Required | ✓ |
| subject | String | Required, max 200 chars | ✗ |
| message | String | Required, max 3000 chars | ✗ |
| contactNumber | String | Optional | ✗ |
| inquiryStatus | String | Enum: pending, replied, closed | ✓ |
| createdAt | Date | Auto-set on create | ✓ |
| updatedAt | Date | Auto-set on update | ✗ |

**Indexes:** propertyId, senderUserId, agentId, inquiryStatus, createdAt

---

### 5. Appointment
**Purpose:** Track property visit bookings

| Field | Type | Constraints | Index |
|-------|------|-------------|-------|
| _id | ObjectId | Primary Key | ✓ |
| propertyId | ObjectId | FK to Property, Required | ✓ |
| userId | ObjectId | FK to User (buyer), Required | ✓ |
| agentId | ObjectId | FK to User (seller/agent), Required | ✓ |
| date | String | Required (ISO date string) | ✓ |
| time | String | HH:MM format, Required | ✗ |
| visitPurpose | String | Text description, default: "Property visit" | ✗ |
| appointmentStatus | String | Enum: pending, confirmed, completed, cancelled | ✓ |
| createdAt | Date | Auto-set on create | ✓ |
| updatedAt | Date | Auto-set on update | ✗ |

**Indexes:** propertyId, userId, agentId, date, appointmentStatus, createdAt

---

### 6. Review
**Purpose:** User ratings and feedback on properties or agents

| Field | Type | Constraints | Index |
|-------|------|-------------|-------|
| _id | ObjectId | Primary Key | ✓ |
| userId | ObjectId | FK to User, Required | ✓ |
| propertyId | ObjectId | FK to Property, Required | ✓ |
| receivedBy | ObjectId | FK to User (agent/owner), Optional | ✓ |
| rating | Number | 1-5, Required | ✗ |
| comment | String | Optional, max 1200 chars | ✗ |
| createdAt | Date | Auto-set on create | ✓ |

**Indexes:** propertyId, receivedBy, userId, createdAt
**Note:** Reviews are property-centered in the current schema; a `receivedBy` field is available to represent the user who received the review (typically the property owner).

---

### 7. Notification
**Purpose:** System alerts and messages for users

| Field | Type | Constraints | Index |
|-------|------|-------------|-------|
| _id | ObjectId | Primary Key | ✓ |
| userId | ObjectId | FK to User, Required | ✓ |
| title | String | Required, max 160 chars | ✗ |
| message | String | Required, max 1500 chars | ✗ |
| type | String | Enum: system, inquiry, appointment, review, listing | ✓ |
| status | String | Enum: unread, read | ✓ |
| createdAt | Date | Auto-set on create | ✓ |

**Indexes:** userId, status, type, createdAt

---

## Relationships Summary

| Source | Relation | Target | Notes |
|--------|----------|--------|-------|
| Property | createdBy | User | 1-to-many, seller/agent owns properties |
| Favorite | links | User & Property | many-to-many, buyer saves properties |
| Inquiry | from-to | User & User & Property | many-to-many, buyer queries agent about property |
| Appointment | books | User & User & Property | many-to-many, buyer books visit at property with agent |
| Review | about | User & Property | many-to-many, buyer reviews property |
| Notification | sent-to | User | 1-to-many, system notifies users |

---

## Constraints & Business Rules

1. **User Role Enforcement:**
   - Only `seller` or `admin` can create properties
   - Only `buyer` can create favorites, inquiries, appointments, reviews
   - Only `admin` can manage users and moderate reviews

2. **Property Constraints:**
   - `listingStatus` can only change via seller/admin and includes `delisted` for owner-controlled feed visibility
   - Cannot delete property if appointments are pending/confirmed
   - Images should be validated on upload (max 5MB per image)

3. **Favorite Constraints:**
   - User cannot favorite the same property twice (unique constraint)
   - Cannot favorite own property

4. **Inquiry Constraints:**
   - `senderUserId` must be different from `agentId`
   - Agent/admin can edit or clear inquiry response content
   - Buyer can delete inquiry after reply; admin can override for moderation
   - Cannot create inquiry for own property

5. **Appointment Constraints:**
   - `date` should be supplied as an ISO date string
   - Cannot book same slot twice (unique: propertyId + date + time)
   - `appointmentStatus` transitions: pending → confirmed/cancelled → completed
   - Delete behavior uses dual soft-delete semantics for buyer and agent perspectives

6. **Review Constraints:**
   - User cannot review same property twice
   - Can only review if user has purchased/visited property or interacted with agent
   - Rating is required; comment is optional
   - Review owner can edit rating/comment, with admin moderation control

7. **Notification Constraints:**
   - Auto-delete after 30 days
   - TTL index on createdAt for auto-expiry
