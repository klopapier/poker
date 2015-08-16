var Card = require('./card'),
    Cards = require('./cards'),
    Deck = function() {

        var card,
            that = this,
            i;
        that.deck = [];
        that.dealtCount = 0;

        for ( i = 0; i < 52; i++ ) {

            card = that.cardMap[i];
            that.deck[i] = new Card(card.substring(0, 1), card.substring(1, 2));

        }
};

Deck.prototype.cardMap = [
    '2d', '3d', '4d', '5d', '6d', '7d', '8d', '9d', 'Td', 'Jd', 'Qd', 'Kd', 'Ad',
    '2c', '3c', '4c', '5c', '6c', '7c', '8c', '9c', 'Tc', 'Jc', 'Qc', 'Kc', 'Ac',
    '2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h', 'Th', 'Jh', 'Qh', 'Kh', 'Ah',
    '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', 'Ts', 'Js', 'Qs', 'Ks', 'As'
];

Deck.prototype.dealCard = function() {

    var rand,
        card,
        that = this;

    if ( that.dealtCount >= 52 ) {

        throw new Error('All cards have been dealt');
    }
     
    do {

        //var that = this;
        rand = Math.floor(Math.random() * 52);
        card = that.deck[rand];

    }

    while (card.dealt);

    card.dealt = true;
    that.dealtCount++;
    return card;
};

Deck.prototype.dealCards = function(numCards) {

    var cards = [],
        that = this,
        i;
    for ( i = 0, len = numCards; i < len; i++ ) {

        cards.push(that.dealCard());
    }

    return new Cards(cards);

};

Deck.prototype.reset = function() {

    var that = this,
        i;
    for ( i = 0; i < 52; i++ ) {

        that.deck[i].dealt = false;
    }

    that.dealtCount = 0;

};

module.exports = Deck;
