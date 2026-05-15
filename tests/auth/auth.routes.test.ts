import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import adminAuthRoutes from "../../src/routes/admin-auth.routes";
import userAuthRoutes from "../../src/routes/user-auth.routes";
import { errorHandler } from "../../src/middleware/errorHandler";

jest.mock("../../src/services/auth.service", () => ({
  __esModule: true,
  default: {
    login: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    logoutAllDevices: jest.fn(),
    logActivity: jest.fn(),
  },
}));

jest.mock("../../src/services/userAuth.service", () => ({
  __esModule: true,
  default: {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    logoutAllDevices: jest.fn(),
    logActivity: jest.fn(),
  },
}));

jest.mock("../../src/middleware/auth", () => ({
  protect: (_req: any, _res: any, next: any) => {
    (_req as any).admin = { _id: { toString: () => "admin-1" } };
    next();
  },
  protectUser: (_req: any, _res: any, next: any) => {
    (_req as any).user = { _id: { toString: () => "user-1" } };
    next();
  },
}));

const authServiceMock = jest.requireMock("../../src/services/auth.service").default as {
  login: jest.Mock;
  refreshToken: jest.Mock;
  logout: jest.Mock;
  logoutAllDevices: jest.Mock;
  logActivity: jest.Mock;
};

const userAuthServiceMock = jest.requireMock("../../src/services/userAuth.service").default as {
  register: jest.Mock;
  login: jest.Mock;
  refreshToken: jest.Mock;
  logout: jest.Mock;
  logoutAllDevices: jest.Mock;
  logActivity: jest.Mock;
};

const adminApp = express();
adminApp.use(express.json());
adminApp.use(cookieParser());
adminApp.use("/api/admin/auth", adminAuthRoutes);
adminApp.use(errorHandler);

const userApp = express();
userApp.use(express.json());
userApp.use(cookieParser());
userApp.use("/api/auth", userAuthRoutes);
userApp.use(errorHandler);

describe("Admin auth routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("logs in admin and sets auth cookies", async () => {
    authServiceMock.login.mockResolvedValue({
      admin: { _id: "admin-1", email: "admin@example.com" },
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });

    const response = await request(adminApp).post("/api/admin/auth/login").send({
      email: "admin@example.com",
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

  it("returns 401 when admin refresh cookie is missing", async () => {
    const response = await request(adminApp)
      .post("/api/admin/auth/refresh")
      .set("Origin", "http://localhost:3000")
      .send({});

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("refreshes admin tokens when refresh cookie exists", async () => {
    authServiceMock.refreshToken.mockResolvedValue({
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    });

    const response = await request(adminApp)
      .post("/api/admin/auth/refresh")
      .set("Origin", "http://localhost:3000")
      .set("Cookie", ["refreshToken=refresh-token"])
      .send({});

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(authServiceMock.refreshToken).toHaveBeenCalledTimes(1);
  });
});

describe("User auth routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("registers user and sets user auth cookies", async () => {
    userAuthServiceMock.register.mockResolvedValue({
      user: { _id: "user-1", email: "user@example.com" },
      accessToken: "ua",
      refreshToken: "ur",
    });

    const response = await request(userApp).post("/api/auth/register").send({
      firstName: "Test",
      lastName: "User",
      email: "user@example.com",
      password: "Password123",
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.headers["set-cookie"]).toEqual(
      expect.arrayContaining([
        expect.stringContaining("userAccessToken="),
        expect.stringContaining("userRefreshToken="),
      ])
    );
  });

  it("returns 401 when user refresh cookie is missing", async () => {
    const response = await request(userApp)
      .post("/api/auth/refresh")
      .set("Origin", "http://localhost:3000")
      .send({});

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("refreshes user tokens when user refresh cookie exists", async () => {
    userAuthServiceMock.refreshToken.mockResolvedValue({
      accessToken: "new-ua",
      refreshToken: "new-ur",
    });

    const response = await request(userApp)
      .post("/api/auth/refresh")
      .set("Origin", "http://localhost:3000")
      .set("Cookie", ["userRefreshToken=refresh-token"])
      .send({});

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(userAuthServiceMock.refreshToken).toHaveBeenCalledTimes(1);
  });
});
