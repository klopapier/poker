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

    that.on('nextSeat', function() {
        var self = this,
            actions, check_or_call,
            nextSeat = this.nextSeat(),
            lastToRaise = this.state.lastToRaise;

        if (this.state.numPlayersInHand === 1) {
            console.log(nextSeat.player.name + ' wins the %s pot!', this.state.potSize);
            nextSeat.wonHand(this.state.potSize);
            this.showPlayersChipCounts();
            this.resetSeats();
            console.log('Next hand coming up...'.prompt);
            return setTimeout(function() {
                self.state.reset();
                self.emit('nextState');
            }, 1000);
        }

        if (nextSeat === lastToRaise || (!lastToRaise && nextSeat === this.state.firstToAct)) {
            this.emit('nextState');
        }
        else {
            if (!this.state.firstToAct) {
                this.state.firstToAct = nextSeat;
            }
            check_or_call = (this.state.lastToRaise || this.state.getState() === 'preflop')
                            ? 'call'
                            : 'check';
            this.state.actions = actions = ['raise', check_or_call, 'fold'];
            nextSeat.player.getAction(actions);
        }
    });

    this.on('nextState', function() {
        // reset the amount each player has bet per round
        this.seats.forEach(function(seat) {
            if (seat) seat.amountBetPerRound = 0;
        });
        this.emit(this.state.nextState());
    });
};

Table.prototype.determineWinner = function() {

    var handInfo, winningHand, winner,
        handAnalyzer = new HandAnalyzer(this.boardCards);

    console.time('<<< HandAnalyzer >>>');
    // find winner
    this.seats.forEach(function(seat) {

        if (this.isInHand(seat)) {

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
    }, this);
    console.timeEnd('HandAnalyzer');

    // distribute chips
    this.seats.forEach(function(seat) {

        if (this.isInHand(seat) && seat !== winner) {

            seat.lostHand();

        }
    }, this);

    winner.wonHand(this.state.potSize);
    console.log('<<< %s wins $%s with %s'.info, winner.player.name, this.state.potSize, winningHand.handType);
    console.log('<<< Winning hand: '.info + winningHand.hand + '\n');
    this.showPlayersChipCounts();
};

// Player joins the table as an observer
Table.prototype.join = function(player) {

    console.log('%s has joined table %s', player.name, this.name);
    this.observers[player.name] = player;

};

// Player leaves the table
Table.prototype.leave = function(player) {

    console.log('%s has left table %s', player.name, this.name);
    delete this.observers[player.name];

};

// Player sits down in a seat but won't be dealt in the next
// hand until they 'sit in'
Table.prototype.sit = function(player, seatNumber, buyIn) {

    if (this.seats[seatNumber] === undefined) {

        console.log('%s is sitting at table %s in seat %s with %s', player.name, this.name, seatNumber, buyIn);
        delete this.observers[player.name];
        this.seats[seatNumber] = new Seat(player, seatNumber, this.state, buyIn);

    } else {

        console.log('Seat %s is taken on table %s', seatNumber, this.name);

    }
};

// Player leaves their seat
Table.prototype.stand = function(player, seatNumber) {

    console.log('%s has stood up from table %s', player.name, this.name);
    this.player.releaseChips(this.seats[seatNumber].chips);
    delete this.seats[seatNumber];
    this.observers[player.name] = player;

};

// Player will be dealt in on the next hand
Table.prototype.sitIn = function(player, seatNumber) {

    this.seats[seatNumber].sittingOut = false;
    this.numPlayersToBeDealt++;

    if (this.numPlayersToBeDealt === 1) {

        this.state.button = this.seats[seatNumber];

    }
    else if (this.numPlayersToBeDealt === 2) {

        this.startGameLoop();

    }
};

// Player remains in seat but will be dealt out on the next hand
Table.prototype.sitOut = function(player, seatNumber) {

    this.seats[seatNumber].sittingOut = true;
    this.numPlayersToBeDealt--;

    if (this.numPlayersToBeDealt === 0) {

        this.state.button = null;
        this.state.currentSeat = null;

    } else if (this.numPlayersToBeDealt === 1) {

        this.stopGameLoop();
        this.state.button = this.nextSeat();

    }
};

Table.prototype.rotateButton = function() {

    this.state.currentSeat = this.state.button = this._nextSeat(this.state.button, true);

};

// stateful
Table.prototype.nextSeat = function(isBeforeCardsDealt) {
    return this.state.currentSeat = this._nextSeat(this.state.currentSeat, isBeforeCardsDealt);
};

// stateless
Table.prototype._nextSeat = function(currentSeat, isBeforeCardsDealt) {
    var nextSeat, currentSeatNum = currentSeat.seatNumber,
        isPlayerIn = isBeforeCardsDealt ?  this.isSittingIn : this.isInHand;

    do {

        nextSeat = this.seats[++currentSeatNum % this.numSeats];

    }

    while (!isPlayerIn(nextSeat));
    return nextSeat;
};

Table.prototype.getNumPlayersToBeDealt = function() {

    var count = 0;
    this.seats.forEach(function(seat) {
        if (this.isSittingIn(seat)) count++;
    }, this);

    return count;
};

Table.prototype.isInHand = function(seat) {

    return seat && seat.isInHand();

};

Table.prototype.isSittingIn = function(seat) {

    return seat && seat.isSittingIn();

};

Table.prototype.resetSeats = function() {

    this.seats.forEach(function(seat) {
        seat.reset();
    });

};

Table.prototype.showPlayersChipCounts = function() {

    this.seats.forEach(function(seat) {
        console.log('Player %s has %s at this table and %s chips total', seat.player.name, seat.chips, seat.player.chipsTotal);
    });

};

Table.prototype.broadcast = function(event, data) {

    console.log(data);
    if (this.io) {
        this.io.sockets.in(this.tableName).emit(event, data || null);
    }

};

module.exports = Table;
