/**
 * New node file
 */
var express = require("express");
var mysql = require("mysql");
var app = express();
/*
* Configure MySQL parameters.
*/
var connection = mysql.createConnection({
	host : "localhost",
	user : "root",
	password : "root",
	database : "poker"
});

/*Connecting to Database*/

connection.connect(function(error){
	if(error)
	{
		console.log("Problem with MySQL"+error);
	}
	else
	{
		console.log("Connected with Database");
	}
});



// Daten holen from player
app.get("/lobby-data",function(req,res){
	connection.query('SELECT * from player', function(err, rows, fields) {
	if (!err)
		res.end(JSON.stringify(rows));
	else
		console.log('Error while performing Query.');
	});

	connection.end(); 
});

/*Start the Server*/

app.listen(1337,function(){
	console.log("It's Started on PORT 1337");
});

