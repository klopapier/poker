var Seat = function(player, seatNumber, tableState, buyIn) {

    var that = this;
    that.player = player;
    that.tableState = tableState;
    that.seatNumber = seatNumber;
    that.sittingOut = true;
    that.folded = false;
    that.cards = null;
    that.chips = buyIn;
    that.amountBetPerRound = 0;
    that.amountBetPerHand = 0;
};

Seat.prototype.raise = function() {

    var that = this,
        raiseAmount = that.tableState.currentBet + that.tableState.minBetAmount - that.amountBetPerRound;

    that.amountBetPerRound += raiseAmount;
    that.amountBetPerHand += raiseAmount;
    that.tableState.increasePot(raiseAmount, true);
    that.chips -= raiseAmount;

};

Seat.prototype.call = function() {

    var that = this,
        callAmount = that.tableState.currentBet - that.amountBetPerRound;

    that.amountBetPerRound += callAmount;
    that.amountBetPerHand += callAmount;
    that.tableState.increasePot(callAmount);
    that.chips -= callAmount;
};

Seat.prototype.fold = function() {

    var that = this;
    that.folded = true;
    that.lostHand();
};

Seat.prototype.payBlind = function(amount) {

    var that = this;
    that.player.payBlind(amount);
    that.amountBetPerRound += amount;
    that.amountBetPerHand += amount;
    that.chips -= amount;

};

Seat.prototype.isInHand = function() {

    var that = this;
    return !that.folded && that.cards;
};

Seat.prototype.isSittingIn = function() {

    var that = this;
    return !that.sittingOut;
};

Seat.prototype.wonHand = function(amount) {

    var that = this;
    that.chips += amount;
    that.player.wonHand(amount - that.amountBetPerHand);

};

Seat.prototype.lostHand = function() {

    var that = this;
    that.player.lostHand(that.amountBetPerHand);

};

Seat.prototype.reset = function() {

    var that = this;
    that.folded = false;
    that.cards = null;
    that.amountBetPerRound = 0;
    that.amountBetPerHand = 0;
};

module.exports = Seat;