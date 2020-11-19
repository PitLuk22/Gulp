"use strict";

// npm outdated - check all packges
// npm update - update all packges
// all code need to write in default.html

const gulp = require("gulp");
const webpack = require("webpack-stream");
const browsersync = require("browser-sync").create();
const del = require("del");
const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const rename = require('gulp-rename');
const imagemin = require('gulp-imagemin');
const panini = require('panini');
const cssnano = require('gulp-cssnano');


// const dist = "/Applications/MAMP/htdocs/Portfolio"; // Ссылка на вашу папку на локальном сервере
const dist = "./dist";

gulp.task("html", () => {
	panini.refresh();
	return gulp.src("./src/index.html")
		.pipe(panini({
			root: 'src/',
			layouts: 'src/layouts/',
			partials: 'src/partials/',
			helpers: 'src/helpers/',
			data: 'src/data/'
		}))
		.pipe(gulp.dest(dist))
		.pipe(browsersync.stream());
});

gulp.task("build-sass", () => {
	return gulp.src("./src/sass/style.scss")
		.pipe(sass().on('error', sass.logError))
		.pipe(
			autoprefixer({
				overrideBrowserslist: ["last 5 versions"],
				cascade: true
			})
		)
		.pipe(cssnano({
			zindex: false,
			discardComments: {
				removeAll: true
			}
		}))
		.pipe(rename({
			suffix: '.min',
			extname: '.css'
		}))
		.pipe(gulp.dest(dist))
		.pipe(browsersync.stream());
});

gulp.task('images', function () {
	return gulp.src("./src/img/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}")
		.pipe(imagemin([
			imagemin.gifsicle({ interlaced: true }),
			imagemin.mozjpeg({ quality: 50, progressive: true }),
			imagemin.optipng({ optimizationLevel: 5 }),
			imagemin.svgo({
				plugins: [
					{ removeViewBox: true },
					{ cleanupIDs: false }
				]
			})
		]))
		.pipe(gulp.dest(dist + "/img"))
		.pipe(browsersync.reload({ stream: true }));
});

gulp.task('fonts', function () {
	return gulp.src("./src/fonts/**/*.{eot,woff,woff2,ttf,svg}")
		.pipe(dest(dist + "/fonts"))
		.pipe(browsersync.reload({ stream: true }));
})

gulp.task('copy-php', function () {
	return gulp.src("./src/php/**/*")
		.pipe(gulp.dest(dist + "/php"));
});

gulp.task('clean', function () {
	return del(dist + "/");
});

gulp.task("build-js", () => {
	return gulp.src("./src/js/main.js")
		.pipe(webpack({
			mode: 'development',
			output: {
				filename: 'script.js'
			},
			watch: false,
			devtool: "source-map",
			module: {
				rules: [
					{
						test: /\.m?js$/,
						exclude: /(node_modules|bower_components)/,
						use: {
							loader: 'babel-loader',
							options: {
								presets: [['@babel/preset-env', {
									debug: true,
									corejs: 3,
									useBuiltIns: "usage"
								}]]
							}
						}
					}
				]
			}
		}))
		.pipe(gulp.dest(dist))
		.on("end", browsersync.reload);
});

gulp.task("watch", () => {
	browsersync.init({
		server: "./dist/",
		port: 4000,
		notify: false
	});

	gulp.watch("./src/**/*.html", gulp.parallel("html"));
	gulp.watch("./src/js/**/*.js", gulp.parallel("build-js"));
	gulp.watch("./src/sass/**/*.scss", gulp.parallel("build-sass"));
	gulp.watch("./src/img/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}", gulp.parallel("images"));
	gulp.watch("./src/fonts/**/*.{eot,woff,woff2,ttf,svg}", gulp.parallel("fonts"));
	gulp.watch("./src/php/**/*.php", gulp.parallel("copy-php"));
});

gulp.task("build", gulp.series("clean", gulp.parallel("html", "build-js", "build-sass", "images", "copy-php")));

gulp.task("default", gulp.parallel("build", "watch"));


gulp.task("prod", () => {
	gulp.src("./src/sass/style.scss")
		.pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
		.pipe(autoprefixer({ overrideBrowserslist: ["last 5 versions"], cascade: true }))
		.pipe(rename({ extname: ".min.css" }))
		.pipe(gulp.dest(dist));
	return gulp.src("./src/js/main.js")
		.pipe(webpack({
			mode: 'production',
			output: {
				filename: 'script.js'
			},
			module: {
				rules: [
					{
						test: /\.m?js$/,
						exclude: /(node_modules|bower_components)/,
						use: {
							loader: 'babel-loader',
							options: {
								presets: [['@babel/preset-env', {
									corejs: 3,
									useBuiltIns: "usage"
								}]]
							}
						}
					}
				]
			}
		}))
		.pipe(gulp.dest(dist));
});

