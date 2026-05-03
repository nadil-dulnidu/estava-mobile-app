// Property List Screen with filters and property type selection
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Image,
  PanResponder,
  Animated,
} from "react-native";
import { getMyProperties, getProperties } from "../api/propertyApi";
import { useAuth } from "../context/AuthContext";
import { estavaCore } from "../theme/estavaCore";
import { AppFooter, HeaderActions, QuickAccessMenu } from "../components/AppChrome";

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

const PRICE_MIN = 0;
const DEFAULT_PRICE_MAX = 10000000;
const PRICE_STEP = 100000;
const THUMB_SIZE = 24;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const formatCurrency = (value) => `LKR ${Number(value || 0).toLocaleString()}`;

const inSelectedPriceRange = (rawPrice, minPrice, maxPrice) => {
  const price = Number(rawPrice || 0);
  return price >= minPrice && price <= maxPrice;
};

const RangeSlider = ({ min, max, lowerValue, upperValue, onChangeLower, onChangeUpper }) => {
  const [trackWidth, setTrackWidth] = useState(1);
  const lowerStart = React.useRef(0);
  const upperStart = React.useRef(0);
  const lowerCurrentX = React.useRef(0);
  const upperCurrentX = React.useRef(0);
  const lowerChangeRef = React.useRef(onChangeLower);
  const upperChangeRef = React.useRef(onChangeUpper);
  const lowerX = React.useRef(new Animated.Value(0)).current;
  const upperX = React.useRef(new Animated.Value(0)).current;
  const safeMax = Math.max(max, min + PRICE_STEP);
  const usableWidth = Math.max(trackWidth, 1);
  const thumbTravelWidth = Math.max(usableWidth - THUMB_SIZE, 1);
  const valueSpan = Math.max(safeMax - min, 1);

  useEffect(() => {
    lowerChangeRef.current = onChangeLower;
    upperChangeRef.current = onChangeUpper;
  }, [onChangeLower, onChangeUpper]);

  const valueToX = (value) => {
    const normalizedValue = clamp(value, min, safeMax);
    return ((normalizedValue - min) / valueSpan) * thumbTravelWidth;
  };

  const xToValue = (x) => {
    const ratio = clamp(x / thumbTravelWidth, 0, 1);
    return clamp(Math.round((min + ratio * (safeMax - min)) / PRICE_STEP) * PRICE_STEP, min, safeMax);
  };

  useEffect(() => {
    lowerX.setValue(valueToX(lowerValue));
    upperX.setValue(valueToX(upperValue));
  }, [lowerValue, upperValue, safeMax, usableWidth]);

  const lowerResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          lowerStart.current = valueToX(lowerValue);
          lowerCurrentX.current = lowerStart.current;
          lowerX.setValue(lowerStart.current);
        },
        onPanResponderMove: (_, gesture) => {
          const nextX = clamp(lowerStart.current + gesture.dx, 0, valueToX(upperValue) - THUMB_SIZE);
          lowerCurrentX.current = nextX;
          lowerX.setValue(nextX);
        },
        onPanResponderRelease: (_, gesture) => {
          const nextX = clamp(lowerStart.current + gesture.dx, 0, valueToX(upperValue) - THUMB_SIZE);
          const nextValue = xToValue(nextX);
          lowerChangeRef.current(Math.min(nextValue, upperValue - PRICE_STEP));
        },
        onPanResponderTerminate: (_, gesture) => {
          const nextX = clamp(lowerStart.current + gesture.dx, 0, valueToX(upperValue) - THUMB_SIZE);
          const nextValue = xToValue(nextX);
          lowerChangeRef.current(Math.min(nextValue, upperValue - PRICE_STEP));
        }
      }),
    [lowerValue, upperValue, safeMax, usableWidth]
  );

  const upperResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          upperStart.current = valueToX(upperValue);
          upperCurrentX.current = upperStart.current;
          upperX.setValue(upperStart.current);
        },
        onPanResponderMove: (_, gesture) => {
          const nextX = clamp(upperStart.current + gesture.dx, valueToX(lowerValue) + THUMB_SIZE, thumbTravelWidth);
          upperCurrentX.current = nextX;
          upperX.setValue(nextX);
        },
        onPanResponderRelease: (_, gesture) => {
          const nextX = clamp(upperStart.current + gesture.dx, valueToX(lowerValue) + THUMB_SIZE, thumbTravelWidth);
          const nextValue = xToValue(nextX);
          upperChangeRef.current(Math.max(nextValue, lowerValue + PRICE_STEP));
        },
        onPanResponderTerminate: (_, gesture) => {
          const nextX = clamp(upperStart.current + gesture.dx, valueToX(lowerValue) + THUMB_SIZE, thumbTravelWidth);
          const nextValue = xToValue(nextX);
          upperChangeRef.current(Math.max(nextValue, lowerValue + PRICE_STEP));
        }
      }),
    [lowerValue, upperValue, safeMax, usableWidth]
  );

  return (
    <View
      style={styles.rangeContainer}
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
    >
      <View style={styles.rangeTrack} />
      <View
        style={[
          styles.rangeSelection,
          {
            left: valueToX(lowerValue),
            width: Math.max(0, valueToX(upperValue) - valueToX(lowerValue))
          }
        ]}
      />
      <Animated.View
        style={[styles.rangeThumb, { left: lowerX }]}
        {...lowerResponder.panHandlers}
      />
      <Animated.View
        style={[styles.rangeThumb, { left: upperX }]}
        {...upperResponder.panHandlers}
      />
    </View>
  );
};

