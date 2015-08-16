var StateMachine = function(limit, table) {

    var that = this;
    that.states       = ["preflop", "flop", "turn", "river", "showdown"];
    that.state        = 'off';
    that.table        = table;
    that.limit        = limit;
    that.minBetAmount = limit / 2;
};

StateMachine.prototype.nextState = function() {

    var that = this;
    if (that.state === 'off') this.state = -1;
    
    that.state = ++that.state % that.states.length;

    switch( that.states[that.state] ) {

        case "preflop":
            that.minBetAmount = that.limit / 2;
            that.reset_betting_round();
            that.currentBet = that.minBetAmount;
            that.potSize = 0;
            break;
        case "flop":
            that.reset_betting_round();
            break;
        case "turn":
            that.minBetAmount = that.limit;
            that.reset_betting_round();
            break;
        case "river":
            that.reset_betting_round();
            break;
    }

    return that.getState();
};

StateMachine.prototype.getState = function() {

    var that = this;
    return that.states[that.state];
};

StateMachine.prototype.increasePot = function(amount, isRaise) {

    var that = this;

    if (isRaise) {
        that.numRaises++;
        that.currentBet += that.minBetAmount;
    }
    that.potSize += amount;
};

StateMachine.prototype.addBlinds = function() {

    var that = this;
    that.potSize = that.minBetAmount + (that.minBetAmount / 2);
};

StateMachine.prototype.reset_betting_round = function() {

    var that = this;
    that.numRaises = 0;
    that.lastToRaise = null;
    that.firstToAct = null;
    that.currentBet = 0;
    that.currentSeat = that.button;
};

StateMachine.prototype.reset = function() {

    var that = this;
    that.state = 'off';
    that.minBetAmount = that.limit / 2;
    that.potSize = 0;
    that.currentSeat = null;
    that.lastToRaise = null;
};

module.exports = StateMachine;