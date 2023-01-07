const config = {
  transformIgnorePatterns: ["<rootDir>/node_modules/"],
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
  coverageProvider: "v8",
  collectCoverageFrom: [
    "!**/node_modules/**",
    "!src/tests/**",
    "src/**/*.{ts,tsx}",
  ],
};
export default config;
