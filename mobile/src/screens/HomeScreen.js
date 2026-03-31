import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estava</Text>
      <Text style={styles.subtitle}>You are logged in as {user?.fullName}</Text>
      <Text style={styles.caption}>Role: {user?.role}</Text>
      <Pressable style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f7fa"
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1f2937"
  },
  subtitle: {
    marginTop: 16,
    fontSize: 18,
    color: "#111827"
  },
  caption: {
    marginTop: 6,
    color: "#4b5563"
  },
  button: {
    marginTop: 24,
    backgroundColor: "#1d4ed8",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700"
  }
});