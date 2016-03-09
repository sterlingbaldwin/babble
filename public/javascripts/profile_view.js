angular.module('babble.profile_view', []).controller('ProfileViewControl', [
  '$scope', '$http', function($scope, $http) {
    $scope.selected_tab = 'home';


    $scope.init = function(){
      console.log('Working!');
    }

  }
]);
