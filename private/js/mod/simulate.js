var util   = require('util'),
    utils  = require('./lib/utils'),
    Player = require('./lib/player'),
    Table  = require('./lib/table');

// create a table
var table   = new Table('Table1', 6, 10);

// create players with initial chip counts
var player1 = new Player('>>> Jonnie', 1000),
    player2 = new Player('>>> Bobby', 1000),
    player3 = new Player('>>> Dono', 1000),
    player4 = new Player('>>> Kasino', 1000),
    player5 = new Player('>>> Indro', 1000);

// join table
player1.joinTable(table);
player2.joinTable(table);
player3.joinTable(table);
player4.joinTable(table);
player5.joinTable(table);

// choose a seat an buy-in
player1.sit('Table1', 0, 500);
player2.sit('Table1', 1, 500);
player3.sit('Table1', 2, 500);
player4.sit('Table1', 3, 500);
player5.sit('Table1', 4, 500);

// sit in next hand
player1.sitIn('Table1');
player2.sitIn('Table1');

// once two players are sitting at a table, the game loop starts
// so player3 won't actually be 'in' the hand until the next round
player3.sitIn('Table1');
player4.sitIn('Table1');
player5.sitIn('Table1');

process.stdin.setEncoding('utf8');

process.stdin.on('data', function (chunk) {

    var action;

    chunk = chunk.trim();

    var currentPlayer = table.state.currentSeat.player;

    switch (chunk) {

        case 'r':
            action = 'raise';
            break;

        case 'f':
            action = 'fold';
            break;

        case 'c':
            if (table.state.actions.some(function(action) { return action === 'call' }))
                action = 'call';
            else
                action = 'check';
            break;
    }

    if (/^raise|call|check|fold$/.test(chunk)) {

        action = chunk;
    }

    if (action) {

        process.stdin.pause();
        currentPlayer.doAction(table.name, action);

    }
});
