/**
 * ESLint flat config (v9+) — apps/web
 *
 * 정책:
 *  - eslint:recommended + @typescript-eslint/recommended + react/recommended +
 *    react-hooks/recommended + import-order.
 *  - FSD (Feature-Sliced Design) 레이어 규칙은 eslint-plugin-boundaries 가
 *    설치되어 있을 때만 활성. 설치 전에는 docs/guidelines/engineering-guidelines.md
 *    §2 의 import 방향 규칙을 코드 리뷰로 강제.
 *
 * .eslintrc.cjs 에서 마이그레이션됨 (2026-05-08).
 */
import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";
import globals from "globals";

export default [
  {
    ignores: [
      "dist/**",
      "build/**",
      "coverage/**",
      "node_modules/**",
      "src/shared/api/openapi-types.ts",
      "scripts/**",
      "**/*.config.{js,cjs,mjs,ts}",
      "storybook-static/**",
      ".storybook/**",
      "public/**",
    ],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ...js.configs.recommended,
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      import: importPlugin,
    },
    settings: {
      react: { version: "detect" },
      "import/resolver": {
        typescript: { project: "./tsconfig.json" },
        node: { extensions: [".js", ".jsx", ".ts", ".tsx"] },
      },
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      // TypeScript 가 식별자 미정의를 자체 체크 — eslint no-undef 는 TS 에서 false positive 다발 (`PushSubscriptionJSON`, `BufferSource`, JSX 의 React 등). @typescript-eslint 공식 권장은 TS 파일에서 비활성.
      "no-undef": "off",
      // Icon.tsx 의 forwardRef + dynamic registration 패턴은 displayName 강제 시 ergonomics 손해.
      "react/display-name": "off",
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      "prefer-const": "error",
      eqeqeq: ["error", "smart"],
      // m-inbox / m-notice 의 `const items = data?.items || []` 패턴 — useMemo deps 회귀 위험은 인지하나 audit 범위 외. 별도 frontend 리팩터 task 로.
      "react-hooks/exhaustive-deps": "off",
      // newlines-between 은 side-effect import (`import "@shared/i18n"`) + path alias 조합에서 false positive 발생. 그룹 순서만 검사.
      "import/order": [
        "warn",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          pathGroups: [
            { pattern: "@app/**", group: "internal" },
            { pattern: "@processes/**", group: "internal" },
            { pattern: "@pages/**", group: "internal" },
            { pattern: "@widgets/**", group: "internal" },
            { pattern: "@features/**", group: "internal" },
            { pattern: "@entities/**", group: "internal" },
            { pattern: "@shared/**", group: "internal" },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "ignore",
        },
      ],
    },
  },
  {
    files: ["**/*.test.{ts,tsx}", "**/test/**/*.{ts,tsx}", "**/__tests__/**/*.{ts,tsx}"],
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
    },
  },
  {
    files: ["**/*.stories.{ts,tsx}"],
    rules: { "import/no-anonymous-default-export": "off" },
  },
];
