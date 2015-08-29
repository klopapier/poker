# poker
poker

- app required client site

-gulpfiles
//requirejs = require('requirejs'),
//browserify = require('gulp-browserify'),
//requirejsOptimize = require('gulp-requirejs-optimize'),

.task('compress', function() {
      
  gulp.src('app.js')
      .pipe(browserify({

          insertGlobals : true
          //debug : !gulp.env.production

      }))
      .pipe(gulp.dest('./public/js/'))
})
.task('code:compress', function () {

  return gulp.src('app.js')
      .pipe(requirejsOptimize())
      .pipe(gulp.dest('./public/js/'));

})