export default function PropertyListScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [rawItems, setRawItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [draftPriceMin, setDraftPriceMin] = useState(PRICE_MIN);
  const [draftPriceMax, setDraftPriceMax] = useState(DEFAULT_PRICE_MAX);
  const [appliedPriceMin, setAppliedPriceMin] = useState(PRICE_MIN);
  const [appliedPriceMax, setAppliedPriceMax] = useState(DEFAULT_PRICE_MAX);
  const [selectedType, setSelectedType] = useState("all");
  const [menuVisible, setMenuVisible] = useState(false);

  const currentUserId = resolveUserId(user);
  const mineMode = route?.params?.viewMode === "mine";
  const isMainList = !mineMode;
  const availablePriceMax = useMemo(() => {
    const prices = rawItems
      .map((item) => Number(item?.price || 0))
      .filter((value) => Number.isFinite(value) && value >= 0);
    const highestPrice = prices.length > 0 ? Math.max(...prices) : DEFAULT_PRICE_MAX;
    return Math.max(DEFAULT_PRICE_MAX, highestPrice);
  }, [rawItems]);

  useEffect(() => {
    setDraftPriceMin((current) => clamp(current, PRICE_MIN, availablePriceMax));
    setDraftPriceMax((current) => (current === DEFAULT_PRICE_MAX ? availablePriceMax : clamp(current, PRICE_MIN + PRICE_STEP, availablePriceMax)));
    setAppliedPriceMin((current) => clamp(current, PRICE_MIN, availablePriceMax));
    setAppliedPriceMax((current) => (current === DEFAULT_PRICE_MAX ? availablePriceMax : clamp(current, PRICE_MIN + PRICE_STEP, availablePriceMax)));
  }, [availablePriceMax]);

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
          mineMode ? Promise.resolve({ items: [] }) : getProperties({ page: 1, limit: 50 }),
          getMyProperties({ page: 1, limit: 50 }).catch(() => ({ items: [] }))
        ]);

        let mergedItems = mineMode
          ? Array.isArray(mineResult?.items)
            ? mineResult.items
            : []
          : dedupeProperties([...(publicResult?.items || []), ...(mineResult?.items || [])]);

        mergedItems = mergedItems.filter((item) => {
          const listingStatus = String(item?.listingStatus || "").toLowerCase();
          if (listingStatus !== "delisted") {
            return true;
          }
          const ownerId = resolveUserId(item?.createdBy);
          return Boolean(ownerId) && String(ownerId) === String(currentUserId);
        });

        setRawItems(mergedItems);
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || "Failed to load properties");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentUserId, mineMode]
  );

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const visibleItems = useMemo(() => {
    let filteredItems = rawItems.slice();

    filteredItems = filteredItems.filter((item) => {
      const listingStatus = String(item?.listingStatus || "").toLowerCase();
      if (listingStatus !== "delisted") {
        return true;
      }
      const ownerId = resolveUserId(item?.createdBy);
      return Boolean(ownerId) && String(ownerId) === String(currentUserId);
    });

    filteredItems = filteredItems.filter((item) =>
      inSelectedPriceRange(item?.price, appliedPriceMin, appliedPriceMax)
    );

    if (selectedType !== "all") {
      filteredItems = filteredItems.filter((item) => {
        return String(item?.propertyType || "").toLowerCase() === selectedType.toLowerCase();
      });
    }

    return filteredItems;
  }, [appliedPriceMax, appliedPriceMin, currentUserId, rawItems, selectedType]);

  const openPriceFilter = () => {
    setDraftPriceMin(appliedPriceMin);
    setDraftPriceMax(appliedPriceMax);
    setShowPriceFilter(true);
    setShowTypeFilter(false);
  };

  const applyPriceChanges = () => {
    const nextMin = Math.min(draftPriceMin, draftPriceMax - PRICE_STEP);
    const nextMax = Math.max(draftPriceMax, nextMin + PRICE_STEP);
    setAppliedPriceMin(nextMin);
    setAppliedPriceMax(nextMax);
    setShowPriceFilter(false);
  };

  const clearAllFilters = () => {
    setDraftPriceMin(PRICE_MIN);
    setDraftPriceMax(availablePriceMax);
    setAppliedPriceMin(PRICE_MIN);
    setAppliedPriceMax(availablePriceMax);
    setSelectedType("all");
  };

  const renderItem = ({ item }) => {
    const ownerId = resolveUserId(item?.createdBy);
    const isOwnerItem = mineMode || (currentUserId && String(ownerId) === String(currentUserId));

    return (
    <Pressable
      style={styles.card}
      onPress={() => navigation.navigate("PropertyDetail", { propertyId: item._id })}
      accessibilityRole="button"
      accessibilityLabel={item.title}
    >
      {Array.isArray(item?.imageUrls) && item.imageUrls[0] ? (
        <Image source={{ uri: item.imageUrls[0] }} style={styles.cardImage} />
      ) : (
        <View style={styles.cardImagePlaceholder}>
          <Text style={styles.cardImagePlaceholderText}>No image</Text>
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.location}>{item.location}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.price}>{formatCurrency(item.price)}</Text>
          <View style={styles.metaChips}>
            <Text style={styles.type}>{item.propertyType || "Property"}</Text>
            <Text style={styles.statusChip}>{String(item?.listingStatus || "available")}</Text>
          </View>
        </View>
        {isOwnerItem ? (
          <Pressable
            style={styles.editButton}
            onPress={() => navigation.navigate("EditProperty", { propertyId: item._id })}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>
        ) : null}
      </View>
    </Pressable>
    );
  };

  const renderPostPropertyAction = () => (
    <View style={styles.postActionWrap}>
      <Pressable
        style={[styles.topActionButton, styles.primaryActionButton]}
        onPress={() => navigation.navigate("CreateProperty")}
        accessibilityRole="button"
      >
        <Text style={styles.primaryActionText}>Post Property</Text>
      </Pressable>
    </View>
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
      <QuickAccessMenu visible={menuVisible} onClose={() => setMenuVisible(false)} navigation={navigation} />

      <View style={[styles.pageHeader, { paddingTop: insets.top + 12 }] }>
        <View style={styles.pageHeaderText}>
          <Text style={styles.pageTitle}>{mineMode ? "My Properties" : "Properties"}</Text>
          <Text style={styles.pageSubtitle}>
            {mineMode
              ? "Keep your own listings close and edit them from the same card layout."
              : "Browse listings, compare prices, and refine the results with friendly filters."}
          </Text>
        </View>
        <HeaderActions
          navigation={navigation}
          user={user}
          onMenuPress={() => setMenuVisible((current) => !current)}
          menuOpen={menuVisible}
        />
      </View>

      <View style={styles.filtersContainer}>
        <Pressable
          style={[styles.filterButton, showPriceFilter && styles.filterButtonActive]}
          onPress={() => {
            if (showPriceFilter) {
              setShowPriceFilter(false);
            } else {
              openPriceFilter();
            }
          }}
        >
          <Text style={styles.filterLabel}>Price range</Text>
          <Text style={styles.filterValue}>{`${formatCurrency(appliedPriceMin)} - ${formatCurrency(appliedPriceMax)}`}</Text>
        </Pressable>

        <Pressable
          style={[styles.filterButton, showTypeFilter && styles.filterButtonActive]}
          onPress={() => {
            setShowTypeFilter((prev) => !prev);
            setShowPriceFilter(false);
          }}
        >
          <Text style={styles.filterLabel}>Type</Text>
          <Text style={styles.filterValue}>{propertyTypes.find((t) => t.value === selectedType)?.label || "All types"}</Text>
        </Pressable>
      </View>

      {showPriceFilter && (
        <View style={styles.dropdownPanel}>
          <View style={styles.dropdownPanelHeader}>
            <Text style={styles.dropdownPanelTitle}>Choose price range</Text>
            <Pressable onPress={() => setShowPriceFilter(false)}>
              <Text style={styles.dropdownPanelLink}>Close</Text>
            </Pressable>
          </View>
          <Text style={styles.dropdownPanelHelper}>
            Drag either handle to narrow the range. Tap Apply Changes when you are ready to refresh the list.
          </Text>
          <View style={styles.rangeValueRow}>
            <Text style={styles.rangeValueLabel}>Min</Text>
            <Text style={styles.rangeValueLabel}>Max</Text>
          </View>
          <RangeSlider
            min={PRICE_MIN}
            max={availablePriceMax}
            lowerValue={draftPriceMin}
            upperValue={draftPriceMax}
            onChangeLower={(value) => {
              setDraftPriceMin(value);
              setDraftPriceMax((current) => Math.max(current, value + PRICE_STEP));
            }}
            onChangeUpper={(value) => {
              setDraftPriceMax(value);
              setDraftPriceMin((current) => Math.min(current, value - PRICE_STEP));
            }}
          />
          <View style={styles.rangeSummaryRow}>
            <Text style={styles.rangeSummaryText}>{formatCurrency(draftPriceMin)}</Text>
            <Text style={styles.rangeSummaryText}>{formatCurrency(draftPriceMax)}</Text>
          </View>
          <View style={styles.dropdownActionRow}>
            <Pressable style={styles.dropdownSecondaryButton} onPress={() => setShowPriceFilter(false)}>
              <Text style={styles.dropdownSecondaryButtonText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.dropdownPrimaryButton} onPress={applyPriceChanges}>
              <Text style={styles.dropdownPrimaryButtonText}>Apply Changes</Text>
            </Pressable>
          </View>
        </View>
      )}

      {showTypeFilter && (
        <View style={styles.dropdownPanel}>
          <View style={styles.dropdownPanelHeader}>
            <Text style={styles.dropdownPanelTitle}>Choose property type</Text>
            <Pressable onPress={() => setShowTypeFilter(false)}>
              <Text style={styles.dropdownPanelLink}>Done</Text>
            </Pressable>
          </View>
          <View style={styles.typeGrid}>
            {propertyTypes.map((type) => {
              const active = selectedType === type.value;
              return (
                <Pressable
                  key={type.value}
                  style={[styles.typeOption, active && styles.typeOptionActive]}
                  onPress={() => setSelectedType(type.value)}
                >
                  <Text style={[styles.typeOptionText, active && styles.typeOptionTextActive]}>{type.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {(appliedPriceMin !== PRICE_MIN || appliedPriceMax !== availablePriceMax || selectedType !== "all") && (
        <View style={styles.activeFilterRow}>
          <Text style={styles.activeFilterLabel}>Active filters</Text>
          <Pressable
            style={styles.clearFilterButton}
            onPress={clearAllFilters}
          >
            <Text style={styles.clearFilterText}>Clear all</Text>
          </Pressable>
        </View>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.topActionRow}>
        <Pressable
          style={[
            styles.topActionButton,
            styles.secondaryActionButton,
            !isMainList && styles.topActionButtonActive,
            !isMainList && styles.secondaryActionButtonActive
          ]}
          onPress={() => navigation.navigate("PropertyList", { viewMode: "mine" })}
          accessibilityRole="button"
        >
          <Text style={[styles.secondaryActionText, !isMainList && styles.secondaryActionTextActive]}>
            My Properties
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.topActionButton,
            styles.secondaryActionButton,
            isMainList && styles.topActionButtonActive,
            isMainList && styles.secondaryActionButtonActive
          ]}
          onPress={() => navigation.navigate("PropertyList", { viewMode: "all" })}
          accessibilityRole="button"
        >
          <Text style={[styles.secondaryActionText, isMainList && styles.secondaryActionTextActive]}>
            All Properties
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={visibleItems}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderPostPropertyAction}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No properties match your filters.</Text>}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchProperties(true)} />
        }
      />

      <AppFooter navigation={navigation} activeRoute="PropertyList" />
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
  pageHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: estavaCore.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: estavaCore.colors.border
  },
  pageHeaderText: {
    flex: 1,
    paddingRight: 8
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: estavaCore.colors.primary
  },
  pageSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: estavaCore.colors.textSecondary
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
  activeFilterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: estavaCore.colors.surface
  },
  activeFilterLabel: {
    color: estavaCore.colors.textSecondary,
    fontSize: 12,
    fontWeight: "600"
  },
  clearFilterButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: estavaCore.colors.surfaceMuted
  },
  clearFilterText: {
    color: estavaCore.colors.primary,
    fontWeight: "700",
    fontSize: 12
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
  dropdownPanel: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: estavaCore.colors.surface,
    borderWidth: 1,
    borderColor: estavaCore.colors.border,
    borderRadius: 12,
    padding: 14,
    maxWidth: '100%',
    ...estavaCore.shadow.card
  },
  dropdownPanelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  dropdownPanelTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: estavaCore.colors.primary
  },
  dropdownPanelLink: {
    color: estavaCore.colors.accent,
    fontWeight: "700",
    fontSize: 13
  },
  dropdownPanelHelper: {
    marginTop: 8,
    fontSize: 12,
    color: estavaCore.colors.textPrimary
  },
  rangeValueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14
  },
  rangeValueLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: estavaCore.colors.textSecondary
  },
  rangeContainer: {
    height: 56,
    justifyContent: "center",
    marginTop: 12,
    overflow: "hidden"
  },
  rangeTrack: {
    height: 4,
    borderRadius: 999,
    backgroundColor: estavaCore.colors.surfaceMuted
  },
  rangeSelection: {
    position: "absolute",
    height: 4,
    borderRadius: 999,
    backgroundColor: estavaCore.colors.accent
  },
  rangeThumb: {
    position: "absolute",
    top: 16,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: estavaCore.colors.surface,
    borderWidth: 2,
    borderColor: estavaCore.colors.accent,
    ...estavaCore.shadow.card
  },
  rangeSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10
  },
  rangeSummaryText: {
    fontSize: 12,
    fontWeight: "700",
    color: estavaCore.colors.primary
  },
  dropdownActionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14
  },
  dropdownSecondaryButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: estavaCore.colors.border,
    backgroundColor: estavaCore.colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center"
  },
  dropdownSecondaryButtonText: {
    color: estavaCore.colors.textPrimary,
    fontWeight: "700",
    fontSize: 13
  },
  dropdownPrimaryButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: estavaCore.colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  dropdownPrimaryButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14
  },
  typeOption: {
    minWidth: "48%",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: estavaCore.colors.border,
    backgroundColor: estavaCore.colors.background,
    alignItems: "center"
  },
  typeOptionActive: {
    borderColor: estavaCore.colors.accent,
    backgroundColor: estavaCore.colors.accentSoft
  },
  typeOptionText: {
    fontSize: 13,
    fontWeight: "600",
    color: estavaCore.colors.textPrimary
  },
  typeOptionTextActive: {
    color: estavaCore.colors.accent,
    fontWeight: "700"
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
  postActionWrap: {
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: estavaCore.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: estavaCore.colors.border
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
  topActionButtonActive: {
    borderColor: estavaCore.colors.accent,
    borderWidth: 1
  },
  primaryActionButton: {
    backgroundColor: estavaCore.colors.primary
  },
  primaryActionButtonActive: {
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
  secondaryActionButtonActive: {
    backgroundColor: estavaCore.colors.accentSoft,
    borderColor: estavaCore.colors.accent
  },
  secondaryActionText: {
    color: estavaCore.colors.textPrimary,
    fontWeight: "700",
    fontSize: 14
  },
  secondaryActionTextActive: {
    color: estavaCore.colors.accent,
    fontWeight: "700"
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12
  },
  card: {
    backgroundColor: estavaCore.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: estavaCore.colors.border,
    overflow: "hidden",
    ...estavaCore.shadow.card
  },
  cardImage: {
    width: "100%",
    height: 152,
    backgroundColor: estavaCore.colors.surfaceMuted
  },
  cardImagePlaceholder: {
    width: "100%",
    height: 152,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: estavaCore.colors.surfaceMuted
  },
  cardImagePlaceholderText: {
    color: estavaCore.colors.textSecondary,
    fontWeight: "600"
  },
  cardContent: {
    paddingVertical: 12,
    paddingHorizontal: 14
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
  metaChips: {
    flexDirection: "row",
    gap: 6
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
  statusChip: {
    fontSize: 12,
    fontWeight: "600",
    color: estavaCore.colors.accent,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: estavaCore.colors.accentSoft,
    borderRadius: 6
  },
  empty: {
    textAlign: "center",
    marginTop: 32,
    fontSize: 16,
    color: "#6b7280"
  }
});
