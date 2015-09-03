var socket = io.connect(),
	app = angular.module( 'app', ['ngRoute'] ).config( function( $routeProvider, $locationProvider ) {

	$routeProvider.when('/table-10/:tableId', {

		templateUrl: '/templates/table-10-handed.html',
		controller: 'TableController'

	});

	$routeProvider.when('/table-6/:tableId', {

		templateUrl: '/templates/table-6-handed.html',
		controller: 'TableController'

	});

	$routeProvider.when('/table-2/:tableId', {

		templateUrl: '/templates/table-2-handed.html',
		controller: 'TableController'

	});

	$routeProvider.when('/', {

		templateUrl: '/templates/lobby.html',
		controller: 'LobbyController'

	});

	$routeProvider.otherwise( { redirectTo: '/' } );

	$locationProvider.html5Mode(true).hashPrefix('!');
});

app.run( function( $rootScope ) {

	$rootScope.screenName = '';
	$rootScope.totalChips = 0;
	$rootScope.sittingOnTable = '';

});