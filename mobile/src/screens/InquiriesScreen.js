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
  TextInput,
  Alert
} from "react-native";
import { inquiryApi } from "../api/inquiryApi";
import { useAuth } from "../context/AuthContext";

const getApiErrorMessage = (error, fallbackMessage) => {
  return error?.response?.data?.message || error?.message || fallbackMessage;
};

const resolveUserId = (userRef) => {
  if (!userRef) return "";
  if (typeof userRef === "string") return userRef;
  return userRef._id || userRef.id || "";
};

const toSafeString = (value) => {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  return String(value);
};

const hasResponseMessage = (inquiry) => {
  return Boolean(toSafeString(inquiry?.responseMessage).trim());
};

const getInquiryStatus = (inquiry) => {
  const normalizedStatus = toSafeString(inquiry?.inquiryStatus || inquiry?.status).trim().toLowerCase();
  return normalizedStatus || "pending";
};

const getStatusColor = (status) => {
  if (status === "replied") return "#059669";
  if (status === "closed") return "#6b7280";
  return "#d97706";
};

const toStatusLabel = (status) => {
  const normalizedStatus = toSafeString(status).trim();
  if (!normalizedStatus) return "Pending";
  return `${normalizedStatus.charAt(0).toUpperCase()}${normalizedStatus.slice(1)}`;
};

