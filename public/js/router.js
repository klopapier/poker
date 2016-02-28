var socket = io.connect(),
	app = angular.module( 'app', ['ngRoute'] ).config( function( $routeProvider, $locationProvider) {

	$routeProvider
        .when('/table-9/:tableId', {

            templateUrl: '/templates/table-10-handed.html',
            controller: 'TableController'

	    })
        .when('/table-5/:tableId', {

            templateUrl: '/templates/table-5-handed.html',
            controller: 'TableController'

	    })
        .when('/table-2/:tableId', {

            templateUrl: '/templates/table-2-handed.html',
            controller: 'TableController'

	    })
	    .when('/lobby', {
	    	templateUrl: '/templates/lobby.html',
	    	controller: 'LobbyController', 
	    })

	    .when('/', {
	    	templateUrl: '/templates/login.html',
	    	controller: 'LoginController', 
	    })

		.otherwise( { redirectTo: '/' } );
	    
		$locationProvider.html5Mode(true).hashPrefix('!');
});

app.run( function( $rootScope ) {

	$rootScope.username = '';
	$rootScope.totalChips = 0;
	$rootScope.sittingOnTable = '';
	//$rootScope.lobbyTablesView = '';

});