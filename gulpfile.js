import gulp from 'gulp';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import concat from 'gulp-concat';
import uglify_es from 'gulp-uglify-es';
import rename from 'gulp-rename';
import autoprefixer from 'gulp-autoprefixer';
import sourcemaps from 'gulp-sourcemaps';
import JavaScriptObfuscator from 'gulp-javascript-obfuscator';

const { src, dest } = gulp;
const sass = gulpSass(dartSass);
const uglify = uglify_es.default;

// JavaScript minify task
gulp.task('minify-js', () => {
  return gulp.src('assets/js/*.js') // or use 'src/js/*.js' if you want all JS files
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(JavaScriptObfuscator())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('./map'))
    .pipe(gulp.dest('dist/js'));
});

// CSS minify task
gulp.task('minify-css', () => {
  return gulp.src('assets/scss/*.scss') // or use 'src/css/*.css'
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('./map'))
    .pipe(gulp.dest('dist/css'));
});


// 🕵️‍♀️ Watcher task
gulp.task('watch-all', () => {
  gulp.watch('assets/js/*.js', gulp.series('minify-js'));
  gulp.watch('assets/scss/*.scss', gulp.series('minify-css'));
});
