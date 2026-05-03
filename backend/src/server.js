// Server entry point: starts HTTP listener and retries DB connection in background.
const app = require("./app");
const env = require("./config/env");
const connectDB = require("./config/db");

const startServer = async () => {
  app.locals.dbConnected = false;

  const connectWithRetry = async () => {
    try {
      await connectDB();
      app.locals.dbConnected = true;
    } catch (error) {
      app.locals.dbConnected = false;
      // eslint-disable-next-line no-console
      console.error("MongoDB connect failed. Retrying in 5s...", error.message);
      setTimeout(connectWithRetry, 5000);
    }
  };

  app.listen(env.port, "0.0.0.0", () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on 0.0.0.0:${env.port}`);
  });

  await connectWithRetry();
};

startServer();