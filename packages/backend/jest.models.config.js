export default {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  transform: {},
  setupFiles: ["<rootDir>/tests/jest.env.js"],
  clearMocks: true,
  collectCoverageFrom: [
    "src/models/**/*.js",
    "src/services/**/*.js",
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};
