// eslint.config.mjs
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import unusedImports from 'eslint-plugin-unused-imports';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default tseslint.config(
  // Base JS rules
  js.configs.recommended,
  // TypeScript aware rules (needs tsconfig.json)
  ...tseslint.configs.recommendedTypeChecked,
  {
    // Ignore build artifacts
    ignores: ['dist', 'build', 'node_modules'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        // Point to your tsconfig for type-aware linting
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'unused-imports': unusedImports,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      // React/TanStack hooks hygiene
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Remove unused code & keep imports tidy
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': ['warn', { args: 'after-used', argsIgnorePattern: '^_' }],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

      // Your functional/immutable style
      'no-var': 'error',
      'no-restricted-syntax': [
        'error',
        { selector: 'VariableDeclaration[kind="let"]', message: 'Use const instead of let.' },
        { selector: 'ForStatement', message: 'Use map/reduce/filter instead of for.' },
        { selector: 'ForInStatement', message: 'Avoid for..in.' },
        { selector: 'ForOfStatement', message: 'Avoid for..of.' },
        { selector: 'WhileStatement', message: 'Avoid while; prefer pure transforms.' },
        { selector: 'DoWhileStatement', message: 'Avoid do..while.' },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: '@mui/material', message: 'Use path import, e.g. @mui/material/Button' },
            {
              name: '@mui/icons-material',
              message: 'Use path import, e.g. @mui/icons-material/Add',
            },
          ],
        },
        {
          patterns: [{ regex: '^@mui/[^/]+$' }],
        },
      ],

      'no-param-reassign': 'error',
      'prefer-const': 'error',
    },
  },
);
