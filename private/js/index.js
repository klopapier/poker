var express = require('express'),
    router = express.Router(),
    //init = require('./mod/game_server'),
    game_server = require('./mod/game_server');

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Game Poker' });

});

//var _initSection = game_server.init;

var init = game_server.init;
console.log(game_server.init);


module.exports = router;
