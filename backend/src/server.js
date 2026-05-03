// Server entry point: starts HTTP listener and retries DB connection in background.
const http = require("http");
const app = require("./app");
const env = require("./config/env");
const { connectDB, disconnectDB } = require("./config/db");
const { initializeSocketServer } = require("./socket");

let server;
let retryTimer = null;
let isShuttingDown = false;

const clearRetryTimer = () => {
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
};

const startServer = async () => {
  app.locals.dbConnected = false;

  const connectWithRetry = async () => {
    if (isShuttingDown) {
      return;
    }

    try {
      await connectDB();
      app.locals.dbConnected = true;
    } catch (error) {
      app.locals.dbConnected = false;
      // eslint-disable-next-line no-console
      console.error("MongoDB connect failed. Retrying in 5s...", error.message);
      clearRetryTimer();
      retryTimer = setTimeout(connectWithRetry, 5000);
    }
  };

  server = http.createServer(app);
  initializeSocketServer(server);
  server.listen(env.port, "0.0.0.0");
  server.on("listening", () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on 0.0.0.0:${env.port}`);
  });
  server.on("error", (error) => {
    // eslint-disable-next-line no-console
    console.error("Server failed to start", error.message);
    process.exit(1);
  });

  await connectWithRetry();
};

const shutdown = async (signal) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  clearRetryTimer();

  // eslint-disable-next-line no-console
  console.log(`Received ${signal}. Shutting down gracefully...`);

  try {
    await disconnectDB();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("MongoDB disconnect failed", error.message);
  }

  if (!server) {
    process.exit(0);
    return;
  }

  server.close(() => {
    process.exit(0);
  });

  setTimeout(() => {
    process.exit(1);
  }, 5000).unref();
};

process.on("SIGINT", () => {
  shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});

process.on("unhandledRejection", (error) => {
  // eslint-disable-next-line no-console
  console.error("Unhandled promise rejection", error);
  shutdown("unhandledRejection");
});

process.on("uncaughtException", (error) => {
  // eslint-disable-next-line no-console
  console.error("Uncaught exception", error);
  shutdown("uncaughtException");
});

startServer();
