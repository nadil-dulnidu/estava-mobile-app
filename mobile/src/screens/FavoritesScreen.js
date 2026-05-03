import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Image
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { favoriteApi } from "../api/favoriteApi";
import { estavaCore } from "../theme/estavaCore";
import { AppFooter } from "../components/AppChrome";
import { normalizeImageUrl } from "../utils/imageUrl";

const MAX_NOTE_LENGTH = 500;

const formatCurrency = (value) => `LKR ${Number(value || 0).toLocaleString()}`;

const getStatusStyle = (status) => {
  switch (String(status).toLowerCase()) {
    case "available":
      return { bg: estavaCore.colors.accentSoft, text: estavaCore.colors.accent };
    case "sold":
      return { bg: estavaCore.colors.dangerSoft, text: estavaCore.colors.danger };
    case "rented":
      return { bg: estavaCore.colors.warningSoft, text: estavaCore.colors.warning };
    default:
      return { bg: estavaCore.colors.surfaceMuted, text: estavaCore.colors.textSecondary };
  }
};

const getSafeErrorMessage = (err, fallbackMessage) => {
  const apiError = err?.response?.data?.error;
  const apiMessage = err?.response?.data?.message;
  if (typeof apiError === "string" && apiError.trim()) return apiError;
  if (typeof apiMessage === "string" && apiMessage.trim()) return apiMessage;
  return fallbackMessage;
};

