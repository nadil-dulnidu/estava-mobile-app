// Screen component for user-facing workflow in the real-estate mobile app.
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  Pressable,
  Modal,
  TextInput,
  Alert,
  Platform
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getPropertyById, updateProperty } from "../api/propertyApi";
import { favoriteApi } from "../api/favoriteApi";
import { inquiryApi } from "../api/inquiryApi";
import { appointmentApi } from "../api/appointmentApi";
import { reviewApi } from "../api/reviewApi";
import { useAuth } from "../context/AuthContext";

export default function PropertyDetailScreen({ route, navigation }) {
  const { propertyId } = route.params;
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ avgRating: 0, total: 0 });
  const [reviewsError, setReviewsError] = useState("");
  const [ownerActionLoading, setOwnerActionLoading] = useState(false);
  const [favoriteActionLoading, setFavoriteActionLoading] = useState(false);

  // Inquiry modal state
  const [inquiryModalVisible, setInquiryModalVisible] = useState(false);
  const [inquirySubject, setInquirySubject] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquiryContact, setInquiryContact] = useState("");

  // Appointment modal state
  const [appointmentModalVisible, setAppointmentModalVisible] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const [appointmentTime, setAppointmentTime] = useState(new Date());
  const [appointmentPurpose, setAppointmentPurpose] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const getNormalizedUserId = (entity) => {
    if (!entity) return "";
    if (typeof entity === "string") return entity;
    return entity._id || entity.id || "";
  };

  const currentUserId = getNormalizedUserId(user);
  const ownerId = getNormalizedUserId(property?.createdBy);
  const isOwner = !!currentUserId && !!ownerId && String(currentUserId) === String(ownerId);

  const renderStars = (value) => {
    const normalized = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
    return `${"★".repeat(normalized)}${"☆".repeat(5 - normalized)}`;
  };

  const formatDateValue = (value) => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatTimeValue = (value) => {
    const hours = String(value.getHours()).padStart(2, "0");
    const minutes = String(value.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const getSafeErrorMessage = (fallback, err) => {
    const message = err?.response?.data?.message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
    return fallback;
  };

  const resolveFavoriteIdForProperty = async (targetPropertyId) => {
    const response = await favoriteApi.getFavorites();
    const favorites = Array.isArray(response?.data?.data) ? response.data.data : [];

    const matchedFavorite = favorites.find((favoriteItem) => {
      const propertyRef = favoriteItem?.propertyId;
      const candidatePropertyId = typeof propertyRef === "string" ? propertyRef : propertyRef?._id;

      return String(candidatePropertyId || "") === String(targetPropertyId || "");
    });

    return matchedFavorite?._id || "";
  };

  const syncFavoriteState = async (targetPropertyId) => {
    try {
      const matchedFavoriteId = await resolveFavoriteIdForProperty(targetPropertyId);
      setFavoriteId(matchedFavoriteId);
      setIsFavorite(Boolean(matchedFavoriteId));
    } catch {
      setFavoriteId("");
      setIsFavorite(false);
    }
  };

  const loadPropertyReviews = async () => {
    try {
      setReviewsError("");
      const reviewData = await reviewApi.getPropertyReviews(propertyId);
      setReviews(Array.isArray(reviewData?.reviews) ? reviewData.reviews : []);
      setReviewStats({
        avgRating: Number(reviewData?.avgRating || 0),
        total: Number(reviewData?.total || 0)
      });
    } catch (reviewsFetchError) {
      setReviews([]);
      setReviewStats({ avgRating: 0, total: 0 });
      setReviewsError(reviewsFetchError?.response?.data?.message || "Failed to load reviews");
    }
  };

  useEffect(() => {
    const load = async () => {
      let shouldLoadReviews = false;

      try {
        setError("");
        const result = await getPropertyById(propertyId);
        setProperty(result);
        await syncFavoriteState(result?._id || propertyId);
        shouldLoadReviews = true;
      } catch (fetchError) {
        setProperty(null);
        setFavoriteId("");
        setIsFavorite(false);
        setReviews([]);
        setReviewStats({ avgRating: 0, total: 0 });
        setReviewsError("");
        setError(fetchError?.response?.data?.message || "Failed to load property details");
      } finally {
        setLoading(false);
      }

      if (shouldLoadReviews) {
        await loadPropertyReviews();
      }
    };

    load();
  }, [propertyId]);

  const handleStatusUpdate = async (status) => {
    if (!isOwner || ownerActionLoading || property?.listingStatus === status) {
      return;
    }

    setOwnerActionLoading(true);
    try {
      const updated = await updateProperty(propertyId, { listingStatus: status });
      setProperty(updated);
      Alert.alert("Success", "Listing status updated");
    } catch (updateError) {
      Alert.alert("Error", updateError?.response?.data?.message || "Failed to update listing status");
    } finally {
      setOwnerActionLoading(false);
    }
  };

  const handleOpenEditProperty = () => {
    if (!isOwner) {
      return;
    }

    navigation.navigate("EditProperty", { propertyId: property._id });
  };

  const handleAddFavorite = async () => {
    if (favoriteActionLoading) {
      return;
    }

    setFavoriteActionLoading(true);
    try {
      const response = await favoriteApi.addFavorite(propertyId);
      const createdFavoriteId = response?.data?.data?._id || "";

      if (createdFavoriteId) {
        setFavoriteId(createdFavoriteId);
        setIsFavorite(true);
      } else {
        await syncFavoriteState(propertyId);
      }
      Alert.alert("Success", "Added to favorites");
    } catch (err) {
      Alert.alert("Error", getSafeErrorMessage("Failed to add favorite", err));
    } finally {
      setFavoriteActionLoading(false);
    }
  };

  const handleRemoveFavorite = async () => {
    if (favoriteActionLoading) {
      return;
    }

    setFavoriteActionLoading(true);
    try {
      let targetFavoriteId = favoriteId;

      if (!targetFavoriteId) {
        targetFavoriteId = await resolveFavoriteIdForProperty(propertyId);
      }

      if (!targetFavoriteId) {
        setFavoriteId("");
        setIsFavorite(false);
        Alert.alert("Info", "Property is not in your favorites");
        return;
      }

      await favoriteApi.removeFavorite(targetFavoriteId);
      setFavoriteId("");
      setIsFavorite(false);
      Alert.alert("Success", "Removed from favorites");
    } catch (err) {
      Alert.alert("Error", getSafeErrorMessage("Failed to remove favorite", err));
    } finally {
      setFavoriteActionLoading(false);
    }
  };

  const handleSendInquiry = async () => {
    if (!inquirySubject.trim() || !inquiryMessage.trim() || !inquiryContact.trim()) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    if (!/^[0-9]{10}$/.test(inquiryContact.trim())) {
      Alert.alert("Error", "Contact number must be exactly 10 digits");
      return;
    }

    try {
      await inquiryApi.sendInquiry({
        propertyId,
        subject: inquirySubject,
        message: inquiryMessage,
        contactNumber: inquiryContact
      });
      setInquiryModalVisible(false);
      setInquirySubject("");
      setInquiryMessage("");
      setInquiryContact("");
      Alert.alert("Success", "Inquiry sent successfully");
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to send inquiry");
    }
  };

  const handleBookAppointment = async () => {
    try {
      await appointmentApi.createAppointment({
        propertyId,
        date: formatDateValue(appointmentDate),
        time: formatTimeValue(appointmentTime),
        visitPurpose: appointmentPurpose || "Property viewing"
      });
      setAppointmentModalVisible(false);
      setAppointmentDate(new Date());
      setAppointmentTime(new Date());
      setAppointmentPurpose("");
      Alert.alert("Success", "Appointment booked successfully");
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to book appointment");
    }
  };

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

      {isOwner ? (
        <>
          <Text style={styles.sectionTitle}>Owner Controls</Text>
          <Text style={styles.ownerHint}>Only you can manage this listing status from here. Use Edit Property for everything else.</Text>
          <View style={styles.statusChipRow}>
            {["available", "rented", "delisted", "sold"].map((statusOption) => (
              <Pressable
                key={statusOption}
                style={[
                  styles.statusChip,
                  property.listingStatus === statusOption && styles.statusChipActive,
                  ownerActionLoading && styles.disabledControl
                ]}
                onPress={() => handleStatusUpdate(statusOption)}
                disabled={ownerActionLoading}
              >
                <Text
                  style={[
                    styles.statusChipText,
                    property.listingStatus === statusOption && styles.statusChipTextActive
                  ]}
                >
                  {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={styles.editListingButton} onPress={handleOpenEditProperty}>
            <Text style={styles.editListingText}>Edit Property</Text>
          </Pressable>
        </>
      ) : null}

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <Pressable
          style={[
            styles.actionButton,
            isFavorite && styles.actionButtonActive,
            favoriteActionLoading && styles.disabledControl
          ]}
          onPress={isFavorite ? handleRemoveFavorite : handleAddFavorite}
          disabled={favoriteActionLoading}
        >
          <Text style={styles.actionButtonEmoji}>❤️</Text>
          <Text style={styles.actionButtonLabel}>{isFavorite ? "Favorited" : "Favorite"}</Text>
        </Pressable>

        <Pressable style={styles.actionButton} onPress={() => setInquiryModalVisible(true)}>
          <Text style={styles.actionButtonEmoji}>💬</Text>
          <Text style={styles.actionButtonLabel}>Inquiry</Text>
        </Pressable>

        <Pressable style={styles.actionButton} onPress={() => setAppointmentModalVisible(true)}>
          <Text style={styles.actionButtonEmoji}>📅</Text>
          <Text style={styles.actionButtonLabel}>Appointment</Text>
        </Pressable>
      </View>

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

      <Text style={styles.sectionTitle}>Reviews</Text>
      <Pressable
        style={styles.reviewShortcutButton}
        onPress={() =>
          navigation.navigate("Reviews", {
            preselectedProperty: {
              _id: property._id,
              title: property.title,
              price: property.price
            }
          })
        }
      >
        <Text style={styles.reviewShortcutButtonText}>Review this property</Text>
      </Pressable>
      <Text style={styles.reviewSummary}>
        Average: {reviewStats.avgRating.toFixed(1)} / 5 ({reviewStats.total} review
        {reviewStats.total === 1 ? "" : "s"})
      </Text>
      {reviewsError ? <Text style={styles.error}>{reviewsError}</Text> : null}

      {reviews.length === 0 ? (
        <Text style={styles.body}>No reviews yet.</Text>
      ) : (
        reviews.map((review) => (
          <View key={review._id} style={styles.reviewCard}>
            <Text style={styles.reviewAuthor}>{review.userId?.fullName || "Anonymous user"}</Text>
            <Text style={styles.reviewStars}>{renderStars(review.rating)}</Text>
            <Text style={styles.reviewComment}>{review.comment || "No comment provided."}</Text>
          </View>
        ))
      )}

      {/* Inquiry Modal */}
      <Modal visible={inquiryModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Send Inquiry</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Subject"
              value={inquirySubject}
              onChangeText={setInquirySubject}
            />
            <TextInput
              style={[styles.modalInput, styles.modalInputLarge]}
              placeholder="Message"
              multiline
              numberOfLines={4}
              value={inquiryMessage}
              onChangeText={setInquiryMessage}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Contact Number"
              keyboardType="number-pad"
              maxLength={10}
              value={inquiryContact}
              onChangeText={(text) => setInquiryContact(text.replace(/\D/g, "").slice(0, 10))}
            />
            <View style={styles.modalButtons}>
              <Pressable style={styles.cancelBtn} onPress={() => setInquiryModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.submitBtn} onPress={handleSendInquiry}>
                <Text style={styles.submitText}>Send</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Appointment Modal */}
      <Modal visible={appointmentModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Book Appointment</Text>
            <Pressable style={styles.pickerButton} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.pickerLabel}>Date</Text>
              <Text style={styles.pickerValue}>{formatDateValue(appointmentDate)}</Text>
            </Pressable>
            <Pressable style={styles.pickerButton} onPress={() => setShowTimePicker(true)}>
              <Text style={styles.pickerLabel}>Time</Text>
              <Text style={styles.pickerValue}>{formatTimeValue(appointmentTime)}</Text>
            </Pressable>

            {showDatePicker && (
              <DateTimePicker
                value={appointmentDate}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === "ios");
                  if (selectedDate) {
                    setAppointmentDate(selectedDate);
                  }
                }}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={appointmentTime}
                mode="time"
                is24Hour={true}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedTime) => {
                  setShowTimePicker(Platform.OS === "ios");
                  if (selectedTime) {
                    setAppointmentTime(selectedTime);
                  }
                }}
              />
            )}
            <TextInput
              style={styles.modalInput}
              placeholder="Purpose (e.g., Property viewing)"
              value={appointmentPurpose}
              onChangeText={setAppointmentPurpose}
            />
            <View style={styles.modalButtons}>
              <Pressable style={styles.cancelBtn} onPress={() => setAppointmentModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.submitBtn} onPress={handleBookAppointment}>
                <Text style={styles.submitText}>Book</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  ownerHint: {
    color: "#6b7280",
    marginBottom: 10
  },
  statusChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12
  },
  statusChip: {
    backgroundColor: "#e5e7eb",
    borderRadius: 16,
    paddingVertical: 7,
    paddingHorizontal: 12
  },
  statusChipActive: {
    backgroundColor: "#1d4ed8"
  },
  statusChipText: {
    color: "#374151",
    fontWeight: "600"
  },
  statusChipTextActive: {
    color: "#ffffff"
  },
  editListingButton: {
    backgroundColor: "#dbeafe",
    borderColor: "#1d4ed8",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 6
  },
  editListingText: {
    color: "#1d4ed8",
    fontWeight: "700"
  },
  addPhotosButton: {
    backgroundColor: "#dbeafe",
    borderColor: "#1d4ed8",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 6
  },
  addPhotosText: {
    color: "#1d4ed8",
    fontWeight: "700"
  },
  disabledControl: {
    opacity: 0.6
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
    marginBottom: 16,
    gap: 8
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  actionButtonActive: {
    backgroundColor: "#dbeafe",
    borderColor: "#1d4ed8"
  },
  actionButtonEmoji: {
    fontSize: 20,
    marginBottom: 4
  },
  actionButtonLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151"
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
  reviewSummary: {
    color: "#1f2937",
    fontWeight: "600",
    marginBottom: 10
  },
  reviewShortcutButton: {
    alignSelf: "flex-start",
    backgroundColor: "#1d4ed8",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10
  },
  reviewShortcutButtonText: {
    color: "#ffffff",
    fontWeight: "700"
  },
  reviewCard: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10
  },
  reviewAuthor: {
    color: "#111827",
    fontWeight: "700"
  },
  reviewStars: {
    marginTop: 6,
    color: "#f59e0b",
    fontSize: 16
  },
  reviewComment: {
    marginTop: 6,
    color: "#374151"
  },
  error: {
    color: "#b91c1c",
    textAlign: "center"
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)"
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 14
  },
  modalInputLarge: {
    height: 100,
    textAlignVertical: "top"
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#e5e7eb"
  },
  cancelText: {
    color: "#374151",
    fontWeight: "600"
  },
  submitBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#1d4ed8"
  },
  submitText: {
    color: "#fff",
    fontWeight: "600"
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: "#fff"
  },
  pickerLabel: {
    color: "#6b7280",
    fontSize: 12
  },
  pickerValue: {
    marginTop: 4,
    color: "#111827",
    fontWeight: "600"
  }
});