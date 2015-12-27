// All Gulp Plugins
var gulp          = require('gulp'),
  // HTML
    htmlReplace   = require('gulp-html-replace'),
  // CSS
    sass          = require('gulp-sass'),
    autoprefixer  = require('gulp-autoprefixer'),
  // JS
    concat        = require('gulp-concat'),
    uglify        = require('gulp-uglify'),
  // OTHER TOOLS
    del           = require('del'),
    gulpif        = require('gulp-if'),
    rename        = require('gulp-rename'),
    plumber       = require('gulp-plumber'),
    runSequence   = require('run-sequence'),
    browserSync   = require('browser-sync');


gulp.task('default', ['browserSync']);


// Run 'gulp build' in console for Production..
// --------------------------------------------
var buildCondition = false;

gulp.task('build', function() {
  runSequence(
    'clean',
    'condition',
    ['html', 'sass', 'js', 'images', 'fonts']
  );
});

gulp.task('condition', function() {
  buildCondition = true;
});
// --------------------------------------------


// HTML.. SASS.. JS.. Images.. Fonts..
// ------------------------------------------------------
gulp.task('html', function() {
  return gulp.src('app/**/*.html')
    .pipe(gulpif(buildCondition, htmlReplace({
      'css': 'css/style-main.min.css',
      'js': 'js/script-main.min.js'
    })))
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('sass', function() {
  return gulp.src('app/sass/**/style-main.scss')
    .pipe(gulpif(buildCondition,
      sass({ outputStyle: 'compressed' }), // if true compressed
      sass({ outputStyle: 'expanded' })    // if false expanded
    ))
      // Run errorHandler if have error
      .on('error', errorHandler)
    .pipe(autoprefixer({
      browser: ['last 2 versions', '> i%', 'not ie <= 8'],
      cascade: true
    }))
    .pipe(gulpif(buildCondition, rename('style-main.min.css')))
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('js', function() {
  return gulp.src('app/js/**/*.js')
    .pipe(plumber()) // will handle if have error in js file when 'gulp build'
    .pipe(concat('script-main.js'))
    .pipe(gulpif(buildCondition, uglify()))
    .pipe(gulpif(buildCondition, rename('script-main.min.js')))
    .pipe(gulp.dest('dist/js'))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('images', function() {
  return gulp.src('app/images/**/*')
    .pipe(gulp.dest('dist/images'))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('fonts', function() {
  return gulp.src('app/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'))
    .pipe(browserSync.reload({ stream: true }));
});
// ------------------------------------------------------


// Delete 'dist' folder during 'gulp build'
// ----------------------------------------
gulp.task('clean', function() {
  del('dist');
});
// ----------------------------------------


// Prevent gulp watch from break..
// ------------------------------------------------------
function errorHandler(error) {
    // Logs out error in the command line
  console.log(error.toString());
    // Ends the current pipe, so Gulp watch doesn't break
  this.emit('end');
}
// ------------------------------------------------------


gulp.task('watch', ['html', 'sass', 'js', 'images', 'fonts'], function() {
  gulp.watch('app/**/*.html', ['html']);
  gulp.watch('app/sass/**/*.{scss,sass}', ['sass']);
  gulp.watch('app/js/**/*.js', ['js']);
  gulp.watch('app/images/**/*', ['images']);
  gulp.watch('app/fonts/**/*', ['fonts']);
});


// Wait for watch, then launch the Server...
// ---------------------------------------------
gulp.task('browserSync', ['watch'], function() {
  browserSync({
    server: {
      baseDir: 'dist'
    }
  });
});
// ---------------------------------------------
