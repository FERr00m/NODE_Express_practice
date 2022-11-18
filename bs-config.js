module.exports = {
  proxy: 'localhost:8000',
  files: ['**/*.css', '**/*.pug', '**/*.js'],
  ignore: ['node_modules'],
  reloadDelay: 10,
  ui: {
    port: 8080,
  },
  notify: false,
  port: 3000,
};
