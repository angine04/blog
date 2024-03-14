const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const cssmin = require('gulp-clean-css');
const through = require('through2');
const crypto = require('crypto');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const pipeline = require('readable-stream').pipeline;

gulp.task('gen-link', function () {
    return gulp.src('source/_posts/**/*.md')
        .pipe(through.obj(function (file, encode, cb) {
            const contents = file.contents.toString();
            const regex = /@@linkhash/g;
            if (regex.test(contents)) {
                time = new Date().toLocaleTimeString('it-IT');
                console.log("[" + time + "] Found @@linkhash at " + file.relative);
                const hash = crypto.createHash('sha256').update(file.contents).digest('hex').substring(0, 4);
                console.log("[" + time + "] Hash generated: " + hash);
                let result = contents.replace(regex, hash);
                file.contents = new Buffer.from(result, encode);
            }
            this.push(file);
            cb();
        }))
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

// gulp.task("minify-images", function () {
//     return gulp
//         .src("./public/**/*.{jpg,png,svg,gif}")
//         .pipe(
//             imagemin()
//         )
//       .pipe(gulp.dest("./public"));
//   });

gulp.task(
    "minify",
    gulp.series(
        gulp.parallel("minify-html", "minify-css", "minify-js"/*, "minify-images"*/)
    )
);

