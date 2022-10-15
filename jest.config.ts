const config = {
  coverageProvider: "v8",
  transformIgnorePatterns: ["<rootDir>/node_modules/"],
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
};
export default config;
