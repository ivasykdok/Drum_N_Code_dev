import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import { rules } from 'eslint-config-prettier/prettier';

export default defineConfig([{
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js, prettier: require("eslint-plugin-prettier") },
    extends: [
      "js/recommended",
      "plugin:prettier/recommended"
    ],
    languageOptions: {
      globals: globals.browser
    } ,
    rules: {
        "prettier/prettier": "error",
      },
    },
])
