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
  ActivityIndicator,
  Image
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { createProperty } from "../api/propertyApi";
import { estavaCore } from "../theme/estavaCore";

const MAX_FEATURES = 20;
const MAX_FEATURE_LENGTH = 50;
const MAX_IMAGES = 8;

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
  const [selectedImages, setSelectedImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onPickImages = async () => {
    setError("");

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      setError("Media library permission is required to upload property images.");
      return;
    }

    const selectionRemaining = MAX_IMAGES - selectedImages.length;
    if (selectionRemaining <= 0) {
      setError(`You can upload up to ${MAX_IMAGES} images.`);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.85,
      selectionLimit: selectionRemaining
    });

    if (result.canceled || !Array.isArray(result.assets)) {
      return;
    }

    const nextImages = [...selectedImages, ...result.assets].slice(0, MAX_IMAGES);
    setSelectedImages(nextImages);
  };

  const onRemoveImage = (uri) => {
    setSelectedImages((current) => current.filter((image) => image.uri !== uri));
  };

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
        features,
        images: selectedImages
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
      <Text style={styles.kicker}>Estava Real Estate</Text>
      <Text style={styles.title}>Post Property</Text>
      <Text style={styles.subtitle}>Create a listing so buyers can inquire and book visits.</Text>

      {!!error && <Text style={styles.error}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Title"
        placeholderTextColor={estavaCore.colors.textSecondary}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description"
        placeholderTextColor={estavaCore.colors.textSecondary}
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Location"
        placeholderTextColor={estavaCore.colors.textSecondary}
        value={location}
        onChangeText={setLocation}
      />
      <TextInput
        style={styles.input}
        placeholder="Price"
        placeholderTextColor={estavaCore.colors.textSecondary}
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
            placeholderTextColor={estavaCore.colors.textSecondary}
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
            placeholderTextColor={estavaCore.colors.textSecondary}
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
        placeholderTextColor={estavaCore.colors.textSecondary}
        keyboardType="numeric"
        value={areaSize}
        onChangeText={setAreaSize}
      />

      <Text style={styles.inputLabel}>Features (comma-separated)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Parking, Garden, Balcony"
        placeholderTextColor={estavaCore.colors.textSecondary}
        value={featuresText}
        onChangeText={setFeaturesText}
      />

      <Text style={styles.inputLabel}>Property Images</Text>
      <Text style={styles.helperText}>Upload up to {MAX_IMAGES} JPG/PNG/WEBP images.</Text>
      <Pressable style={styles.pickImageButton} onPress={onPickImages}>
        <Text style={styles.pickImageButtonText}>Choose Images ({selectedImages.length}/{MAX_IMAGES})</Text>
      </Pressable>

      {selectedImages.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreviewRow}>
          {selectedImages.map((image) => (
            <View key={image.uri} style={styles.previewCard}>
              <Image source={{ uri: image.uri }} style={styles.previewImage} />
              <Pressable style={styles.removeImageButton} onPress={() => onRemoveImage(image.uri)}>
                <Text style={styles.removeImageButtonText}>Remove</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      ) : null}

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
  container: { flex: 1, backgroundColor: estavaCore.colors.background },
  content: { padding: 16 },
  kicker: {
    color: estavaCore.colors.accent,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 6
  },
  title: { fontSize: 24, fontWeight: "800", color: estavaCore.colors.primary },
  subtitle: { marginTop: 6, marginBottom: 16, color: estavaCore.colors.textSecondary },
  error: { color: estavaCore.colors.danger, marginBottom: 8 },
  input: {
    backgroundColor: estavaCore.colors.surface,
    borderWidth: 1,
    borderColor: estavaCore.colors.border,
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
    color: estavaCore.colors.textPrimary,
    marginBottom: 8
  },
  inputLabel: {
    fontWeight: "600",
    color: estavaCore.colors.textSecondary,
    marginBottom: 6
  },
  helperText: {
    color: estavaCore.colors.textSecondary,
    marginBottom: 8,
    fontSize: 12
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12
  },
  chip: {
    backgroundColor: estavaCore.colors.surfaceMuted,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12
  },
  chipActive: {
    backgroundColor: estavaCore.colors.primary
  },
  chipText: {
    color: estavaCore.colors.textSecondary,
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
  pickImageButton: {
    backgroundColor: estavaCore.colors.accentSoft,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 10
  },
  pickImageButtonText: {
    color: estavaCore.colors.accent,
    fontWeight: "700"
  },
  imagePreviewRow: {
    marginBottom: 14
  },
  previewCard: {
    marginRight: 10,
    width: 130
  },
  previewImage: {
    width: 130,
    height: 88,
    borderRadius: 10,
    backgroundColor: estavaCore.colors.surfaceMuted
  },
  removeImageButton: {
    marginTop: 6,
    backgroundColor: estavaCore.colors.dangerSoft,
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: "center"
  },
  removeImageButtonText: {
    color: estavaCore.colors.danger,
    fontWeight: "600",
    fontSize: 12
  },
  submitButton: {
    backgroundColor: estavaCore.colors.primary,
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