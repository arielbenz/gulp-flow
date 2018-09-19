// gulpfile.js

const namespace = 'gulp-flow';

const   gulp                = require('gulp'),
        watch               = require('gulp-watch'),
        gutil               = require('gulp-util'),
        plumber             = require('gulp-plumber'),
        slang               = require('gulp-slang'),
        debug               = require('gulp-debug'),
        options             = require('gulp-options'),
        sass                = require('gulp-sass'),
        sourcemaps          = require('gulp-sourcemaps'),
        postcss             = require('gulp-postcss'),
        autoprefixer        = require('autoprefixer'),
        cssnano             = require('cssnano'),
        eslint              = require('gulp-eslint'),
        reporter            = require('postcss-reporter');

// --------------------------------------------------------
// Configuration
// --------------------------------------------------------

const   root      = 'ui.apps/src/main/content/jcr_root/',
        components  = root + 'apps/' + namespace + '/components/',
        designs     = root + 'etc/designs/' + namespace + '/',
        clientlibs  = root + 'etc/clientlibs/' + namespace + '/',
        cssPath     = clientlibs + 'css/',
        sassPath    = clientlibs + 'scss/',
        mainScss    = clientlibs + 'styles/main.scss',
        cssBuild    = cssPath + 'main.css',
        cssSrcMaps  = cssPath + 'main.css.map',
        jsPath      = clientlibs + 'js/internal';


const autoPrefixerConfig = autoprefixer({
    browsers: ['last 2 version', 'safari 10', 'ie 11', 'ios 10', 'android 4']
});

const processors = [
  autoPrefixerConfig,
  cssnano({
    options: {
      safe: true
    },
    autoprefixer: true,
    discardComments: {
      removeAll: true
    },
    colormin: true
  }),
  reporter()
];

const scssConfig = {
    outputStyle: 'compressed',
    omitSourceMapUrl: true,
    includePaths: [sassPath, components]
};

// --------------------------------------------------------
// Task: `sass:build`
// Compiles the scss files.
// --------------------------------------------------------

gulp.task('sass:build', function (cb) {
    gulp.src(mainScss)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass(scssConfig).on('error', sass.logError))
        .pipe(postcss(processors))
        .pipe(sourcemaps.write('./', {
            addComment: false
        }))
        .pipe(plumber.stop())
        .pipe(gulp.dest(cssPath))
        .on('end', cb);
});

// --------------------------------------------------------
// Task: `sass:sling`
// Slings the compiled CSS and sourcemaps to AEM.
// --------------------------------------------------------

gulp.task('sass:sling', ['sass:build'], function () {
    return gulp.src([cssBuild, cssSrcMaps])
        .pipe(slang());
});

// --------------------------------------------------------
// Task: `sass`
// Runs the sass build and slings the results to AEM.
// --------------------------------------------------------

gulp.task('sass', ['sass:build', 'sass:sling']);

// --------------------------------------------------------
// Task: `js:eslint`
// Lint the javascript files.
// --------------------------------------------------------

gulp.task('js:eslint', function () {
    return gulp.src([components + '**/*.js', jsPath + '**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format());
});

// --------------------------------------------------------
// Task: `watch`
// Watches the HTML, Sass, and JS for changes.
// --------------------------------------------------------

gulp.task('watch', function () {
    const jsWatch = gulp.watch([components + '**/*.js', jsPath + '**/*.js'], ['js:eslint']),
        sassWatch = gulp.watch([components + '**/*.scss', mainScss, sassPath + '**/*.scss'], ['sass']),
        markupWatch = gulp.watch([components + '**/**/*.html', components + '**/**/*.jsp']);

    gutil.log('Waiting for changes...');

    // Check changes for javascript files
    jsWatch.on('change', function (ev) {
        gutil.log('Javascript changes on ' + gutil.colors.cyan.bold(ev.path));
        return gulp.src(ev.path).pipe(slang(ev.path));
    });

    // Check changes for SCSS files
    sassWatch.on('change', function (ev) {
        gutil.log('SCSS changes on ' + gutil.colors.cyan.bold(ev.path));
        return gulp.src(ev.path).pipe(slang(ev.path));
    });

    // Check changes for HTML files
    markupWatch.on('change', function (ev) {
        gutil.log('HTML changes on ' + gutil.colors.cyan.bold(ev.path));
        return gulp.src(ev.path).pipe(slang(ev.path));
    });
});

gulp.task('build', ['sass:build', 'js:eslint']);
