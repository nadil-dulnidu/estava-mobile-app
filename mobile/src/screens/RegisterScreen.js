// Screen component for user-facing workflow in the real-estate mobile app.
import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import { estavaCore } from "../theme/estavaCore";

export default function RegisterScreen({ navigation }) {
  const { register, loading } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async () => {
    setError("");

    if (fullName.trim().length < 2) {
      setError("Full name must be at least 2 characters");
      return;
    }

    if (!email.includes("@")) {
      setError("Enter a valid email");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    const result = await register({ fullName, email, password, role: "buyer" });
    if (!result.ok) {
      setError(result.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>Estava Real Estate</Text>
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Register to save favorites and manage appointments.</Text>
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor={estavaCore.colors.textSecondary}
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={estavaCore.colors.textSecondary}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={estavaCore.colors.textSecondary}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Pressable style={styles.button} onPress={onSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Please wait..." : "Register"}</Text>
      </Pressable>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: estavaCore.colors.background
  },
  kicker: {
    color: estavaCore.colors.accent,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 6
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: estavaCore.colors.primary
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 18,
    color: estavaCore.colors.textSecondary,
    lineHeight: 20
  },
  input: {
    backgroundColor: estavaCore.colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: estavaCore.colors.border
  },
  button: {
    backgroundColor: estavaCore.colors.primary,
    borderRadius: 8,
    padding: 14,
    marginTop: 8,
    alignItems: "center"
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700"
  },
  error: {
    color: estavaCore.colors.danger,
    marginBottom: 8
  },
  link: {
    marginTop: 14,
    color: estavaCore.colors.accent,
    textAlign: "center"
  }
});