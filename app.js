var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	lessMiddleware = require('less-middleware'),
	path = require('path'),
	bcrypt = require('bcrypt-nodejs'),
	Table = require('./private/table'),
	Player = require('./private/player'),
	User =require('./private/server/register'),
	Room = require('./private/server/room');


app.set('views', path.join(__dirname, 'views'))
	.set('view engine', 'jade')
	.use(express.favicon())
	.use(express.logger('dev'))
	.use(express.bodyParser())
	.use(app.router)
	.use(lessMiddleware(__dirname + '/public'))
	.use(express.static(path.join(__dirname, 'public')));


// Development Only
if ( 'development' == app.get('env') ) {
	app.use( express.errorHandler() );
}

var players = [],
	tables = [],
	eventEmitter = {},
	port = process.env.PORT || 1337;

server.listen(port);
console.log('<<< We are in Port ' + port + ' >>>');

// to access login
app.get('/', function( req, res ) {
	res.render('index');
});


// lobby-data
app.get('/bet-data', function( req, res ) {
	
	Room.getBets(function (err, results) {
		if (!err){
				gameTypes = JSON.stringify(results);
				res.send(gameTypes);

		}else{
			console.log('Error while performing Query.');
		}
	});
	
});

// get All Tables
Room.getAllroom(function (err, results) {
	if (!err){

		for(var id in results){
			
			room_id = results[id].game_structure_id;
			var name = results[id].nameSeat;
			var seatsCount = results[id].seatCount;
			var maxBuyIn = results[id].maxBuyIn;
			var minBuyIn = results[id].minBuyIn;
			var boolean = results[id].privatTable;
				
			tables[room_id] = new Table(room_id, name , eventEmitter(room_id), seatsCount, 2, 1, maxBuyIn, minBuyIn, boolean );
			
			tables[0] = new Table( 0, '5-handed Table', eventEmitter(0), 5, 4, 2, 400, 80, false );
			
		}
	}
});


// If the table is requested manually, redirect to lobby
app.get('/table-10/:tableId', function( req, res ) {

	res.redirect('/');

});

// If the table is requested manually, redirect to lobby
app.get('/table-5/:tableId', function( req, res ) {

	res.redirect('/');

});

// If the table is requested manually, redirect to lobby
app.get('/table-2/:tableId', function( req, res ) {

	res.redirect('/');

});

/*app.get('/lobby', function( req, res ){
	res.render('index');
})
*/

// table data
app.get('/table-data/:tableId', function( req, res ) {

	if( typeof req.params.tableId !== 'undefined' && typeof tables[req.params.tableId] !== 'undefined' ) {

		res.send( { 'table': tables[req.params.tableId].public } );

	}
});

