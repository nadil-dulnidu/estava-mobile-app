// Screen for posting new property listings from the mobile app.
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator
} from "react-native";
import { createProperty } from "../api/propertyApi";

const MAX_FEATURES = 20;
const MAX_FEATURE_LENGTH = 50;

const parseNonNegativeNumber = (value, options = {}) => {
  const { required = false, defaultValue = 0 } = options;
  const normalized = String(value ?? "").trim();

  if (!normalized) {
    return { isValid: !required, value: defaultValue };
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return { isValid: false, value: defaultValue };
  }

  return { isValid: true, value: parsed };
};

const parseFeaturesInput = (value) => {
  const rawFeatures = String(value ?? "")
    .split(",")
    .map((feature) => feature.trim())
    .filter(Boolean);

  const dedupedFeatures = [];
  const seenNormalized = new Set();

  for (const feature of rawFeatures) {
    if (feature.length > MAX_FEATURE_LENGTH) {
      return {
        features: [],
        error: `Each feature must be ${MAX_FEATURE_LENGTH} characters or less.`
      };
    }

    const normalizedKey = feature.toLowerCase();
    if (seenNormalized.has(normalizedKey)) {
      continue;
    }

    seenNormalized.add(normalizedKey);
    dedupedFeatures.push(feature);

    if (dedupedFeatures.length > MAX_FEATURES) {
      return {
        features: [],
        error: `Please provide up to ${MAX_FEATURES} features.`
      };
    }
  }

  return { features: dedupedFeatures, error: "" };
};

export default function CreatePropertyScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [propertyType, setPropertyType] = useState("apartment");
  const [listingStatus, setListingStatus] = useState("available");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [areaSize, setAreaSize] = useState("");
  const [featuresText, setFeaturesText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async () => {
    setError("");

    if (!title.trim() || !description.trim() || !location.trim()) {
      setError("Title, description, and location are required.");
      return;
    }

    const parsedPrice = parseNonNegativeNumber(price, { required: true });
    if (!parsedPrice.isValid) {
      setError("Please enter a valid non-negative price.");
      return;
    }

    const parsedBedrooms = parseNonNegativeNumber(bedrooms);
    if (!parsedBedrooms.isValid) {
      setError("Bedrooms must be a non-negative number.");
      return;
    }

    const parsedBathrooms = parseNonNegativeNumber(bathrooms);
    if (!parsedBathrooms.isValid) {
      setError("Bathrooms must be a non-negative number.");
      return;
    }

    const parsedAreaSize = parseNonNegativeNumber(areaSize);
    if (!parsedAreaSize.isValid) {
      setError("Area size must be a non-negative number.");
      return;
    }

    const { features, error: featuresError } = parseFeaturesInput(featuresText);
    if (featuresError) {
      setError(featuresError);
      return;
    }

    setSubmitting(true);
    try {
      await createProperty({
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        price: parsedPrice.value,
        propertyType,
        listingStatus,
        bedrooms: parsedBedrooms.value,
        bathrooms: parsedBathrooms.value,
        areaSize: parsedAreaSize.value,
        features
      });

      Alert.alert("Success", "Property posted successfully", [
        {
          text: "View Properties",
          onPress: () => navigation.navigate("PropertyList")
        }
      ]);
    } catch (submitError) {
      const message = submitError?.response?.data?.message || "Failed to post property";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Post Property</Text>
      <Text style={styles.subtitle}>Create a listing so buyers can inquire and book visits.</Text>

      {!!error && <Text style={styles.error}>{error}</Text>}

      <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description"
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
      />
      <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} />
      <TextInput
        style={styles.input}
        placeholder="Price"
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
      />

      <Text style={styles.label}>Property Type</Text>
      <View style={styles.row}>
        {[
          { label: "Apartment", value: "apartment" },
          { label: "House", value: "house" },
          { label: "Land", value: "land" },
          { label: "Commercial", value: "commercial" }
        ].map((option) => (
          <Pressable
            key={option.value}
            style={[styles.chip, propertyType === option.value && styles.chipActive]}
            onPress={() => setPropertyType(option.value)}
          >
            <Text style={[styles.chipText, propertyType === option.value && styles.chipTextActive]}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Listing Status</Text>
      <View style={styles.row}>
        {[
          { label: "Available", value: "available" },
          { label: "Rented", value: "rented" },
          { label: "Sold", value: "sold" }
        ].map((option) => (
          <Pressable
            key={option.value}
            style={[styles.chip, listingStatus === option.value && styles.chipActive]}
            onPress={() => setListingStatus(option.value)}
          >
            <Text style={[styles.chipText, listingStatus === option.value && styles.chipTextActive]}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.inlineInputs}>
        <View style={styles.inlineField}>
          <Text style={styles.inputLabel}>Bedrooms</Text>
          <TextInput
            style={[styles.input, styles.inlineInput]}
            placeholder="e.g. 3"
            keyboardType="numeric"
            value={bedrooms}
            onChangeText={setBedrooms}
          />
        </View>
        <View style={styles.inlineField}>
          <Text style={styles.inputLabel}>Bathrooms</Text>
          <TextInput
            style={[styles.input, styles.inlineInput]}
            placeholder="e.g. 2"
            keyboardType="numeric"
            value={bathrooms}
            onChangeText={setBathrooms}
          />
        </View>
      </View>

      <Text style={styles.inputLabel}>Land / Area Size (sqft)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 1200"
        keyboardType="numeric"
        value={areaSize}
        onChangeText={setAreaSize}
      />

      <Text style={styles.inputLabel}>Features (comma-separated)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Parking, Garden, Balcony"
        value={featuresText}
        onChangeText={setFeaturesText}
      />

      <Pressable style={styles.submitButton} onPress={onSubmit} disabled={submitting}>
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>Publish Listing</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa" },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: "800", color: "#111827" },
  subtitle: { marginTop: 6, marginBottom: 16, color: "#4b5563" },
  error: { color: "#b91c1c", marginBottom: 8 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top"
  },
  label: {
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8
  },
  inputLabel: {
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12
  },
  chip: {
    backgroundColor: "#e5e7eb",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12
  },
  chipActive: {
    backgroundColor: "#1d4ed8"
  },
  chipText: {
    color: "#374151",
    fontWeight: "600"
  },
  chipTextActive: {
    color: "#fff"
  },
  inlineInputs: {
    flexDirection: "row",
    gap: 10
  },
  inlineField: {
    flex: 1
  },
  inlineInput: {
    marginBottom: 12
  },
  submitButton: {
    backgroundColor: "#1d4ed8",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 20
  },
  submitText: {
    color: "#fff",
    fontWeight: "700"
  }
});