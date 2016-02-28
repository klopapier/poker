app.directive('toggle', function() {
    return function(scope, elem, attrs) {
        scope.$on('event:toggle', function() {
            elem.toggleClass('open');
      	});
  	};
});