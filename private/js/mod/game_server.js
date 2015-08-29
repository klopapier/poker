var socketio = require('socket.io'),
    Player   = require('./lib/player'),
    Table    = require('./lib/table'),
    lobby = {
    players: {},
    tables: {}
};

var init = function(server) {

    //var io = game.io = socketio.listen(server);
    var io = socketio.listen(server);
    createTables();

    io.on('connection', function(socket) {
        var counter = Object.keys(lobby.players).length,
            player = new Player('Player ' + counter, socket);

        lobby.players[player.name] = player;
        player.joinTable(lobby.tables['table1']);
        player.sit('table1', counter);

    });
};

var createTables = function() {
    lobby.tables['table1'] = new Table('table1', 6, lobby.io);
    lobby.tables['table2'] = new Table('table2', 2, lobby.io);
    lobby.tables['table3'] = new Table('table3', 10, lobby.io);
};

//module.exports = init;

exports.init = function(){
    return init();
};
