// Appointments screen for property visit scheduling and management
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator
} from "react-native";
import { appointmentApi } from "../api/appointmentApi";

export default function AppointmentsScreen({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await appointmentApi.getMyAppointments();
      setAppointments(res.data.data || []);
    } catch (err) {
      setError(err.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const onCancel = async (appointmentId) => {
    try {
      await appointmentApi.cancelAppointment(appointmentId);
      loadAppointments();
    } catch (err) {
      setError("Failed to cancel appointment");
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 20 }} size="large" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Appointments</Text>
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Pressable style={styles.bookButton} onPress={() => navigation.navigate("PropertyList")}>
        <Text style={styles.bookButtonText}>+ Book from Properties</Text>
      </Pressable>

      {appointments.length === 0 ? (
        <Text style={styles.emptyText}>No appointments scheduled</Text>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {(() => {
                const status = item.appointmentStatus || item.status || "pending";
                return (
                  <>
                    <Text style={styles.property}>{item.propertyId?.title || "Property"}</Text>
                    <Text style={styles.date}>📅 {item.date}</Text>
                    <Text style={styles.time}>🕐 {item.time}</Text>
                    <Text
                      style={[
                        styles.status,
                        {
                          color:
                            status === "confirmed"
                              ? "#059669"
                              : status === "cancelled"
                                ? "#b91c1c"
                                : "#d97706"
                        }
                      ]}
                    >
                      {status.toUpperCase()}
                    </Text>
                    {status !== "cancelled" && (
                      <Pressable style={styles.cancelButton} onPress={() => onCancel(item._id)}>
                        <Text style={styles.cancelText}>Cancel</Text>
                      </Pressable>
                    )}
                  </>
                );
              })()}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f7fa" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16, color: "#1f2937" },
  error: { color: "#b91c1c", marginBottom: 8 },
  emptyText: { textAlign: "center", color: "#6b7280", marginTop: 20 },
  bookButton: {
    backgroundColor: "#1d4ed8",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16
  },
  bookButtonText: { color: "#fff", fontWeight: "700", textAlign: "center" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12
  },
  property: { fontSize: 16, fontWeight: "600" },
  date: { fontSize: 14, color: "#374151", marginTop: 6 },
  time: { fontSize: 14, color: "#374151", marginTop: 4 },
  status: { fontSize: 12, fontWeight: "600", marginTop: 4 },
  cancelButton: { marginTop: 8, paddingVertical: 6, alignItems: "center" },
  cancelText: { color: "#b91c1c", fontWeight: "600" }
});