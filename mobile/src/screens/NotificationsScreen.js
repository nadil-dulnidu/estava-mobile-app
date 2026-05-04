// Notifications screen for system alerts and user notifications
import React, { useCallback, useEffect, useState } from "react";
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
import { BellIcon, CalendarIcon, GridIcon, InboxIcon, StarIcon } from "../components/AppIcons";
import { subscribeToNotifications } from "../realtime/notificationSocket";
import { useAuth } from "../context/AuthContext";

export default function NotificationsScreen({ navigation }) {
  const { refreshUnreadNotificationCount } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const unreadCount = notifications.filter((notification) => notification.status === "unread").length;

  const mergeNotification = useCallback((incomingNotification) => {
    if (!incomingNotification?._id) {
      return;
    }

    setNotifications((currentNotifications) => {
      const existingIndex = currentNotifications.findIndex((item) => item._id === incomingNotification._id);
      if (existingIndex >= 0) {
        const next = currentNotifications.slice();
        next[existingIndex] = {
          ...currentNotifications[existingIndex],
          ...incomingNotification
        };
        return next;
      }

      return [incomingNotification, ...currentNotifications];
    });
  }, []);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await notificationApi.getNotifications();
      const items = res.data.data || [];
      setNotifications(items);
      void refreshUnreadNotificationCount();
    } catch (err) {
      // Retry once for transient cold-start/network failures.
      try {
        const retryRes = await notificationApi.getNotifications();
        const items = retryRes.data.data || [];
        setNotifications(items);
        void refreshUnreadNotificationCount();
      } catch (retryErr) {
        setError(retryErr?.response?.data?.message || retryErr?.message || "Failed to load notifications");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    return subscribeToNotifications((incomingNotification) => {
      mergeNotification(incomingNotification);
    });
  }, [mergeNotification]);

  const onMarkAsRead = async (notificationId) => {
    setError("");
    try {
      await notificationApi.markAsRead(notificationId);
      setNotifications((currentNotifications) =>
        currentNotifications.map((n) =>
          n._id === notificationId ? { ...n, status: "read" } : n
        )
      );
      void refreshUnreadNotificationCount();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to mark as read");
    }
  };

  const onMarkAllAsRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    setError("");
    try {
      await notificationApi.markAllAsRead();
      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          status: "read"
        }))
      );
      void refreshUnreadNotificationCount();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to mark all as read");
    }
  };

  const onDelete = async (notificationId) => {
    setError("");
    try {
      await notificationApi.deleteNotification(notificationId);
      setNotifications((currentNotifications) =>
        currentNotifications.filter((n) => n._id !== notificationId)
      );
      void refreshUnreadNotificationCount();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to delete notification");
    }
  };

  const getNotificationDestination = (type) => {
    const destinations = {
      inquiry: { route: "Inquiries", label: "Open inquiries" },
      appointment: { route: "Appointments", label: "Open appointments" },
      listing: { route: "PropertyList", label: "Open listings" },
      review: { route: "Reviews", label: "Open reviews" },
      system: { route: "Home", label: "Open home" }
    };

    return destinations[type] || destinations.system;
  };

  const onOpenNotification = async (item) => {
    if (item?.status === "unread") {
      await onMarkAsRead(item._id);
    }

    const destination = getNotificationDestination(item?.type);
    navigation.navigate(destination.route);
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 20 }} size="large" color={estavaCore.colors.accent} />;

  const getIcon = (type) => {
    const icons = {
      inquiry: InboxIcon,
      appointment: CalendarIcon,
      listing: GridIcon,
      review: StarIcon,
      system: BellIcon
    };
    return icons[type] || BellIcon;
  };

  const formatTimestamp = (value) => {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? "Unknown date" : parsed.toLocaleString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>Updates from inquiries, appointments, and your account.</Text>
        </View>
        <Pressable
          onPress={onMarkAllAsRead}
          disabled={unreadCount === 0}
          style={[styles.markAllButton, unreadCount === 0 && styles.markAllButtonDisabled]}
        >
          <Text style={styles.markAllButtonText}>Read all</Text>
        </Pressable>
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}

      {notifications.length === 0 ? (
        <Text style={styles.emptyText}>No notifications</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          onRefresh={loadNotifications}
          refreshing={loading}
          renderItem={({ item }) => {
            const destination = getNotificationDestination(item?.type);

            return (
            <Pressable
              style={[styles.card, item.status === "unread" && styles.cardUnread]}
              onPress={() => onOpenNotification(item)}
              accessibilityRole="button"
              accessibilityLabel={`${item.title}. ${destination.label}`}
            >
              <View style={styles.iconWrap}>
                {(() => {
                  const Icon = getIcon(item.type);
                  return <Icon color={estavaCore.colors.accent} size={18} />;
                })()}
              </View>
              <View style={styles.content}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.timestamp}>
                  {formatTimestamp(item.createdAt)}
                </Text>
                <Text style={styles.openHint}>{destination.label}</Text>
              </View>
              <View style={styles.actions}>
                {item.status === "unread" && (
                  <Pressable
                    onPress={(event) => {
                      event.stopPropagation?.();
                      onMarkAsRead(item._id);
                    }}
                    style={styles.actionBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Mark notification as read"
                  >
                    <Text style={styles.actionText}>✓</Text>
                  </Pressable>
                )}
                <Pressable
                  onPress={(event) => {
                    event.stopPropagation?.();
                    onDelete(item._id);
                  }}
                  style={styles.deleteBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Delete notification"
                >
                  <Text style={styles.deleteText}>✕</Text>
                </Pressable>
              </View>
            </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, backgroundColor: estavaCore.colors.background },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12
  },
  headerCopy: { flex: 1 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 4, color: estavaCore.colors.primary },
  subtitle: { color: estavaCore.colors.textSecondary, marginBottom: 14 },
  markAllButton: {
    backgroundColor: estavaCore.colors.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  markAllButtonDisabled: {
    opacity: 0.45
  },
  markAllButtonText: {
    color: estavaCore.colors.accent,
    fontWeight: "700"
  },
  error: { color: estavaCore.colors.danger, marginBottom: 8 },
  emptyText: { textAlign: "center", color: estavaCore.colors.textSecondary, marginTop: 20 },
  card: {
    backgroundColor: estavaCore.colors.surface,
    borderRadius: 12,
    padding: 14,
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
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: estavaCore.colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12
  },
  content: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: "600", color: estavaCore.colors.textPrimary },
  message: { fontSize: 13, color: estavaCore.colors.textSecondary, marginTop: 4 },
  timestamp: { fontSize: 11, color: estavaCore.colors.textSecondary, marginTop: 4 },
  openHint: { fontSize: 12, color: estavaCore.colors.accent, fontWeight: "700", marginTop: 8 },
  actions: { flexDirection: "row", gap: 6 },
  actionBtn: { minWidth: 34, minHeight: 34, alignItems: "center", justifyContent: "center" },
  actionText: { color: estavaCore.colors.accent, fontWeight: "700", fontSize: 16 },
  deleteBtn: { minWidth: 34, minHeight: 34, alignItems: "center", justifyContent: "center" },
  deleteText: { color: estavaCore.colors.danger, fontWeight: "700", fontSize: 16 }
});
