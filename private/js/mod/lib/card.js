var Card = function(rank, suit) {

	var that = this;
    	that.rank = rank;
    	that.suit = suit;
    	that.dealt = false;
    	that.weight = that.rankToInt();
};

Card.prototype.toString = function() {

	var that = this;
    return that.rank + that.suit;
};

Card.prototype.rankToInt = function() {
	var that = this,
		rank;

	switch(that.rank) {
	case 'T':
		rank = 10;
		break;
	case 'J':
		rank = 11;
		break;
	case 'Q':
		rank = 12;
		break;
	case 'K':
		rank = 13;
		break;
	case 'A':
		rank = 14;
		break;
	default:
		rank = + that.rank;
	}

	return rank;
}

module.exports = Card;
