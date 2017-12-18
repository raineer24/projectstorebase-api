const gulp = require('gulp');
const args = require('yargs').argv;
const config = require('./gulp.config')();
require('dotenv').config();

const $ = require('gulp-load-plugins')({ lazy: true });

gulp.task('help', $.taskListing);

function log(msg) {
  if (typeof (msg) === 'object') {
    Object.keys(msg).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(msg, key)) {
        $.util.log($.util.colors.blue(msg[key]));
      }
    });

    // for (const item in msg) {
    //   if (Object.prototype.hasOwnProperty.call(msg, item)) {
    //     $.util.log($.util.colors.blue(msg[item]));
    //   }
    // }
  } else {
    $.util.log($.util.colors.blue(msg));
  }
}

gulp.task('lint', () => {
  log('eslint - Running lint');
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
  log('Running unit test');
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
//   log('Running integration test');
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
//   log('Running configuration... ');
//   return gulp
//     .src('./.env.local')
//     .pipe($.rename('.env'))
//     .pipe(gulp.dest('./'));
// });

function serve(isDev) {
  log(`Running in ${isDev ? 'development' : 'production'} mode...`);
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
