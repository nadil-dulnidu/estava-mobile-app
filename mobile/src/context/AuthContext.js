// Global auth state management for login, registration, and session handling.
import React, { createContext, useContext, useMemo, useState } from "react";
import apiClient, { setAuthToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await apiClient.post("/auth/login", { email, password });
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

  const register = async ({ fullName, email, password, role }) => {
    setLoading(true);
    try {
      const response = await apiClient.post("/auth/register", {
        fullName,
        email,
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
    () => ({ user, token, loading, login, register, logout, isAuthenticated: !!token }),
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