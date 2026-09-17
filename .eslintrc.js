module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      files: ['src/**/domain/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [
              'react',
              'react-native',
              '@react-navigation/native',
              '@react-navigation/native-stack',
              '@react-native-async-storage/async-storage',
            ],
            patterns: [
              '**/data/**',
              '**/presentation/**',
              '**/app/**',
              '@app/**',
              '@features/**/data/**',
              '@features/**/presentation/**',
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
              'react',
              'react-native',
              '@react-navigation/native',
              '@react-navigation/native-stack',
            ],
            patterns: [
              '**/presentation/**',
              '**/app/**',
              '@app/**',
              '@features/**/presentation/**',
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
            paths: ['@react-native-async-storage/async-storage'],
            patterns: ['**/data/**', '@features/**/data/**'],
          },
        ],
      },
    },
  ],
};
