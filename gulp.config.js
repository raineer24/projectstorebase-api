const config = {};

config.variables = () => {
  const files = {
    env: 'development',
    alljs: [
      './api/**/*.js',
      './service/*.js',
      './middleware/*.js',
      './config/*.js',
      './*.js',
      './.env',
    ],
    test: {
      lib: './api/**/*.js',
      spec: './test/api/**/*.js',
      unit: {
        lib: [
          './api/**/*.js',
          '!./api/**/index.js',
        ],
        spec: [
          './test/api/unit/**/*-test.js',
        ],
        reportOptions: {
          dir: './test/unit-coverage',
          reporters: [
            'text',
            'lcov',
          ],
          reportOpts: {
            dir: './test/unit-coverage',
          },
        },
      },
      integration: {
        lib: [
          './api/**/*.js',
          '!./api/**/index.js',
        ],
        spec: [
          './test/api/client/*-test.js',
        ],
        reportOptions: {
          dir: './test/integration-coverage',
          reporters: [
            'text',
            'lcov',
          ],
          reportOpts: {
            dir: './test/integration-coverage',
          },
        },
      },
    },

  };

  return files;
};

module.exports = config.variables;