export default function InquiriesScreen() {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("incoming");

  const [responseModalVisible, setResponseModalVisible] = useState(false);
  const [responseMode, setResponseMode] = useState("create");
  const [responseInquiry, setResponseInquiry] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");

  const [editInquiryModalVisible, setEditInquiryModalVisible] = useState(false);
  const [editInquiry, setEditInquiry] = useState(null);
  const [editSubject, setEditSubject] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [editContact, setEditContact] = useState("");

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
      setError(getApiErrorMessage(err, "Failed to load inquiries"));
    } finally {
      setLoading(false);
    }
  };

  const openResponseModal = (item) => {
    const hasResponse = hasResponseMessage(item);
    setResponseInquiry(item);
    setResponseMode(hasResponse ? "edit" : "create");
    setResponseMessage(toSafeString(item?.responseMessage));
    setError("");
    setResponseModalVisible(true);
  };

  const closeResponseModal = () => {
    setResponseModalVisible(false);
    setResponseInquiry(null);
    setResponseMessage("");
  };

  const onSaveResponse = async () => {
    const nextResponse = toSafeString(responseMessage).trim();
    if (nextResponse.length < 3) {
      setError("Response must be at least 3 characters");
      return;
    }

    if (!responseInquiry?._id) return;

    setActionLoading(true);
    setError("");
    try {
      await inquiryApi.saveInquiryResponse(responseInquiry._id, nextResponse);
      closeResponseModal();
      await loadInquiries();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to save response"));
    } finally {
      setActionLoading(false);
    }
  };

  const onClearResponse = (item) => {
    Alert.alert("Clear response", "This will remove the current response message. Continue?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          setActionLoading(true);
          setError("");
          try {
            await inquiryApi.clearInquiryResponse(item._id);
            await loadInquiries();
          } catch (err) {
            setError(getApiErrorMessage(err, "Failed to clear response"));
          } finally {
            setActionLoading(false);
          }
        }
      }
    ]);
  };

  const openEditInquiryModal = (item) => {
    setEditInquiry(item);
    setEditSubject(toSafeString(item?.subject));
    setEditMessage(toSafeString(item?.message));
    setEditContact(toSafeString(item?.contactNumber));
    setError("");
    setEditInquiryModalVisible(true);
  };

  const closeEditInquiryModal = () => {
    setEditInquiryModalVisible(false);
    setEditInquiry(null);
    setEditSubject("");
    setEditMessage("");
    setEditContact("");
  };

  const onSaveInquiryEdits = async () => {
    const subject = toSafeString(editSubject).trim();
    const message = toSafeString(editMessage).trim();
    const contactNumber = toSafeString(editContact).trim();

    if (subject.length < 3 || subject.length > 160) {
      setError("Subject must be between 3 and 160 characters");
      return;
    }

    if (message.length < 10 || message.length > 3000) {
      setError("Message must be between 10 and 3000 characters");
      return;
    }

    if (contactNumber.length > 40) {
      setError("Contact number must be 40 characters or less");
      return;
    }

    if (!editInquiry?._id) return;

    setActionLoading(true);
    setError("");
    try {
      await inquiryApi.updateInquiryDetails(editInquiry._id, {
        subject,
        message,
        contactNumber
      });
      closeEditInquiryModal();
      await loadInquiries();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to update inquiry"));
    } finally {
      setActionLoading(false);
    }
  };

  const onDeleteInquiry = (item) => {
    Alert.alert(
      "Hide inquiry",
      "This removes the inquiry from your view. It will be permanently deleted only after both participants hide it.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Hide",
          style: "destructive",
          onPress: async () => {
            setActionLoading(true);
            setError("");
            try {
              await inquiryApi.removeInquiry(item._id);
              await loadInquiries();
            } catch (err) {
              setError(getApiErrorMessage(err, "Failed to hide inquiry"));
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const currentUserId = user?.id || user?._id || "";
  const incoming = inquiries.filter((item) => resolveUserId(item.agentId) === currentUserId);
  const sent = inquiries.filter((item) => resolveUserId(item.senderUserId) === currentUserId);
  const filtered = activeTab === "incoming" ? incoming : sent;
  const isEditingResponse = responseMode === "edit";

  if (loading) return <ActivityIndicator style={{ marginTop: 20 }} size="large" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inquiries</Text>
      {!!error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.tabsRow}>
        <Pressable
          style={[styles.tabButton, activeTab === "incoming" && styles.tabButtonActive]}
          onPress={() => setActiveTab("incoming")}
        >
          <Text style={[styles.tabText, activeTab === "incoming" && styles.tabTextActive]}>
            Incoming ({incoming.length})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabButton, activeTab === "sent" && styles.tabButtonActive]}
          onPress={() => setActiveTab("sent")}
        >
          <Text style={[styles.tabText, activeTab === "sent" && styles.tabTextActive]}>
            Sent ({sent.length})
          </Text>
        </Pressable>
      </View>

      {filtered.length === 0 ? (
        <Text style={styles.emptyText}>No inquiries yet</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => {
            const status = getInquiryStatus(item);
            const hasResponse = hasResponseMessage(item);
            const isIncoming = activeTab === "incoming";

            return (
              <View style={styles.card}>
                <Text style={styles.property}>{item.propertyId?.title || "Property"}</Text>
                <Text style={styles.subject}>{item.subject}</Text>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.contact}>Contact: {item.contactNumber || "-"}</Text>
                <Text style={[styles.status, { color: getStatusColor(status) }]}>Status: {toStatusLabel(status)}</Text>

                {hasResponse ? (
                  <View style={styles.responseBox}>
                    <Text style={styles.responseLabel}>Seller response:</Text>
                    <Text style={styles.responseText}>{item.responseMessage}</Text>
                    {item.respondedAt ? (
                      <Text style={styles.responseDate}>
                        Responded: {new Date(item.respondedAt).toLocaleString()}
                      </Text>
                    ) : null}
                  </View>
                ) : null}

                <View style={styles.actionsRow}>
                  {isIncoming ? (
                    <>
                      <Pressable
                        style={styles.actionPrimary}
                        onPress={() => openResponseModal(item)}
                        disabled={actionLoading}
                      >
                        <Text style={styles.actionPrimaryText}>
                          {hasResponse ? "Edit Response" : "Create Response"}
                        </Text>
                      </Pressable>
                      {hasResponse ? (
                        <Pressable
                          style={styles.actionDanger}
                          onPress={() => onClearResponse(item)}
                          disabled={actionLoading}
                        >
                          <Text style={styles.actionDangerText}>Clear Response</Text>
                        </Pressable>
                      ) : null}
                      <Pressable
                        style={styles.actionDanger}
                        onPress={() => onDeleteInquiry(item)}
                        disabled={actionLoading}
                      >
                        <Text style={styles.actionDangerText}>Hide Inquiry</Text>
                      </Pressable>
                    </>
                  ) : (
                    <>
                      <Pressable
                        style={styles.actionSecondary}
                        onPress={() => openEditInquiryModal(item)}
                        disabled={actionLoading}
                      >
                        <Text style={styles.actionSecondaryText}>Edit Inquiry</Text>
                      </Pressable>
                      <Pressable
                        style={styles.actionDanger}
                        onPress={() => onDeleteInquiry(item)}
                        disabled={actionLoading}
                      >
                        <Text style={styles.actionDangerText}>Hide Inquiry</Text>
                      </Pressable>
                    </>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}

      <Modal
        visible={responseModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeResponseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{isEditingResponse ? "Edit Response" : "Create Response"}</Text>
            <TextInput
              style={[styles.modalInput, styles.modalInputLarge]}
              placeholder="Type response message..."
              multiline
              numberOfLines={4}
              value={responseMessage}
              onChangeText={setResponseMessage}
            />
            <View style={styles.modalButtons}>
              <Pressable style={styles.cancelBtn} onPress={closeResponseModal} disabled={actionLoading}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.submitBtn, actionLoading && styles.submitBtnDisabled]}
                onPress={onSaveResponse}
                disabled={actionLoading}
              >
                <Text style={styles.submitText}>{isEditingResponse ? "Save Response" : "Send Response"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={editInquiryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeEditInquiryModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Sent Inquiry</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Subject"
              value={editSubject}
              onChangeText={setEditSubject}
              maxLength={160}
            />
            <TextInput
              style={[styles.modalInput, styles.modalInputLarge]}
              placeholder="Message"
              multiline
              numberOfLines={4}
              value={editMessage}
              onChangeText={setEditMessage}
              maxLength={3000}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Contact Number"
              keyboardType="phone-pad"
              value={editContact}
              onChangeText={setEditContact}
              maxLength={40}
            />
            <View style={styles.modalButtons}>
              <Pressable style={styles.cancelBtn} onPress={closeEditInquiryModal} disabled={actionLoading}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.submitBtn, actionLoading && styles.submitBtnDisabled]}
                onPress={onSaveInquiryEdits}
                disabled={actionLoading}
              >
                <Text style={styles.submitText}>Save Inquiry</Text>
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
  property: { fontSize: 12, color: "#6b7280", marginBottom: 4 },
  message: { fontSize: 14, color: "#374151", marginTop: 6 },
  contact: { fontSize: 12, color: "#6b7280", marginTop: 4 },
  status: { fontSize: 12, fontWeight: "600", marginTop: 4 },
  tabsRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  tabButton: {
    flex: 1,
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center"
  },
  tabButtonActive: { backgroundColor: "#1d4ed8" },
  tabText: { fontWeight: "600", color: "#374151" },
  tabTextActive: { color: "#fff" },
  responseBox: {
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe"
  },
  responseLabel: { fontSize: 12, fontWeight: "700", color: "#1e40af" },
  responseText: { marginTop: 4, color: "#1f2937" },
  responseDate: { marginTop: 4, fontSize: 12, color: "#4b5563" },
  actionsRow: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center"
  },
  actionPrimary: {
    backgroundColor: "#1d4ed8",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8
  },
  actionPrimaryText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  actionSecondary: {
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8
  },
  actionSecondaryText: { color: "#374151", fontWeight: "700", fontSize: 12 },
  actionDanger: {
    backgroundColor: "#fee2e2",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8
  },
  actionDangerText: { color: "#b91c1c", fontWeight: "700", fontSize: 12 },
  actionHint: { color: "#6b7280", fontSize: 12, marginTop: 2 },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.3)" },
  modalContent: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  modalInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12
  },
  modalInputLarge: {
    minHeight: 90,
    textAlignVertical: "top"
  },
  modalButtons: { flexDirection: "row", justifyContent: "space-around" },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#e5e7eb"
  },
  cancelText: { color: "#374151", fontWeight: "600" },
  submitBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#1d4ed8"
  },
  submitBtnDisabled: {
    opacity: 0.5
  },
  submitText: { color: "#fff", fontWeight: "600" }
});