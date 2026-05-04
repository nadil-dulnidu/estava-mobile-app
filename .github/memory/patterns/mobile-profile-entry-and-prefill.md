---
title: "mobile-profile-entry-and-prefill"
date: 2026-04-26
type: pattern
status: active
agent: designer
task: "implement profile UI route, avatar entry point, and inquiry phone prefill"
tags:
  - pattern
  - mobile
  - profile
  - inquiries
aliases: []
---

## When to Use

Use when authenticated mobile users need quick profile access from dashboard and contact fields should reuse profile phone without locking edits.

## Implementation

```javascript
// Home screen header action
<Pressable onPress={() => navigation.navigate("Profile")}>{/* avatar or fallback */}</Pressable>

// Property detail inquiry modal opening
if (!inquiryContact && user?.phoneNumber) {
  setInquiryContact(normalizePhoneNumber(user.phoneNumber));
}
setInquiryModalVisible(true);

// Inquiries edit modal opening
const fallbackPhone = item?.contactNumber || user?.phoneNumber;
setEditContact(normalizePhoneNumber(fallbackPhone));
```

## Example in Codebase

`mobile/src/screens/HomeScreen.js` and `mobile/src/screens/ProfileScreen.js` show dashboard profile entry + profile management forms.

`mobile/src/screens/PropertyDetailScreen.js` and `mobile/src/screens/InquiriesScreen.js` show editable phone prefill fallback behavior.

## Anti-Patterns

- Hardcoding contact number from profile on every keystroke (breaks user edits).
- Opening profile via nested menu only (slow discovery).
- Auto-filling without digit normalization (invalid submissions).

## Related

- [[sessions/2026-04-26-profile-home-user-profile]] — session where this was established
- [[patterns/auth-profile-endpoints]] — backend/auth contract used by this UI flow
