/*
    tabs.ctrl
*/
app.controller('tabsController', ['$scope', function ($scope) {
    $scope.tabs = [{
            title: 'HOLD-M',
            url: 'holdem'
        }, {
            title: 'TOURNAMENT',
            url: 'tournament'
        }, {
            title: 'VIP',
            url: 'vip'
    }];

    $scope.currentTab = 'holdem';

    $scope.onClickTab = function (tab) {
        $scope.currentTab = tab.url;
    };
    
    $scope.isActiveTab = function(tabUrl) {
        return tabUrl == $scope.currentTab;
    };

    // defined hide/show 
    $scope.hidden = false;
}]);