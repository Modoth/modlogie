module.exports = {
  env: {
    browser: true,
    es2020: true
  },
  extends: [
    'plugin:react/recommended',
    'standard'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 11,
    sourceType: 'module'
  },
  plugins: [
    'react',
    '@typescript-eslint'
  ],
  ignorePatterns: ['src/impl/remote-apis/**', 'src/plugins/h5/view/frameworks'],
  rules: {
    'no-unused-vars': 'off',
    'no-useless-constructor': 0,
    '@typescript-eslint/no-useless-constructor': 0
  }
}
