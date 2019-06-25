module.exports = {
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  setupFilesAfterEnv: ["./tests/setup.ts"],
  collectCoverage: true,
  collectCoverageFrom: ["<rootDir>/src/**"],
  verbose: true
};
