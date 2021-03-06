
angular.module('babble.profile', []).controller('ProfileControl', [
  '$scope', '$http', 'socket', function($scope, $http, socket) {

    $scope.profile_list = [];

    $scope.link_to_profile = function(){
      window.location.href= "/profile/" + $scope.selected_profile.name + "/view"
    }

    $scope.mark_seen = function(profile){
      $http({
        url: '/profile/' + profile.name + '/mark_seen',
        method: 'POST'
      })
      .then(function(res){
        for(n in $scope.selected_profile.notifications){
          $scope.selected_profile.notifications[n].status = "seen";
        }
      })
      .catch(function(res){
        console.log('error marking profile notifications as seen');
        console.log(res);
      })
    }

    $scope.select_profile = function(profile){
      console.log(profile);
      $scope.selected_profile = profile;
      $scope.$parent.profile = profile;
      $scope.$parent.send_profile(profile);

      $('.profile_select_btn').css('opacity', '1');
      $('#' + profile.name + '_select').css('opacity', '0');

      $('.teal')
      .addClass('unselected')
      .removeClass('teal')
      .removeClass('selected');

      $('#' + profile.name + '_box')
        .addClass('large-6')
        .addClass('teal')
        .addClass('selected')
        .removeClass('unselected')
        .removeClass('large-4');
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

    $scope.remove_profile_modal_trigger = function(){
      $('#remove_profile_confirm_modal').foundation('reveal', 'open');
    }

    $scope.delete_profile = function(){
      $http({
        url: '/profile/delete',
        method: 'POST',
        data: {
          _id: $scope.selected_profile._id
        }
      })
      .then(function(res){
        for(p in $scope.profile_list){
          if($scope.profile_list[p].name == $scope.selected_profile.name){
            console.log($scope.profile_list[p]);
            $scope.profile_list.splice(p, 1);
          }
        }
      })
      .catch(function(res){
        console.log(res);
      });
      $('#remove_profile_confirm_modal').foundation('reveal', 'close');
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
        $('#new_profile_modal').foundation('reveal', 'close');
        return
      }).catch(function(res){
        console.log(res);
        console.log('failed to make new profile');
      })
    }
  }
]);
