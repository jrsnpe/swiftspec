module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
  },
  globals: {
    hljs: "readonly",
  },
  rules: {
    // Você pode adicionar regras personalizadas aqui
  },
};
