var express = require('express'),
    router = express.Router(),
    player = require('./mod/simulate'),
    path = require('path'),
    fs = require('fs'),
    vm = require('vm');

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Game Poker' });

});

//var _initSection = game_server.init;
var data = function( path ) {

    var dataModel = fs.readFileSync( path );

    vm.getValue( dataModel, path );

}.bind(this);

data('./mod/');


module.exports = router;
