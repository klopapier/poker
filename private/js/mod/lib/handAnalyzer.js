var _ = require('lodash');

// @param {{Cards}}
var HandAnalyzer = function(board) {

    var that = this;
    // Parse cards in board and cache results for reuse
    that.board = board.sort();
    that.boardCount = new HandCount( that.board.toString() );

};

HandAnalyzer.prototype.newHand = function(hand) {

    var that = this;

    that.fullHouse = [],
    that.quads = [],
    that.trips = [],
    that.pairs = [];

    return new HandCount(hand.toString());
};

// @param {{Cards}}
HandAnalyzer.prototype.analyze = function(hand) {

    var that = this;
    // combine hand counts for board and players hand
    that.handCount = that.boardCount.combine(that.newHand(hand));
    // create sorted hand of all 7 cards
    that.allCards = hand.merge(that.board.clone()).sort();

    // parse pairs (ie. quads, trips, pairs)
    that.parsePairs();

    // analyze hand
    var that = this,
        rank,
        ranks,
        finalHand,
        handType,
        weight,
        flushCardSuit = that.isFlush(),
        straightCardRank = that.isStraight();

    if ( rank = that.isStraightFlush( straightCardRank, flushCardSuit ) ) {

        handType = that.handCount.intToRank(rank) === 'A' ? 'ROYALFLUSH' : 'STRAIGHTFLUSH';
        finalHand = that.allCards.spliceStraight(rank).map(function(card) {

            card.suit = flushCardSuit;
            return card;

        });

    } else if ( rank = that.isQuads() ) {

        handType = 'QUADS';
        finalHand = that.allCards.spliceByRank(rank).merge(that.allCards.splice(-1));

    } else if ( rank = that.isFullHouse() ) {

        handType = 'FULLHOUSE';
        finalHand = that.allCards.spliceByRank(rank[0]).merge(that.allCards.spliceByRank(rank[1]));

    } else if ( flushCardSuit ) {

        handType = 'FLUSH';
        finalHand = that.allCards.spliceFlush( flushCardSuit );

        rank = finalHand.cards[4].rank;

    } else if ( rank = straightCardRank ) {

        handType = 'STRAIGHT';
        finalHand = that.allCards.spliceStraight(straightCardRank);

    } else if ( rank = that.isTrips() ) {

        handType = 'TRIPS';
        finalHand = that.allCards.spliceByRank(rank).merge(that.allCards.splice(-2));

    } else if ( rank = that.isTwoPair() ) {

        handType = 'TWOPAIR';
        finalHand = that.allCards.spliceByRank(rank[0])
                        .merge(that.allCards.spliceByRank(rank[1]))
                        .merge(that.allCards.splice(-1));

    } else if (rank = that.isPair()) {

        handType = 'PAIR';
        finalHand = that.allCards.spliceByRank(rank).merge(that.allCards.splice(-3));

    } else {

        handType = 'HIGHCARD';
        finalHand = that.allCards.splice(-5);

    }

    return {

        handType: that.handTypes[handType].title,
        handTypeValue: that.handTypes[handType].value,
        hand: finalHand,
        weight: that.getHandWeight(handType, finalHand, rank)

    }
};

HandAnalyzer.prototype.getHandWeight = function(handType, hand, rank) {

    var reduceCallback = function( weight, card ) {

        var cardWeight = card.weight;

        // special case for 5 high straights
        if (handType === 'STRAIGHT' && rank === '5' && card.rank === 'A') {

            cardWeight = 1;

        }

        return weight += cardWeight;

    };
   
    return hand.reduce(reduceCallback);
};

HandAnalyzer.prototype.handTypes = {

    HIGHCARD: {
        value: 0,
        title: 'High card'
    },
    PAIR: {
        value: 1,
        title: 'Pair'
    },
    TWOPAIR: {
        value: 2,
        title: 'Two pairs'
    },
    TRIPS: {
        value: 3,
        title: 'Three of a kind'
    },
    STRAIGHT: {
        value: 4,
        title: 'Straight'
    },
    FLUSH: {
        value: 5,
        title: 'Flush'
    },
    FULLHOUSE: {
        value: 6,
        title: 'Full house'
    },
    QUADS: {
        value: 7,
        title: 'Four of a kind'
    },
    STRAIGHTFLUSH: {
        value: 8,
        title: 'Straight flush'
    },
    ROYALFLUSH: {
        value: 9,
        title: 'Royal flush'
    }
};