io.sockets.on('connection', function( socket ) {
	
	/**
	 *  a player login
	 */
	
	socket.on('signin', function(email, password, callback ) {
		if( typeof email !== 'undefined' && typeof password !== 'undefined' && typeof players[socket.id] === 'undefined' ) {
			var email = email.trim();
			
			if (email && password){
				User.getUserByUserEmail(email, function (err, results) {
				//console.log("result"+ results[0].email );
					if(results == '' ) {  
					
						callback({
							success: false,
							message: 'Email not exits'
						});
						return;  
					}  
		       
					//console.log("result"+ results[0].chips );
					var chips = results[0].chips;
					if(results[0].email != email || !bcrypt.compareSync(password, results[0].password)){
						callback({
							success: false,
							message: 'Email or password error.'
						});
						return;  
		            
					}else{  

						if(results[0].username != null && results[0].username != '' && results[0].avatar != ''){
							
						//	console.log("results[0].avatar"+ results[0].avatar);						
							players[socket.id] = new Player(socket, results[0].username, chips );
						//	console.log("socket.id"+ socket.id);
							
							callback({
							success: true,
							username: results[0].username,
							avatar: results[0].avatar,
							totalChips: players[socket.id].chips
							});		        		        		
						}else{
							callback({
								success: true,
								username: results[0].email							
								//totalChips: players[socket.id].chips
							});
						}
					} 
						
				});
						
			}
			
		}else{			
			callback({
				success: false,
				message: 'Email or password error.'
			});
			return;
		}
	});
	
	
	/**
	 * change to Register
	 */
		
	socket.on('toRegister', function( callback ) {

		if(typeof players[socket.id] === 'undefined') {

				callback({
					success: true,
					registerView:true
				});
		}
	});
	
	/**
	 * change to Login
	 */
		
	socket.on('toLogin', function( callback ) {

		if(typeof players[socket.id] === 'undefined') {

				callback({
					success: true,
					registerView:''
				});
			}
	});
	

	/**
	 * a Player Register
	 */
	
	socket.on('signup', function(email, password, username, callback ) {
		if( typeof email !== 'undefined' && typeof password !== 'undefined' && typeof players[socket.id] === 'undefined') {
			
			//console.log("result email:"+ email + "passw:"+password+ "username:"+ username);
			if (email && password){				
				if(email){
					// Check the exist email in DB
				User.checkEmailinDB(email, function (err, results){	
						
					if(results != "" ){
							// If Email exist in DB
							callback({
								success: false,
								message: 'Email ist already exist'
							});
							return;
							
					}else{

						var password = bcrypt.hashSync(password);
							// new Register
						User.insertRegisterSave(email,password, username, function (err, results) {

								if(err){
									callback({
										success: false,
										message: 'Register ist not success!'
									});
									return;  
									
								}else{
									
									players[socket.id] = new Player(socket, username, 1000 );					
									callback({
										success: true,
										username: username,							
										//totalChips: players[socket.id].chips
									});	
									}					
							});
														
					}
				});
				}					
			}	
		}else{			
			callback({
				success: false,
				message: 'Email, password or username error.'
			});
			return;
		}
	});
	

	/**
	 * search a Room..
	 */
		
	socket.on('searchRoom', function( id, gameTyp, callback ) { 
		
		if(id !== 'undefined' && typeof gameTyp !== 'undefined' && typeof players[socket.id] !== 'undefined') {

			Room.searchRoom(id, gameTyp, function (err, results) {
				if(!err){

					var lobbyTables = [],
					tableId;
					for(var id in results){						
						
						tableId = results[id].game_structure_id;

							if( !tables[tableId].privateTable ) {
								lobbyTables[tableId] = {};
								lobbyTables[tableId].id = tables[tableId].public.id;
								lobbyTables[tableId].name = tables[tableId].public.name;
								lobbyTables[tableId].seatsCount = tables[tableId].public.seatsCount;
								lobbyTables[tableId].playersSeatedCount = tables[tableId].public.playersSeatedCount;
								lobbyTables[tableId].bigBlind = tables[tableId].public.bigBlind;
								lobbyTables[tableId].smallBlind = tables[tableId].public.smallBlind;
							}
					}

					callback({
						success: true,
						lobbyTables:lobbyTables,
						lobbyTablesView:''
							
					});
					
				}else{			
					callback({
						success: false,
						message: 'Data-Base Error!'
					});
					return;
				}
			});
			
		}else{			
			callback({
				success: false,
				message: 'No Data in Room!'
			});
			return;
		}
	});
	
	/**
	 * When a player enters a room
	 * @param object table-data
	 */

	socket.on('enterRoom', function( tableId ) {
		
		if( typeof players[socket.id] !== 'undefined' 
			&& players[socket.id].room === null ) {
			
			console.log("i am in enterRoom");

			// Add the player to the socket room
			socket.join( 'table-' + tableId );
			
			console.log("i am in enterRoom" + tableId);

			// Add the room to the player's data
			players[socket.id].room = tableId;
			
			//console.log("player-test enter room" + players[socket.id].room);

		}
	});

	/**
	 * When a player leaves a room
	 */

	socket.on('leaveRoom', function() {

		if( typeof players[socket.id] !== 'undefined'
			&& players[socket.id].room !== null 
			//&& players[socket.id].lobby !== null
			&& players[socket.id].sittingOnTable === false ) {
			
			console.log("i am in leaveRoom");

			// Remove the player from the socket room
			socket.leave( 'table-' + players[socket.id].room );

			// Remove the room to the player's data
			players[socket.id].room = null;

		}
	});

	/**
	 * When a player disconnects
	 */

	socket.on('disconnect', function() {

		// If the socket points to a player object
		if( typeof players[socket.id] !== 'undefined' ) {

			// If the player was sitting on a table
			if( players[socket.id].sittingOnTable !== false &&
				typeof tables[players[socket.id].sittingOnTable] !== 'undefined' ) {

				// The seat on which the player was sitting
				var seat = players[socket.id].seat;

				// The table on which the player was sitting
				var tableId = players[socket.id].sittingOnTable;

				// Remove the player from the seat
				tables[tableId].playerLeft( seat );

			}

			// Remove the player object from the players array
			delete players[socket.id];
		}
	});
	
	/**
	 * When a player disconnects && Logout
	 */

	socket.on('logout', function(callback) {

		// If the socket points to a player object
		if( typeof players[socket.id] !== 'undefined' ) {

			// If the player was sitting on a table
			if( players[socket.id].sittingOnTable !== false &&
				typeof tables[players[socket.id].sittingOnTable] !== 'undefined' ) {

				// The seat on which the player was sitting
				var seat = players[socket.id].seat;

				// The table on which the player was sitting
				var tableId = players[socket.id].sittingOnTable;

				// Remove the player from the seat
				tables[tableId].playerLeft( seat );

			}

			// Remove the player object from the players array
			delete players[socket.id];
			
			callback({
				success: true,
				registerView:'',				
				username: ''
				
			});
		}
	});

	/**
	 * When a player leaves the table
	 * @param function callback
	 */

	socket.on('leaveTable', function( callback ) {

		// If the player was sitting on a table
		if( players[socket.id].sittingOnTable !== false
			&& tables[players[socket.id].sittingOnTable] !== false ) {

			// The seat on which the player was sitting
			var seat = players[socket.id].seat;

			// The table on which the player was sitting
			var tableId = players[socket.id].sittingOnTable;

			// Remove the player from the seat
			tables[tableId].playerLeft( seat );

			// Send the number of total chips back to the user
			callback( { 'success': true, 'totalChips': players[socket.id].chips } );
		}
	});


	/**
	 * When a player requests to sit on a table
	 * @param function callback
	 */
	socket.on('sitOnTheTable', function( data, callback ) {

		if( 
			// A seat has been specified
			typeof data.seat !== 'undefined'

			// A table id is specified
			&& typeof data.tableId !== 'undefined'

			// The table exists
			&& typeof tables[data.tableId] !== 'undefined'

			// The seat number is an integer and less than the total number of seats
			&& typeof data.seat === 'number'

			&& data.seat >= 0

			&& data.seat < tables[data.tableId].public.seatsCount

			&& typeof players[socket.id] !== 'undefined'

			// The seat is empty
			&& tables[data.tableId].seats[data.seat] == null

			// The player isn't sitting on any other tables
			&& players[socket.id].sittingOnTable === false

			// The player had joined the room of the table
			&& players[socket.id].room === data.tableId

			// The chips number chosen is a number
			&& typeof data.chips !== 'undefined'

			&& !isNaN(parseInt(data.chips))

			&& isFinite(data.chips)

			// The chips number is an integer
			&& data.chips % 1 === 0

		){
			
			console.log("i am in sitOnTable");
			
			// The chips the player chose are less than the total chips the player has
			if( data.chips > players[socket.id].chips )
				
				
				callback({
					success: false,
					error: 'You don\'t have that many chips'
				});

			else if( data.chips > tables[data.tableId].public.maxBuyIn ||
				data.chips < tables[data.tableId].public.minBuyIn )

				callback({

					success: false,
					error: 'The amount of chips should be between the maximum and the minimum amount of allowed buy in'
				});

			else {

					// Give the response to the user
					callback({

						success: true
					});

				}
				// Add the player to the table
				tables[data.tableId].playerSatOnTheTable( players[socket.id], data.seat, data.chips );

				//console.log('results:'+ data.tableId+ 'players[socket.id]:' +players[socket.id]+ 'data.seat:' + data.seat);
				
				
			} else {

			// If the user is not allowed to sit in, notify the user
			callback( { 'success': false } );
		}
	});

	/**
	 * When a player who sits on the table but is not sitting in, requests to sit in
	 * @param function callback
	 */
	socket.on('sitIn', function( callback ) {

		console.log("players[socket.id].sittingOnTable:" + players[socket.id].sittingOnTable);
		console.log("players[socket.id].seat:" + players[socket.id].seat);
		console.log("players[socket.id].public.sittingIn:" + players[socket.id].public.sittingIn);
		
		if( players[socket.id].sittingOnTable !== false &&
			players[socket.id].seat !== null &&
			!players[socket.id].public.sittingIn ) {

			console.log("i am in sitIn");
			// Getting the table id from the player object
			var tableId = players[socket.id].sittingOnTable;
			
			console.log("tableId:" + tableId);

			tables[tableId].playerSatIn( players[socket.id].seat );
			
			console.log("players[socket.id].seat:" +players[socket.id].seat);
				callback({
					success: true
				});
			}
	});

	/**
	 * When a player posts a blind
	 * @param bool postedBlind (Shows if the user posted the blind or not)
	 * @param function callback
	 */
	socket.on('postBlind', function( postedBlind, callback ) {

		if( players[socket.id].sittingOnTable !== false ) {

			var tableId = players[socket.id].sittingOnTable,
				activeSeat = tables[tableId].public.activeSeat;

			if( tables[tableId] 
				&& typeof tables[tableId].seats[activeSeat].public !== 'undefined' 
				&& tables[tableId].seats[activeSeat].socket.id === socket.id 
				&& ( tables[tableId].public.phase === 'smallBlind' || tables[tableId].public.phase === 'bigBlind' ) 
			){
				if( postedBlind ) {

					callback({

						success: true
					});
				}
				if( tables[tableId].public.phase === 'smallBlind' ) {

					// The player posted the small blind
					tables[tableId].playerPostedSmallBlind();

				} else {

					// The player posted the big blind
					tables[tableId].playerPostedBigBlind();

				}

			} else {

				tables[tableId].playerSatOut( players[socket.id].seat );
				callback( { 'success': true } );

			}
		}

	});

	/**
	 * When a player checks
	 * @param function callback
	 */
	socket.on('check', function( callback ){

		if( players[socket.id].sittingOnTable !== 'undefined' ) {

			var tableId = players[socket.id].sittingOnTable,
				activeSeat = tables[tableId].public.activeSeat;

			if( tables[tableId] 
				&& tables[tableId].seats[activeSeat].socket.id === socket.id 
				&& !tables[tableId].public.biggestBet ||
				( tables[tableId].public.phase === 'preflop'
				&& tables[tableId].public.biggestBet === players[socket.id].public.bet )
				&& ['preflop','flop','turn','river'].indexOf(tables[tableId].public.phase) > -1 
			){

				// Sending the callback first, because the next functions may need to send data to the same player, that shouldn't be overwritten
				callback({
					success: true
				});
			}
			tables[tableId].playerChecked();

		}

	});

	/**
	 * When a player folds
	 * @param function callback
	 */
	socket.on('fold', function( callback ){

		if( players[socket.id].sittingOnTable !== false ) {

			var tableId = players[socket.id].sittingOnTable,
				activeSeat = tables[tableId].public.activeSeat;

			if( tables[tableId] && tables[tableId].seats[activeSeat].socket.id === socket.id &&
				['preflop','flop','turn','river'].indexOf(tables[tableId].public.phase) > -1 ) {

				// Sending the callback first, because the next functions may need to send data to the same player, that shouldn't be overwritten
				callback({ 'success': true } );
				tables[tableId].playerFolded();
			}
		}
	});

	/**
	 * When a player calls
	 * @param function callback
	 */
	socket.on('call', function( callback ){

		if( players[socket.id].sittingOnTable !== 'undefined' ) {

			var tableId = players[socket.id].sittingOnTable,
				activeSeat = tables[tableId].public.activeSeat;

			if( tables[tableId] && tables[tableId].seats[activeSeat].socket.id === socket.id
				&& tables[tableId].public.biggestBet
				&& ['preflop','flop','turn','river'].indexOf(tables[tableId].public.phase) > -1 ) {

				// Sending the callback first, because the next functions may need to send data to the same player, that shouldn't be overwritten
				callback({

					success: true
				});

				tables[tableId].playerCalled();
			}
		}
	});

	/**
	 * When a player bets
	 * @param number amount
	 * @param function callback
	 */
	socket.on('bet', function( amount, callback ){

		if( players[socket.id].sittingOnTable !== 'undefined' ) {

			var tableId = players[socket.id].sittingOnTable,
				activeSeat = tables[tableId].public.activeSeat;

			if( tables[tableId] && tables[tableId].seats[activeSeat].socket.id === socket.id
				&& !tables[tableId].public.biggestBet
				&& ['preflop','flop','turn','river'].indexOf(tables[tableId].public.phase) > -1 ) {

				// Validating the bet amount
				amount = parseInt( amount );
				if ( amount && isFinite( amount ) && amount <= tables[tableId].seats[activeSeat].public.chipsInPlay ) {

					// Sending the callback first, because the next functions may need to send data to the same player, that shouldn't be overwritten
						callback({

							success: true
						});
					}
				tables[tableId].playerBetted( amount );
			}
		}

	});

	/**
	 * When a player raises
	 * @param function callback
	 */
	socket.on('raise', function( amount, callback ){

		if( players[socket.id].sittingOnTable !== 'undefined' ) {

			var tableId = players[socket.id].sittingOnTable,
				activeSeat = tables[tableId].public.activeSeat;
			
			if(
				// The table exists
				typeof tables[tableId] !== 'undefined'

				// The player who should act is the player who raised
				&& tables[tableId].seats[activeSeat].socket.id === socket.id

				// The pot was betted 
				&& tables[tableId].public.biggestBet

				// It's not a round of blinds
				&& ['preflop','flop','turn','river'].indexOf(tables[tableId].public.phase) > -1

				// Not every other player is all in (in which case the only move is "call")
				&& !tables[tableId].otherPlayersAreAllIn()
			) {
				amount = parseInt( amount );
				if ( amount && isFinite( amount ) ) {

					amount -= tables[tableId].seats[activeSeat].public.bet;

					if( amount <= tables[tableId].seats[activeSeat].public.chipsInPlay ) {

						// Sending the callback first, because the next functions may need to send data to the same player, that shouldn't be overwritten
						callback({

							success: true
						});

						// The amount should not include amounts previously betted
						tables[tableId].playerRaised( amount );
					}
				}
			}
		}
	});

	/**
	 * When a message from a player is sent
	 * @param string message
	 */
	socket.on('sendMessage', function( message ) {

		message = message.trim();
		if( message && players[socket.id].room) {

			socket.broadcast.to( 'table-' + players[socket.id].room )
				.emit( 'receiveMessage', {

					message: htmlEntities( message ),
					sender: players[socket.id].public.name
				});
		}
	});
});

