const gulp = require('gulp');
const replace = require('gulp-replace');
const htmlmin = require('gulp-htmlmin');
const cssmin = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const pipeline = require('readable-stream').pipeline;
const imagemin = require('gulp-imagemin');

gulp.task('gen-link', function(){
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');
    hash.update(contents);
    var hashValue = hash.digest('hex').substring(0,4);
    return gulp.src('./source/_posts/**/*.md')
        .pipe(replace(/@@linkhash/g, hashValue))
        .pipe(gulp.dest('source/_posts'));
  });

gulp.task('minify-html', function () {
    return gulp.src('./public/**/*.html')
        .pipe(htmlmin({ 
            collapseWhitespace: true,
            removeComments: false,
            collapseBooleanAttributes: true,  //省略布尔属性的值 <input checked="true"/> ==> <input checked />
            removeEmptyAttributes: true,  //删除所有空格作属性值 <input id="" /> ==> <input />
            removeScriptTypeAttributes: true,  //删除<script>的type="text/javascript"
            removeStyleLinkTypeAttributes: true,  //删除<style>和<link>的type="text/css"
            minifyJS: true,  //压缩页面JS
            minifyCSS: true  //压缩页面CSS
            }))
        .pipe(gulp.dest('./public'));
  });

gulp.task('minify-css', function () {
    return gulp.src('./public/**/*.css')
        .pipe(cssmin())
        .pipe(gulp.dest('./public/'));
});

gulp.task('minify-js', function (cb) {
    return pipeline(
          gulp.src('./public/**/*.js'),
          uglify(),
          gulp.dest('./public/'),
          cb
    );
  });

gulp.task("minify-images", function () {
    return gulp
        .src("./public/**/*.{jpg,png,svg,gif}")
        .pipe(
            imagemin()
        )
      .pipe(gulp.dest("./public"));
  });

gulp.task(
    "minify",
    gulp.series(
        gulp.parallel("minify-html", "minify-css", "minify-js", "minify-images")
    )
);
