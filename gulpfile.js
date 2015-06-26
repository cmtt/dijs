var gulp = require('gulp');
var mocha = require('gulp-mocha');
var jshint = require('gulp-jshint');
var webpack = require('gulp-webpack');
var compiler = require('gulp-closure-compiler');

gulp.task('default', ['jshint', 'mocha', 'webpack']);

var paths = {
  src : ['index.js', 'legacy.js', 'promise.js', 'methods/*.js', 'lib/**/*.js'],
  test : 'test/**/*.js',
  dest : 'dist'
};

var compilerOptions = {
  compilerPath: process.env.CLOSURE_PATH,
  fileName: 'di.min.js',    
  compilerFlags: {
    compilation_level: 'ADVANCED_OPTIMIZATIONS',
    language_in : 'ECMASCRIPT5',
    externs: 'contrib/externs.js'
  }
};

gulp.task('jshint', function () {
  return gulp.src(paths.src)
  .pipe(jshint())
  .pipe(jshint.reporter('default'));
});

gulp.task('mocha', function() {
  return gulp.src(paths.test)
  .pipe(mocha());
});

gulp.task('webpack', function () {
  return gulp.src(['index.js'])
  .pipe(webpack({
    target : 'node',
    output : {
      filename : 'di.js'
    }
  }))
  .pipe(gulp.dest(paths.dest));
});

gulp.task('watch', ['default'], function () {
  var srcs = [];
  for (var k in paths) srcs.push(paths[k]);
  gulp.watch(srcs, ['default']);
});

gulp.task('minify', ['webpack'], function () {
  return gulp.src('dist/di.js')
  .pipe(compiler(compilerOptions))
  .pipe(gulp.dest(paths.dest));
});
