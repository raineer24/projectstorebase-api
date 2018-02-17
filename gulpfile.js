const gulp = require('gulp');
const args = require('yargs').argv;
const config = require('./gulp.config')();
require('dotenv').config();

const $ = require('gulp-load-plugins')({ lazy: true });
const log = require('color-logs')(true, true, 'Item');

gulp.task('help', $.taskListing);

gulp.task('lint', () => {
  log.info('eslint - Running lint');
  return gulp
    .src(config.alljs)
    .pipe($.if(args.verbose, $.print()))
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError());
});

gulp.task('db-create', $.shell.task([
  'mysql -u root -h localhost -e "DROP DATABASE IF EXISTS grocerystore;CREATE DATABASE grocerystore;"',
  'mysql -u root -h localhost grocerystore < db/local.sql',
]));

gulp.task('unit-test', ['lint'], (done) => {
  log.info('Running unit test');
  gulp
    .src(config.test.unit.lib)
    .pipe($.istanbul())
    .pipe($.istanbul.hookRequire())
    .on('finish', () => {
      gulp.src(config.test.unit.spec)
        .pipe($.babel())
        .pipe($.injectModules())
        .pipe($.mocha())
        .pipe($.istanbul.writeReports(config.test.unit.reportOptions))
        .pipe($.istanbul.enforceThresholds({ thresholds: { global: 90 } }))
        .on('finish', done);
    });
});
// gulp.task('integration-test', ['unit-test'], function () {
//   log.info('Running integration test');
//   gulp
//     .src(config.test.integration.spec)
//     .pipe($.istanbul())
//     .pipe($.istanbul.hookRequire())
//     .on('finish', function () {
//       gulp
//         .src(config.test.integration.spec)
//         .pipe($.babel())
//         .pipe($.injectModules())
//         .pipe($.mocha())
//         .pipe($.istanbul.writeReports(config.test.integration.reportOptions))
//         .pipe($.istanbul.enforceThresholds({ thresholds: { global: 90 } }));
//     });
// });
//
// gulp.task('configure-dev', ['lint'], function () {
//   log.info('Running configuration... ');
//   return gulp
//     .src('./.env.local')
//     .pipe($.rename('.env'))
//     .pipe(gulp.dest('./'));
// });

function serve(isDev) {
  log.info(`Running in ${isDev ? 'development' : 'production'} mode...`);
  if (isDev) {
    $.nodemon({
      script: 'app.js',
      tasks: ['lint', 'db-create'],
    });
  } else {
    $.nodemon({
      script: 'app.js',
    });
  }
}

gulp.task('watcher', () => {
  gulp.watch(config.alljs, ['lint']);
});

gulp.task('test', ['unit-test'], () => { });
gulp.task('develop', ['db-create'], () => { serve(true); });
gulp.task('default', ['help'], () => { });
gulp.task('production', () => { serve(false); });
