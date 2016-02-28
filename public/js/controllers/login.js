app.controller('LoginController', ['$scope', '$rootScope', '$http', '$location', function( $scope, $rootScope, $http, $location ) {
	
	$scope.moduleTitle = "Login";
	$scope.email = "";
	$scope.password="";
	
/*	
	$http({
		url: '/bet-data',
		method: 'GET'
	}).success(function (data,status, headers, config ) {
					
			$scope.gameTypes = data;
		
		
		}).error(function(data) {

			console.log('Error: ' + data);
    });
*/	

	
	$scope.login = function() {
		if($scope.email && $scope.password) {
			
			socket.emit('signin', $scope.email, $scope.password, function(response){

				if(response.success){
					$rootScope.username = response.username;
				//	$rootScope.avatar = response.avatar;
				//	alert('Success 3'+ $rootScope.username);
					$rootScope.totalChips = response.totalChips;
					$location.path('/lobby');
					$scope.registerError = '';					
					$rootScope.$digest();					
					
					
				}
				else if(response.message) {
					$scope.registerError = response.message;

				}
				$scope.$digest();
			});
		}
	};
	
	$scope.toRegister = function(){
		socket.emit( 'toRegister', function( response ) {
			if( response.success ) {
				$rootScope.registerView = true;
				$rootScope.$digest();
			}
		});
	};
	
	$scope.toLogin = function(){
		socket.emit( 'toLogin', function( response ) {
			if( response.success ) {
				$rootScope.registerView = '';
				$rootScope.$digest();
			}
		});
	};
	
	$scope.signup = function() {
		if($scope.email && $scope.password && $scope.username) {
			
			socket.emit('signup', $scope.email, $scope.password, $scope.username, function( response ){

				if(response.success){
					$rootScope.username = response.username;
					$rootScope.totalChips = response.totalChips;
					$location.path('/lobby');
					$scope.registerError = '';
					$rootScope.$digest();
				}
				else if(response.message) {
					$scope.registerError = response.message;

				}
				$scope.$digest();
			});
		}
	};
		

}]);



