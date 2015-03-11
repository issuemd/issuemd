var gulp = require("gulp"),
    peg = require("gulp-peg"),
    gutil = require("gutil"),
    browserify = require("browserify"),
    transform = require("vinyl-transform");

var paths = {
  build: "dist",
  scripts: {
    core: "src/issuemd.js",
    peg: "src/parser.pegjs"
  }
};

gulp.task("build:parser", function() {
  gulp.src(paths.scripts.peg).pipe(peg().on("error", gutil.log)).pipe(gulp.dest(paths.build));
});

gulp.task("build", ["build:parser"], function(){

    gulp.src(paths.scripts.core)
    // don't use gulp-browserify - do it this way: https://medium.com/@sogko/gulp-browserify-the-gulp-y-way-bb359b3f9623
    .pipe( transform(function(filename){ return browserify(filename, {standalone: "issuemd"}).bundle(); }) )
    .pipe( gulp.dest(paths.build) );

});
