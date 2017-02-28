let path = require('path');
let gulp = require('gulp'),
    cleanCss = require('gulp-clean-css'),
    sourcemaps = require('gulp-sourcemaps'),
    gulpClean = require('gulp-clean'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    inject = require('gulp-inject'),
    license = require('gulp-header-license'),
    fs = require('fs');
let { i18n, style } = require('./tasks');

gulp.task('style', ['clean'], function () {
    return gulp.src([
        './src/less/**/*.less',
        './src/css/**/*.css',
        './node_modules/font-awesome/css/font-awesome.min.css'
    ])
        .pipe(sourcemaps.init())
        .pipe(style())
        .pipe(cleanCss())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dist/css/'));
});

gulp.task('asserts', ['clean'], function () {
    gulp.src('./src/images/**/*')
        .pipe(gulp.dest('./dist/images/'));
    gulp.src('./node_modules/font-awesome/fonts/*')
        .pipe(gulp.dest('./dist/fonts/'));
});

gulp.task('i18n', ['clean'], function () {
    return gulp.src('./src/i18n/*.txt')
        .pipe(i18n())
        .pipe(gulp.dest('./dist/js/'));
});

gulp.task('js', ['clean', 'i18n'], function () {
    return gulp.src([
        './node_modules/jquery/dist/jquery.min.js',
        './node_modules/device.js/device.js',
        './src/js/**/*.js',
        './dist/js/**/*.js'
    ])
        .pipe(sourcemaps.init())
        // .pipe(concat('dist.js'))
        .pipe(uglify())
        .pipe(license(fs.readFileSync('misc/license-head.txt','utf-8')))
        .pipe(gulp.dest('./dist/js'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dist/js/'));
});

gulp.task('clean', function () {
    return gulp.src('./dist', {
        read: false
    })
        .pipe(gulpClean({ force: true }));
});

gulp.task('inject', ['style', 'js'], function () {
    return gulp.src('./src/index.html')
        .pipe(
        inject(
            gulp.src(['./dist/js/**/*.js',
                './dist/css/**/*.css'], { read: false }),
            {
                ignorePath: '/dist',
                removeTags: true
            }
        )
        )
        .pipe(gulp.dest('./dist/'));
});

gulp.task('default', ['clean'], function () {
    gulp.start(['asserts', 'inject']);
});
