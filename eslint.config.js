import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

// 👋 Import prettier plugins
import prettierConfig from 'eslint-config-prettier';
import pluginPrettier from 'eslint-plugin-prettier';

export default [
  {
    ignores: ['./dist'], // Array of ignore patterns
  },
  {
    files: ['**/*.{js,mjs,cjs,ts}'], // Glob patterns to match files
    languageOptions: {
      globals: globals.browser, // Specify browser globals
      parser: tsParser, // Use TypeScript parser for TypeScript files
    },
    plugins: {
      '@typescript-eslint': tseslint, // Register the TypeScript ESLint plugin
      prettier: pluginPrettier, // 👋 Add prettier plugin
    },
    rules: {
      ...pluginJs.configs.recommended.rules, // Spread ESLint JS recommended rules
      ...tseslint.configs.recommended.rules, // Spread TypeScript ESLint recommended rules

      // 👋 Add prettier rules at the bottom
      ...prettierConfig.rules, // Merge Prettier and ESLint rules
      'prettier/prettier': [
        'error',
        {
          semi: true, // Prettier setting to enforce semicolons
        },
      ], // Show Prettier errors as ESLint errors
      'capitalized-comments': ['error'],
    },
  },
];
