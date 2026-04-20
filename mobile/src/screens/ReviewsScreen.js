// Reviews screen for viewing and submitting property and agent reviews
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
  Alert
} from "react-native";
import { reviewApi } from "../api/reviewApi";
import { getProperties } from "../api/propertyApi";

export default function ReviewsScreen({ route, navigation }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [propertySelectMode, setPropertySelectMode] = useState(false);
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState("5");
  const [editComment, setEditComment] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const preselectedProperty = route?.params?.preselectedProperty;

  useEffect(() => {
    loadReviews();
    loadProperties();
  }, []);

  useEffect(() => {
    if (!preselectedProperty?._id) {
      return;
    }

    setSelectedProperty({
      _id: preselectedProperty._id,
      title: preselectedProperty.title || "Selected Property",
      price: Number(preselectedProperty.price || 0)
    });
    setModalVisible(true);
    setPropertySelectMode(true);
    setRating("5");
    setComment("");
    setSubmitError("");
    navigation.setParams({ preselectedProperty: undefined });
  }, [navigation, preselectedProperty]);

  const loadReviews = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await reviewApi.getMyReviews();
      setReviews(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const loadProperties = async () => {
    try {
      const result = await getProperties();
      setProperties(result?.items || []);
    } catch (err) {
      console.log("Failed to load properties:", err.message);
      setProperties([]);
    }
  };

  const onSubmitReview = async () => {
    setSubmitError("");

    if (!selectedProperty) {
      setSubmitError("Please select a property");
      return;
    }
    if (!comment.trim()) {
      setSubmitError("Comment cannot be empty");
      return;
    }

    try {
      await reviewApi.submitReview({
        propertyId: selectedProperty._id,
        rating: parseInt(rating, 10),
        comment
      });
      setModalVisible(false);
      setPropertySelectMode(false);
      setRating("5");
      setComment("");
      setSelectedProperty(null);
      setSubmitError("");
      loadReviews();
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Failed to submit review");
    }
  };

  const onOpenEditReview = (review) => {
    setEditingReview(review);
    setEditRating(String(review?.rating || 5));
    setEditComment(review?.comment || "");
    setSubmitError("");
    setEditModalVisible(true);
  };

  const onUpdateReview = async () => {
    if (!editingReview) {
      return;
    }

    setSubmitError("");
    if (!editComment.trim()) {
      setSubmitError("Comment cannot be empty");
      return;
    }

    setSavingEdit(true);
    try {
      await reviewApi.updateReview(editingReview._id, {
        rating: parseInt(editRating, 10),
        comment: editComment.trim()
      });
      setEditModalVisible(false);
      setEditingReview(null);
      setEditRating("5");
      setEditComment("");
      setSubmitError("");
      loadReviews();
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Failed to update review");
    } finally {
      setSavingEdit(false);
    }
  };

  const renderStars = (count) => "⭐".repeat(Math.min(count, 5));

  const onDeleteReview = (reviewId) => {
    Alert.alert("Delete review", "Are you sure you want to delete this review?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await reviewApi.deleteReview(reviewId);
            loadReviews();
          } catch (err) {
            setError(err.response?.data?.message || "Failed to delete review");
          }
        }
      }
    ]);
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 20 }} size="large" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Reviews</Text>
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Pressable
        style={styles.addButton}
        onPress={() => {
          setModalVisible(true);
          setPropertySelectMode(false);
          setSelectedProperty(null);
          setRating("5");
          setComment("");
          setSubmitError("");
        }}
      >
        <Text style={styles.addButtonText}>+ Add Review</Text>
      </Pressable>

      {reviews.length === 0 ? (
        <Text style={styles.emptyText}>No reviews yet</Text>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.target}>
                {item.propertyId?.title || item.agentId?.fullName || "Target"}
              </Text>
              <Text style={styles.stars}>{renderStars(item.rating)}</Text>
              <Text style={styles.comment}>{item.comment}</Text>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              <View style={styles.cardActions}>
                <Pressable style={styles.editButton} onPress={() => onOpenEditReview(item)}>
                  <Text style={styles.editButtonText}>Edit</Text>
                </Pressable>
                <Pressable style={styles.deleteButton} onPress={() => onDeleteReview(item._id)}>
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {!propertySelectMode ? (
              <>
                <Text style={styles.modalTitle}>Select Property</Text>
                {properties.length === 0 ? (
                  <Text style={styles.emptyText}>No properties available</Text>
                ) : (
                  <ScrollView style={styles.propertyList} nestedScrollEnabled={true}>
                    {properties.map((prop) => (
                      <Pressable
                        key={prop._id}
                        style={[
                          styles.propertyItem,
                          selectedProperty?._id === prop._id && styles.propertyItemSelected
                        ]}
                        onPress={() => setSelectedProperty(prop)}
                      >
                        <Text style={styles.propertyTitle}>{prop.title}</Text>
                        <Text style={styles.propertyPrice}>LKR {Number(prop.price || 0).toLocaleString()}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                )}
                <View style={styles.modalButtons}>
                  <Pressable style={styles.cancelBtn} onPress={() => {
                    setModalVisible(false);
                    setPropertySelectMode(false);
                    setSelectedProperty(null);
                    setSubmitError("");
                  }}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.submitBtn, !selectedProperty && styles.submitBtnDisabled]}
                    onPress={() => setPropertySelectMode(true)}
                    disabled={!selectedProperty}
                  >
                    <Text style={styles.submitText}>Next</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Review: {selectedProperty?.title}</Text>
                {!!submitError && <Text style={styles.error}>{submitError}</Text>}
                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Pressable
                      key={star}
                      onPress={() => setRating(star.toString())}
                      style={[styles.starButton, star <= parseInt(rating, 10) && styles.starSelected]}
                    >
                      <Text style={styles.starText}>⭐</Text>
                    </Pressable>
                  ))}
                </View>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Write your comment..."
                  multiline
                  numberOfLines={4}
                  value={comment}
                  onChangeText={setComment}
                />
                <View style={styles.modalButtons}>
                  <Pressable
                    style={styles.cancelBtn}
                    onPress={() => {
                      setPropertySelectMode(false);
                      setSelectedProperty(null);
                      setSubmitError("");
                    }}
                  >
                    <Text style={styles.cancelText}>Back</Text>
                  </Pressable>
                  <Pressable style={styles.submitBtn} onPress={onSubmitReview}>
                    <Text style={styles.submitText}>Submit</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Review</Text>
            {!!submitError && <Text style={styles.error}>{submitError}</Text>}

            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                  key={star}
                  onPress={() => setEditRating(star.toString())}
                  style={[styles.starButton, star <= parseInt(editRating, 10) && styles.starSelected]}
                >
                  <Text style={styles.starText}>⭐</Text>
                </Pressable>
              ))}
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Update your comment..."
              multiline
              numberOfLines={4}
              value={editComment}
              onChangeText={setEditComment}
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => {
                  setEditModalVisible(false);
                  setEditingReview(null);
                  setSubmitError("");
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.submitBtn, savingEdit && styles.submitBtnDisabled]}
                onPress={onUpdateReview}
                disabled={savingEdit}
              >
                <Text style={styles.submitText}>{savingEdit ? "Saving..." : "Save"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f7fa" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16, color: "#1f2937" },
  error: { color: "#b91c1c", marginBottom: 8 },
  emptyText: { textAlign: "center", color: "#6b7280", marginTop: 20 },
  addButton: {
    backgroundColor: "#1d4ed8",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16
  },
  addButtonText: { color: "#fff", fontWeight: "700", textAlign: "center" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12
  },
  target: { fontSize: 16, fontWeight: "600" },
  stars: { fontSize: 16, marginTop: 6 },
  comment: { fontSize: 14, color: "#374151", marginTop: 6 },
  date: { fontSize: 12, color: "#9ca3af", marginTop: 6 },
  cardActions: { marginTop: 8, flexDirection: "row", gap: 14 },
  editButton: { paddingVertical: 2, paddingHorizontal: 2 },
  editButtonText: { color: "#1d4ed8", fontWeight: "700", fontSize: 12 },
  deleteButton: { paddingVertical: 2, paddingHorizontal: 2 },
  deleteButtonText: { color: "#b91c1c", fontWeight: "700", fontSize: 12 },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.3)" },
  modalContent: { backgroundColor: "#fff", padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: "85%" },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  propertyList: { height: 250, marginBottom: 12, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8 },
  propertyItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  propertyItemSelected: { backgroundColor: "#dbeafe", borderBottomColor: "#1d4ed8" },
  propertyTitle: { fontSize: 14, fontWeight: "600" },
  propertyPrice: { fontSize: 12, color: "#6b7280", marginTop: 4 },
  ratingContainer: { flexDirection: "row", justifyContent: "space-around", marginBottom: 12 },
  starButton: { padding: 8 },
  starSelected: { transform: [{ scale: 1.2 }] },
  starText: { fontSize: 24 },
  modalInput: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, padding: 10, marginBottom: 12 },
  modalButtons: { flexDirection: "row", justifyContent: "space-around" },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, backgroundColor: "#e5e7eb" },
  cancelText: { color: "#374151", fontWeight: "600" },
  submitBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, backgroundColor: "#1d4ed8" },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { color: "#fff", fontWeight: "600" }
});