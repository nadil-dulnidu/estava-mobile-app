// Global auth state management for login, registration, and session handling.
import React, { createContext, useContext, useMemo, useState } from "react";
import apiClient, { setAuthToken } from "../api/client";
import {
  getProfile,
  updateProfile as updateProfileRequest,
  changePassword as changePasswordRequest,
  uploadProfileAvatar
} from "../api/profileApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const normalizedEmail = String(email || "").trim().toLowerCase();
      let response;

      try {
        response = await apiClient.post("/auth/login", {
          email: normalizedEmail,
          password
        });
      } catch (firstError) {
        const isTransient = !firstError?.response;
        if (!isTransient) {
          throw firstError;
        }

        response = await apiClient.post("/auth/login", {
          email: normalizedEmail,
          password
        });
      }

      const payload = response.data.data;
      setUser(payload.user);
      setToken(payload.token);
      setAuthToken(payload.token);
      return { ok: true };
    } catch (error) {
      const message = error?.response?.data?.message || "Login failed";
      return { ok: false, message };
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      const profile = await getProfile();
      setUser(profile);
      return { ok: true, data: profile };
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to load profile";
      return { ok: false, message };
    }
  };

  const updateProfile = async (payload) => {
    setLoading(true);
    try {
      const profile = await updateProfileRequest(payload);
      setUser(profile);
      return { ok: true, data: profile };
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to update profile";
      return { ok: false, message };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    setLoading(true);
    try {
      const profile = await changePasswordRequest({ currentPassword, newPassword });
      setUser(profile);
      return { ok: true, data: profile };
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to change password";
      return { ok: false, message };
    } finally {
      setLoading(false);
    }
  };

  const updateAvatar = async (image) => {
    setLoading(true);
    try {
      const profile = await uploadProfileAvatar(image);
      setUser(profile);
      return { ok: true, data: profile };
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to upload profile image";
      return { ok: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ fullName, email, password, role }) => {
    setLoading(true);
    try {
      const normalizedEmail = String(email || "").trim().toLowerCase();
      const response = await apiClient.post("/auth/register", {
        fullName,
        email: normalizedEmail,
        password,
        role
      });
      const payload = response.data.data;
      setUser(payload.user);
      setToken(payload.token);
      setAuthToken(payload.token);
      return { ok: true };
    } catch (error) {
      const message = error?.response?.data?.message || "Registration failed";
      return { ok: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      refreshProfile,
      updateProfile,
      changePassword,
      updateAvatar,
      isAuthenticated: !!token
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}