var browserify = require('./browserify');
var buffer = require('vinyl-buffer');
var connect = require('gulp-connect');
var del = require('del');
var derequire = require('gulp-derequire');
var flatten = require('gulp-flatten');
var pkg = require('../package.json');
var gulp = require('gulp');
var gutil = require('gulp-util');
var gzip = require('gulp-gzip');
var header = require('gulp-header');
var jade = require('gulp-jade');
var rename = require('gulp-rename');
var source = require('vinyl-source-stream');
var stylus = require('gulp-stylus');
var tar = require('gulp-tar');
var uglify = require('gulp-uglify');


var BANNER =
  '/*! Quill Editor v${pkg.version}\n' +
  ' *  https://quilljs.com/\n' +
  ' *  Copyright (c) 2014, Jason Chen\n' +
  ' *  Copyright (c) 2013, salesforce.com\n' +
  ' */\n\n';

var watcher = browserify('./src/index.js');
watcher.on('update', bundle);
function bundle() {
  return watcher.bundle()
    .on('error', function(err) {
      gutil.log(gutil.colors.red('[browserify]', err.name, err.message));
      this.emit('end');
    })
    .pipe(source('quill.js'))
    .pipe(buffer())
    .pipe(derequire())
    .pipe(gulp.dest('.build/quill/'))
    .pipe(connect.reload());
}


gulp.task('source:watch', bundle);

gulp.task('source', ['source:watch'], function() {
  watcher.close();
});

gulp.task('minify', function() {
  return gulp.src('.build/quill/quill.js')
    .pipe(uglify({ banner: BANNER }))
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest('.build/quill/'));
});

gulp.task('theme', function() {
  return gulp.src('src/themes/*/*.styl')
    .pipe(stylus())
    .pipe(rename({ prefix: 'quill.' }))
    .pipe(flatten())
    .pipe(gulp.dest('.build/quill/'))
    .pipe(connect.reload());
});


gulp.task('examples:styles', function() {
  return gulp.src('examples/styles/*.styl')
    .pipe(stylus())
    .pipe(gulp.dest('.build/quill/examples/styles/'))
    .pipe(connect.reload());
});

gulp.task('examples:html', function() {
  return gulp.src('examples/*.jade')
    .pipe(jade({ pretty: true }))
    .pipe(gulp.dest('.build/quill/examples/'))
    .pipe(connect.reload());
});

gulp.task('examples:scripts', function() {
  return gulp.src('examples/scripts/*.js')
    .pipe(gulp.dest('.build/quill/examples/scripts/'))
    .pipe(connect.reload());
});


gulp.task('clean', function() {
  return del(['.build', 'dist']);
});

gulp.task('dist', function() {
  return gulp.src(['.build/quill/quill.js', '.build/quill/quill.*.css'])
    .pipe(header(BANNER, { pkg: pkg }))
    .pipe(gulp.dest('dist/'));
});

gulp.task('compress', function() {
  return gulp.src('.build/quill/*')
    .pipe(tar('quill.tar'))
    .pipe(gzip())
    .pipe(gulp.dest('.build/'));
});
