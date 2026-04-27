// Favorites screen for viewing and managing property wishlist
import React, { useEffect, useRef, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, TextInput } from "react-native";
import { favoriteApi } from "../api/favoriteApi";
import { estavaCore } from "../theme/estavaCore";

const MAX_NOTE_LENGTH = 500;

const getSafeErrorMessage = (err, fallbackMessage) => {
  const apiError = err?.response?.data?.error;
  const apiMessage = err?.response?.data?.message;

  if (typeof apiError === "string" && apiError.trim()) {
    return apiError;
  }

  if (typeof apiMessage === "string" && apiMessage.trim()) {
    return apiMessage;
  }

  return fallbackMessage;
};

export default function FavoritesScreen() {
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

  if (loading) return <ActivityIndicator style={{ marginTop: 20 }} size="large" color={estavaCore.colors.accent} />;

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
          renderItem={({ item }) => {
            const isRowBusy = savingNoteId === item._id || removingFavoriteId === item._id;

            return (
              <View style={styles.card}>
                <Text style={styles.propertyTitle}>{item.propertyId?.title || "Property"}</Text>
                {editingFavoriteId === item._id ? (
                  <>
                    <TextInput
                      style={styles.noteInput}
                      placeholder="Add a note for this favorite"
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
                        style={[
                          styles.actionButton,
                          styles.saveButton,
                          savingNoteId === item._id && styles.disabledButton
                        ]}
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
                  </>
                ) : (
                  <>
                    <Text style={styles.note}>{item.note ? `Note: ${item.note}` : "Note: No note added"}</Text>
                    <View style={styles.actionRow}>
                      <Pressable
                        onPress={() => onStartEditNote(item)}
                        style={[styles.actionButton, styles.editButton, isRowBusy && styles.disabledButton]}
                        disabled={isRowBusy}
                      >
                        <Text style={styles.editText}>Edit Note</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => onRemoveFavorite(item._id)}
                        style={[
                          styles.actionButton,
                          styles.removeButton,
                          removingFavoriteId === item._id && styles.disabledButton
                        ]}
                        disabled={removingFavoriteId === item._id}
                      >
                        {removingFavoriteId === item._id ? (
                          <ActivityIndicator color="#b91c1c" size="small" />
                        ) : (
                          <Text style={styles.removeText}>Remove</Text>
                        )}
                      </Pressable>
                    </View>
                  </>
                )}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: estavaCore.colors.background },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16, color: estavaCore.colors.primary },
  error: { color: estavaCore.colors.danger, marginBottom: 8 },
  emptyText: { textAlign: "center", color: estavaCore.colors.textSecondary, marginTop: 20 },
  card: {
    backgroundColor: estavaCore.colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: estavaCore.colors.border,
    borderLeftWidth: 4,
    borderLeftColor: estavaCore.colors.accent,
    ...estavaCore.shadow.card
  },
  propertyTitle: { fontSize: 16, fontWeight: "600", color: estavaCore.colors.textPrimary },
  note: { fontSize: 12, color: estavaCore.colors.textSecondary, marginTop: 6 },
  noteInput: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: estavaCore.colors.border,
    borderRadius: 8,
    backgroundColor: estavaCore.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 72,
    textAlignVertical: "top"
  },
  noteCount: { marginTop: 6, fontSize: 11, color: estavaCore.colors.textSecondary, textAlign: "right" },
  actionRow: {
    marginTop: 10,
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