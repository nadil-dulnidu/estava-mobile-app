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
  TextInput
} from "react-native";
import { reviewApi } from "../api/reviewApi";

export default function ReviewsScreen() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await reviewApi.getMyReviews();
      setReviews(res.data.data || []);
    } catch (err) {
      setError(err.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const onSubmitReview = async () => {
    if (!comment.trim()) {
      setError("Comment cannot be empty");
      return;
    }
    try {
      // Note: property/agent selection would be done before opening this modal in production
      await reviewApi.submitReview({
        rating: parseInt(rating),
        comment
      });
      setModalVisible(false);
      setRating("5");
      setComment("");
      loadReviews();
    } catch (err) {
      setError("Failed to submit review");
    }
  };

  const renderStars = (count) => "⭐".repeat(Math.min(count, 5));

  if (loading) return <ActivityIndicator style={{ marginTop: 20 }} size="large" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Reviews</Text>
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Pressable style={styles.addButton} onPress={() => setModalVisible(true)}>
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
              <Text style={styles.date}>{new Date(item.reviewDate).toLocaleDateString()}</Text>
            </View>
          )}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Review</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                  key={star}
                  onPress={() => setRating(star.toString())}
                  style={[styles.starButton, star <= parseInt(rating) && styles.starSelected]}
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
              <Pressable style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.submitBtn} onPress={onSubmitReview}>
                <Text style={styles.submitText}>Submit</Text>
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
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.3)" },
  modalContent: { backgroundColor: "#fff", padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  ratingContainer: { flexDirection: "row", justifyContent: "space-around", marginBottom: 12 },
  starButton: { padding: 8 },
  starSelected: { transform: [{ scale: 1.2 }] },
  starText: { fontSize: 24 },
  modalInput: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, padding: 10, marginBottom: 12 },
  modalButtons: { flexDirection: "row", justifyContent: "space-around" },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, backgroundColor: "#e5e7eb" },
  cancelText: { color: "#374151", fontWeight: "600" },
  submitBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, backgroundColor: "#1d4ed8" },
  submitText: { color: "#fff", fontWeight: "600" }
});