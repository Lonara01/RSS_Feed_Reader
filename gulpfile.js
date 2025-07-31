const gulp = require('gulp');
const terser = require('gulp-terser');
const csso = require('gulp-csso');
const htmlmin = require('gulp-htmlmin');

// JavaScript minify task
gulp.task('minify-js', () => {
  return gulp.src('src/js/script.js') // or use 'src/js/*.js' if you want all JS files
    .pipe(terser())
    .pipe(gulp.dest('dist/js'));
});

// CSS minify task
gulp.task('minify-css', () => {
  return gulp.src('src/css/style.css') // or use 'src/css/*.css'
    .pipe(csso())
    .pipe(gulp.dest('dist/css'));
});

// HTML minify task
gulp.task('minify-html', () => {
  return gulp.src('src/index.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('dist'));
});

// 🕵️‍♀️ Watcher task
gulp.task('watch', () => {
  gulp.watch('src/js/script.js', gulp.series('minify-js'));
  gulp.watch('src/css/style.css', gulp.series('minify-css'));
  gulp.watch('src/index.html', gulp.series('minify-html'));
});

// 🧪 Optional: Run all + start watching
gulp.task('default', gulp.parallel('minify-js', 'minify-css', 'minify-html', 'watch'));
