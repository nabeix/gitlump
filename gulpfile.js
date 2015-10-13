var gulp = require('gulp');
var exec = require('child_process').exec;
var jasmine = require('gulp-jasmine');
var reporters = require('jasmine-reporters');

gulp.task('compile', function(cb) {
  exec('node_modules/typescript/bin/tsc', function (err, stdout, stderr) {
    if (stdout) console.log(stdout);
    if (stderr) console.log(stderr);
    cb(err);
  });
});

gulp.task('test', function () {
  return gulp.src('spec/test.js')
    .pipe(jasmine({
        // reporter: new reporters.JUnitXmlReporter(),
        verbose:true,
        includeStackTrace: true
    }));
});

gulp.task('default', ['compile']);
