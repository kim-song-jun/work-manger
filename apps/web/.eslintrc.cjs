/**
 * ESLint config (apps/web)
 *
 * 정책:
 *  - eslint:recommended + @typescript-eslint/recommended + react/recommended +
 *    react-hooks/recommended + import-order.
 *  - FSD (Feature-Sliced Design) 레이어 규칙은 eslint-plugin-boundaries 가
 *    설치되어 있을 때만 활성. 설치 전에는 docs/guidelines/engineering-guidelines.md
 *    §2 의 import 방향 규칙을 코드 리뷰로 강제.
 *
 * 일관성을 위해 ESLint 9 flat config 으로 옮기기 전까지는 .eslintrc.cjs 를 유지.
 */
module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
  settings: {
    react: { version: "detect" },
    "import/resolver": {
      typescript: { project: "./tsconfig.json" },
      node: { extensions: [".js", ".jsx", ".ts", ".tsx"] },
    },
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
  ],
  plugins: ["@typescript-eslint", "react", "react-hooks", "import"],
  rules: {
    // TypeScript 가 PropTypes 를 대신.
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",

    // 빈 인터페이스는 도메인 모델 placeholder 로 종종 사용.
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/no-explicit-any": "warn",

    // 코드 위생.
    "no-console": ["warn", { allow: ["warn", "error", "info"] }],
    "prefer-const": "error",
    eqeqeq: ["error", "smart"],

    // import 순서: 외부 → 내부 (FSD 레이어 순서).
    "import/order": [
      "warn",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          ["parent", "sibling", "index"],
        ],
        pathGroups: [
          { pattern: "@app/**", group: "internal", position: "before" },
          { pattern: "@pages/**", group: "internal", position: "before" },
          { pattern: "@widgets/**", group: "internal", position: "before" },
          { pattern: "@features/**", group: "internal", position: "before" },
          { pattern: "@entities/**", group: "internal", position: "before" },
          { pattern: "@shared/**", group: "internal", position: "after" },
        ],
        pathGroupsExcludedImportTypes: ["builtin"],
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],
  },
  ignorePatterns: [
    "dist/",
    "build/",
    "coverage/",
    "node_modules/",
    "src/shared/api/openapi-types.ts",
    "scripts/",
    "*.config.{js,cjs,ts}",
  ],
  overrides: [
    {
      // 테스트 파일은 일부 룰 완화.
      files: ["**/*.test.{ts,tsx}", "**/test/**/*.{ts,tsx}"],
      env: { node: true },
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "no-console": "off",
      },
    },
    {
      // Storybook 파일은 default-export 가 정상.
      files: ["**/*.stories.{ts,tsx}"],
      rules: { "import/no-anonymous-default-export": "off" },
    },
  ],
};
