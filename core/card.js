var _ = require('lodash'),
    RANKS = [2, 3, 4, 5, 6, 7, 8, 9, 'T', 'J', 'Q', 'K', 'A'],
    SUITS = ['s', 'c', 'd', 'h'],
    deck = [];


_.forEach(RANKS, function (rank) {

    _.forEach(SUITS, function (suit) {

        var card = {};
        card.rank = rank;
        card.suit = suit;
        deck.push(card);

    });
});

module.exports = deck;