var util         = require('util'),
    events       = require('events'),
    Deck         = require('./deck'),
    Seat         = require('./seat'),
    HandAnalyzer = require('./handAnalyzer'),
    StateMachine = require('./statemachine');


//prototype Table
var Table = function(name, numSeats, limit, io) {

    var that = this;
    that.name = name;
    that.numSeats = numSeats;

    that.observers = {};
    that.seats = [];
    that.numPlayersToBeDealt = 0;

    that.deck = new Deck();
    that.state = new StateMachine(limit, that);
    that.io = io;

    that.on('join', that.join);
    that.on('leave', that.leave);
    that.on('sit', that.sit);
    that.on('stand', that.stand);
    that.on('sitIn', that.sitIn);
    that.on('sitOut', that.sitOut);

    that.initGameLoop();

    events.EventEmitter.call(that);
};
util.inherits(Table, events.EventEmitter);

Table.prototype.startGameLoop = function() {

    var that = this;
    that.state.reset();
    that.state.currentSeat = that.state.button;
    that.emit(that.state.nextState());
};

Table.prototype.stopGameLoop = function() {

};

Table.prototype.initGameLoop = function() {

    var that = this;
    that.on('preflop', function() {

        var seat, dealCards;
        that.deck.reset();
        that.rotateButton();

        // add big blind + small blind to pot;
        that.state.addBlinds();
        // if Heads-Up
        if ((that.state.numPlayersInHand = that.getNumPlayersToBeDealt()) === 2) {

            that.state.currentSeat.payBlind(that.state.minBetAmount / 2); // SB

        } else {

            that.nextSeat(true).payBlind(that.state.minBetAmount / 2); // SB

        }
        that.nextSeat(true).payBlind(that.state.minBetAmount); // BB

        console.log('Dealing hands'.info);

        that.seats.forEach(function(seat) {

            if (that.isSittingIn(seat)) {

                cards = that.deck.dealCards(2);
                seat.player.receiveCards(that.name, cards);
                seat.cards = cards;

            }

        }, that);

        that.emit('nextSeat');

    });

    that.on('flop', function() {

        console.log('<<< Dealing flop >>>'.info);

        that.boardCards = that.deck.dealCards(3);
        that.broadcast('flop', that.boardCards.print());
        that.emit('nextSeat');
    });

    that.on('turn', function() {

        console.log('<<< Dealing turn >>>'.info);

        that.boardCards = that.boardCards.merge(that.deck.dealCards(1));
        that.broadcast('turn', that.boardCards.print());
        that.emit('nextSeat');
    });

    that.on('river', function() {
        console.log('<<< Dealing river >>>'.info);

        that.boardCards = that.boardCards.merge(that.deck.dealCards(1));
        that.broadcast('river', that.boardCards.print());
        that.emit('nextSeat');
    });

    that.on('showdown', function() {
        that.determineWinner();
        that.resetSeats();

        console.log('<<< Next hand coming up... >>>'.prompt);

        setTimeout(that.emit.bind(that, 'nextState'), 1000);
    });

    that.on('action', function(type, player) {

        if (type === 'raise') {

            that.state.lastToRaise = that.state.currentSeat;
            that.state.currentSeat.raise();

        }
        else if (type === 'call') {

            that.state.currentSeat.call();

        }
        else if (type === 'fold') {

            that.state.currentSeat.fold();
            that.state.numPlayersInHand--;

        }

        console.log('<<< Potsize : $%s >>>'.info, that.state.potSize.toString());

        that.emit('nextSeat');
    });

    //deprecated use this insted self
    that.on('nextSeat', function() {
        var self = this,
            actions, check_or_call,
            nextSeat = self.nextSeat(),
            lastToRaise = self.state.lastToRaise;

        if (self.state.numPlayersInHand === 1) {
            console.log(nextSeat.player.name + ' wins the %s pot!', self.state.potSize);
            nextSeat.wonHand(self.state.potSize);
            self.showPlayersChipCounts();
            self.resetSeats();
            console.log('Next hand coming up...'.prompt);
            return setTimeout(function() {
                self.state.reset();
                self.emit('nextState');
            }, 1000);
        }

        if (nextSeat === lastToRaise || (!lastToRaise && nextSeat === self.state.firstToAct)) {
            self.emit('nextState');
        }
        else {
            if (!self.state.firstToAct) {
                self.state.firstToAct = nextSeat;
            }
            check_or_call = (self.state.lastToRaise || self.state.getState() === 'preflop')
                            ? 'call'
                            : 'check';
            self.state.actions = actions = ['raise', check_or_call, 'fold'];
            nextSeat.player.getAction(actions);
        }
    });

    that.on('nextState', function() {
        // reset the amount each player has bet per round
        that.seats.forEach(function(seat) {
            if (seat) seat.amountBetPerRound = 0;
        });
        that.emit(that.state.nextState());
    });
};

