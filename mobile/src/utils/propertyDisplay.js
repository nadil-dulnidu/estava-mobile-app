export const PROPERTY_TYPE_OPTIONS = [
  { label: "Apartment", value: "apartment" },
  { label: "House", value: "house" },
  { label: "Land", value: "land" },
  { label: "Commercial", value: "commercial" },
  { label: "Villa", value: "villa" }
];

export const PROPERTY_TYPE_FILTER_OPTIONS = [
  { label: "All Types", value: "all" },
  ...PROPERTY_TYPE_OPTIONS
];

export const normalizePropertyType = (value) => String(value || "").trim().toLowerCase();

export const getPropertyTypeLabel = (value, fallback = "Property") => {
  const normalized = normalizePropertyType(value);
  const option = PROPERTY_TYPE_OPTIONS.find((item) => item.value === normalized);
  return option?.label || fallback;
};

export const hasRooms = (propertyType) => {
  const normalized = normalizePropertyType(propertyType);
  return normalized !== "land";
};

export const formatAreaSize = (value) => {
  const numericValue = Number(value || 0);
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return "Not provided";
  }

  return `${numericValue.toLocaleString()} sqft`;
};
