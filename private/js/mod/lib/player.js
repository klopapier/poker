var util   = require('util'),
    events = require('events');

//prototype player
var Player = function(name, chipsTotal, socket) {

    var that = this;
    events.EventEmitter.call(that);
    that.name = name;
    that.socket = socket;
    that.chipsTotal = chipsTotal;
    that.chipsInUse = 0;
    that.tables = {};

    if (that.socket) {

        that.bindSocketListeners();

    }
};

util.inherits(Player, events.EventEmitter);

Player.prototype.bindSocketListeners = function() {

    var that = this;
    that.socket.on('raise', that.raise);
    that.socket.on('fold', that.fold);
    that.socket.on('check', this.check);
    that.socket.on('call', that.call);

};

Player.prototype.getTable = function(tableName) {

    var that = this;
    return that.tables[tableName].table;

};

Player.prototype.getSeatNumber = function(tableName) {

    var that = this;
    return that.tables[tableName].seatNumber;

};

Player.prototype.joinTable = function(table) {

    var that = this;
    that.tables[table.name] = {
        table: table,
        seatNumber: null
    };

    table.emit('join', that);
    if (that.socket) {

        that.socket.join(table.name);

    }
};

//leave delete table player
Player.prototype.leaveTable = function(tableName) {

    var that = this;

    that.tables[tableName].table.emit('leave', that);
    delete that.tables[tableName];

    if (that.socket) {

        that.socket.leave(tableName);
    }
};

// buy chips
Player.prototype.sit = function(tableName, seatNumber, buyIn) {

    var that = this;

    that.tables[tableName].seatNumber = seatNumber;
    that.getTable(tableName).emit('sit', that, seatNumber, buyIn);

};

Player.prototype.stand = function(tableName) {

    var that = this;
    that.getTable(tableName).emit('stand', that, that.getSeatNumber(tableName));
    that.tables[tableName].seatNumber = null;

};

Player.prototype.sitIn = function(tableName) {

    var that = this;
    that.getTable(tableName).emit('sitIn', that, that.getSeatNumber(tableName));

};

Player.prototype.sitOut = function(tableName) {

    var that = this;
    that.getTable(tableName).emit('sitOut', that, that.getSeatNumber(tableName));

};

Player.prototype.receiveCards = function(tableName, cards) {

    var that = this;
    that.tables[tableName].cards = cards;

    if (that.socket) {

        that.socket.emit('getHoleCards', cards.print());

    } else {

        console.log('%s\'s cards: ', that.name, cards.print());

    }
};

Player.prototype.payBlind = function(amount) {

    var that = this;
    console.log('%s has paid %s in blinds', that.name, amount);

};

//count chips
Player.prototype.wonHand = function(amount) {

    var that = this;
    that.chipsTotal += amount;
    that.chipsInUse += amount;
};

Player.prototype.lostHand = function(amount) {

    var that = this;
    that.chipsTotal -= amount;
    that.chipsInUse -= amount;
};

Player.prototype.releaseChips = function(amount) {

    var that = this;
    that.chipsInUse -= amount;

};

Player.prototype.getAction = function(actions) {

    var that = this;

    if (that.socket) {
        that.socket.emit('getAction', actions);

    } else {

        actions = actions
                    .map(function(action) {

                        return action.replace(/(\w)(\w+)/, '[$1]$2')
                    })
                    .join(', ');

        promptMsg = that.name + ', select an action (' + actions + '):';

        console.log(promptMsg.prompt);

        process.stdin.resume();
    }
};

Player.prototype.doAction = function(tableName, type) {

    var that = this;
    that.getTable(tableName).emit('action', type, that);

};

Player.prototype.raise = function(tableName) {

    var that = this;
    that.doAction(tableName, 'raise');

};

Player.prototype.call = function(tableName) {

    var that = this;
    that.doAction(tableName, 'call');

};

Player.prototype.fold = function(tableName) {

    var that = this;
    that.doAction(tableName, 'fold');

};

Player.prototype.check = function(tableName) {

    var that = this;
    that.doAction(tableName, 'check');
};

Player.prototype.transport = function() {

    process.stdin.resume();

};

module.exports = Player;

