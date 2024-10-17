// gulpプラグインの読み込み
const gulp = require("gulp");

// gulpプラグインを読み込みます
//const { src, dest, watch } = require("gulp");

// Sassをコンパイルするプラグインの読み込み
const sass = require("gulp-sass")(require("sass"));

//ejs用
var rename = require("gulp-rename");
var ejs = require("gulp-ejs");
var replace = require("gulp-replace");
var data = require("gulp-data");
const plumber = require("gulp-plumber");
const autoprefixer = require("autoprefixer");
const minifycss = require("gulp-minify-css");

const postcss = require("gulp-postcss");
var webserver = require('gulp-webserver');
const browserSync = require('browser-sync');
const webpackConfig = require("./webpack.config");
const webpack = require('webpack-stream');

var path = {
  base: "./",
};

// style.scssをタスクを作成する
gulp.task("css", function (done) {
  // style.scssファイルを取得
  gulp
    .src(path.base + "src/scss/**/*.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(
      postcss([
        autoprefixer({
          //browsers: ['last 3 version', 'iOS >= 8.1', 'Android >= 4.4'],
          cascade: false,
        }),
      ])
    )
    .pipe(minifycss())
    .pipe(gulp.dest(path.base + "dist/css"));
  done();
});

// watch&リロード 処理
gulp.task("watchFiles", function () {
  gulp.watch(path.base + "src/scss/**/*.scss").on("change", gulp.series("css"));
  gulp.watch(path.base + "src/ejs/**/*.ejs").on("change", gulp.series("ejs"));
  gulp.watch(path.base + "src/js/**/*.js").on("change", gulp.series(scripts));
});

/**
 * Sassファイルを監視し、変更があったらSassを変換します
 */
const watchSassFiles = () => watch("css/style.scss", compileSass);

//ejs変換関数
gulp.task("ejs", (done) => {
  gulp
    .src(["src/ejs/**/*.ejs", "!" + "src/ejs/**/_*.ejs"])
    .pipe(plumber())
    .pipe(ejs({}, {}, {
      ext: ".html"
    }))
    .pipe(rename({
      extname: ".html"
    }))
    .pipe(replace(/[\s\S]*?(<!DOCTYPE)/, "$1"))
    .pipe(
      htmlbeautify({
        indent_size: 2, //インデントサイズ
        indent_char: "  ", // インデントに使う文字列
        max_preserve_newlines: 0, // 許容する連続改行数
        preserve_newlines: false, //コンパイル前のコードの改行
        indent_inner_html: false, //head,bodyをインデント
        extra_liners: [], // 終了タグの前に改行を入れるタグ。配列で指定。head,body,htmlにはデフォで改行を入れたくない場合は[]。
      })
    )
    .pipe(gulp.dest("./dist/"));
  done();
});

gulp.task("server", function () {
  gulp.src('dist')
    .pipe(webserver({
      port: 7000
    }));
});

const browserSyncOption = {
  files: ['./dist/**/*'],
  proxy: 'http://localhost:7000/',
  reloadOnRestart: true,
};

function browsersync(done) {
  browserSync.init(browserSyncOption);
  done();
}

// js(webpack)
function scripts() {
  return gulp
    .src([path.base + 'src/js/*.js', path.base + 'src/js/module/*.js'])
    .pipe(plumber())
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest(path.base + 'dist/js/'))
  //.pipe(browserSync.reload({stream: true}));
}

gulp.task(
  "default",
  gulp.series(gulp.parallel("css", "ejs", scripts), gulp.parallel("server", browsersync, "watchFiles"))
);