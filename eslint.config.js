import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import obsidianPlugin from 'eslint-plugin-obsidianmd';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    plugins: {
      obsidianmd: obsidianPlugin,
    },
    rules: {
      ...obsidianPlugin.configs.recommended.rules,
    },
  },
  {
    ignores: ['dist/', 'node_modules/', 'coverage/', '*.mjs'],
  },
  prettier
);
