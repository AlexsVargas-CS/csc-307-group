import { jest } from "@jest/globals";
import request from "supertest";

const userStore = new Map();

const UserMock = {
  findOne: jest.fn(async ({ username }) => userStore.get(username) || null),
  create: jest.fn(async ({ username, passwordHash }) => {
    const doc = { username, passwordHash };
    userStore.set(username, doc);
    return doc;
  }),
};

const bcryptMock = {
  genSalt: jest.fn(async () => "salt"),
  hash: jest.fn(async (pwd) => `hashed:${pwd}`),
  compare: jest.fn(async () => false),
};

const jwtMock = {
  sign: jest.fn((payload, secret, options, cb) => cb(null, `token:${payload.username}`)),
  verify: jest.fn((token, secret, cb) => cb(null, { username: token.replace(/^token:/, "") })),
};

jest.unstable_mockModule("../src/models/User.js", () => ({
  default: UserMock,
}));
jest.unstable_mockModule("bcrypt", () => ({
  default: bcryptMock,
}));
jest.unstable_mockModule("jsonwebtoken", () => ({
  default: jwtMock,
}));

const { default: app } = await import("../src/app.js");

beforeEach(() => {
  userStore.clear();
  bcryptMock.compare.mockResolvedValue(false);
});

describe("Auth", () => {
  test("POST /signup rejects missing fields", async () => {
    const res = await request(app).post("/signup").send({ username: "a" });
    expect(res.status).toBe(400);
  });

  test("POST /signup creates user and returns JWT", async () => {
    const res = await request(app)
      .post("/signup")
      .send({ username: "alice", pwd: "password123" });

    expect(res.status).toBe(201);
    expect(typeof res.body.token).toBe("string");
    expect(res.body.token).toBe("token:alice");

    expect(UserMock.findOne).toHaveBeenCalledWith({ username: "alice" });
    expect(bcryptMock.genSalt).toHaveBeenCalled();
    expect(bcryptMock.hash).toHaveBeenCalledWith("password123", "salt");
    expect(UserMock.create).toHaveBeenCalledWith({
      username: "alice",
      passwordHash: "hashed:password123",
    });
    expect(jwtMock.sign).toHaveBeenCalled();
  });

  test("POST /signup rejects duplicate username", async () => {
    await UserMock.create({ username: "bob", passwordHash: "hash" });

    const res = await request(app)
      .post("/signup")
      .send({ username: "bob", pwd: "password123" });

    expect(res.status).toBe(409);
  });

  test("POST /login rejects unknown user", async () => {
    const res = await request(app)
      .post("/login")
      .send({ username: "nobody", pwd: "x" });

    expect(res.status).toBe(401);
  });

  test("POST /login rejects wrong password", async () => {
    await request(app).post("/signup").send({ username: "cory", pwd: "goodpass" });

    const res = await request(app)
      .post("/login")
      .send({ username: "cory", pwd: "badpass" });

    expect(res.status).toBe(401);
  });

  test("POST /login returns JWT for valid credentials", async () => {
    await request(app).post("/signup").send({ username: "dana", pwd: "goodpass" });
    bcryptMock.compare.mockResolvedValue(true);

    const res = await request(app)
      .post("/login")
      .send({ username: "dana", pwd: "goodpass" });

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
    expect(res.body.token).toBe("token:dana");
    expect(bcryptMock.compare).toHaveBeenCalled();
    expect(jwtMock.sign).toHaveBeenCalled();
  });
});
