
  angular.module('babble.profile', []).controller('ProfileControl', [
    '$scope', '$http', function($scope, $http) {

      $scope.profile_list = [];

      $scope.init = function() {
        $http({
          url: '/profile/list',
          method: 'GET'
        }).then(function(res) {
          console.log(res);
          $scope.user = res.data.user;
          if(res.data.profile_list && res.data.profile_list.length > 0){
            $scope.profile_list = res.profile_list;
          }
          return
        })["catch"](function(res) {
          console.log(res);
          console.log('failed to get profile list');
          return
        });
      };

      $scope.new_profile_modal_trigger = function(){
        $('#new_profile_modal').foundation('reveal', 'open');
      }

      $scope.new_profile = function(){
        data = {
          name: $('#new-profile-name-field').val()
        }
        $http({
          url: '/profile/new',
          method: 'POST',
          data: data
        }).then(function(res){
          console.log(res);
          if(res.data.profile_list.length > 0){
            $scope.profile_list = res.profile_list;
          }
          return
        }).catch(function(res){
          console.log(res);
          console.log('failed to make new profile');
        })
      }



    }
  ]);
