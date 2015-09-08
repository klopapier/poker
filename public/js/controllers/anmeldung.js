/*app.controller('AnmeldungControlle',function($scope,$http,$interval){
  load_player();
  
  $interval(function(){
    	load_player();
  	},300);
  
  function load_player(){
  		$http.get('http://localhost:1337/anmeldung').success(function(data){    
    	$scope.name=data;
		$scope.email=data;
  		});
  	};
  	
});
*/

app.controller('anmeldungControlle', ['$scope', '$rootScope', '$http', function( $scope, $rootScope, $http ) {
	
	$http({
		url: '/anmeldung',
		method: 'GET'
	}).success(function (data) {
		
		$scope.name=data;
		$scope.email=data;

	});
	
}]);
