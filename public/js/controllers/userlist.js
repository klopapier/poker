app.controller('UserController', ['$scope', '$http', function( $scope, $http ) {
	
	$http({
		url: '/getUsers',
		method: 'GET'
	}).success(function (data) {

		$scope.rows = data;
        console.log( data );

	}).error(function(data) {

        console.log('Error: ' + data);
    });
	
}]);
