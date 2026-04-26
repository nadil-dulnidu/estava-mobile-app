const request = require("supertest");

jest.mock("../src/services/authService", () => ({
  registerUser: jest.fn(),
  loginUser: jest.fn(),
  getUserProfile: jest.fn(),
  updateUserProfile: jest.fn(),
  changeUserPassword: jest.fn(),
  updateUserAvatar: jest.fn()
}));

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn()
}));

jest.mock("../src/models/User", () => ({
  findById: jest.fn()
}));

const app = require("../src/app");
const jwt = require("jsonwebtoken");
const User = require("../src/models/User");
const authService = require("../src/services/authService");

const AUTH_FAILURE_MESSAGE = "Authentication failed";

describe("auth profile endpoints", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("gets profile when token valid", async () => {
    jwt.verify.mockReturnValue({ sub: "507f191e810c19729de860ea" });
    User.findById.mockResolvedValue({
      _id: "507f191e810c19729de860ea",
      role: "buyer"
    });

    authService.getUserProfile.mockResolvedValue({
      id: "507f191e810c19729de860ea",
      fullName: "Test User",
      email: "test@example.com",
      role: "buyer",
      phoneNumber: null,
      profileImage: null
    });

    const response = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", "Bearer valid.jwt.token")
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe("test@example.com");
    expect(authService.getUserProfile).toHaveBeenCalledWith("507f191e810c19729de860ea");
  });

  it("returns 401 when token invalid", async () => {
    const invalidTokenError = new Error("jwt malformed");
    invalidTokenError.name = "JsonWebTokenError";
    jwt.verify.mockImplementation(() => {
      throw invalidTokenError;
    });

    const response = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", "Bearer bad.token")
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(AUTH_FAILURE_MESSAGE);
  });

  it("returns 401 when token expired", async () => {
    const expiredTokenError = new Error("jwt expired");
    expiredTokenError.name = "TokenExpiredError";
    jwt.verify.mockImplementation(() => {
      throw expiredTokenError;
    });

    const response = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", "Bearer expired.token")
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(AUTH_FAILURE_MESSAGE);
  });

  it("returns 401 when token not active", async () => {
    const notBeforeError = new Error("jwt not active");
    notBeforeError.name = "NotBeforeError";
    jwt.verify.mockImplementation(() => {
      throw notBeforeError;
    });

    const response = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", "Bearer future.token")
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(AUTH_FAILURE_MESSAGE);
  });

  it("returns 401 when token verify throws unknown error", async () => {
    const unknownVerifyError = new Error("unexpected verify failure");
    jwt.verify.mockImplementation(() => {
      throw unknownVerifyError;
    });

    const response = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", "Bearer any.token")
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(AUTH_FAILURE_MESSAGE);
  });

  it("returns 401 when auth header missing", async () => {
    const response = await request(app).get("/api/auth/profile").expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(AUTH_FAILURE_MESSAGE);
    expect(jwt.verify).not.toHaveBeenCalled();
  });

  it("returns 401 when auth header malformed", async () => {
    const response = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", "Bearer")
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(AUTH_FAILURE_MESSAGE);
  });

  it("returns 401 when token payload missing sub", async () => {
    jwt.verify.mockReturnValue({});

    const response = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", "Bearer valid.jwt.token")
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(AUTH_FAILURE_MESSAGE);
    expect(User.findById).not.toHaveBeenCalled();
  });

  it("returns 401 when token payload sub format invalid", async () => {
    jwt.verify.mockReturnValue({ sub: "not-object-id" });

    const response = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", "Bearer valid.jwt.token")
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(AUTH_FAILURE_MESSAGE);
    expect(User.findById).not.toHaveBeenCalled();
  });

  it("returns 401 when user from token no longer exists", async () => {
    jwt.verify.mockReturnValue({ sub: "507f191e810c19729de860ea" });
    User.findById.mockResolvedValue(null);

    const response = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", "Bearer valid.jwt.token")
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(AUTH_FAILURE_MESSAGE);
  });

  it("returns 400 when profile update payload invalid", async () => {
    jwt.verify.mockReturnValue({ sub: "507f191e810c19729de860ea" });
    User.findById.mockResolvedValue({
      _id: "507f191e810c19729de860ea",
      role: "buyer"
    });

    const response = await request(app)
      .patch("/api/auth/profile")
      .set("Authorization", "Bearer valid.jwt.token")
      .send({})
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Please provide fullName or phoneNumber to update");
  });
});
