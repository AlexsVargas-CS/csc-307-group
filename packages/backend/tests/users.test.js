import { jest } from "@jest/globals";
import request from "supertest";

const UserMock = {
  findOne: jest.fn(() => ({ lean: async () => null })),
  findOneAndUpdate: jest.fn(() => ({ lean: async () => null })),
};

const jwtMock = {
  sign: jest.fn((payload, secret, options, cb) => cb(null, `token:${payload.username}`)),
  verify: jest.fn((token, secret, cb) =>
    cb(null, { username: token.replace(/^token:/, "") }),
  ),
};

jest.unstable_mockModule("../src/models/User.js", () => ({
  default: UserMock,
}));
jest.unstable_mockModule("jsonwebtoken", () => ({
  default: jwtMock,
}));

const { default: app } = await import("../src/app.js");

beforeEach(() => {
  UserMock.findOne.mockReturnValue({ lean: async () => null });
  UserMock.findOneAndUpdate.mockReturnValue({ lean: async () => null });
});

const tokenFor = (username) => `token:${username}`;

describe("Users / account flow", () => {
  test("GET /api/me requires auth", async () => {
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    const res = await request(app).get("/api/me");
    logSpy.mockRestore();
    expect(res.status).toBe(401);
  });

  test("GET /api/me returns current user profile", async () => {
    UserMock.findOne.mockReturnValue({
      lean: async () => ({ username: "me-user", profilePictureUrl: "" }),
    });
    const token = tokenFor("me-user");

    const res = await request(app)
      .get("/api/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      username: "me-user",
      profilePictureUrl: "",
    });
  });

  test("GET /api/users/:username returns public profile", async () => {
    UserMock.findOne.mockReturnValue({
      lean: async () => ({
        username: "public",
        profilePictureUrl: "",
        bio: "hello",
        favoriteMovies: [10, 20],
      }),
    });

    const res = await request(app).get("/api/users/public");
    expect(res.status).toBe(200);
    expect(res.body.username).toBe("public");
    expect(res.body.bio).toBe("hello");
    expect(res.body.favoriteMovies).toEqual([10, 20]);
  });

  test("PUT /api/users/:username forbids editing other users", async () => {
    const token = tokenFor("alice");
    const res = await request(app)
      .put("/api/users/bob")
      .set("Authorization", `Bearer ${token}`)
      .send({ bio: "nope" });

    expect(res.status).toBe(403);
    expect(UserMock.findOneAndUpdate).not.toHaveBeenCalled();
  });

  test("PUT /api/users/:username updates bio and sanitizes favoriteMovies", async () => {
    UserMock.findOneAndUpdate.mockImplementation((_filter, update) => ({
      lean: async () => ({
        username: "editme",
        profilePictureUrl: "",
        bio: update.bio || "",
        favoriteMovies: update.favoriteMovies || [],
      }),
    }));

    const token = tokenFor("editme");

    const res = await request(app)
      .put("/api/users/editme")
      .set("Authorization", `Bearer ${token}`)
      .send({
        bio: "new bio",
        favoriteMovies: ["1", "2", "abc", -4, 0, 3, 4, 5, 6],
      });

    expect(res.status).toBe(200);
    expect(res.body.bio).toBe("new bio");
    expect(res.body.favoriteMovies).toEqual([1, 2, 3, 4, 5]);

    expect(UserMock.findOneAndUpdate).toHaveBeenCalledWith(
      { username: "editme" },
      { bio: "new bio", favoriteMovies: [1, 2, 3, 4, 5] },
      { new: true },
    );
  });
});
