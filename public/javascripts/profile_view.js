angular.module('babble.profile_view', []).controller('ProfileViewControl', [
  '$scope', '$http', function($scope, $http) {

    $scope.init = function(){
      $scope.profile = window.location.href.split('/')[4];
      $scope.selected_tab = 'home';
      $scope.selected_friends = [];
      $scope.group_list = [];
      $scope.friend_list = [];
    }

    $scope.create_group_trigger = function(){
      $("#group_create_modal").foundation("reveal", "open");
    }

    $scope.create_group = function(){
      $scope.selected_friends.push($scope.profile);
      data = {
        privacy: $('#create_group_privacy_radio').val(),
        sub_names: $scope.selected_friends,
        group_name: $('#new_group_name').val()
      };
      $http({
        url: '/group/create',
        method: 'POST',
        data: data
      }).then(function(res){
        console.log(res);
        $scope.group_list.push(res.data);
      }).catch(function(res){
        console.log(res);
      });
    }

    $scope.select_friend = function(friend){
      $scope.selected_friends.push(friend.name);
    }

    $scope.get_friends = function(){
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
