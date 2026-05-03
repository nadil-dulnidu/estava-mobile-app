const MAX_RECENT = 10;
const viewedByUser = new Map();

const normalizeUserKey = (userId) => String(userId || "guest");
const normalizePropertyKey = (propertyId) => String(propertyId || "").trim();

export const pushRecentlyViewedProperty = (userId, propertyId) => {
  const userKey = normalizeUserKey(userId);
  const propertyKey = normalizePropertyKey(propertyId);
  if (!propertyKey) return;

  const existing = viewedByUser.get(userKey) || [];
  const next = [propertyKey, ...existing.filter((id) => id !== propertyKey)].slice(0, MAX_RECENT);
  viewedByUser.set(userKey, next);
};

export const getRecentlyViewedPropertyIds = (userId, limit = 3) => {
  const userKey = normalizeUserKey(userId);
  const existing = viewedByUser.get(userKey) || [];
  return existing.slice(0, Math.max(0, Number(limit) || 0));
};
