import { jest } from "@jest/globals";
import request from "supertest";

import { ApiError } from "../src/utils/apiError.js";
import { errorHandler } from "../src/middleware/errorHandler.js";
import { notFound } from "../src/middleware/notFound.js";

describe("ApiError", () => {
  test("stores message, code, status, and details", () => {
    const err = new ApiError(
      "Nope",
      "BAD_THING",
      418,
      { field: "username" },
    );

    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("ApiError");
    expect(err.message).toBe("Nope");
    expect(err.code).toBe("BAD_THING");
    expect(err.status).toBe(418);
    expect(err.details).toEqual({ field: "username" });
  });
});

describe("notFound", () => {
  test("returns a 404 payload with the request path", () => {
    const req = { method: "GET", originalUrl: "/missing" };
    const json = jest.fn();
    const res = {
      status: jest.fn(() => ({ json })),
    };

    notFound(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({
      error: {
        message: "Route not found: GET /missing",
        code: "NOT_FOUND",
      },
    });
  });
});

describe("errorHandler", () => {
  test("delegates to next when headers were already sent", () => {
    const err = new Error("already sent");
    const next = jest.fn();
    const res = { headersSent: true };

    errorHandler(err, {}, res, next);

    expect(next).toHaveBeenCalledWith(err);
  });

  test("formats zod validation errors as a 400 response", () => {
    const issues = [{ path: ["query"], message: "Required" }];
    const json = jest.fn();
    const res = {
      headersSent: false,
      status: jest.fn(() => ({ json })),
    };

    errorHandler({ name: "ZodError", issues }, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      error: {
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        details: issues,
      },
    });
  });

  test("uses status, code, details, and stack for non-production errors", () => {
    const json = jest.fn();
    const res = {
      headersSent: false,
      status: jest.fn(() => ({ json })),
    };
    const err = new ApiError(
      "Boom",
      "BROKEN",
      503,
      { retry: true },
    );
    err.stack = "stack-trace";

    errorHandler(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(503);
    expect(json).toHaveBeenCalledWith({
      error: {
        message: "Boom",
        code: "BROKEN",
        details: { retry: true },
        stack: "stack-trace",
      },
    });
  });

  test("falls back to internal server defaults", () => {
    const json = jest.fn();
    const res = {
      headersSent: false,
      status: jest.fn(() => ({ json })),
    };

    errorHandler({}, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      error: {
        message: "Internal server error",
        code: "INTERNAL_SERVER_ERROR",
      },
    });
  });
});

describe("app shell", () => {
  test("GET /health returns ok", async () => {
    const { default: app } = await import("../src/app.js");

    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  test("unknown routes return the notFound payload", async () => {
    const { default: app } = await import("../src/app.js");

    const res = await request(app).get("/totally-missing");

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
    expect(res.body.error.message).toContain(
      "GET /totally-missing",
    );
  });
});
