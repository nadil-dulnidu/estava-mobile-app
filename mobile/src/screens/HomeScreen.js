// Screen component for user-facing workflow in the real-estate mobile app.
import React from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();

  const menuItems = [
    { label: "Browse Properties", screen: "PropertyList", icon: "🏠" },
    { label: "Post Property", screen: "CreateProperty", icon: "📢" },
    { label: "My Favorites", screen: "Favorites", icon: "❤️" },
    { label: "Inquiries", screen: "Inquiries", icon: "💬" },
    { label: "Appointments", screen: "Appointments", icon: "📅" },
    { label: "Reviews", screen: "Reviews", icon: "⭐" },
    { label: "Notifications", screen: "Notifications", icon: "🔔" }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Estava</Text>
        <Text style={styles.subtitle}>{user?.fullName}</Text>
        <Text style={styles.caption}>Role: {user?.role}</Text>
      </View>

      <View style={styles.grid}>
        {menuItems.map((item) => (
          <Pressable
            key={item.screen}
            style={styles.menuCard}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
    paddingVertical: 20
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1f2937"
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: "#374151"
  },
  caption: {
    marginTop: 4,
    fontSize: 14,
    color: "#6b7280"
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    marginBottom: 20
  },
  menuCard: {
    width: "48%",
    marginHorizontal: "1%",
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#1d4ed8"
  },
  icon: {
    fontSize: 28,
    marginBottom: 8
  },
  menuLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center"
  },
  logoutButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#b91c1c",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center"
  },
  logoutText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16
  }
});