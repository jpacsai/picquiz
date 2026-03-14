// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  // Globális ignore-ok
  globalIgnores(['dist', 'build', 'node_modules']),

  // TS/TSX fájlokra vonatkozó blokk
  {
    files: ['**/*.{ts,tsx}'],

    // Bázis + TS + React Hooks + React Refresh
    extends: [
      js.configs.recommended,
      // Type-aware TS szabályok (tsconfig kell hozzá)
      ...tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
    ],

    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: process.cwd(),
      },
    },

    plugins: {
      'react-hooks': reactHooks,
      'unused-imports': unusedImports,
      'simple-import-sort': simpleImportSort,
    },

    rules: {
      // React / Hooks higiénia
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true, allowExportNames: ['Route'] },
      ],
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],

      // Importok rendben tartása
      'unused-imports/no-unused-imports': 'error',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // Csak EGY unused-vars szabály legyen aktív
      'no-unused-vars': 'off',
      'unused-imports/no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      // Típusimportok konzisztensen
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/only-throw-error': 'off',
      '@typescript-eslint/require-await': 'off',

      // Funkcionális / immutábilis stílus
      'no-var': 'error',
      'prefer-const': 'error',
      'no-param-reassign': 'error',
      'no-restricted-syntax': [
        'error',
        { selector: 'VariableDeclaration[kind="let"]', message: 'Use const instead of let.' },
        { selector: 'ForStatement', message: 'Use map/reduce/filter instead of for.' },
        { selector: 'ForInStatement', message: 'Avoid for..in.' },
        { selector: 'ForOfStatement', message: 'Avoid for..of.' },
        { selector: 'WhileStatement', message: 'Avoid while; prefer pure transforms.' },
        { selector: 'DoWhileStatement', message: 'Avoid do..while.' },
      ],
    },
  },
  {
    files: ['src/routes/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
]);
