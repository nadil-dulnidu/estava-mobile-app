// Favorites screen for viewing and managing property wishlist
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { favoriteApi } from "../api/favoriteApi";
import { useAuth } from "../context/AuthContext";

export default function FavoritesScreen() {
  const { token } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await favoriteApi.getFavorites();
      setFavorites(response.data.data || []);
    } catch (err) {
      setError(err.message || "Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  const onRemoveFavorite = async (favoriteId) => {
    try {
      await favoriteApi.removeFavorite(favoriteId);
      setFavorites(favorites.filter((f) => f._id !== favoriteId));
    } catch (err) {
      setError("Failed to remove favorite");
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 20 }} size="large" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Favorites</Text>
      {!!error && <Text style={styles.error}>{error}</Text>}
      {favorites.length === 0 ? (
        <Text style={styles.emptyText}>No favorites yet</Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.propertyTitle}>{item.propertyId?.title || "Property"}</Text>
              {item.note && <Text style={styles.note}>Note: {item.note}</Text>}
              <Pressable onPress={() => onRemoveFavorite(item._id)} style={styles.removeButton}>
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f7fa" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16, color: "#1f2937" },
  error: { color: "#b91c1c", marginBottom: 8 },
  emptyText: { textAlign: "center", color: "#6b7280", marginTop: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#1d4ed8"
  },
  propertyTitle: { fontSize: 16, fontWeight: "600" },
  note: { fontSize: 12, color: "#6b7280", marginTop: 4 },
  removeButton: { marginTop: 8, paddingVertical: 6, alignItems: "center" },
  removeText: { color: "#b91c1c", fontWeight: "600" }
});