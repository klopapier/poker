/*
 footer-tabs.ctrl
 */
app.controller('footerController', ['$scope', function ($scope) {
    $scope.footerTabs = [{
        title: 'RECENT PLAY',
        url: 'recent_play'
    }, {
        title: 'MOST CHIPS',
        url: 'most_chips'
    }];

    $scope.currentTab = 'recent_play';

    $scope.onClickTab = function (tabs) {
        $scope.currentTab = tabs.url;
    };

    $scope.isActiveTab = function(tabUrl) {
        return tabUrl == $scope.currentTab;
    };

    // defined hide/show 
    $scope.hidden = false;
}]);