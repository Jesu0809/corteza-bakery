module.exports = {
  default: {
    paths: ['../especificaciones/*.feature'],
    require: ['features/step_definitions/*.js'],
    format: ['progress-bar', 'summary', 'html:reportes/cucumber.html'],
    language: 'es',
  },
};
