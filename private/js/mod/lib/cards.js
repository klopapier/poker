var _ = require('lodash'),
    Card = require('./card.js');

// @param {string|array} - can be an array of Card object or
// a string(rank, suit) eg. Tc9h6s
var Cards = function( cards ) {

    if (typeof cards === 'string') {

        var that = this,
            i;

        that.cards = [];
        for (  i = 0; i < cards.length; i += 2 ) {

            that.cards.push( new Card( cards[i], cards[i + 1] ) );
        }

    } else {

        var that = this;
        that.cards = cards;

    }
};

// Convert cards into an array of strings eg. ['As','5d','3c']
Cards.prototype.print = function() {

    var that = this,
        cards = that.cards.map(function(card) {

        return card.toString();

    });

    return cards;
};

// return an array of cards
Cards.prototype.toArray = function() {

    var that = this;
    return that.cards;

};

// convert cards into a string eg. '5d3d2d'
Cards.prototype.toString = function() {

    var cards = this.toArray(),
        string = '',
        i;

    for ( i = 0, len = cards.length; i < len; i++ ) {

        string += cards[i].toString();

    }

    return string;
};

// clone this object
// @return a new Cards object
Cards.prototype.clone = function() {
    var newCard,
        card,
        newCards = [],
        that = this,
        cards = that.cards,
        i;

    for ( i = 0, len = cards.length; i < len; i++ ) {

        card = cards[i];

        var newCard = new Card(card.rank, card.suit);

        newCard.dealt = card.dealt;
        newCard.weight = card.weight;
        newCards.push(newCard);

    }

    return new Cards(newCards);

};

// merge in another Cards object
// @return a new Cards object
Cards.prototype.merge = function(cards) {

    var that = this;
    return new Cards(that.cards.concat(cards.toArray()));


};

// reduce all cards into an integer
// @param {function} - takes params (weight, card) where weight is an accumulator
//                     and card is a card object.  Returns the accumulator.

Cards.prototype.reduce = function(obj) {

    var that = this,
        cards = that.cards,
        weight = 0,
        i;
    for ( i = 0, len = cards.length; i < len; i++ ) {

        weight = obj(weight, cards[i]);

    }

    return weight;
};

// return a new object with each card transformed by cb function
// @param {function} - takes params (card) where card is a card object.
Cards.prototype.map = function(obj) {

    var that = this,
        cards = that.cards,
        newCards = [],
        i;

    for ( i = 0, len = cards.length; i < len; i++ ) {

        newCards[i] = obj(cards[i]);

    }

    return new Cards(newCards);

};

// remove duplicate ranks
// @return a new Cards object
Cards.prototype.unique = function() {

    var that = this;
    return new Cards(_.unique(that.cards, true, function(card) {

        return card.rank;

    }));
};

// splice out card objects by index
// @param index {integer} - start index
// @param howMany {integer} - num to splice
// @return a new Cards object
Cards.prototype.splice = function(index, howMany) {

    var that = this;
    return new Cards(that.cards.splice.apply(that.cards, arguments));

};

// splice out card objects by card rank
// @param rank {string|int} - rank value eg. 5 or 'A'
// @return a new Cards object
Cards.prototype.spliceByRank = function(rank) {

    var that = this,
        cards = that.cards,
        splicedCards= [],
        i;

    for ( i = 0; i < cards.length; i++ ) {

        if ( cards[i].rank === rank ) {

            splicedCards = splicedCards.concat(cards.splice(i, 1));
            i--;

        }
    }
    
    return new Cards(splicedCards);
};

// splice out card objects by card suit
// @param suit {'d'|'c'|'h'|'s'} - suit value 
// @return a new Cards object
Cards.prototype.spliceBySuit = function(suit) {

    var that = this,
        cards = that.cards,
        splicedCards= [],
        i;

    for ( i = 0; i < cards.length; i++ ) {

        if ( cards[i].suit === suit ) {

            splicedCards = splicedCards.concat(cards.splice(i, 1));
            i--;

        }
    }
    
    return new Cards(splicedCards);
};

Cards.prototype.spliceStraight = function(highEndRank) {

    var that = this,
        splicedCards,
        cards = that.unique(),
        cardsArray = cards.toArray(),
        i;

    for ( i = 0, len = cardsArray.length; i < len; i++ ) {

        if ( cardsArray[i].rank === highEndRank ) {

            // special case for low-end straights
            if ( highEndRank === '5' ) {

                splicedCards = cards.spliceByRank('A'); 
                splicedCards = splicedCards.merge(cards.splice(i - 3, 4));

            } else {

                splicedCards = cards.splice(i - 4, 5);

            }

            break;
        }
    }

    return splicedCards;
};

Cards.prototype.spliceFlush = function(suit) {

    var that = this;
    return that.spliceBySuit(suit).splice(-5);

};


// insertion sort
Cards.prototype.sort = function() {
    var that = this,
        card, iHole,
        cards = that.cards,
        i;

    for ( i = 1, len = cards.length; i < len; i++ ) {

        card = cards[i];
        iHole = i;

        while ( iHole > 0 && cards[iHole - 1].weight > card.weight ) {

            cards[iHole] = cards[iHole - 1];
            iHole--;

        }

        cards[iHole] = card;

    }

    return that;
};

module.exports = Cards;