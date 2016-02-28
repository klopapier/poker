app.controller( 'LobbyController', ['$scope', '$rootScope', '$http', '$routeParams', '$timeout', '$location',
function( $scope, $rootScope, $http, $routeParams, $timeout, $location) {
	

	$http({
		url: '/bet-data',
		method: 'GET'
	}).success(function (data,status, headers, config ) {
					
			$scope.gameTypes = data;
		
		
		}).error(function(data) {

			console.log('Error: ' + data);
    });

	
	$scope.searchRoom = function( id, gameTyp ) {
		$scope.id = id;
		$scope.gameTyp = gameTyp;
			socket.emit('searchRoom', $scope.id, $scope.gameTyp, function(response){

				if(response.success){
				
					$rootScope.lobbyTables = response.lobbyTables;
					$rootScope.lobbyTablesView = true;
					$rootScope.lobbyError = "";
					$rootScope.$digest();
					
				}
				else if(response.message) {
					$scope.lobbyError = response.message;

				}
				$scope.$digest();
			});
			
	};
	
	$scope.logout = function() {
		socket.emit( 'logout', function(response){
			if(response.success){
				$rootScope.username = response.username;
				$location.path('/');
				$rootScope.registerView = '';				
				$rootScope.$digest();
				process.exit();
			}
		});
	};
	

}]);