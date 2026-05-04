const http = require("http");

const baseUrl = (process.env.SMOKE_BASE_URL || "http://127.0.0.1:5001").replace(/\/+$/, "");

const parseJson = (body) => {
  try {
    return JSON.parse(body);
  } catch (_error) {
    return null;
  }
};

const request = (path) =>
  new Promise((resolve, reject) => {
    const req = http.get(`${baseUrl}${path}`, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          body,
          json: parseJson(body)
        });
      });
    });

    req.on("error", reject);
  });

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const run = async () => {
  console.log(`Smoke check base URL: ${baseUrl}`);

  const root = await request("/");
  assert(root.statusCode === 200, `Expected / to return 200, got ${root.statusCode}`);
  assert(root.json?.success === true, "Expected / success response");

  const healthz = await request("/healthz");
  assert(healthz.statusCode === 200, `Expected /healthz to return 200, got ${healthz.statusCode}`);
  assert(typeof healthz.json?.dbConnected === "boolean", "Expected /healthz dbConnected flag");

  const apiHealth = await request("/api/health");
  assert(apiHealth.statusCode === 200, `Expected /api/health to return 200, got ${apiHealth.statusCode}`);
  assert(apiHealth.json?.success === true, "Expected /api/health success response");
  assert(typeof apiHealth.json?.dbConnected === "boolean", "Expected /api/health dbConnected flag");
  assert(typeof apiHealth.json?.jwtConfigured === "boolean", "Expected /api/health jwtConfigured flag");

  console.log("Smoke check passed");
};

run().catch((error) => {
  console.error("Smoke check failed:", error.message);
  process.exit(1);
});
