const path = require('path')

module.exports = {
  extends: '@ivangabriele/eslint-config-typescript-react',
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    project: path.join(__dirname, 'tsconfig.json')
  },
  ignorePatterns: ['.eslintrc.js', '.eslintrc.partial.js'],
  env: {
    browser: true
  },
  rules: {
    '@typescript/no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'off',

    'react/react-in-jsx-scope': 'off'
  },
  overrides: [
    {
      files: [
        'src/domain/shared_slices/**/*.ts',
        'src/domain/shared_slices/**/*.js',
        'src/**/*.slice.ts',
        'src/**/*.slice.js',
        'src/**/slice.ts'
      ],
      rules: {
        'no-param-reassign': 'off'
      }
    },
    {
      files: ['src/ui/**/*.tsx'],
      rules: {
        'react/jsx-props-no-spreading': 'off'
      }
    },
    {
      files: ['cypress/**/*.js', 'cypress/**/*.ts', 'cypress.config.ts'],
      plugins: ['cypress', 'no-only-tests'],
      rules: {
        'cypress/no-assigning-return-values': 'error',
        // TODO Hopefully we'll able to enforce that rule someday.
        'cypress/no-unnecessary-waiting': 'off',
        'cypress/assertion-before-screenshot': 'error',
        // TODO Hopefully we'll able to enforce that rule someday.
        'cypress/no-force': 'off',
        'cypress/no-async-tests': 'error',
        'cypress/no-pause': 'error',

        'import/no-default-export': 'off',
        'import/no-extraneous-dependencies': 'off',
        'no-only-tests/no-only-tests': 'error'
      }
    },
    // Custom monitorenv rule
    {
      files: ['**/*.stories.*'],
      rules: {
        'import/no-anonymous-default-export': 'off',
        'import/no-default-export': 'off',
        'react/jsx-props-no-spreading': 'off',
        'no-console': 'off'
      }
    }
  ]
}
