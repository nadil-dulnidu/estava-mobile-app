// Property List Screen with filters and property type selection
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  ScrollView
} from "react-native";
import { getMyProperties, getProperties } from "../api/propertyApi";
import { useAuth } from "../context/AuthContext";
import { estavaCore } from "../theme/estavaCore";

const resolveUserId = (entity) => {
  if (!entity) return "";
  if (typeof entity === "string") return entity;
  return entity._id || entity.id || "";
};

const dedupeProperties = (items) => {
  const map = new Map();
  items.forEach((item) => {
    const key = item?._id;
    if (!key) return;
    map.set(String(key), item);
  });
  return Array.from(map.values());
};

const inSelectedPriceRange = (rawPrice, selectedPrice) => {
  if (selectedPrice === "all") return true;

  const price = Number(rawPrice || 0);

  if (selectedPrice.endsWith("+")) {
    const minPrice = Number(selectedPrice.replace("+", ""));
    return price >= minPrice;
  }

  const [min, max] = selectedPrice.split("-");
  const minPrice = Number(min);
  const maxPrice = Number(max);
  return price >= minPrice && price <= maxPrice;
};

export default function PropertyListScreen({ navigation }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const currentUserId = resolveUserId(user);

  const priceRanges = [
    { label: "All Prices", value: "all" },
    { label: "Under LKR 500K", value: "0-500000" },
    { label: "LKR 500K - 1M", value: "500000-1000000" },
    { label: "LKR 1M - 2M", value: "1000000-2000000" },
    { label: "Over LKR 2M", value: "2000000+" }
  ];

  const propertyTypes = [
    { label: "All Types", value: "all" },
    { label: "House", value: "House" },
    { label: "Apartment", value: "Apartment" },
    { label: "Condo", value: "Condo" },
    { label: "Land", value: "Land" },
    { label: "Commercial", value: "Commercial" }
  ];

  const fetchProperties = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        setError("");
        const [publicResult, mineResult] = await Promise.all([
          getProperties({ page: 1, limit: 50 }),
          getMyProperties({ page: 1, limit: 50 }).catch(() => ({ items: [] }))
        ]);

        let mergedItems = dedupeProperties([
          ...(publicResult?.items || []),
          ...(mineResult?.items || [])
        ]);

        mergedItems = mergedItems.filter((item) => {
          const listingStatus = String(item?.listingStatus || "").toLowerCase();
          if (listingStatus !== "delisted") {
            return true;
          }
          const ownerId = resolveUserId(item?.createdBy);
          return Boolean(ownerId) && String(ownerId) === String(currentUserId);
        });

        mergedItems = mergedItems.filter((item) =>
          inSelectedPriceRange(item?.price, selectedPrice)
        );

        if (selectedType !== "all") {
          mergedItems = mergedItems.filter((item) => {
            return String(item?.propertyType || "").toLowerCase() === selectedType.toLowerCase();
          });
        }

        setItems(mergedItems);
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || "Failed to load properties");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentUserId, selectedPrice, selectedType]
  );

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const renderItem = ({ item }) => (
    <Pressable
      style={styles.card}
      onPress={() => navigation.navigate("PropertyDetail", { propertyId: item._id })}
      accessibilityRole="button"
      accessibilityLabel={item.title}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.location}>{item.location}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.price}>LKR {Number(item.price || 0).toLocaleString()}</Text>
        <Text style={styles.type}>{item.propertyType || "Property"}</Text>
      </View>
    </Pressable>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={estavaCore.colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filtersContainer}>
        <Pressable
          style={[styles.filterButton, selectedPrice !== "all" && styles.filterButtonActive]}
          onPress={() => {
            setShowPriceFilter((prev) => !prev);
            setShowTypeFilter(false);
          }}
          accessibilityLabel="Price filter"
          accessibilityRole="button"
        >
          <Text style={styles.filterLabel}>Price</Text>
          <Text style={styles.filterValue}>
            {priceRanges.find((r) => r.value === selectedPrice)?.label || "All"}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.filterButton, selectedType !== "all" && styles.filterButtonActive]}
          onPress={() => {
            setShowTypeFilter((prev) => !prev);
            setShowPriceFilter(false);
          }}
          accessibilityLabel="Property type filter"
          accessibilityRole="button"
        >
          <Text style={styles.filterLabel}>Type</Text>
          <Text style={styles.filterValue}>
            {propertyTypes.find((t) => t.value === selectedType)?.label || "All"}
          </Text>
        </Pressable>
      </View>

      {showPriceFilter && (
        <ScrollView style={styles.dropdown}>
          {priceRanges.map((range) => (
            <Pressable
              key={range.value}
              style={[
                styles.dropdownItem,
                selectedPrice === range.value && styles.dropdownItemActive
              ]}
              onPress={() => {
                setSelectedPrice(range.value);
                setShowPriceFilter(false);
              }}
            >
              <Text
                style={[
                  styles.dropdownText,
                  selectedPrice === range.value && styles.dropdownTextActive
                ]}
              >
                {range.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {showTypeFilter && (
        <ScrollView style={styles.dropdown}>
          {propertyTypes.map((type) => (
            <Pressable
              key={type.value}
              style={[
                styles.dropdownItem,
                selectedType === type.value && styles.dropdownItemActive
              ]}
              onPress={() => {
                setSelectedType(type.value);
                setShowTypeFilter(false);
              }}
            >
              <Text
                style={[
                  styles.dropdownText,
                  selectedType === type.value && styles.dropdownTextActive
                ]}
              >
                {type.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.topActionRow}>
        <Pressable
          style={[styles.topActionButton, styles.secondaryActionButton]}
          onPress={() => navigation.navigate("MyProperties")}
          accessibilityRole="button"
        >
          <Text style={styles.secondaryActionText}>My Properties</Text>
        </Pressable>
        <Pressable
          style={[styles.topActionButton, styles.primaryActionButton]}
          onPress={() => navigation.navigate("CreateProperty")}
          accessibilityRole="button"
        >
          <Text style={styles.primaryActionText}>Post Property</Text>
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No properties match your filters.</Text>}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchProperties(true)} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: estavaCore.colors.background
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: estavaCore.colors.background
  },
  filtersContainer: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: estavaCore.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: estavaCore.colors.border
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: estavaCore.colors.border,
    backgroundColor: estavaCore.colors.background,
    alignItems: "center"
  },
  filterButtonActive: {
    borderColor: estavaCore.colors.accent,
    backgroundColor: estavaCore.colors.accentSoft
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: estavaCore.colors.textSecondary
  },
  filterValue: {
    fontSize: 12,
    fontWeight: "700",
    color: estavaCore.colors.primary,
    marginTop: 2
  },
  dropdown: {
    maxHeight: 200,
    backgroundColor: estavaCore.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: estavaCore.colors.border
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f4f6"
  },
  dropdownItemActive: {
    backgroundColor: "#e8f5ef"
  },
  dropdownText: {
    fontSize: 14,
    color: estavaCore.colors.textPrimary
  },
  dropdownTextActive: {
    fontWeight: "700",
    color: estavaCore.colors.accent
  },
  error: {
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fef2f2",
    color: "#ba1a1a",
    borderRadius: 6,
    borderLeftWidth: 2,
    borderLeftColor: "#ba1a1a",
    fontSize: 13
  },
  topActionRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: estavaCore.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: estavaCore.colors.border
  },
  topActionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center"
  },
  primaryActionButton: {
    backgroundColor: estavaCore.colors.primary
  },
  primaryActionText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14
  },
  secondaryActionButton: {
    backgroundColor: estavaCore.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: estavaCore.colors.border
  },
  secondaryActionText: {
    color: estavaCore.colors.textPrimary,
    fontWeight: "700",
    fontSize: 14
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12
  },
  card: {
    backgroundColor: estavaCore.colors.surface,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: estavaCore.colors.border,
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: estavaCore.colors.primary
  },
  location: {
    marginTop: 4,
    fontSize: 13,
    color: estavaCore.colors.textSecondary
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopColor: estavaCore.colors.border,
    borderTopWidth: 1
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: estavaCore.colors.accent
  },
  type: {
    fontSize: 12,
    fontWeight: "600",
    color: estavaCore.colors.textSecondary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: estavaCore.colors.surfaceMuted,
    borderRadius: 6
  },
  empty: {
    textAlign: "center",
    marginTop: 32,
    fontSize: 16,
    color: "#6b7280"
  }
});
