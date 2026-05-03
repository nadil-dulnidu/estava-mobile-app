// Appointments screen for property visit scheduling and management
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Alert,
  Platform
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { appointmentApi } from "../api/appointmentApi";
import { estavaCore } from "../theme/estavaCore";

const STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" }
];

const normalizeStatus = (value) => {
  const normalized = String(value || "").toLowerCase();

  if (
    normalized === "pending" ||
    normalized === "confirmed" ||
    normalized === "completed" ||
    normalized === "cancelled"
  ) {
    return normalized;
  }

  return "pending";
};

const getStatusColor = (status) => {
  if (status === "confirmed") return "#2563eb";
  if (status === "completed") return "#059669";
  if (status === "cancelled") return "#b91c1c";
  return "#d97706";
};

const getStatusLabel = (status) => {
  const normalized = normalizeStatus(status);
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
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

const parseDateValue = (value) => {
  if (typeof value !== "string") return null;

  const parts = value.split("-");
  if (parts.length !== 3) return null;

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }

  const parsedDate = new Date(year, month - 1, day);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
};

const parseTimeValue = (value, baseDate) => {
  if (typeof value !== "string") return null;

  const parts = value.split(":");
  if (parts.length < 2) return null;

  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  const parsedTime = new Date(baseDate);
  parsedTime.setHours(hours, minutes, 0, 0);
  return parsedTime;
};

const getSafeErrorMessage = (err, fallback) => {
  return err?.response?.data?.message || err?.response?.data?.error || err?.message || fallback;
};

