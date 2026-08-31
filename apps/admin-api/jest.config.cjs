require("dotenv").config({ path: ".env.test" });

module.exports = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "<rootDir>/tsconfig.json"
      }
    ]
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"]
};
