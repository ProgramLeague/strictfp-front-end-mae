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
    injectString = require('gulp-inject-string'),
    rename = require('gulp-rename'),
    reload = browserSync.reload,
    sequence = require('gulp-sequence'),
    fs = require('fs');
let { i18n, style, getThirdparty } = require('./gulp/tasks');

/*
clean
1st:i18n style3rd js3rd
2nd:style js assets
3rd:inject
*/

gulp.task('clean', function () {
    return gulp.src('./dist', {
        read: false
    })
        .pipe(gulpClean({ force: true }));
});

gulp.task('style3rd', function () {
    return gulp.src(getThirdparty('style'))
        .pipe(style())
        .pipe(cleanCss())
        .pipe(gulp.dest('./dist/css/'))
        .pipe(reload({
            stream: true
        }));
    //no sms needed for 3rdparty plugins.
});

gulp.task('style', function () {
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

gulp.task('js', function () {
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

gulp.task('inject', function () {
    let presetOpts = {
        isRelease: !!gulp.env.release,
        cdn: gulp.env.cdn || ".",
        apiRoot: gulp.env['api-root'] || '/api/v0',
        misc: JSON.parse(gulp.env['preset-misc'] || '{}')
    };
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
        .pipe(
            injectString.replace(
                '<!-- intron:1 -->', 
                `<script>window.maePresetOpts = ${JSON.stringify(presetOpts)};</script>`
            )
        )
        .pipe(gulp.dest('./dist/'))
        .pipe(reload({
            stream: true
        }));
});

/* Things does not work with v3.9.1.
    They haven't updated the Gulp yet!

gulp.task('1st', function () {
    return gulp.parallel('i18n', 'style3rd', 'js3rd');
});

gulp.task('2nd', function () {
    return gulp.parallel('style', 'js', 'assets');
});

gulp.task('3rd', gulp.series('inject'));

gulp.task('default', gulp.series('clean', '1st', '2nd', '3rd'));

*/

//This should work and looks pretty good:
gulp.task('default', sequence(
    ['i18n', 'style3rd', 'js3rd'],
    ['style', 'js', 'assets'],
    'inject'
));

gulp.task('serve', ['default'], function () {
    browserSync.init({
        server: './dist'
    });

    gulp.watch('./src/js/**/*.js', ['js']);
    gulp.watch('./src/(images|fonts)/**/*', ['assets']);
    gulp.watch('./src/css/**/*', ['style']);
    gulp.watch('./src/less/**/*', ['style']);
    gulp.watch('./src/*.html', ['inject']);
});
