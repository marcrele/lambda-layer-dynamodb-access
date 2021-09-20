module.exports = {
  preset: "jest-dynalite",
  transform: { "^.+\\.(ts|tsx)$": "ts-jest" },
  transformIgnorePatterns: [],
  testMatch: ["**/*.test.ts"],
};