import { io } from "socket.io-client";
import { getSocketBaseUrl } from "../api/client";

let socket;
let activeToken;
const listeners = new Set();

const notifyListeners = (notification) => {
  listeners.forEach((listener) => {
    try {
      listener(notification);
    } catch (_error) {
      // Keep other listeners alive.
    }
  });
};

export const connectNotificationSocket = (token) => {
  if (!token) {
    return null;
  }

  if (socket && activeToken !== token) {
    disconnectNotificationSocket();
  }

  if (socket) {
    if (!socket.connected) {
      socket.connect();
    }
    return socket;
  }

  activeToken = token;
  socket = io(getSocketBaseUrl(), {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    timeout: 20000,
    auth: {
      token
    },
    extraHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  socket.on("notification:new", (notification) => {
    notifyListeners(notification);
  });

  socket.on("connect_error", (error) => {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn("Notification socket connection failed:", error?.message || error);
    }
  });

  return socket;
};

export const disconnectNotificationSocket = () => {
  if (!socket) {
    return;
  }

  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
  activeToken = null;
};

export const subscribeToNotifications = (listener) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};
