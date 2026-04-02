// Screen component for user-facing workflow in the real-estate mobile app.
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image } from "react-native";
import { getPropertyById } from "../api/propertyApi";

export default function PropertyDetailScreen({ route }) {
  const { propertyId } = route.params;
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        const result = await getPropertyById(propertyId);
        setProperty(result);
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || "Failed to load property details");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [propertyId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1d4ed8" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!property) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Property not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{property.title}</Text>
      <Text style={styles.location}>{property.location}</Text>
      <Text style={styles.price}>LKR {Number(property.price || 0).toLocaleString()}</Text>
      <Text style={styles.status}>Status: {property.listingStatus}</Text>

      {Array.isArray(property.imageUrls) && property.imageUrls.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
          {property.imageUrls.map((url) => (
            <Image key={url} source={{ uri: url }} style={styles.image} />
          ))}
        </ScrollView>
      ) : null}

      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.body}>{property.description}</Text>

      <Text style={styles.sectionTitle}>Details</Text>
      <Text style={styles.body}>Type: {property.propertyType}</Text>
      <Text style={styles.body}>Bedrooms: {property.bedrooms ?? 0}</Text>
      <Text style={styles.body}>Bathrooms: {property.bathrooms ?? 0}</Text>
      <Text style={styles.body}>Area Size: {property.areaSize ?? 0}</Text>

      {Array.isArray(property.features) && property.features.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Features</Text>
          <Text style={styles.body}>{property.features.join(", ")}</Text>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa"
  },
  content: {
    padding: 16
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fa",
    padding: 16
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827"
  },
  location: {
    marginTop: 8,
    color: "#4b5563"
  },
  price: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: "800",
    color: "#1d4ed8"
  },
  status: {
    marginTop: 8,
    color: "#4b5563"
  },
  imageRow: {
    marginTop: 16
  },
  image: {
    width: 220,
    height: 140,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: "#d1d5db"
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "700",
    color: "#111827"
  },
  body: {
    color: "#374151",
    lineHeight: 22
  },
  error: {
    color: "#b91c1c",
    textAlign: "center"
  }
});