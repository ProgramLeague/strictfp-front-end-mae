let path = require('path');
let gulp = require('gulp'),
    cleanCss = require('gulp-clean-css'),
    sourcemaps = require('gulp-sourcemaps'),
    gulpClean = require('gulp-clean'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    inject = require('gulp-inject'),
    license = require('gulp-header-license'),
    browserSync = require('browser-sync').create(),
    rename = require('gulp-rename'),
    reload = browserSync.reload,
    fs = require('fs');
let { i18n, style, getThirdparty } = require('./gulp/tasks');

/*
clean
default(clean)->(post-modification)
i18n style3rd js3rd
style(style3rd) js(i18n,js3rd) assets
inject(style,js,assets)
post-modification(inject)
(serve(post-modification))
*/

gulp.task('default', ['clean'], function () {
    gulp.start(['post-modification']);
});

gulp.task('clean', function () {
    return gulp.src('./dist', {
        read: false
    })
        .pipe(gulpClean({ force: true }));
});

gulp.task('style3rd', function () {
    return gulp.src(getThirdparty('style' ))
        .pipe(style())
        .pipe(cleanCss())
        .pipe(gulp.dest('./dist/css/'))
        .pipe(reload({
            stream: true
        }));
    //no sms needed for 3rdparty plugins.
});

gulp.task('style', ['style3rd'], function () {
    return gulp.src([
        './src/less/**/*.less',
        './src/css/**/*.css',
    ])
        .pipe(sourcemaps.init())
        .pipe(style())
        .pipe(cleanCss())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dist/css/'))
        .pipe(reload({
            stream: true
        }));
});

gulp.task('assets', function () {
    gulp.src('./src/images/**/*')
        .pipe(gulp.dest('./dist/images/'));
    gulp.src('./node_modules/font-awesome/fonts/*')
        .pipe(gulp.dest('./dist/fonts/'));
});

gulp.task('i18n', function () {
    return gulp.src('./src/i18n/*.txt')
        .pipe(i18n())
        .pipe(gulp.dest('./dist/js/'))
        .pipe(reload({
            stream: true
        }));
});

gulp.task('js3rd', function () {
    return gulp.src(getThirdparty('js'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('./dist/js/'))
        .pipe(reload({
            stream: true
        }));
});

gulp.task('js', ['i18n', 'js3rd'], function () {
    return gulp.src('./src/js/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(license(fs.readFileSync('misc/license-head.txt','utf-8')))
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dist/js/'))
        .pipe(reload({
            stream: true
        }));
});

gulp.task('inject', ['style', 'js', 'assets'], function () {
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
        .pipe(gulp.dest('./dist/'))
        .pipe(reload({
            stream: true
        }));
});

gulp.task('serve', ['post-modification'], function () {
    browserSync.init({
        server: './dist'
    });

    gulp.watch('./src/js/**/*.js', ['js']);
    gulp.watch('./src/(images|fonts)/**/*', ['assets']);
    gulp.watch('./src/(less|css)/**/*', ['style']);
    gulp.watch('./src/*.html', ['inject']);
});