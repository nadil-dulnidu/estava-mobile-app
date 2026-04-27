// Screen for owners to quickly browse and edit their own property listings.
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import { getMyProperties } from "../api/propertyApi";
import { estavaCore } from "../theme/estavaCore";

const resolveOwnerId = (entity) => {
  if (!entity) return "";
  if (typeof entity === "string") return entity;
  return entity._id || entity.id || "";
};

export default function MyPropertiesScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchMyProperties = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      setError("");
      const result = await getMyProperties({ page: 1, limit: 50 });
      setItems(Array.isArray(result?.items) ? result.items : []);
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || "Failed to load your properties");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMyProperties();
  }, [fetchMyProperties]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={estavaCore.colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.headerRow}>
        <Text style={styles.subtitle}>Quick access to your own listings.</Text>
        <Pressable style={styles.backButton} onPress={() => navigation.navigate("PropertyList")}>
          <Text style={styles.backButtonText}>Browse All</Text>
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchMyProperties(true)} />}
        ListEmptyComponent={<Text style={styles.empty}>You have not posted any properties yet.</Text>}
        renderItem={({ item }) => {
          const ownerId = resolveOwnerId(item?.createdBy);
          const isOwnerItem = Boolean(ownerId);

          return (
            <Pressable
              style={styles.card}
              onPress={() => navigation.navigate("PropertyDetail", { propertyId: item._id })}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleBlock}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.meta}>{item.location}</Text>
                </View>
                {isOwnerItem ? <Text style={styles.ownerBadge}>Owner</Text> : null}
              </View>
              <Text style={styles.price}>LKR {Number(item.price || 0).toLocaleString()}</Text>
              <Text style={styles.meta}>Status: {item.listingStatus}</Text>

              <View style={styles.actionsRow}>
                <Pressable
                  style={styles.editButton}
                  onPress={() => navigation.navigate("EditProperty", { propertyId: item._id })}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </Pressable>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: estavaCore.colors.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: estavaCore.colors.background },
  error: { marginHorizontal: 16, marginTop: 16, color: estavaCore.colors.danger },
  headerRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4
  },
  subtitle: { color: estavaCore.colors.textSecondary, marginBottom: 10 },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: estavaCore.colors.surfaceMuted,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14
  },
  backButtonText: { color: estavaCore.colors.textPrimary, fontWeight: "700" },
  listContent: { padding: 16, gap: 12 },
  card: {
    backgroundColor: estavaCore.colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: estavaCore.colors.border,
    ...estavaCore.shadow.card
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  cardTitleBlock: { flex: 1, paddingRight: 10 },
  title: { fontSize: 16, fontWeight: "700", color: estavaCore.colors.textPrimary },
  meta: { marginTop: 4, color: estavaCore.colors.textSecondary },
  price: { marginTop: 8, fontSize: 16, fontWeight: "700", color: estavaCore.colors.accent },
  ownerBadge: {
    backgroundColor: estavaCore.colors.accentSoft,
    color: estavaCore.colors.accent,
    fontWeight: "700",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    overflow: "hidden"
  },
  actionsRow: { marginTop: 12, flexDirection: "row", gap: 10 },
  editButton: {
    backgroundColor: estavaCore.colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center"
  },
  editButtonText: { color: "#fff", fontWeight: "700" },
  empty: { textAlign: "center", marginTop: 24, color: estavaCore.colors.textSecondary }
});
