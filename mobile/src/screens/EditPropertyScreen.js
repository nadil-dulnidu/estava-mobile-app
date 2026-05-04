// Screen for owners to edit all property fields, manage photos, update status, and delete listings.
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  Image
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { deleteProperty, getPropertyById, updateProperty } from "../api/propertyApi";
import { estavaCore } from "../theme/estavaCore";

const MAX_FEATURES = 20;
const MAX_FEATURE_LENGTH = 50;
const MAX_NEW_IMAGES = 8;

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

const normalizeUrl = (url) => String(url || "");

export default function EditPropertyScreen({ route, navigation }) {
  const { propertyId } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [property, setProperty] = useState(null);

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
  const [existingImages, setExistingImages] = useState([]);
  const [removedImageUrls, setRemovedImageUrls] = useState([]);
  const [newImages, setNewImages] = useState([]);

  const remainingNewImageSlots = useMemo(() => Math.max(0, MAX_NEW_IMAGES - newImages.length), [newImages.length]);

  useEffect(() => {
    const loadProperty = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await getPropertyById(propertyId);
        setProperty(result);
        setTitle(result?.title || "");
        setDescription(result?.description || "");
        setLocation(result?.location || "");
        setPrice(String(result?.price ?? ""));
        setPropertyType(result?.propertyType || "apartment");
        setListingStatus(result?.listingStatus || "available");
        setBedrooms(String(result?.bedrooms ?? ""));
        setBathrooms(String(result?.bathrooms ?? ""));
        setAreaSize(String(result?.areaSize ?? ""));
        setFeaturesText(Array.isArray(result?.features) ? result.features.join(", ") : "");
        setExistingImages(Array.isArray(result?.imageUrls) ? result.imageUrls : []);
        setRemovedImageUrls([]);
        setNewImages([]);
      } catch (loadError) {
        setError(loadError?.response?.data?.message || "Failed to load property");
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [propertyId]);

  const handlePickImages = async () => {
    setError("");

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Media library permission is required to add property images.");
      return;
    }

    if (remainingNewImageSlots <= 0) {
      setError(`You can add up to ${MAX_NEW_IMAGES} new images at a time.`);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.85,
      selectionLimit: remainingNewImageSlots
    });

    if (result.canceled || !Array.isArray(result.assets)) {
      return;
    }

    const next = [...newImages];
    result.assets.forEach((asset) => {
      if (!asset?.uri) return;
      if (next.some((image) => image.uri === asset.uri)) return;
      next.push(asset);
    });

    setNewImages(next.slice(0, MAX_NEW_IMAGES));
  };

  const toggleExistingImageRemoval = (url) => {
    const normalized = normalizeUrl(url);
    setRemovedImageUrls((current) => {
      if (current.includes(normalized)) {
        return current.filter((item) => item !== normalized);
      }
      return [...current, normalized];
    });
  };

  const removeNewImage = (uri) => {
    setNewImages((current) => current.filter((image) => image.uri !== uri));
  };

  const handleDelete = () => {
    Alert.alert("Delete Listing", "Are you sure you want to delete this property listing?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeleting(true);
          try {
            await deleteProperty(propertyId);
            Alert.alert("Success", "Property deleted successfully", [
              { text: "OK", onPress: () => navigation.navigate("MyProperties") }
            ]);
          } catch (deleteError) {
            Alert.alert("Error", deleteError?.response?.data?.message || "Failed to delete property");
          } finally {
            setDeleting(false);
          }
        }
      }
    ]);
  };

  const handleSave = async () => {
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

    setSaving(true);
    try {
      const updated = await updateProperty(propertyId, {
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
        images: newImages,
        removeImageUrls: removedImageUrls
      });
      setProperty(updated);
      Alert.alert("Success", "Property updated successfully", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (saveError) {
      setError(saveError?.response?.data?.message || "Failed to update property");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1d4ed8" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Edit Property</Text>
      <Text style={styles.subtitle}>Update any property details, manage photos, change status, or delete the listing.</Text>

      <Text style={styles.kicker}>Estava Real Estate</Text>
      {!!error && <Text style={styles.error}>{error}</Text>}

      <Text style={styles.sectionTitle}>Property Status</Text>
      <View style={styles.statusChipRow}>
        {["available", "rented", "delisted", "sold"].map((statusOption) => (
          <Pressable
            key={statusOption}
            style={[styles.statusChip, listingStatus === statusOption && styles.statusChipActive]}
            onPress={() => setListingStatus(statusOption)}
          >
            <Text style={[styles.statusChipText, listingStatus === statusOption && styles.statusChipTextActive]}>
              {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.inputLabel}>Title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Title" />

      <Text style={styles.inputLabel}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Description"
        multiline
        numberOfLines={4}
      />

      <Text style={styles.inputLabel}>Location</Text>
      <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Location" />

      <Text style={styles.inputLabel}>Price</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        placeholder="Price"
        keyboardType="numeric"
      />

      <Text style={styles.inputLabel}>Property Type</Text>
      <View style={styles.row}>
        {[
          { label: "Apartment", value: "apartment" },
          { label: "House", value: "house" },
          { label: "Land", value: "land" },
          { label: "Commercial", value: "commercial" },
          { label: "Villa", value: "villa" }
        ].map((option) => (
          <Pressable
            key={option.value}
            style={[styles.chip, propertyType === option.value && styles.chipActive]}
            onPress={() => setPropertyType(option.value)}
          >
            <Text style={[styles.chipText, propertyType === option.value && styles.chipTextActive]}>{option.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.inlineInputs}>
        <View style={styles.inlineField}>
          <Text style={styles.inputLabel}>Bedrooms</Text>
          <TextInput
            style={[styles.input, styles.inlineInput]}
            value={bedrooms}
            onChangeText={setBedrooms}
            placeholder="e.g. 3"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inlineField}>
          <Text style={styles.inputLabel}>Bathrooms</Text>
          <TextInput
            style={[styles.input, styles.inlineInput]}
            value={bathrooms}
            onChangeText={setBathrooms}
            placeholder="e.g. 2"
            keyboardType="numeric"
          />
        </View>
      </View>

      <Text style={styles.inputLabel}>Area Size (sqft)</Text>
      <TextInput
        style={styles.input}
        value={areaSize}
        onChangeText={setAreaSize}
        placeholder="e.g. 1200"
        keyboardType="numeric"
      />

      <Text style={styles.inputLabel}>Features (comma-separated)</Text>
      <TextInput
        style={styles.input}
        value={featuresText}
        onChangeText={setFeaturesText}
        placeholder="Parking, Garden, Balcony"
      />

      <Text style={styles.sectionTitle}>Photos</Text>
      <Text style={styles.helperText}>Tap remove on any photo you want hidden after saving. Add more photos below.</Text>

      {existingImages.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
          {existingImages.map((url) => {
            const isRemoved = removedImageUrls.includes(normalizeUrl(url));
            return (
              <View key={url} style={styles.previewCard}>
                <Image source={{ uri: url }} style={[styles.previewImage, isRemoved && styles.removedPreviewImage]} />
                <Pressable style={[styles.removePhotoButton, isRemoved && styles.removePhotoButtonActive]} onPress={() => toggleExistingImageRemoval(url)}>
                  <Text style={styles.removePhotoButtonText}>{isRemoved ? "Undo Remove" : "Remove"}</Text>
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <Text style={styles.emptyPhotosText}>No photos uploaded yet.</Text>
      )}

      {newImages.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
          {newImages.map((image) => (
            <View key={image.uri} style={styles.previewCard}>
              <Image source={{ uri: image.uri }} style={styles.previewImage} />
              <Pressable style={styles.removePhotoButton} onPress={() => removeNewImage(image.uri)}>
                <Text style={styles.removePhotoButtonText}>Remove New</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      ) : null}

      <Pressable style={styles.pickImageButton} onPress={handlePickImages}>
        <Text style={styles.pickImageButtonText}>Add More Photos ({newImages.length}/{MAX_NEW_IMAGES})</Text>
      </Pressable>

      <Pressable style={[styles.saveButton, saving && styles.disabledButton]} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
      </Pressable>

      <Pressable style={[styles.deleteButton, deleting && styles.disabledButton]} onPress={handleDelete} disabled={deleting}>
        <Text style={styles.deleteButtonText}>{deleting ? "Deleting..." : "Delete Listing"}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: estavaCore.colors.background },
  content: { padding: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: estavaCore.colors.background },
  title: { fontSize: 24, fontWeight: "800", color: estavaCore.colors.primary },
  subtitle: { marginTop: 6, marginBottom: 16, color: estavaCore.colors.textSecondary },
  error: { color: estavaCore.colors.danger, marginBottom: 8 },
  sectionTitle: { marginTop: 14, marginBottom: 8, fontSize: 16, fontWeight: "700", color: estavaCore.colors.primary },
  helperText: { color: estavaCore.colors.textSecondary, marginBottom: 8, fontSize: 12 },
  inputLabel: { fontWeight: "600", color: estavaCore.colors.textSecondary, marginBottom: 6 },
  input: {
    backgroundColor: estavaCore.colors.surface,
    borderWidth: 1,
    borderColor: estavaCore.colors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12
  },
  textArea: { minHeight: 100, textAlignVertical: "top" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  chip: { backgroundColor: estavaCore.colors.surfaceMuted, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 12 },
  chipActive: { backgroundColor: estavaCore.colors.primary },
  chipText: { color: estavaCore.colors.textSecondary, fontWeight: "600" },
  chipTextActive: { color: "#fff" },
  inlineInputs: { flexDirection: "row", gap: 10 },
  inlineField: { flex: 1 },
  inlineInput: { marginBottom: 12 },
  statusChipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  statusChip: { backgroundColor: estavaCore.colors.surfaceMuted, borderRadius: 16, paddingVertical: 7, paddingHorizontal: 12 },
  statusChipActive: { backgroundColor: estavaCore.colors.primary },
  statusChipText: { color: estavaCore.colors.textSecondary, fontWeight: "600" },
  statusChipTextActive: { color: "#ffffff" },
  imageRow: { marginBottom: 12 },
  previewCard: { width: 140, marginRight: 10 },
  previewImage: { width: 140, height: 95, borderRadius: 12, backgroundColor: estavaCore.colors.surfaceMuted },
  removedPreviewImage: { opacity: 0.35 },
  removePhotoButton: {
    marginTop: 6,
    backgroundColor: estavaCore.colors.dangerSoft,
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: "center"
  },
  removePhotoButtonActive: { backgroundColor: estavaCore.colors.surfaceMuted },
  removePhotoButtonText: { color: estavaCore.colors.danger, fontWeight: "700", fontSize: 12 },
  emptyPhotosText: { color: estavaCore.colors.textSecondary, marginBottom: 12 },
  pickImageButton: {
    backgroundColor: estavaCore.colors.accentSoft,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 12
  },
  pickImageButtonText: { color: estavaCore.colors.accent, fontWeight: "700" },
  saveButton: {
    backgroundColor: estavaCore.colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12
  },
  saveButtonText: { color: "#fff", fontWeight: "700" },
  deleteButton: {
    backgroundColor: estavaCore.colors.dangerSoft,
    borderColor: estavaCore.colors.danger,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 20
  },
  deleteButtonText: { color: estavaCore.colors.danger, fontWeight: "700" },
  disabledButton: { opacity: 0.6 }
});
