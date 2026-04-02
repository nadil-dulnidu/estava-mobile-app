// Notifications screen for system alerts and user notifications
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator
} from "react-native";
import { notificationApi } from "../api/notificationApi";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await notificationApi.getNotifications();
      setNotifications(res.data.data || []);
    } catch (err) {
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const onMarkAsRead = async (notificationId) => {
    try {
      await notificationApi.markAsRead(notificationId);
      setNotifications(
        notifications.map((n) =>
          n._id === notificationId ? { ...n, status: "read" } : n
        )
      );
    } catch (err) {
      setError("Failed to mark as read");
    }
  };

  const onDelete = async (notificationId) => {
    try {
      await notificationApi.deleteNotification(notificationId);
      setNotifications(notifications.filter((n) => n._id !== notificationId));
    } catch (err) {
      setError("Failed to delete notification");
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 20 }} size="large" />;

  const getIcon = (type) => {
    const icons = {
      inquiry: "💬",
      appointment: "📅",
      property: "🏠",
      review: "⭐",
      system: "🔔"
    };
    return icons[type] || "📬";
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      {!!error && <Text style={styles.error}>{error}</Text>}

      {notifications.length === 0 ? (
        <Text style={styles.emptyText}>No notifications</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={[styles.card, item.status === "unread" && styles.cardUnread]}>
              <Text style={styles.icon}>{getIcon(item.type)}</Text>
              <View style={styles.content}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.timestamp}>
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              </View>
              <View style={styles.actions}>
                {item.status === "unread" && (
                  <Pressable onPress={() => onMarkAsRead(item._id)} style={styles.actionBtn}>
                    <Text style={styles.actionText}>✓</Text>
                  </Pressable>
                )}
                <Pressable onPress={() => onDelete(item._id)} style={styles.deleteBtn}>
                  <Text style={styles.deleteText}>✕</Text>
                </Pressable>
              </View>
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
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-start"
  },
  cardUnread: {
    backgroundColor: "#dbeafe",
    borderLeftWidth: 4,
    borderLeftColor: "#1d4ed8"
  },
  icon: { fontSize: 20, marginRight: 12 },
  content: { flex: 1 },
  title: { fontSize: 14, fontWeight: "600" },
  message: { fontSize: 13, color: "#374151", marginTop: 4 },
  timestamp: { fontSize: 11, color: "#9ca3af", marginTop: 4 },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: { paddingVertical: 6, paddingHorizontal: 8 },
  actionText: { color: "#059669", fontWeight: "700", fontSize: 16 },
  deleteBtn: { paddingVertical: 6, paddingHorizontal: 8 },
  deleteText: { color: "#b91c1c", fontWeight: "700", fontSize: 16 }
});