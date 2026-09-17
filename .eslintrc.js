module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      files: ['jest.setup.js'],
      env: {
        jest: true,
      },
    },
    {
      files: ['src/**/domain/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: 'react',
                message: 'domain must not import React.',
              },
              {
                name: 'react-native',
                message: 'domain must not import React Native.',
              },
              {
                name: '@react-navigation/native',
                message: 'domain must not import React Navigation.',
              },
              {
                name: '@react-navigation/native-stack',
                message: 'domain must not import React Navigation.',
              },
              {
                name: '@react-native-async-storage/async-storage',
                message: 'domain must not import AsyncStorage.',
              },
            ],
            patterns: [
              {
                group: ['**/data/**', '**/presentation/**', '**/app/**'],
                message:
                  'domain must not import data, presentation, or app layers.',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['src/**/data/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: 'react',
                message: 'data must not import React.',
              },
              {
                name: 'react-native',
                message: 'data must not import React Native.',
              },
              {
                name: '@react-navigation/native',
                message: 'data must not import React Navigation.',
              },
              {
                name: '@react-navigation/native-stack',
                message: 'data must not import React Navigation.',
              },
            ],
            patterns: [
              {
                group: ['**/presentation/**', '**/app/**'],
                message: 'data must not import presentation or app layers.',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['src/**/presentation/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: '@react-native-async-storage/async-storage',
                message:
                  'presentation must not access AsyncStorage; use ViewModels and use cases.',
              },
            ],
            patterns: [
              {
                group: ['**/data/**'],
                message:
                  'presentation must depend on domain contracts and use cases, not data implementations or DTOs.',
              },
            ],
          },
        ],
      },
    },
  ],
};
