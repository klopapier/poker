

var express = require('express');
var router = express.Router();
var DB = require('./db').DB;



var getBets = function getBets(callback){
	//var cmd = "select * from tblBet";  
	var cmd = "SELECT DISTINCT t2.bet_id, t1.value, t2.gameTyp FROM tblbet t1, tblgame_structure t2 WHERE t1.bet_id = t2.bet_id ORDER BY t2.bet_id";
	DB.query(cmd, function (err,result) {  
		callback(err,result);  
		// console.log("juhuvvv"+ result);
	});         
};

/*
var holeBetVip = function holeBetVip(callback){
	var cmd = "SELECT DISTINCT t2.bet_id, t1.value FROM tblbet t1, tblgame_structure t2 WHERE t1.bet_id = t2.bet_id && t2.gameTyp = 'vip' ORDER BY t2.bet_id;";  
	DB.query(cmd, function (err,result) {  
		callback(err,result);  
		// console.log("juhuvvv"+ result);
	});         
};
*/

var searchRoom = function searchRoom(bet_id, gameTyp, callback){

	var cmd = "SELECT * FROM tblgame_structure WHERE bet_id=? and gameTyp=?";
	DB.query(cmd,[bet_id, gameTyp], function (err,result) {  
		callback(err,result);  
		//console.log("juhuvvv"+ result);
	});
};

var getAllroom = function getAllroom(callback){

	var cmd = "SELECT * FROM tblbet t1, tblgame_structure t2 WHERE t1.bet_id = t2.bet_id ORDER BY t2.game_structure_id";
	DB.query(cmd, function (err,result) {  
		callback(err,result);  
		//console.log("juhuvvv"+ result);
	});
};




//module.exports.holeBetVip = holeBetVip;
module.exports.getBets = getBets;
module.exports.searchRoom = searchRoom;
module.exports.getAllroom = getAllroom;