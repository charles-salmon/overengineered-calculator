module.exports = {
  preset: "ts-jest",
  setupFilesAfterEnv: ["./tests/setup.ts"],
  collectCoverage: true,
  collectCoverageFrom: ["<rootDir>/src/**"],
  verbose: true
};
