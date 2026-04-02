// Inquiries screen for managing property inquiries and communication
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
import { inquiryApi } from "../api/inquiryApi";

export default function InquiriesScreen() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [response, setResponse] = useState("");

  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await inquiryApi.getMyInquiries();
      setInquiries(res.data.data || []);
    } catch (err) {
      setError(err.message || "Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  const onRespond = async () => {
    if (!response.trim()) {
      setError("Response cannot be empty");
      return;
    }
    try {
      await inquiryApi.updateInquiry(selectedInquiry._id, {
        status: "replied",
        message: response
      });
      setModalVisible(false);
      setResponse("");
      loadInquiries();
    } catch (err) {
      setError("Failed to respond");
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 20 }} size="large" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inquiries</Text>
      {!!error && <Text style={styles.error}>{error}</Text>}
      {inquiries.length === 0 ? (
        <Text style={styles.emptyText}>No inquiries yet</Text>
      ) : (
        <FlatList
          data={inquiries}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.subject}>{item.subject}</Text>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.contact}>Contact: {item.contactNumber}</Text>
              <Text style={[styles.status, { color: item.status === "replied" ? "#059669" : "#d97706" }]}>
                Status: {item.status}
              </Text>
              {item.status !== "replied" && (
                <Pressable
                  style={styles.respondButton}
                  onPress={() => {
                    setSelectedInquiry(item);
                    setModalVisible(true);
                  }}
                >
                  <Text style={styles.respondText}>Respond</Text>
                </Pressable>
              )}
            </View>
          )}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Respond to Inquiry</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Type your response..."
              multiline
              numberOfLines={4}
              value={response}
              onChangeText={setResponse}
            />
            <View style={styles.modalButtons}>
              <Pressable style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.submitBtn} onPress={onRespond}>
                <Text style={styles.submitText}>Send</Text>
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
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12
  },
  subject: { fontSize: 16, fontWeight: "600" },
  message: { fontSize: 14, color: "#374151", marginTop: 6 },
  contact: { fontSize: 12, color: "#6b7280", marginTop: 4 },
  status: { fontSize: 12, fontWeight: "600", marginTop: 4 },
  respondButton: { marginTop: 8, paddingVertical: 6, alignItems: "center" },
  respondText: { color: "#1d4ed8", fontWeight: "600" },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.3)" },
  modalContent: { backgroundColor: "#fff", padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  modalInput: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, padding: 10, marginBottom: 12 },
  modalButtons: { flexDirection: "row", justifyContent: "space-around" },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, backgroundColor: "#e5e7eb" },
  cancelText: { color: "#374151", fontWeight: "600" },
  submitBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, backgroundColor: "#1d4ed8" },
  submitText: { color: "#fff", fontWeight: "600" }
});