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
import { getPropertyById } from "../api/propertyApi";
import { favoriteApi } from "../api/favoriteApi";
import { inquiryApi } from "../api/inquiryApi";
import { appointmentApi } from "../api/appointmentApi";

export default function PropertyDetailScreen({ route }) {
  const { propertyId } = route.params;
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

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

  const handleAddFavorite = async () => {
    try {
      await favoriteApi.addFavorite(propertyId);
      setIsFavorite(true);
      Alert.alert("Success", "Added to favorites");
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to add favorite");
    }
  };

  const handleRemoveFavorite = async () => {
    try {
      // Need favoriteId - for now, just toggle via API
      // In production, store favoriteId when adding
      setIsFavorite(false);
      Alert.alert("Success", "Removed from favorites");
    } catch (err) {
      Alert.alert("Error", "Failed to remove favorite");
    }
  };

  const handleSendInquiry = async () => {
    if (!inquirySubject.trim() || !inquiryMessage.trim() || !inquiryContact.trim()) {
      Alert.alert("Error", "All fields are required");
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

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <Pressable
          style={[styles.actionButton, isFavorite && styles.actionButtonActive]}
          onPress={isFavorite ? handleRemoveFavorite : handleAddFavorite}
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
              keyboardType="phone-pad"
              value={inquiryContact}
              onChangeText={setInquiryContact}
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