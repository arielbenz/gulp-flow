// gulpfile.js

var namespace = 'gulp-flow';

var gulp        = require('gulp'),
    watch       = require('gulp-watch'),
    gutil       = require('gulp-util'),
    plumber     = require('gulp-plumber'),
    slang       = require('gulp-slang'),
    debug       = require('gulp-debug'),
    options     = require('gulp-options'),
    sass        = require('gulp-sass'),
    sourcemaps  = require('gulp-sourcemaps'),
    eslint      = require('gulp-eslint');

var root        = 'ui.apps/src/main/content/jcr_root/',
    components  = root + 'apps/' + namespace + '/components/',
    designs     = root + 'etc/designs/' + namespace + '/',
    clientlibs  = root + 'etc/clientlibs/' + namespace + '/',
    cssPath     = clientlibs + 'css/',
    sassPath    = clientlibs + 'scss/',
    mainCss     = clientlibs + 'styles/main.scss',
    cssBuild    = cssPath + 'main.css',
    cssSrcMaps  = cssPath + 'main.css.map',
    jsPath      = clientlibs + 'js/internal';


/**
 * Helper: options
 * Add options parameters in Gulp.
 */

function options() {
    var opts = {
        prod: false,
        debug: false,
        env: 'local'
    };
    if (options.has('env')) {
        opts.env = options.get('env');
    }
    if (options.has('debug')) {
        opts.debug = options.get('debug');
    }
    if (options.has('prod')) {
        opts.prod = options.get('prod');
    }
    return opts;
}

/**
 * Task: `sass:build`
 * Compiles the scss files.
 */
gulp.task('sass:build', function (cb) {
    var compressed = 'compressed';
    if (options().debug) {
        gutil.log('File ' + gutil.colors.cyan.bold(maincss));
        compressed = 'expanded';
    }

    gulp.src(mainCss)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: compressed,
            omitSourceMapUrl: true,
            includePaths: [sassPath, components]
        }).on('error', sass.logError))
        .pipe(sourcemaps.write('./', {
            addComment: false
        }))
        .pipe(plumber.stop())
        .pipe(gulp.dest(cssPath))
        .on('end', cb);
});

/**
 * Task: `sass:sling`
 * Slings the compiled CSS and sourcemaps to AEM.
 */
gulp.task('sass:sling', ['sass:build'], function () {
    return gulp.src([cssBuild, cssSrcMaps])
        .pipe(slang());
});

/**
 * Task: `sass`
 * Runs the sass build and slings the results to AEM.
 */
gulp.task('sass', ['sass:build', 'sass:sling']);

/**
 * Task: `js:lint`
 * Lint the javascript files.
 */
gulp.task('js:lint', function () {
    return gulp.src([components + '**/*.js', jsPath + '**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format());
});

/**
 * Task: `watch`
 * Watches the HTML, Sass, and JS for changes.
 */
gulp.task('watch', function () {
    var jsWatch = gulp.watch([components + '**/*.js', jsPath + '**/*.js'], ['js:lint']),
        sassWatch = gulp.watch([components + '**/*.scss', mainCss, sassPath + '**/*.scss'], ['sass']),
        markupWatch = gulp.watch([components + '**/**/*.html', components + '**/**/*.jsp']);

    gutil.log('Waiting for changes...');

    // Check changes for javascript files
    jsWatch.on('change', function (ev) {
        return gulp.src(ev.path).pipe(slang(ev.path));
    });

    // Check changes for SCSS files
    sassWatch.on('change', function (ev) {
        return gulp.src(ev.path).pipe(slang(ev.path));
    });

    // Check changes for HTML files
    markupWatch.on('change', function (ev) {
        return gulp.src(ev.path).pipe(slang(ev.path));
    });
});

gulp.task('build', ['sass:build', 'js:lint']);
