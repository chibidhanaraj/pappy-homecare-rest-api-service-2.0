module.exports = {
  env: {
    commonjs: true,
    es2020: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 11,
  },
  rules: {
    camelcase: ['error', { ignoreDestructuring: true, properties: 'never' }],
    'no-extra-semi': 'off',
    semi: ['error', 'always'],
  },
};
