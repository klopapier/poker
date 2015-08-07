var colors = require('colors'),
    _ = require('lodash'),
    prompt = require('prompt');

prompt.message = '';
prompt.start();

var Game = function () {
    
    var that = this;

    that.printer = require('./printer');
    that.deck = _.shuffle(require('./card'));
    that.hand = require('hoyle').Hand;
    that.humanState = [true, false];
    that.round = 0;

};

Game.prototype.startGame = function () {

    console.log('<<< Dealing first row of cards, Good Luck! >>>');

    var that = this;

    that.p1Hands = [];
    that.p2Hands = [];

    for (var i = 0; i < 10; i++) {

        if (i < 5) {

            that.p1Hands.push( [ that.deck.shift() ] );

        } else {

            that.p2Hands.push( [ that.deck.shift() ] );

        }
    }

    that.mainLoop();

};

Game.prototype.mainLoop = function () {
    
    var that = this;

    if ( that.round === 40 ) {
        
        that.determineWinner();
        return;
        
    }

    that.curr = ( that.round % 2 === 0 ) ? 1 : 2;
    that.activeCard = that.deck.shift();
    
    console.log('Round Number ' + that.round);
    
    that.printGameState();
    that.getMove();

};

Game.prototype.isHuman = function (playerID) {
    
    var that = this;
    return that.humanState[playerID - 1];

};

Game.prototype.getMove = function () {
    
    var that = this;

    if ( that.isHuman( that.curr ) ) {
        
        that.getHumanMove();
        
    } else {
        
        that.getAiMove();
        
    }

};


Game.prototype.getHumanMove = function () {

    var that = this,
        promptMessage = 'Player ' + that.curr + ' ( You )  enter column number';

    prompt.get([promptMessage], function (err, input) {

        var columnNumber = parseInt(input[promptMessage], 10);

        if (!that.isValidInput(columnNumber)) {

            console.log('That isnt a valid choice');
            that.getMove();

        } else {

            that.makeMove(columnNumber);

        }
    });
};


//returns an array of legal column moves
Game.prototype.getPossibleMoves = function () {

    var arr = [],
        that = this;

    for ( var i = 0; i < 5; i++ ) {

        if ( that.isValidInput(i) ) {

            arr.push(i);

        }
    }

    return arr;

};

Game.prototype.getAiMove = function () {

    var that = this,
        moves = that.getPossibleMoves();

    that.makeMove(_.sample(moves));

};

Game.prototype.makeMove = function (columnNumber) {

    var that = this;

    that.addToHand(columnNumber);
    that.round += 1;
    that.mainLoop();

};

Game.prototype.isValidInput = function (number) {

    if (isNaN(number) || number < 0 || number > 4) {
        return false;
    }

    var that = this,
        activePlayerHands = ( that.curr === 1 ) ? that.p1Hands : that.p2Hands,
        minLength = _.min(activePlayerHands, function (hand) { return hand.length; }).length;

    if ( activePlayerHands[number].length !== minLength ) {

        return false;

    }

    return true;

};

Game.prototype.addToHand = function ( column ) {

    var that = this;

    if ( that.curr === 1 ) {

        that.p1Hands[ column ].push( that.activeCard );

    } else {

        that.p2Hands[ column ].push( that.activeCard );
    }

};

Game.prototype.determineWinner = function () {

    var p1WinCount = 0,
        that = this,
        i;

    for ( i = 0; i < that.p1Hands.length; i++ ) {

        var hand1 = that.hand.make(that.p1Hands[i]),
            hand2 = that.hand.make(that.p2Hands[i]),
            winner = that.hand.pickWinners([hand1, hand2])[0];

        if (winner === hand1) {

            p1WinCount += 1;

        }
    }

    console.log((p1WinCount >= 3) ? ' <<< Congratulation You wins >>> ' : '<<< Congratulation Player 2 wins >>>');

    console.log('<<< Game Over >>>');

};

Game.prototype.printGameState = function () {

    console.log('\033[2J');

    var that = this;

    that.printer.printHands(that.p1Hands, '<<< Player 1 ( You ) Hands: >>>');
    that.printer.printHands(that.p2Hands, '<<< Player 2 Hands: >>>');

    console.log('current card is:', that.printer.printCard(that.activeCard));
    
};

var myGame = new Game();
myGame.startGame();