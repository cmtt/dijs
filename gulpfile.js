var gulp = require('gulp');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var closureCompiler = require('gulp-closure-compiler');

var compilerOptions = {
  fileName : 'di.min.js',
  compilerPath : process.env.CLOSURE_PATH,
  compilerFlags: {
    compilation_level: 'ADVANCED_OPTIMIZATIONS',
    externs: ['contrib/di-externs.js']
  }
};

gulp.task('default', ['jshint','mocha']);

gulp.task('jshint', function () {
  return gulp
    .src([
      'gulpfile.js',
      'lib/*.js',
      'contrib/test-helper.js',
      'spec/*.js'
    ])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('mocha', function () {
  return gulp
    .src([
      'contrib/test-helper.js',
      'spec/*.js'
      ])
    .pipe(mocha({ reporter : 'list'}));
});

gulp.task('closure', function () {
  return gulp
    .src(['lib/di.js'])
    .pipe(closureCompiler(compilerOptions))
    .pipe(gulp.dest('build'));
});

gulp.task('watch', ['default'], function () {
  gulp.watch('lib/*.js', ['default']);
  gulp.watch('spec/*.js', ['default']);
});
