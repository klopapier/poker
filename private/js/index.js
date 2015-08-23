var express = require('express'),
    router = express.Router(),
    player = require('./mod/simulate'),
    path = require('path'),
    fs = require('fs'),
    vm = require('vm');


/* GET home page. */
router.get('/', function(req, res) {

    var data = function( path ) {

        var dataModel = fs.readFileSync( path );

        vm.runInThisContext( dataModel, path );

    }.bind( this );

    data( __dirname + '/mod/simulate.js');

    res.render('index', {
        title: 'Game Poker',
        player: data

    });

});


module.exports = router;