export default function FavoritesScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingFavoriteId, setEditingFavoriteId] = useState("");
  const [draftNote, setDraftNote] = useState("");
  const [savingNoteId, setSavingNoteId] = useState("");
  const [removingFavoriteId, setRemovingFavoriteId] = useState("");
  const savingNoteLocksRef = useRef(new Set());
  const removingFavoriteLocksRef = useRef(new Set());

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
      setError(getSafeErrorMessage(err, "Failed to load favorites"));
    } finally {
      setLoading(false);
    }
  };

  const onRemoveFavorite = async (favoriteId) => {
    const normalizedFavoriteId = String(favoriteId || "").trim();
    if (!normalizedFavoriteId || removingFavoriteLocksRef.current.has(normalizedFavoriteId)) {
      return;
    }

    removingFavoriteLocksRef.current.add(normalizedFavoriteId);
    setRemovingFavoriteId(normalizedFavoriteId);
    setError("");

    try {
      await favoriteApi.removeFavorite(normalizedFavoriteId);
      setFavorites((currentFavorites) =>
        currentFavorites.filter((favorite) => favorite._id !== normalizedFavoriteId)
      );
    } catch (err) {
      setError(getSafeErrorMessage(err, "Failed to remove favorite"));
    } finally {
      removingFavoriteLocksRef.current.delete(normalizedFavoriteId);
      setRemovingFavoriteId("");
    }
  };

  const onStartEditNote = (favorite) => {
    if (savingNoteLocksRef.current.has(favorite._id) || removingFavoriteLocksRef.current.has(favorite._id)) {
      return;
    }
    setEditingFavoriteId(favorite._id);
    setDraftNote(favorite.note || "");
    setError("");
  };

  const onCancelEditNote = () => {
    setEditingFavoriteId("");
    setDraftNote("");
  };

  const onSaveNote = async (favoriteId) => {
    const normalizedFavoriteId = String(favoriteId || "").trim();
    if (!normalizedFavoriteId || savingNoteLocksRef.current.has(normalizedFavoriteId)) {
      return;
    }

    const normalizedNote = draftNote.trim();

    if (normalizedNote.length > MAX_NOTE_LENGTH) {
      setError(`Note must be ${MAX_NOTE_LENGTH} characters or less`);
      return;
    }

    savingNoteLocksRef.current.add(normalizedFavoriteId);
    setSavingNoteId(normalizedFavoriteId);
    setError("");

    try {
      const response = await favoriteApi.updateFavoriteNote(normalizedFavoriteId, normalizedNote);
      const updatedFavorite = response?.data?.data;

      setFavorites((currentFavorites) =>
        currentFavorites.map((favorite) => {
          if (favorite._id !== normalizedFavoriteId) return favorite;
          return {
            ...favorite,
            note: updatedFavorite?.note ?? normalizedNote
          };
        })
      );

      setEditingFavoriteId("");
      setDraftNote("");
    } catch (err) {
      setError(getSafeErrorMessage(err, "Failed to update note"));
    } finally {
      savingNoteLocksRef.current.delete(normalizedFavoriteId);
      setSavingNoteId("");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={estavaCore.colors.accent} />
        </View>
        <AppFooter navigation={navigation} activeRoute="Favorites" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>My Favorites</Text>
        <Text style={styles.pageSubtitle}>Properties you have saved for later</Text>
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No favorites yet</Text>
          <Text style={styles.emptySubtext}>Browse properties and tap the heart icon to save them here</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const property = item.propertyId;
            const isRowBusy = savingNoteId === item._id || removingFavoriteId === item._id;
            const statusStyle = getStatusStyle(property?.listingStatus);

            return (
              <Pressable
                style={styles.card}
                onPress={() => property?._id && navigation.navigate("PropertyDetail", { propertyId: property._id })}
                accessibilityRole="button"
                accessibilityLabel={property?.title || "Property"}
              >
                {Array.isArray(property?.imageUrls) && property.imageUrls[0] ? (
                  <Image source={{ uri: normalizeImageUrl(property.imageUrls[0]) }} style={styles.cardImage} />
                ) : (
                  <View style={styles.cardImagePlaceholder}>
                    <Text style={styles.cardImagePlaceholderText}>No image</Text>
                  </View>
                )}

                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.propertyTitle} numberOfLines={1}>
                      {property?.title || "Property"}
                    </Text>
                    <View style={[styles.statusChip, { backgroundColor: statusStyle.bg }]}>
                      <Text style={[styles.statusChipText, { color: statusStyle.text }]}>
                        {String(property?.listingStatus || "available")}
                      </Text>
                    </View>
                  </View>

                  {!!property?.location && (
                    <Text style={styles.location} numberOfLines={1}>{property.location}</Text>
                  )}

                  <View style={styles.detailsRow}>
                    {property?.price != null && (
                      <Text style={styles.price}>{formatCurrency(property.price)}</Text>
                    )}
                    <View style={styles.metaChips}>
                      {!!property?.propertyType && (
                        <Text style={styles.typeChip}>{property.propertyType}</Text>
                      )}
                      {property?.bedrooms != null && (
                        <Text style={styles.metaText}>{property.bedrooms} bed</Text>
                      )}
                      {property?.bathrooms != null && (
                        <Text style={styles.metaText}>{property.bathrooms} bath</Text>
                      )}
                    </View>
                  </View>

                  {editingFavoriteId === item._id ? (
                    <View style={styles.noteSection}>
                      <TextInput
                        style={styles.noteInput}
                        placeholder="Add a note for this favorite"
                        placeholderTextColor={estavaCore.colors.textSecondary}
                        multiline
                        numberOfLines={3}
                        maxLength={MAX_NOTE_LENGTH}
                        value={draftNote}
                        onChangeText={setDraftNote}
                      />
                      <Text style={styles.noteCount}>{draftNote.length}/{MAX_NOTE_LENGTH}</Text>
                      <View style={styles.actionRow}>
                        <Pressable
                          onPress={() => onSaveNote(item._id)}
                          style={[styles.actionButton, styles.saveButton, savingNoteId === item._id && styles.disabledButton]}
                          disabled={savingNoteId === item._id}
                        >
                          {savingNoteId === item._id ? (
                            <ActivityIndicator color="#fff" size="small" />
                          ) : (
                            <Text style={styles.saveText}>Save Note</Text>
                          )}
                        </Pressable>
                        <Pressable
                          onPress={onCancelEditNote}
                          style={[styles.actionButton, styles.cancelButton]}
                          disabled={savingNoteId === item._id}
                        >
                          <Text style={styles.cancelText}>Cancel</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.noteSection}>
                      {!!item.note && <Text style={styles.note} numberOfLines={2}>{item.note}</Text>}
                      <View style={styles.actionRow}>
                        <Pressable
                          onPress={() => onStartEditNote(item)}
                          style={[styles.actionButton, styles.editButton, isRowBusy && styles.disabledButton]}
                          disabled={isRowBusy}
                        >
                          <Text style={styles.editText}>{item.note ? "Edit Note" : "Add Note"}</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => onRemoveFavorite(item._id)}
                          style={[styles.actionButton, styles.removeButton, removingFavoriteId === item._id && styles.disabledButton]}
                          disabled={removingFavoriteId === item._id}
                        >
                          {removingFavoriteId === item._id ? (
                            <ActivityIndicator color="#b91c1c" size="small" />
                          ) : (
                            <Text style={styles.removeText}>Remove</Text>
                          )}
                        </Pressable>
                      </View>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          }}
        />
      )}

      <AppFooter navigation={navigation} activeRoute="Favorites" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: estavaCore.colors.background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  pageHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: estavaCore.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: estavaCore.colors.border
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
  error: {
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: estavaCore.colors.dangerSoft,
    color: estavaCore.colors.danger,
    borderRadius: 6,
    borderLeftWidth: 2,
    borderLeftColor: estavaCore.colors.danger,
    fontSize: 13
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32
  },
  emptyText: {
    fontSize: 17,
    fontWeight: "700",
    color: estavaCore.colors.textPrimary
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: estavaCore.colors.textSecondary,
    textAlign: "center"
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8
  },
  propertyTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: estavaCore.colors.primary
  },
  statusChip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize"
  },
  location: {
    marginTop: 4,
    fontSize: 13,
    color: estavaCore.colors.textSecondary
  },
  detailsRow: {
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
  metaChips: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center"
  },
  typeChip: {
    fontSize: 12,
    fontWeight: "600",
    color: estavaCore.colors.textSecondary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: estavaCore.colors.surfaceMuted,
    borderRadius: 6
  },
  metaText: {
    fontSize: 12,
    fontWeight: "600",
    color: estavaCore.colors.textSecondary
  },
  noteSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopColor: estavaCore.colors.border,
    borderTopWidth: 1
  },
  note: {
    fontSize: 13,
    color: estavaCore.colors.textSecondary,
    fontStyle: "italic",
    marginBottom: 8
  },
  noteInput: {
    borderWidth: 1,
    borderColor: estavaCore.colors.border,
    borderRadius: 8,
    backgroundColor: estavaCore.colors.background,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 72,
    textAlignVertical: "top"
  },
  noteCount: {
    marginTop: 6,
    fontSize: 11,
    color: estavaCore.colors.textSecondary,
    textAlign: "right"
  },
  actionRow: {
    marginTop: 8,
    flexDirection: "row",
    gap: 8
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  saveButton: { backgroundColor: estavaCore.colors.primary },
  saveText: { color: "#fff", fontWeight: "600" },
  cancelButton: { backgroundColor: estavaCore.colors.surfaceMuted },
  cancelText: { color: estavaCore.colors.textPrimary, fontWeight: "600" },
  editButton: { backgroundColor: estavaCore.colors.accentSoft },
  editText: { color: estavaCore.colors.accent, fontWeight: "600" },
  removeButton: { backgroundColor: estavaCore.colors.dangerSoft },
  removeText: { color: estavaCore.colors.danger, fontWeight: "600" },
  disabledButton: { opacity: 0.7 }
});