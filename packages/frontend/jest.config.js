export default {
  testEnvironment: "node",
  testMatch: ["**/src/**/*.test.js"],
  transform: {},
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/data/mockMediaData.js",
  ],
};
