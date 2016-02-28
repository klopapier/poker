var express = require('express');
var bcrypt = require('bcrypt-nodejs');
var router = express.Router();
var DB = require('./db').DB;
var apptitle = 'Legend Poker';

function User(user) {  
    this.username = user.username;  
    this.password = user.password;
    this.email    = user.email;
};  

var insertRegisterSave = function insertRegisterSave(email, password, username, callback){
	//console.log("resultjuhu"+ password );
    var cmd = "INSERT INTO tblPlayers(playerId, username, password, email, chips, game_id, game_position, sitting_out, finished_place) VALUES(0,?,?,?,0,0,0,0,0)";  
    DB.query(cmd, [username, password, email], function (err,result) {  
        callback(err,result); 
       // console.log("resultjuhu2"+ result );
    });         
};  


var checkEmailinDB = function checkEmailinDB(email, callback){
		//console.log("resultjuhu"+ email );
    var cmd = "select * from tblPlayers where email = ?";  
    DB.query(cmd, [email], function (err,result) {  
        callback(err,result);  
       // console.log("juhuvvv"+ result[0].email);
    });         
};


/*
User.getUserNumByName = function getUserNumByName(username, callback) {  
    var cmd = 'select COUNT(1) AS num from tblPlayers where username = ?';
    DB.query(cmd, [username], function (err, result) {  
        connection.release(); 
        callback(err,result);                      
    });         
};  
var getUserByUserName = function getUserNumByName(username, callback) {  
    var cmd = 'select * from tblPlayers where username = ?';  
    DB.query(cmd, [username], function (err, result) {  
        callback(err,result);                      
    });         
}; 
*/
User.getUserNumByEmail = function getUserNumByEmail(email, callback) {  
    var cmd = 'select COUNT(1) AS num from tblPlayers where email = ?';
    DB.query(cmd, [email], function (err, result) {  
        connection.release(); 
        callback(err,result);                      
    });         
};  
var getUserByUserEmail = function getUserNumByEmail(email, callback) {  
	
    var cmd = 'select * from tblPlayers where email = ?';  
    DB.query(cmd, [email], function (err, result) {  
        callback(err,result);              
       
    });         
};




module.exports.checkEmailinDB = checkEmailinDB;
module.exports.insertRegisterSave = insertRegisterSave;
module.exports.getUserByUserEmail = getUserByUserEmail;
