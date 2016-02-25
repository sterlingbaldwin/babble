
  angular.module('babble.profile', []).controller('ProfileControl', [
    '$scope', '$http', function($scope, $http) {

      $scope.profile_list = [];

      $scope.select_profile = function(profile){
        console.log(profile);
        $scope.selected_profile = profile;

        //remove other selected profiles style
        $('.fa-circle')
          .removeClass('fa-circle')
          .addClass('fa-circle-o')
          .parent().parent()
            .removeClass('large-6')
            .addClass('large-4');

        //update the style for the selected profile
        var element = $('#' + profile.name + '_select_circle');
        element
          .addClass('fa-circle')
          .removeClass('fa-circle-o');

        element = $('#' + profile.name + '_box');
        element
          .addClass('large-6')
          .removeClass('large-4')

      }

      $scope.init = function() {
        $http({
          url: '/profile/list',
          method: 'GET'
        }).then(function(res) {
          console.log(res);
          $scope.user = res.data.user;
          if(res.data.profile_list && res.data.profile_list.length > 0){
            $scope.profile_list = res.data.profile_list;
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
          if(res.data.new_profile){
            $scope.profile_list.push(res.data.new_profile);
          }
          return
        }).catch(function(res){
          console.log(res);
          console.log('failed to make new profile');
        })
      }
    }
  ]);
