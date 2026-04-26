---
title: "profile-route-hardening-and-client-url-guard"
date: 2026-04-26
type: pattern
status: active
agent: coder
task: "fix profile update route-not-found and auth hardening"
tags:
  - pattern
  - auth
  - mobile
  - backend
  - security
aliases: []
---

# profile-route-hardening-and-client-url-guard

## When to Use
When mobile app calls protected profile endpoints and env mismatch or malformed API URL can cause route misses or token leakage risk.

## Implementation

```javascript
// mobile/src/api/client.js
const { baseUrl, origin } = normalizeApiBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL);
apiClient.interceptors.request.use((config) => {
  const resolvedUrl = new URL(config.url || "/", config.baseURL || baseUrl);
  if (resolvedUrl.origin !== origin) {
    stripAuthorizationHeader(config.headers);
    throw new Error("Blocked request to unexpected API origin.");
  }
  return config;
});

// backend/src/middlewares/authMiddleware.js
const verifyAuthToken = (token) => {
  try {
    return jwt.verify(token, env.jwtSecret);
  } catch (error) {
    if (error?.name === "TokenExpiredError") throw new AppError("Token has expired. Please log in again", 401);
    if (error?.name === "JsonWebTokenError" || error?.name === "NotBeforeError") {
      throw new AppError("Invalid authentication token", 401);
    }
    throw error;
  }
};
```

## Example in Codebase
`mobile/src/api/client.js` and `backend/src/middlewares/authMiddleware.js`.

## Anti-Patterns
- Trusting raw API env URL without parse/normalize.
- Passing through raw jsonwebtoken errors to global handler as 500.
- Sending Authorization header toward unexpected absolute URL origin.

## Related
- [[sessions/2026-04-26-profile-home-user-profile]] — profile flow session context
