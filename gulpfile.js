var gulp = require('gulp');
var exec = require('child_process').exec;
var jasmine = require('gulp-jasmine');
var reporters = require('jasmine-reporters');
var shell = require('gulp-shell');

gulp.task('compile', shell.task('tsc'));

gulp.task('test', function () {
  return gulp.src('spec/*[Test].js')
    .pipe(jasmine({
        // reporter: new reporters.JUnitXmlReporter(),
        verbose:true,
        includeStackTrace: true
    }));
});

gulp.task('default', ['compile']);
