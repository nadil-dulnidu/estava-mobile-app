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
import { estavaCore } from "../theme/estavaCore";

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
      // Retry once for transient cold-start/network failures.
      try {
        const retryRes = await notificationApi.getNotifications();
        setNotifications(retryRes.data.data || []);
      } catch (retryErr) {
        setError(retryErr?.response?.data?.message || retryErr?.message || "Failed to load notifications");
      }
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

  if (loading) return <ActivityIndicator style={{ marginTop: 20 }} size="large" color={estavaCore.colors.accent} />;

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
      <Text style={styles.subtitle}>Updates from inquiries, appointments, and your account.</Text>
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
                <Text style={styles.itemTitle}>{item.title}</Text>
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
  container: { flex: 1, padding: 16, backgroundColor: estavaCore.colors.background },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 4, color: estavaCore.colors.primary },
  subtitle: { color: estavaCore.colors.textSecondary, marginBottom: 14 },
  error: { color: estavaCore.colors.danger, marginBottom: 8 },
  emptyText: { textAlign: "center", color: estavaCore.colors.textSecondary, marginTop: 20 },
  card: {
    backgroundColor: estavaCore.colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: estavaCore.colors.border,
    ...estavaCore.shadow.card
  },
  cardUnread: {
    backgroundColor: estavaCore.colors.accentSoft,
    borderLeftWidth: 4,
    borderLeftColor: estavaCore.colors.accent
  },
  icon: { fontSize: 20, marginRight: 12 },
  content: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: "600", color: estavaCore.colors.textPrimary },
  message: { fontSize: 13, color: estavaCore.colors.textSecondary, marginTop: 4 },
  timestamp: { fontSize: 11, color: estavaCore.colors.textSecondary, marginTop: 4 },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: { paddingVertical: 6, paddingHorizontal: 8 },
  actionText: { color: estavaCore.colors.accent, fontWeight: "700", fontSize: 16 },
  deleteBtn: { paddingVertical: 6, paddingHorizontal: 8 },
  deleteText: { color: estavaCore.colors.danger, fontWeight: "700", fontSize: 16 }
});