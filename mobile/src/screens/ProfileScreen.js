// Screen for viewing and updating authenticated user profile details.
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../context/AuthContext";
import { isTenDigitPhoneNumber, normalizePhoneNumber } from "../utils/phoneNumber";
import { estavaCore } from "../theme/estavaCore";

const getInitials = (name) => {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) {
    return "U";
  }

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

export default function ProfileScreen() {
  const { user, loading, refreshProfile, updateProfile, changePassword, updateAvatar } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [refreshing, setRefreshing] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setFullName(String(user?.fullName || ""));
    setPhoneNumber(normalizePhoneNumber(user?.phoneNumber || ""));
  }, [user?.fullName, user?.phoneNumber]);

  const resetMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const onRefreshProfile = async () => {
    setRefreshing(true);
    resetMessages();

    const result = await refreshProfile();
    if (!result?.ok) {
      setErrorMessage(result?.message || "Failed to refresh profile");
    } else {
      setSuccessMessage("Profile refreshed");
    }

    setRefreshing(false);
  };

  const onPickAvatar = async () => {
    resetMessages();

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      setErrorMessage("Media library permission is required to upload profile picture.");
      return;
    }

    const selection = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
      aspect: [1, 1]
    });

    if (selection.canceled || !Array.isArray(selection.assets) || !selection.assets[0]) {
      return;
    }

    setAvatarSaving(true);
    const result = await updateAvatar(selection.assets[0]);
    if (!result?.ok) {
      setErrorMessage(result?.message || "Failed to upload profile picture");
    } else {
      setSuccessMessage("Profile picture updated");
    }
    setAvatarSaving(false);
  };

  const onSaveProfile = async () => {
    resetMessages();

    const nextName = String(fullName || "").trim();
    const nextPhone = normalizePhoneNumber(phoneNumber);

    if (!nextName) {
      setErrorMessage("Full name is required");
      return;
    }

    if (nextPhone && !isTenDigitPhoneNumber(nextPhone)) {
      setErrorMessage("Phone number must be exactly 10 digits");
      return;
    }

    setProfileSaving(true);
    const result = await updateProfile({
      fullName: nextName,
      phoneNumber: nextPhone || null
    });

    if (!result?.ok) {
      setErrorMessage(result?.message || "Failed to update profile");
    } else {
      setSuccessMessage("Profile details updated");
    }

    setProfileSaving(false);
  };

  const onChangePassword = async () => {
    resetMessages();

    if (!currentPassword || !newPassword) {
      setErrorMessage("Current and new password are required");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Confirm password must match new password");
      return;
    }

    setPasswordSaving(true);
    const result = await changePassword(currentPassword, newPassword);

    if (!result?.ok) {
      setErrorMessage(result?.message || "Failed to change password");
    } else {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccessMessage("Password changed successfully");
      Alert.alert("Success", "Password updated");
    }

    setPasswordSaving(false);
  };

  const anyActionLoading = loading || refreshing || profileSaving || passwordSaving || avatarSaving;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>My Profile</Text>
      <Text style={styles.subtitle}>Manage your account details used across inquiries and bookings.</Text>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Profile Picture</Text>
        <View style={styles.avatarRow}>
          {user?.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarFallbackText}>{getInitials(user?.fullName)}</Text>
            </View>
          )}
          <View style={styles.avatarActions}>
            <Pressable
              style={[styles.primaryButton, anyActionLoading && styles.buttonDisabled]}
              onPress={onPickAvatar}
              disabled={anyActionLoading}
              accessibilityLabel="Upload profile picture"
            >
              {avatarSaving ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.primaryButtonText}>Upload Picture</Text>
              )}
            </Pressable>
            <Pressable
              style={[styles.secondaryButton, anyActionLoading && styles.buttonDisabled]}
              onPress={onRefreshProfile}
              disabled={anyActionLoading}
              accessibilityLabel="Refresh profile details"
            >
              {refreshing ? (
                <ActivityIndicator size="small" color="#1d4ed8" />
              ) : (
                <Text style={styles.secondaryButtonText}>Refresh</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Basic Details</Text>

        <Text style={styles.inputLabel}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Your full name"
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          accessibilityLabel="Full name"
          accessibilityHint="Used across inquiries and bookings"
        />

        <Text style={styles.inputLabel}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={(value) => setPhoneNumber(normalizePhoneNumber(value))}
          placeholder="10-digit phone number"
          keyboardType="phone-pad"
          maxLength={10}
          autoComplete="tel"
          textContentType="telephoneNumber"
          accessibilityLabel="Phone number"
          accessibilityHint="Optional contact number used for inquiries and bookings"
        />

        <Pressable
          style={[styles.primaryButton, anyActionLoading && styles.buttonDisabled]}
          onPress={onSaveProfile}
          disabled={anyActionLoading}
          accessibilityLabel="Save profile details"
        >
          {profileSaving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>Save Profile</Text>
          )}
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Change Password</Text>

        <Text style={styles.inputLabel}>Current Password</Text>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Current password"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="current-password"
          textContentType="password"
          accessibilityLabel="Current password"
        />

        <Text style={styles.inputLabel}>New Password</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="At least 8 characters"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
          accessibilityLabel="New password"
        />

        <Text style={styles.inputLabel}>Confirm New Password</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Repeat new password"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
          accessibilityLabel="Confirm new password"
        />

        <Pressable
          style={[styles.primaryButton, anyActionLoading && styles.buttonDisabled]}
          onPress={onChangePassword}
          disabled={anyActionLoading}
          accessibilityLabel="Change account password"
        >
          {passwordSaving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>Update Password</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: estavaCore.colors.background
  },
  content: {
    padding: 16,
    paddingBottom: 28
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: estavaCore.colors.primary
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 14,
    color: estavaCore.colors.textSecondary
  },
  card: {
    backgroundColor: estavaCore.colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: estavaCore.colors.border
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: estavaCore.colors.primary,
    marginBottom: 10
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#d1d5db"
  },
  avatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: estavaCore.colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarFallbackText: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "700"
  },
  avatarActions: {
    marginLeft: 14,
    flex: 1,
    gap: 8
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: estavaCore.colors.textSecondary,
    marginBottom: 6
  },
  input: {
    borderWidth: 1,
    borderColor: estavaCore.colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: estavaCore.colors.surface,
    marginBottom: 12,
    color: estavaCore.colors.textPrimary
  },
  primaryButton: {
    backgroundColor: estavaCore.colors.primary,
    borderRadius: 8,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "700"
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: estavaCore.colors.accent,
    backgroundColor: estavaCore.colors.accentSoft,
    borderRadius: 8,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14
  },
  secondaryButtonText: {
    color: estavaCore.colors.accent,
    fontWeight: "700"
  },
  buttonDisabled: {
    opacity: 0.6
  },
  error: {
    marginBottom: 10,
    color: estavaCore.colors.danger,
    fontWeight: "600"
  },
  success: {
    marginBottom: 10,
    color: estavaCore.colors.accent,
    fontWeight: "600"
  }
});
