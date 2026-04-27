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
import { isTenDigitPhoneNumber, normalizePhoneNumber } from "../utils/phoneNumber";
import { estavaCore } from "../theme/estavaCore";

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
  if (status === "replied") return estavaCore.colors.accent;
  if (status === "closed") return estavaCore.colors.textSecondary;
  return "#a16207";
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
  const [responseError, setResponseError] = useState("");

  const [editInquiryModalVisible, setEditInquiryModalVisible] = useState(false);
  const [editInquiry, setEditInquiry] = useState(null);
  const [editSubject, setEditSubject] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [editContact, setEditContact] = useState("");
  const [editInquiryError, setEditInquiryError] = useState("");

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
    setResponseError("");
    setResponseModalVisible(true);
  };

  const closeResponseModal = () => {
    setResponseModalVisible(false);
    setResponseInquiry(null);
    setResponseMessage("");
    setResponseError("");
  };

  const onSaveResponse = async () => {
    const nextResponse = toSafeString(responseMessage).trim();
    if (nextResponse.length < 3) {
      setResponseError("Response must be at least 3 characters");
      return;
    }

    if (!responseInquiry?._id) return;

    setActionLoading(true);
    setResponseError("");
    try {
      await inquiryApi.saveInquiryResponse(responseInquiry._id, nextResponse);
      closeResponseModal();
      await loadInquiries();
    } catch (err) {
      setResponseError(getApiErrorMessage(err, "Failed to save response"));
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
    const fallbackPhone = toSafeString(item?.contactNumber) || toSafeString(user?.phoneNumber);
    setEditContact(normalizePhoneNumber(fallbackPhone));
    setEditInquiryError("");
    setEditInquiryModalVisible(true);
  };

  const closeEditInquiryModal = () => {
    setEditInquiryModalVisible(false);
    setEditInquiry(null);
    setEditSubject("");
    setEditMessage("");
    setEditContact("");
    setEditInquiryError("");
  };

  const onSaveInquiryEdits = async () => {
    const subject = toSafeString(editSubject).trim();
    const message = toSafeString(editMessage).trim();
    const contactNumber = toSafeString(editContact).trim();

    if (subject.length < 3 || subject.length > 160) {
      setEditInquiryError("Subject must be between 3 and 160 characters");
      return;
    }

    if (message.length < 10 || message.length > 3000) {
      setEditInquiryError("Message must be between 10 and 3000 characters");
      return;
    }

    if (!isTenDigitPhoneNumber(contactNumber)) {
      setEditInquiryError("Contact number must be exactly 10 digits");
      return;
    }

    if (!editInquiry?._id) return;

    setActionLoading(true);
    setEditInquiryError("");
    try {
      await inquiryApi.updateInquiryDetails(editInquiry._id, {
        subject,
        message,
        contactNumber: normalizePhoneNumber(contactNumber)
      });
      closeEditInquiryModal();
      await loadInquiries();
    } catch (err) {
      setEditInquiryError(getApiErrorMessage(err, "Failed to update inquiry"));
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
          accessibilityRole="button"
          accessibilityLabel={`Incoming inquiries tab, ${incoming.length} items`}
          accessibilityHint="Shows inquiries received from buyers and renters"
        >
          <Text style={[styles.tabText, activeTab === "incoming" && styles.tabTextActive]}>
            Incoming ({incoming.length})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabButton, activeTab === "sent" && styles.tabButtonActive]}
          onPress={() => setActiveTab("sent")}
          accessibilityRole="button"
          accessibilityLabel={`Sent inquiries tab, ${sent.length} items`}
          accessibilityHint="Shows inquiries you have sent to property owners"
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
                        accessibilityRole="button"
                        accessibilityLabel={hasResponse ? "Edit response" : "Create response"}
                        accessibilityHint="Opens a modal to write a seller response"
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
                          accessibilityRole="button"
                          accessibilityLabel="Clear response"
                          accessibilityHint="Removes the current seller response from this inquiry"
                        >
                          <Text style={styles.actionDangerText}>Clear Response</Text>
                        </Pressable>
                      ) : null}
                      <Pressable
                        style={styles.actionDanger}
                        onPress={() => onDeleteInquiry(item)}
                        disabled={actionLoading}
                        accessibilityRole="button"
                        accessibilityLabel="Hide inquiry"
                        accessibilityHint="Removes this inquiry from your view"
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
                        accessibilityRole="button"
                        accessibilityLabel="Edit inquiry"
                        accessibilityHint="Opens a modal to update the inquiry details"
                      >
                        <Text style={styles.actionSecondaryText}>Edit Inquiry</Text>
                      </Pressable>
                      <Pressable
                        style={styles.actionDanger}
                        onPress={() => onDeleteInquiry(item)}
                        disabled={actionLoading}
                        accessibilityRole="button"
                        accessibilityLabel="Hide inquiry"
                        accessibilityHint="Removes this inquiry from your view"
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
              onChangeText={(text) => {
                setResponseMessage(text);
                if (responseError) setResponseError("");
              }}
              accessibilityLabel="Response message"
              accessibilityHint="Type the reply that will be visible to the inquiry sender"
            />
            {responseError ? <Text style={styles.modalError}>{responseError}</Text> : null}
            <View style={styles.modalButtons}>
              <Pressable
                style={styles.cancelBtn}
                onPress={closeResponseModal}
                disabled={actionLoading}
                accessibilityRole="button"
                accessibilityLabel="Cancel response"
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.submitBtn, actionLoading && styles.submitBtnDisabled]}
                onPress={onSaveResponse}
                disabled={actionLoading}
                accessibilityRole="button"
                accessibilityLabel={isEditingResponse ? "Save response" : "Send response"}
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
              onChangeText={(text) => {
                setEditSubject(text);
                if (editInquiryError) setEditInquiryError("");
              }}
              maxLength={160}
              accessibilityLabel="Inquiry subject"
              accessibilityHint="Update the short subject line for this inquiry"
            />
            <TextInput
              style={[styles.modalInput, styles.modalInputLarge]}
              placeholder="Message"
              multiline
              numberOfLines={4}
              value={editMessage}
              onChangeText={(text) => {
                setEditMessage(text);
                if (editInquiryError) setEditInquiryError("");
              }}
              maxLength={3000}
              accessibilityLabel="Inquiry message"
              accessibilityHint="Update the main message sent with the inquiry"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Contact Number"
              keyboardType="phone-pad"
              maxLength={10}
              value={editContact}
              onChangeText={(text) => {
                setEditContact(normalizePhoneNumber(text));
                if (editInquiryError) setEditInquiryError("");
              }}
              autoComplete="tel"
              textContentType="telephoneNumber"
              accessibilityLabel="Contact number"
              accessibilityHint="Use a 10-digit phone number for replies"
            />
            {editInquiryError ? <Text style={styles.modalError}>{editInquiryError}</Text> : null}
            <View style={styles.modalButtons}>
              <Pressable
                style={styles.cancelBtn}
                onPress={closeEditInquiryModal}
                disabled={actionLoading}
                accessibilityRole="button"
                accessibilityLabel="Cancel edit"
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.submitBtn, actionLoading && styles.submitBtnDisabled]}
                onPress={onSaveInquiryEdits}
                disabled={actionLoading}
                accessibilityRole="button"
                accessibilityLabel="Save inquiry edits"
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
  container: { flex: 1, padding: 16, backgroundColor: estavaCore.colors.background },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16, color: estavaCore.colors.primary },
  error: { color: estavaCore.colors.danger, marginBottom: 8 },
  emptyText: { textAlign: "center", color: estavaCore.colors.textSecondary, marginTop: 20 },
  card: {
    backgroundColor: estavaCore.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: estavaCore.colors.border,
    padding: 12,
    marginBottom: 12
  },
  subject: { fontSize: 16, fontWeight: "600", color: estavaCore.colors.textPrimary },
  property: { fontSize: 12, color: estavaCore.colors.textSecondary, marginBottom: 4 },
  message: { fontSize: 14, color: estavaCore.colors.textPrimary, marginTop: 6 },
  contact: { fontSize: 12, color: estavaCore.colors.textSecondary, marginTop: 4 },
  status: { fontSize: 12, fontWeight: "600", marginTop: 4 },
  tabsRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  tabButton: {
    flex: 1,
    backgroundColor: estavaCore.colors.surfaceMuted,
    borderRadius: 8,
    minHeight: 44,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  tabButtonActive: { backgroundColor: estavaCore.colors.primary },
  tabText: { fontWeight: "600", color: estavaCore.colors.textSecondary },
  tabTextActive: { color: estavaCore.colors.surface },
  responseBox: {
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: estavaCore.colors.accentSoft,
    borderWidth: 1,
    borderColor: estavaCore.colors.border
  },
  responseLabel: { fontSize: 12, fontWeight: "700", color: estavaCore.colors.accent },
  responseText: { marginTop: 4, color: estavaCore.colors.textPrimary },
  responseDate: { marginTop: 4, fontSize: 12, color: estavaCore.colors.textSecondary },
  actionsRow: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center"
  },
  actionPrimary: {
    backgroundColor: estavaCore.colors.primary,
    borderRadius: 8,
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
    justifyContent: "center"
  },
  actionPrimaryText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  actionSecondary: {
    backgroundColor: estavaCore.colors.surfaceMuted,
    borderRadius: 8,
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
    justifyContent: "center"
  },
  actionSecondaryText: { color: estavaCore.colors.textPrimary, fontWeight: "700", fontSize: 12 },
  actionDanger: {
    backgroundColor: estavaCore.colors.dangerSoft,
    borderRadius: 8,
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
    justifyContent: "center"
  },
  actionDangerText: { color: estavaCore.colors.danger, fontWeight: "700", fontSize: 12 },
  actionHint: { color: estavaCore.colors.textSecondary, fontSize: 12, marginTop: 2 },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.3)" },
  modalContent: {
    backgroundColor: estavaCore.colors.surface,
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  modalInput: {
    borderWidth: 1,
    borderColor: estavaCore.colors.border,
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
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: estavaCore.colors.surfaceMuted
  },
  cancelText: { color: estavaCore.colors.textPrimary, fontWeight: "600" },
  submitBtn: {
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: estavaCore.colors.primary
  },
  submitBtnDisabled: {
    opacity: 0.5
  },
  submitText: { color: "#fff", fontWeight: "600" },
  modalError: {
    color: estavaCore.colors.danger,
    marginTop: -4,
    marginBottom: 10,
    fontWeight: "600"
  }
});