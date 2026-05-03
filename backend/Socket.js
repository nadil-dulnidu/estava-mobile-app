const { Server } = require("socket.io");
const env = require("./config/env");

let io;

const initializeSocketServer = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.corsOrigin || "*",
      methods: ["GET", "POST", "PATCH", "DELETE"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join", (userId) => {
      if (!userId) {
        return;
      }

      socket.join(userId.toString());
      console.log(`User ${userId} joined socket room`);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }

  return io;
};

const emitToUser = (userId, eventName, data) => {
  if (!io || !userId) {
    return;
  }

  io.to(userId.toString()).emit(eventName, data);
};

module.exports = {
  initializeSocketServer,
  getIO,
  emitToUser,
};
