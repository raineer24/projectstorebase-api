/* jslint node: true */
"use strict";

var gulp = require('gulp');
var args = require('yargs').argv;
var config = require('./gulp.config')();
require('dotenv').config();

var $ = require('gulp-load-plugins')({lazy: true});

gulp.task('help', $.taskListing);

function log (msg) {
  if (typeof(msg) === 'object') {
    for (var item in msg) {
      if (msg.hasOwnProperty(item)) {
        $.util.log($.util.colors.blue(msg[item]));
      }
    }
  }
  else {
    $.util.log($.util.colors.blue(msg));
  }
}

gulp.task('lint', function () {
  log('eslint - Running lint');
  return gulp
    .src(config.alljs)
    .pipe($.if(args.verbose, $.print()))
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError());
});

// gulp.task('unit-test', ['lint'], function (done) {
//   log('Running unit test');
//   gulp
//     .src(config.test.unit.lib)
//     .pipe($.istanbul())
//     .pipe($.istanbul.hookRequire())
//     .on('finish', function () {
//       gulp.src(config.test.unit.spec)
//         .pipe($.babel())
//         .pipe($.injectModules())
//         .pipe($.mocha())
//         .pipe($.istanbul.writeReports(config.test.unit.reportOptions))
//         .pipe($.istanbul.enforceThresholds({ thresholds: { global: 90 } }))
//         .on('finish', done);
//     });
// });
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

function serve (isDev) {
  log('Running in ' + (isDev ? 'development' : 'production') + ' mode...');
  if (isDev) {
    $.nodemon({
      script: 'app.js',
      tasks: ['lint']
    });
  }
  else {
    $.nodemon({
      script: 'app.js'
    });
  }
}

gulp.task('test', ['integration-test'], function () { });
gulp.task('develop',['configure-dev'], function () { serve(true); });
gulp.task('default', ['help'], function () { });
gulp.task('production', function () { serve(false); });
