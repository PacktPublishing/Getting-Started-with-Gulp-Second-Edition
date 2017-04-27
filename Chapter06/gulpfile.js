// Load Node Modules/Plugins
var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var imagemin = require('gulp-imagemin');
var connect = require('connect');
var serve = require('serve-static');
var browsersync = require('browser-sync');
var postcss = require('gulp-postcss');
var cssnext = require('postcss-cssnext');
var cssnano = require('cssnano');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var plumber = require('gulp-plumber');
var beeper = require('beeper');
var del = require('del');
var sourcemaps = require('gulp-sourcemaps');

// Error Handler
function onError(err) {
    beeper();
    console.log('Name:', err.name);
    console.log('Reason:', err.reason);
    console.log('File:', err.file);
    console.log('Line:', err.line);
    console.log('Column:', err.column);
}

// Styles Task
gulp.task('styles', function () {
    gulp.src('app/css/*.css')
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(concat('all.css'))
        .pipe(postcss([
            cssnext(),
            cssnano()
        ]))
        .pipe(gulp.dest('dist'));
});

// Scripts Task
gulp.task('scripts', function () {
    return gulp.src('app/js/*.js')
        .pipe(sourcemaps.init())
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(concat('all.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist'));
});

// Images Task
gulp.task('images', function () {
    return gulp.src('app/img/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/img'));
});

// Server Task
gulp.task('server', function () {
    return connect().use(serve(__dirname))
        .listen(8080)
        .on('listening', function() {
            console.log('Server Running: View at http://localhost:8080');
        });
});

// BrowserSync Task
gulp.task('browsersync', function () {
    return browsersync({
        server: {
            baseDir: './'
        }
    });
});

// Browserify Task
gulp.task('browserify', function () {
    return browserify('./app/js/app.js')
        .transform('babelify', {
            presets: ['env']
        })
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(gulp.dest('dist'));
});

// Clean Task
gulp.task('clean', function () {
    return del(['dist']);
});

// Watch Task
gulp.task('watch', function () {
    gulp.watch('app/css/*.css', ['styles', browsersync.reload]);
    gulp.watch('app/js/*.js', ['scripts', browsersync.reload]);
    gulp.watch('app/img/*', ['images', browsersync.reload]);
});

// Default Task
gulp.task('default', ['styles', 'scripts', 'images', 'browsersync', 'watch']);
