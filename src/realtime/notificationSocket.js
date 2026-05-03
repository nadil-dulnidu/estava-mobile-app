import { io } from "socket.io-client";
import { getSocketBaseUrl } from "../api/client";

let socket;
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

  if (socket) {
    if (!socket.connected) {
      socket.connect();
    }
    return socket;
  }

  socket = io(getSocketBaseUrl(), {
    transports: ["websocket"],
    auth: {
      token
    }
  });

  socket.on("notification:new", (notification) => {
    notifyListeners(notification);
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
};

export const subscribeToNotifications = (listener) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};
