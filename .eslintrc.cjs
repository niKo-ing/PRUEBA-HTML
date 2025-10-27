module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react-refresh", "react-hooks"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  rules: {
    "react-refresh/only-export-components": "warn",
    "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }]
  }
};