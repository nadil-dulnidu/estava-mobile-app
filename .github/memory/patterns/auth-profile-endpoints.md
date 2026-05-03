---
title: "auth-profile-endpoints"
date: 2026-04-26
type: pattern
status: active
agent: coder
task: "implement profile data-layer endpoints and mobile auth sync"
tags:
  - pattern
  - auth
  - profile
aliases: []

---

## When to Use

Use when authenticated user needs profile read/update, password rotation, and avatar upload using existing auth module.

## Implementation

```javascript
// routes/authRoutes.js
router.get("/profile", protect, profile);

router.patch("/profile", protect, updateProfile);
router.patch("/change-password", protect, changePassword);
router.patch("/profile/avatar", protect, uploadAvatarImage, updateAvatar);

// services/authService.js
const normalizeUserPayload = (user) => ({
  id: user._id,
  fullName: user.fullName,
  ---
  title: "auth-profile-endpoints"
  date: 2026-04-26
  type: pattern
  status: active
  agent: coder
  task: "implement profile data-layer endpoints and mobile auth sync"
  tags:
    - pattern
    - auth
    - profile
  aliases: []
  ---

  ## When to Use

  Use when authenticated user needs profile read/update, password rotation, and avatar upload using existing auth module.

  ## Implementation

  ```javascript
  // routes/authRoutes.js
  router.get("/profile", protect, profile);
  router.patch("/profile", protect, updateProfile);
  router.patch("/change-password", protect, changePassword);
  router.patch("/profile/avatar", protect, uploadAvatarImage, updateAvatar);

  // services/authService.js
  const normalizeUserPayload = (user) => ({
    id: user._id,
    fullName: user.fullName,
    ---
    title: "auth-profile-endpoints"
    date: 2026-04-26
    type: pattern
    status: active
    agent: coder
    task: "implement profile data-layer endpoints and mobile auth sync"
    tags:
      - pattern
      - auth
      - profile
    aliases: []
    ---

    ## When to Use

    Use when authenticated user needs profile read/update, password rotation, and avatar upload using existing auth module.

    ## Implementation

    ```javascript
    // routes/authRoutes.js
    router.get("/profile", protect, profile);
    router.patch("/profile", protect, updateProfile);
    router.patch("/change-password", protect, changePassword);
    router.patch("/profile/avatar", protect, uploadAvatarImage, updateAvatar);

    // services/authService.js
    const normalizeUserPayload = (user) => ({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber || null,
      profileImage: user.profileImage || null
    });
    ```

    ## Example in Codebase

    `backend/src/routes/authRoutes.js` and `backend/src/services/authService.js` show protected profile endpoints using shared normalized user payload.

    ## Anti-Patterns

    - Returning raw user documents with `password` or internal fields.
    - Accepting password change without checking current password.
    - Uploading avatar through property upload middleware field names.

    ## Related

    - [[sessions/2026-04-26-profile-home-user-profile]] — session where this pattern established

  - Returning raw user documents with `password` or internal fields.
  - Accepting password change without checking current password.
  - Uploading avatar through property upload middleware field names.

  ## Related

  - [[sessions/2026-04-26-profile-home-user-profile]] — session where this pattern established
