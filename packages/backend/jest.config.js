export default {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  transform: {},
  setupFiles: ["<rootDir>/tests/jest.env.js"],
  clearMocks: true,
};
