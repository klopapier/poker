app.controller('AnmeldungControlle',function($scope,$http,$interval){
  load_pictures();
  $interval(function(){
    load_pictures();
  },300);
  function load_pictures(){
  $http.get('http://localhost:1337/anmeldung').success(function(data){    
    $scope.name=data;
	$scope.email=data;
  });
  };
});


/*app.controller('anmeldungControlle', ['$scope', '$rootScope', '$http', function( $scope, $rootScope, $http ) {
	
//	load_pictures();
	$http({
		url: '/anmeldung',
		method: 'GET'
	}).success(function (data) {
		
		$scope.name=data;
		$scope.email=data;

	});
	
}]);*/