export default function AppointmentsScreen({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState("");
  const [editDate, setEditDate] = useState(new Date());
  const [editTime, setEditTime] = useState(new Date());
  const [editStatus, setEditStatus] = useState("pending");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [softDeletingId, setSoftDeletingId] = useState("");

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await appointmentApi.getMyAppointments();
      setAppointments(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (err) {
      setError(getSafeErrorMessage(err, "Failed to load appointments"));
    } finally {
      setLoading(false);
    }
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setShowDatePicker(false);
    setShowTimePicker(false);
    setEditingAppointmentId("");
  };

  const openEditModal = (appointment) => {
    const initialDate = parseDateValue(appointment?.date) || new Date();
    const initialTime = parseTimeValue(appointment?.time, initialDate) || new Date(initialDate);

    setEditingAppointmentId(appointment?._id || "");
    setEditDate(initialDate);
    setEditTime(initialTime);
    setEditStatus(normalizeStatus(appointment?.appointmentStatus || appointment?.status));
    setShowDatePicker(false);
    setShowTimePicker(false);
    setEditModalVisible(true);
    setError("");
  };

  const onSaveEdit = async () => {
    if (!editingAppointmentId) {
      setError("No appointment selected for update.");
      return;
    }

    setSavingEdit(true);
    try {
      await appointmentApi.updateAppointment(editingAppointmentId, {
        date: formatDateValue(editDate),
        time: formatTimeValue(editTime),
        appointmentStatus: editStatus
      });
      closeEditModal();
      await loadAppointments();
    } catch (err) {
      setError(getSafeErrorMessage(err, "Failed to update appointment"));
    } finally {
      setSavingEdit(false);
    }
  };

  const cancelAppointment = async (appointment) => {
    try {
      await appointmentApi.cancelAppointment(appointment._id);
      await loadAppointments();
    } catch (err) {
      setError(getSafeErrorMessage(err, "Failed to mark appointment as cancelled"));
    }
  };

  const confirmCancel = (appointment) => {
    Alert.alert(
      "Mark as Cancelled",
      "This updates appointment status to Cancelled. You can hide it from your list afterwards.",
      [
        { text: "Keep", style: "cancel" },
        {
          text: "Mark Cancelled",
          style: "destructive",
          onPress: () => {
            void cancelAppointment(appointment);
          }
        }
      ]
    );
  };

  const executeSoftDelete = async (appointmentId, fallbackMessage = "Failed to delete appointment") => {
    setSoftDeletingId(appointmentId);
    setError("");
    try {
      await appointmentApi.softDeleteAppointment(appointmentId);
      await loadAppointments();
    } catch (err) {
      setError(getSafeErrorMessage(err, fallbackMessage));
    } finally {
      setSoftDeletingId("");
    }
  };

  const confirmDeleteCompleted = (appointment) => {
    const status = normalizeStatus(appointment?.appointmentStatus || appointment?.status);
    if (status !== "completed") {
      return;
    }

    Alert.alert(
      "Delete Appointment",
      "Are you sure you want to delete this completed appointment from your list?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void executeSoftDelete(appointment._id, "Failed to delete appointment");
          }
        }
      ]
    );
  };

  const confirmSoftDelete = (appointment) => {
    const status = normalizeStatus(appointment?.appointmentStatus || appointment?.status);
    if (status !== "cancelled") {
      setError("Only cancelled appointments can be hidden from your list.");
      return;
    }

    Alert.alert(
      "Hide Cancelled Appointment",
      "This action removes the cancelled appointment from your list only.",
      [
        { text: "Back", style: "cancel" },
        {
          text: "Hide from My List",
          style: "destructive",
          onPress: () => {
            void executeSoftDelete(appointment._id, "Failed to hide appointment");
          }
        }
      ]
    );
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 20 }} size="large" color={estavaCore.colors.accent} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Appointments</Text>
      <Text style={styles.subtitle}>Track visits, update status, and manage your schedule.</Text>
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Pressable style={styles.bookButton} onPress={() => navigation.navigate("PropertyList")}>
        <Text style={styles.bookButtonText}>+ Book from Properties</Text>
      </Pressable>

      {appointments.length === 0 ? (
        <Text style={styles.emptyText}>No appointments scheduled</Text>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item, index) => item?._id || `appointment-${index}`}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {(() => {
                const status = normalizeStatus(item?.appointmentStatus || item?.status);
                const isCancelled = status === "cancelled";
                const isCompleted = status === "completed";
                return (
                  <>
                    <Text style={styles.property}>{item?.propertyId?.title || "Property"}</Text>
                    <Text style={styles.date}>Date: {item?.date || "-"}</Text>
                    <Text style={styles.time}>Time: {item?.time || "-"}</Text>
                    <Text style={[styles.status, { color: getStatusColor(status) }]}>
                      {getStatusLabel(status)}
                    </Text>

                    <View style={styles.actionRow}>
                      {isCompleted ? (
                        <Pressable
                          style={styles.deleteButton}
                          onPress={() => confirmDeleteCompleted(item)}
                          disabled={softDeletingId === item?._id}
                        >
                          <Text style={styles.deleteText}>
                            {softDeletingId === item?._id ? "Deleting..." : "Delete Appointment"}
                          </Text>
                        </Pressable>
                      ) : (
                        <>
                          <Pressable style={styles.editButton} onPress={() => openEditModal(item)}>
                            <Text style={styles.editButtonText}>Edit</Text>
                          </Pressable>

                          {!isCancelled ? (
                            <Pressable style={styles.cancelButton} onPress={() => confirmCancel(item)}>
                              <Text style={styles.cancelText}>Mark Cancelled</Text>
                            </Pressable>
                          ) : (
                            <Pressable
                              style={styles.hideButton}
                              onPress={() => confirmSoftDelete(item)}
                              disabled={softDeletingId === item?._id}
                            >
                              <Text style={styles.hideText}>
                                {softDeletingId === item?._id ? "Hiding..." : "Hide from My List"}
                              </Text>
                            </Pressable>
                          )}
                        </>
                      )}
                    </View>

                    {isCancelled && (
                      <Text style={styles.noteText}>
                        Hide from My List only removes this cancelled appointment from your view.
                      </Text>
                    )}

                    {isCompleted && (
                      <Text style={styles.noteText}>
                        Delete Appointment removes this completed appointment from your view.
                      </Text>
                    )}
                  </>
                );
              })()}
            </View>
          )}
        />
      )}

      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Appointment</Text>

            <Pressable style={styles.pickerButton} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.pickerLabel}>Date</Text>
              <Text style={styles.pickerValue}>{formatDateValue(editDate)}</Text>
            </Pressable>

            <Pressable style={styles.pickerButton} onPress={() => setShowTimePicker(true)}>
              <Text style={styles.pickerLabel}>Time</Text>
              <Text style={styles.pickerValue}>{formatTimeValue(editTime)}</Text>
            </Pressable>

            {showDatePicker && (
              <DateTimePicker
                value={editDate}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === "ios");
                  if (selectedDate) {
                    setEditDate(selectedDate);
                  }
                }}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={editTime}
                mode="time"
                is24Hour={true}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedTime) => {
                  setShowTimePicker(Platform.OS === "ios");
                  if (selectedTime) {
                    setEditTime(selectedTime);
                  }
                }}
              />
            )}

            <Text style={styles.statusLabel}>Status</Text>
            <View style={styles.statusOptionsRow}>
              {STATUS_OPTIONS.map((option) => {
                const active = option.value === editStatus;
                return (
                  <Pressable
                    key={option.value}
                    style={[styles.statusChip, active && styles.statusChipActive]}
                    onPress={() => setEditStatus(option.value)}
                  >
                    <Text style={[styles.statusChipText, active && styles.statusChipTextActive]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.modalButtons}>
              <Pressable style={styles.modalCancelButton} onPress={closeEditModal}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalSaveButton} onPress={onSaveEdit} disabled={savingEdit}>
                <Text style={styles.modalSaveText}>{savingEdit ? "Saving..." : "Save Changes"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, backgroundColor: estavaCore.colors.background },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 4, color: estavaCore.colors.primary },
  subtitle: { color: estavaCore.colors.textSecondary, marginBottom: 14 },
  error: { color: estavaCore.colors.danger, marginBottom: 8 },
  emptyText: { textAlign: "center", color: estavaCore.colors.textSecondary, marginTop: 20 },
  bookButton: {
    backgroundColor: estavaCore.colors.primary,
    borderRadius: 10,
    minHeight: 48,
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16
  },
  bookButtonText: { color: "#fff", fontWeight: "700", textAlign: "center" },
  card: {
    backgroundColor: estavaCore.colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: estavaCore.colors.border,
    ...estavaCore.shadow.card
  },
  property: { fontSize: 16, fontWeight: "600", color: estavaCore.colors.textPrimary },
  date: { fontSize: 14, color: estavaCore.colors.textSecondary, marginTop: 6 },
  time: { fontSize: 14, color: estavaCore.colors.textSecondary, marginTop: 4 },
  status: { fontSize: 12, fontWeight: "700", marginTop: 6 },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10
  },
  editButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: estavaCore.colors.accentSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  editButtonText: {
    color: estavaCore.colors.accent,
    fontWeight: "700"
  },
  cancelButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: estavaCore.colors.dangerSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  cancelText: { color: estavaCore.colors.danger, fontWeight: "700" },
  hideButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: estavaCore.colors.warningSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  hideText: { color: estavaCore.colors.warning, fontWeight: "700" },
  deleteButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: estavaCore.colors.dangerSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  deleteText: { color: estavaCore.colors.danger, fontWeight: "700" },
  noteText: {
    marginTop: 8,
    fontSize: 12,
    color: estavaCore.colors.textSecondary
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)"
  },
  modalContent: {
    backgroundColor: estavaCore.colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 18
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: estavaCore.colors.primary
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: estavaCore.colors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: estavaCore.colors.surface
  },
  pickerLabel: { color: estavaCore.colors.textSecondary, fontSize: 12 },
  pickerValue: { marginTop: 4, color: estavaCore.colors.textPrimary, fontWeight: "600" },
  statusLabel: {
    marginTop: 6,
    marginBottom: 8,
    color: estavaCore.colors.textPrimary,
    fontWeight: "700"
  },
  statusOptionsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8
  },
  statusChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: estavaCore.colors.border,
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: estavaCore.colors.surface
  },
  statusChipActive: {
    borderColor: estavaCore.colors.primary,
    backgroundColor: estavaCore.colors.primary
  },
  statusChipText: { color: estavaCore.colors.textSecondary, fontWeight: "600" },
  statusChipTextActive: {
    color: "#fff"
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12
  },
  modalCancelButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: estavaCore.colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center"
  },
  modalCancelText: {
    color: estavaCore.colors.textPrimary,
    fontWeight: "600"
  },
  modalSaveButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: estavaCore.colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  modalSaveText: {
    color: "#fff",
    fontWeight: "700"
  }
});
