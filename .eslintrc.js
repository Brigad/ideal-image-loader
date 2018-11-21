module.exports = {
  extends: ['airbnb', 'prettier'],
  parser: 'babel-eslint',
  rules: {
    'arrow-parens': ['error', 'as-needed', { requireForBlockBody: true }],
    'operator-linebreak': ['error', 'before'],
    'react/jsx-filename-extension': ['error', { extensions: ['.js'] }],
    'import/no-extraneous-dependencies': ['error', { peerDependencies: true }],
  },
};
