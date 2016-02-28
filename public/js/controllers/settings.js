/*
    settings.ctrl
*/
app.controller('settingsController', function($scope) {
    $scope.toggle = function() {
        $scope.$broadcast('event:toggle');
    }
})