//todo: defined the winner!
Table.prototype.determineWinner = function() {

    var self = this,
        handAnalyzer = new HandAnalyzer(self.boardCards),
        handInfo,
        winningHand,
        winner;

    console.time('<<< HandAnalyzer >>>');

    // find winner
    self.seats.forEach(function(seat) {

        if (self.isInHand(seat)) {

            handInfo = handAnalyzer.analyze(seat.cards);

            if (!winningHand) {

                winningHand = handInfo;
                winner = seat;

            } else if (handInfo.handTypeValue > winningHand.handTypeValue) {

                winningHand = handInfo;
                winner = seat;

            } else if (handInfo.handTypeValue === winningHand.handTypeValue) {

                if (handInfo.weight > winningHand.weight) {

                    winningHand = handInfo;
                    winner = seat;
                }
            }
        }
    }, self);

    console.timeEnd('<<< HandAnalyzer >>>');

    // distribute chips
    self.seats.forEach(function(seat) {

        if (self.isInHand(seat) && seat !== winner) {

            seat.lostHand();

        }
    }, self);

    winner.wonHand(self.state.potSize);
    console.log('<<< %s wins $%s with %s'.info, winner.player.name, self.state.potSize, winningHand.handType);
    console.log('<<< Winning hand: '.info + winningHand.hand + '\n');
    self.showPlayersChipCounts();
};

// Player joins the table as an observer
Table.prototype.join = function(player) {

    var self = this;
    console.log('%s has joined table %s', player.name, self.name);
    self.observers[player.name] = player;

};

// Player leaves the table
Table.prototype.leave = function(player) {

    var self = this;

    console.log('%s has left table %s', player.name, self.name);
    delete self.observers[player.name];

};

// Player sits down in a seat but won't be dealt in the next
// hand until they 'sit in'
Table.prototype.sit = function(player, seatNumber, buyIn) {

    var self = this;

    if (self.seats[seatNumber] === undefined) {

        console.log('%s is sitting at table %s in seat %s with %s', player.name, self.name, seatNumber, buyIn);
        delete self.observers[player.name];
        self.seats[seatNumber] = new Seat(player, seatNumber, self.state, buyIn);

    } else {

        console.log('Seat %s is taken on table %s', seatNumber, self.name);

    }
};

// Player leaves their seat
Table.prototype.stand = function(player, seatNumber) {

    var self = this;

    console.log('%s has stood up from table %s', player.name, self.name);
    self.player.releaseChips(self.seats[seatNumber].chips);
    delete self.seats[seatNumber];
    self.observers[player.name] = player;

};

// Player will be dealt in on the next hand
Table.prototype.sitIn = function(player, seatNumber) {

    var self = this;

    self.seats[seatNumber].sittingOut = false;
    self.numPlayersToBeDealt++;

    if (self.numPlayersToBeDealt === 1) {

        self.state.button = self.seats[seatNumber];

    }
    else if (self.numPlayersToBeDealt === 2) {

        self.startGameLoop();

    }
};

// Player remains in seat but will be dealt out on the next hand
Table.prototype.sitOut = function(player, seatNumber) {

    var self = this;

    self.seats[seatNumber].sittingOut = true;
    self.numPlayersToBeDealt--;

    if (self.numPlayersToBeDealt === 0) {

        self.state.button = null;
        self.state.currentSeat = null;

    } else if (self.numPlayersToBeDealt === 1) {

        self.stopGameLoop();
        self.state.button = self.nextSeat();

    }
};

Table.prototype.rotateButton = function() {

    var self = this;

    self.state.currentSeat = self.state.button = self._nextSeat(self.state.button, true);

};

// stateful
Table.prototype.nextSeat = function(isBeforeCardsDealt) {

    var that = this;
    return that.state.currentSeat = that._nextSeat(that.state.currentSeat, isBeforeCardsDealt);
};

// stateless
Table.prototype._nextSeat = function(currentSeat, isBeforeCardsDealt) {

    var nextSeat, currentSeatNum = currentSeat.seatNumber,
        that = this,
        isPlayerIn = isBeforeCardsDealt ?  that.isSittingIn : that.isInHand;

    do {

        nextSeat = that.seats[++currentSeatNum % that.numSeats];

    }

    while (!isPlayerIn(nextSeat));
    return nextSeat;
};

Table.prototype.getNumPlayersToBeDealt = function() {

    var count = 0,
        that = this;
    that.seats.forEach(function(seat) {
        if (that.isSittingIn(seat)) count++;
    }, that);

    return count;
};

Table.prototype.isInHand = function(seat) {

    return seat && seat.isInHand();

};

Table.prototype.isSittingIn = function(seat) {

    return seat && seat.isSittingIn();

};

Table.prototype.resetSeats = function() {

    var that = this;
    that.seats.forEach(function(seat) {
        seat.reset();
    });

};

Table.prototype.showPlayersChipCounts = function() {

    var that = this;
    that.seats.forEach(function(seat) {
        console.log('Player %s has %s at this table and %s chips total', seat.player.name, seat.chips, seat.player.chipsTotal);
    });

};

Table.prototype.broadcast = function(event, data) {

    var that = this;
    console.log(data);
    if (that.io) {
        that.io.sockets.in(that.tableName).emit(event, data || null);
    }

};

module.exports = Table;
