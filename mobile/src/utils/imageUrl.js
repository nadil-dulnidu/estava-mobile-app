export const normalizeImageUrl = (url) => {
  const value = String(url || "").trim();
  if (!value) return "";

  if (value.startsWith("http://") && !value.includes("localhost") && !value.includes("10.0.2.2")) {
    return value.replace(/^http:\/\//i, "https://");
  }

  return value;
};