HandAnalyzer.prototype.isStraightFlush = function(straightCardRank, flushCardSuit) {

    if (straightCardRank === false || flushCardSuit === false)
        return false;

    var that = this,
        flushCards = that.allCards.clone().spliceBySuit(flushCardSuit),
        straightFlushHandCount =  {

            handCount: new HandCount(flushCards.toString())
        };

    return that.isStraight.call(straightFlushHandCount);

};

HandAnalyzer.prototype.isQuads = function() {

    var that = this;
    return that.quads.length > 0 ? that.quads.slice(-1).toString() : false;

};

HandAnalyzer.prototype.isFullHouse = function() {

    var that = this,
        trips = that.isTrips(),
        pairs = that.isTwoPair();

    if ( trips && pairs )

        return trips + _(pairs).without(trips).last();

    else
        return false;
};

HandAnalyzer.prototype.isFlush = function() {

    var that = this,
        flushSuit,
        suitCount = that.handCount.suitCount,
        flush = Object.keys(suitCount).some(function(suit) {

            flushSuit = suit;
            return suitCount[suit] >= 5;
        });

    return flush ? flushSuit : false;
};

// @return rank of the high end of straight, if there is a straight; false otherwise
HandAnalyzer.prototype.isStraight = function() {

    var that = this,
        rankCount = that.handCount.rankCount,
        intToRank = that.handCount.intToRank,
        straightCounter = 0,
        straight = false,
        index,
        i;

    // 14 is the rank of an Ace
    // 1 is also used as a rank for an Ace so we can check for a low straight
    for ( i = 14; i >= 1; i-- ) {

        // special case for detecting low-end straights
        index = (i === 1) ? 14 : i;

        if ( rankCount[intToRank(index)] > 0 )

            straightCounter++;

        else

            straightCounter = 0;


        if ( straightCounter === 5 ) {

            straight = intToRank(i + 4); // return high-end
            break;

        }
    }

    return straight;
};

HandAnalyzer.prototype.isTrips = function() {

    var that = this;
    return that.trips.length > 0 ? that.trips.slice(-1).toString() : false;

};

HandAnalyzer.prototype.isTwoPair = function() {

    var that = this;
    return that.pairs.length >= 2  ? that.pairs.slice(-2).reverse().join('') : false;

};

HandAnalyzer.prototype.isPair = function() {

    var that = this;
    return that.pairs.length > 0 ? that.pairs.slice(-1).toString() : false;

};

HandAnalyzer.prototype.parsePairs = function() {

    var that = this,
        rankCount = that.handCount.rankCount,
        rank,
        i;

    for ( i = 2; i <= 14; i++ ) {

        rank = that.handCount.intToRank(i);

        if ( rankCount[rank] === 4 )

            that.quads.push(rank);

        if ( rankCount[rank] >= 3 )

            that.trips.push(rank);

        if (rankCount[rank] >= 2)

            that.pairs.push(rank);
    }
};


var HandCount = function(handStr) {

    handStr = handStr || '';

    var that = this,
        i;
    that.suitCount = {

        'd': 0, 'c': 0,
        'h': 0, 's': 0

    };

    that.rankCount = {

        '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0,
        '9': 0, 'T': 0, 'J': 0, 'Q': 0, 'K': 0, 'A': 0

    };

    for ( i = 0, len = handStr.length; i < len; i++ ) {

        if ( _.isNumber( that.suitCount[handStr[i]] ) )

            that.suitCount[handStr[i]]++;

        else

            that.rankCount[handStr[i]]++;
    }
};

HandCount.prototype.combine = function(countObj) {

    var self = this,
        combinedCount = new HandCount();

    _.each(this.suitCount, function(value, key) {

        combinedCount.suitCount[key] = self.suitCount[key] + countObj.suitCount[key];

    });

    _.each(this.rankCount, function(value, key) {

        combinedCount.rankCount[key] = self.rankCount[key] + countObj.rankCount[key];

    });

    return combinedCount;
};

HandCount.prototype.intToRank = function(int) {

    var rank;
    switch(int) {
    case 10:
        rank = 'T';
        break;
    case 11:
        rank = 'J';
        break;
    case 12:
        rank = 'Q';
        break;
    case 13:
        rank = 'K';
        break;
    case 14:
        rank = 'A';
        break;
    default:
        rank = int + '';
    }
    return rank
};

module.exports = HandAnalyzer;