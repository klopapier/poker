'use strict';

var gulp = require('gulp'),
    browserSync = require('browser-sync'),
    nodemon = require('gulp-nodemon');


gulp.task('default', ['browser-sync'], function () {})
    .task('poker', ['browser-sync'], function () {})
    .task('browser-sync', ['nodemon'], function() {

        browserSync.init(null, {
            proxy: 'http://localhost:5000',
            open: 'external',
            files: ['private/**/*.*', 'public/**/*.*'],
            browser: 'google chrome',
            port: 1337
        });
});

gulp.task('nodemon', function (obj) {

    var started = false;

    return nodemon({

        script: 'app.js'

    }).on('start', function () {

        if (!started) {
            obj();
            started = true;
        }
    });
});