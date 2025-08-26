// ESLint flat config for React/React Native Expo project (CommonJS)
const js = require('@eslint/js');
const reactPlugin = require('eslint-plugin-react');
const babelParser = require('@babel/eslint-parser');

module.exports = [
  { ignores: ['node_modules/**', '**/node_modules/**'] },
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
  ecmaVersion: 2021,
  sourceType: 'module',
  parser: babelParser,
  parserOptions: { 
    requireConfigFile: false, 
    ecmaFeatures: { jsx: true },
    babelOptions: { presets: ['babel-preset-expo'] } 
  },
      globals: {
        // browser-like globals used in RN/Expo code
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        FormData: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
      },
    },
    plugins: { react: reactPlugin },
    rules: {
      'react/prop-types': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' }],
      'react/jsx-uses-vars': 'warn',
      'no-empty': 'off'
    },
    settings: { react: { version: 'detect' } },
  },
  {
    files: ['src/__tests__/**/*.{js,jsx}'],
    languageOptions: {
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
  beforeAll: 'readonly',
  afterAll: 'readonly',
  beforeEach: 'readonly',
  afterEach: 'readonly',
      },
    },
    rules: {
      // Tests often import helpers/components that get tree-shaken by Jest; keep CI quiet
      'no-unused-vars': 'off',
    }
  },
];
