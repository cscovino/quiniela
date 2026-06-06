import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import astroPlugin from 'eslint-plugin-astro';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import type { Linter } from 'eslint';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: { jsx: true },
      },
      globals: { ...globals.browser, ...globals.node, ...globals.vitest },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      ...reactHooksPlugin.configs.recommended.rules,
      'import/prefer-default-export': 'off',
      'react/react-in-jsx-scope': 'off',
      'object-curly-newline': 'off',
      'operator-linebreak': 'off',
      'no-console': 'warn',
      'react-hooks/set-state-in-effect': 'off',
      'simple-import-sort/imports': ['error', {
        groups: [
          ['^node:'],
          ['^@?\\w'],
          ['^@(atoms|molecules|organisms|templates|pages|layouts|styles|utils|hooks|store|services|app-types|locales|lib|\\/)/'],
          ['^\\.'],
          ['^\\u0000'],
        ],
      }],
      'simple-import-sort/exports': 'error',
    },
    settings: { react: { version: '19.2' } },
  },
  {
    files: ['**/*.test.{ts,tsx}'],
    languageOptions: {
      globals: globals.vitest,
    },
  },
  ...astroPlugin.configs.recommended,
  { ignores: ['dist/', 'node_modules/', '.astro/', 'storybook-static/', 'src/data/third-place-matrix.js', 'src/data/third-place-matrix.js.map'] },
] as Linter.Config[];
