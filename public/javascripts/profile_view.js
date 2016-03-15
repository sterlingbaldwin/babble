angular.module('babble.profile_view', []).controller('ProfileViewControl', [
  '$scope', '$http', function($scope, $http) {
    $scope.selected_tab = 'home';


    $scope.init = function(){
      $scope.profile = window.location.href.split('/')[4];
    }

    $scope.create_group_trigger = function(){
      $("#group_create_modal").foundation("reveal", "open");
    }

    $scope.select_friends = function(){
      $http({
        url: '/profile/' + $scope.profile + '/friends_list',
        method: 'GET'
      }).then(function(res){
        $scope.friend_list = res.data;
        console.log(res);
      }).catch(function(res){
        console.log(res);
      });
    }

    $scope.get_groups = function(){
      $scope.selected_tab = 'groups';
      console.log('Retrieving group list');
      $http({
        url: '/profile/get_group_list/' + $scope.profile,
        method: 'GET'
      }).then(function(res){
        $scope.group_list = res.data;
        console.log(res);
      }).catch(function(res){
        console.log(res);
      });
    }

  }
]);
