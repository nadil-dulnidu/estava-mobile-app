// Express app setup with security middleware, routing, and centralized error handling.
const express = require("express");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const env = require("./config/env");
const routes = require("./routes");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

const app = express();

app.set("trust proxy", 1);

// Platform health probes often hit '/' or '/healthz'. Keep these lightweight.
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Estava backend is running"
  });
});

app.get("/healthz", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ok",
    dbConnected: Boolean(req.app.locals.dbConnected)
  });
});

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;