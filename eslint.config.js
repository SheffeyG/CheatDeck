import pluginJs from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import pluginReact from "eslint-plugin-react";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["dist/*"],
    settings: {
      react: { version: "18.3" },
    },
  },

  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,

  stylistic.configs.customize({
    indent: 2,
    quotes: "double",
    braceStyle: "1tbs",
    semi: true,
    jsx: true,
  }),

  {
    files: ["src/**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "react/react-in-jsx-scope": "off",

      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",

      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
];
