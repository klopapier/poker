'use strict';

// simple express server
var express = require('express'),
    path = require('path'),
    router = express.Router(),
    sassMiddleware = require('node-sass-middleware'),
    routes = require('./private/js/index'),
    users = require('./private/js/users'),
    player = require('./private/js/mod/simulate'),
    init = require('./private/js/mod/game_server'),
    app = express();

// Load function
//game_server.init();
//sass
app.use(express.static('public'))
    .use(
        sassMiddleware({
            src: './private/sass/',
            dest: path.join('./public/css/'),
            debug: true,
            outputStyle: 'compressed',
            prefix: '/css/'
        })
    )
    .use('/', routes)
    .use('/users', users);


//jade
app.set('views', path.join('./public/views/'))
    .set('view engine', 'jade')
    .set('view options', {

        layout: true

    });

// Export Modules
module.exports = app;

//Proxy Listening
app.listen(5000);

// configure io
//var io = require('socket.io').listen( server );