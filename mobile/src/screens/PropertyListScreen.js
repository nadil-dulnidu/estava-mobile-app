// Screen component for user-facing workflow in the real-estate mobile app.
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import { getMyProperties, getProperties } from "../api/propertyApi";
import { useAuth } from "../context/AuthContext";

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

export default function PropertyListScreen({ navigation }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const currentUserId = resolveUserId(user);

  const fetchProperties = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      setError("");
      const [publicResult, mineResult] = await Promise.all([
        getProperties({ page: 1, limit: 20 }),
        getMyProperties({ page: 1, limit: 20 }).catch(() => ({ items: [] }))
      ]);

      const mergedItems = dedupeProperties([
        ...(publicResult?.items || []),
        ...(mineResult?.items || [])
      ]);

      const visibleItems = mergedItems.filter((item) => {
        const listingStatus = String(item?.listingStatus || "").toLowerCase();
        if (listingStatus !== "delisted") {
          return true;
        }

        const ownerId = resolveUserId(item?.createdBy);
        return Boolean(ownerId) && String(ownerId) === String(currentUserId);
      });

      setItems(visibleItems);
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || "Failed to load properties");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const renderItem = ({ item }) => (
    <Pressable
      style={styles.card}
      onPress={() => navigation.navigate("PropertyDetail", { propertyId: item._id })}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.meta}>{item.location}</Text>
      <Text style={styles.price}>LKR {Number(item.price || 0).toLocaleString()}</Text>
      <Text style={styles.meta}>Status: {item.listingStatus}</Text>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1d4ed8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.topActionRow}>
        <Pressable style={[styles.topActionButton, styles.secondaryActionButton]} onPress={() => navigation.navigate("MyProperties")}>
          <Text style={styles.secondaryActionText}>My Properties</Text>
        </Pressable>
        <Pressable style={[styles.topActionButton, styles.primaryActionButton]} onPress={() => navigation.navigate("CreateProperty")}>
          <Text style={styles.primaryActionText}>Post your own property</Text>
        </Pressable>
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No properties available yet.</Text>}
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
    backgroundColor: "#f5f7fa"
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fa"
  },
  listContent: {
    padding: 16,
    gap: 12
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb"
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827"
  },
  meta: {
    marginTop: 4,
    color: "#4b5563"
  },
  price: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "700",
    color: "#1d4ed8"
  },
  empty: {
    textAlign: "center",
    marginTop: 24,
    color: "#6b7280"
  },
  error: {
    marginHorizontal: 16,
    marginTop: 16,
    color: "#b91c1c"
  },
  topActionRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 2
  },
  topActionButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center"
  },
  primaryActionButton: {
    backgroundColor: "#1d4ed8"
  },
  primaryActionText: {
    color: "#ffffff",
    fontWeight: "700"
  },
  secondaryActionButton: {
    backgroundColor: "#e5e7eb"
  },
  secondaryActionText: {
    color: "#374151",
    fontWeight: "700"
  }
});