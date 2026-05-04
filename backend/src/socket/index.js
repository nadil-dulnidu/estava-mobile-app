const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const env = require("../config/env");

let io;

const getAllowedOrigins = () => {
  const rawOrigin = env.corsOrigin;

  if (!rawOrigin || rawOrigin === "*") {
    return true;
  }

  if (Array.isArray(rawOrigin)) {
    return rawOrigin;
  }

  return String(rawOrigin)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
};

const initializeSocketServer = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: getAllowedOrigins(),
      methods: ["GET", "POST"]
    }
  });

  io.use((socket, next) => {
    const rawToken =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization ||
      socket.handshake.query?.token;

    if (!rawToken) {
      return next(new Error("Authentication required"));
    }

    const token = String(rawToken).replace(/^Bearer\s+/i, "").trim();

    try {
      const decoded = jwt.verify(token, env.jwtSecret);
      socket.user = {
        id: String(decoded.sub || decoded.id || "")
      };
      return next();
    } catch (_error) {
      return next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user?.id;
    if (userId) {
      socket.join(`user:${userId}`);
    }

    socket.on("disconnect", () => {});
  });

  return io;
};

const getSocketServer = () => io;

const emitNotificationToUser = (userId, notification) => {
  if (!io || !userId || !notification) {
    return;
  }

  io.to(`user:${String(userId)}`).emit("notification:new", notification);
};

module.exports = {
  initializeSocketServer,
  getSocketServer,
  emitNotificationToUser
};
