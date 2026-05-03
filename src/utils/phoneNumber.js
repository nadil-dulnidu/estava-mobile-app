export const normalizePhoneNumber = (value) => String(value ?? "").replace(/\D/g, "").slice(0, 10);

export const isTenDigitPhoneNumber = (value) => /^\d{10}$/.test(String(value ?? "").trim());
