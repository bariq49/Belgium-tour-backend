import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import authRoutes from "../../src/routes/auth.routes";
import { errorHandler } from "../../src/middleware/errorHandler";

jest.mock("../../src/services/auth.service", () => ({
  __esModule: true,
  default: {
    login: jest.fn(),
    signup: jest.fn(),
    refreshToken: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    logout: jest.fn(),
    logoutAll: jest.fn(),
  },
}));

jest.mock("../../src/middleware/auth", () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = { _id: { toString: () => "user-1" }, role: "user" };
    next();
  },
  authorize: () => (_req: any, _res: any, next: any) => next(),
  optionalAuthenticate: (_req: any, _res: any, next: any) => next(),
}));

const authServiceMock = jest.requireMock("../../src/services/auth.service").default as {
  login: jest.Mock;
  signup: jest.Mock;
  refreshToken: jest.Mock;
  forgotPassword: jest.Mock;
  resetPassword: jest.Mock;
  logout: jest.Mock;
  logoutAll: jest.Mock;
};

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use(errorHandler);

describe("Auth routes (cookie-only flow)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("logs in user and sets auth cookies", async () => {
    authServiceMock.login.mockResolvedValue({
      user: { _id: "user-1", email: "user@example.com" },
      token: "access-token",
      refreshToken: "refresh-token",
      role: "user",
    });

    const response = await request(app).post("/api/auth/user/login").send({
      email: "user@example.com",
      password: "Password123",
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.headers["set-cookie"]).toEqual(
      expect.arrayContaining([
        expect.stringContaining("accessToken="),
        expect.stringContaining("refreshToken="),
      ])
    );
  });

  it("returns 401 when refresh cookie is missing", async () => {
    const response = await request(app)
      .post("/api/auth/refresh")
      .set("Origin", "http://localhost:3000")
      .send({});

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("refreshes tokens when refresh cookie exists", async () => {
    authServiceMock.refreshToken.mockResolvedValue({
      token: "new-access-token",
      refreshToken: "new-refresh-token",
    });

    const response = await request(app)
      .post("/api/auth/refresh")
      .set("Origin", "http://localhost:3000")
      .set("Cookie", ["refreshToken=refresh-token"])
      .send({});

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(authServiceMock.refreshToken).toHaveBeenCalledTimes(1);
  });

  it("logs out all sessions for authenticated user", async () => {
    const response = await request(app)
      .post("/api/auth/logout-all")
      .set("Origin", "http://localhost:3000")
      .set("Cookie", ["accessToken=access-token", "refreshToken=refresh-token"])
      .send({});

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(authServiceMock.logoutAll).toHaveBeenCalledWith("user-1", "user");
  });
});