/**
 * Event emitter function that will be sent to the table objects
 * Tables use the eventEmitter in order to send events to the client
 * and update the table data in the ui
 * @param string tableId
 */
var eventEmitter = function( tableId ) {
	return function ( eventName, eventData ) {
		
	//	console.log("eventName:"+ eventName);
	//	console.log("eventData:"+ eventData);
		
		io.sockets.in( 'table-' + tableId )
			.emit( eventName, eventData );
		

		
	}
};




/**
 * Changes certain characters in a string to html entities
 * @param string str
 */
function htmlEntities(str) {

    return String(str).replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');

}


/*
tables[0] = new Table( 0, '5-handed Table', eventEmitter(0), 5, 4, 2, 400, 80, false );
tables[1] = new Table( 1, '2-handed Table', eventEmitter(1), 2, 8, 4, 800, 160, false );
tables[2] = new Table( 2, '5-handed Table', eventEmitter(2), 5, 4, 2, 400, 80, false );
tables[3] = new Table( 3, '2-handed Table', eventEmitter(3), 2, 8, 4, 800, 160, false );
tables[4] = new Table( 4, '5-handed Table', eventEmitter(4), 5, 4, 2, 400, 80, false );
tables[5] = new Table( 5, '2-handed Table', eventEmitter(5), 2, 8, 4, 800, 160, false );
tables[6] = new Table( 6, '5-handed Table', eventEmitter(6), 5, 4, 2, 400, 80, false );
tables[7] = new Table( 7, '2-handed Table', eventEmitter(7), 2, 8, 4, 800, 160, false );
tables[8] = new Table( 8, '5-handed Table', eventEmitter(8), 5, 4, 2, 400, 80, false );
tables[9] = new Table( 9, '2-handed Table', eventEmitter(9), 2, 8, 4, 800, 160, false );
tables[10] = new Table( 10, '5-handed Table', eventEmitter(10), 5, 4, 2, 400, 80, false );
tables[11] = new Table( 11, '2-handed Table', eventEmitter(11), 2, 8, 4, 800, 160, false );
//tables[4] = new Table( 4, '6-handed Private Table', eventEmitter(4), 5, 20, 10, 2000, 400, true );

*/


