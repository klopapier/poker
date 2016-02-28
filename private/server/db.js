/**
 * Config-DB -Mysql
 * 
 */

var mysql = require("mysql");

var DB = mysql.createConnection({
	host : "localhost",
	user : "root",
	password : "",
	database : "poker"
});


module.exports.DB = DB;
