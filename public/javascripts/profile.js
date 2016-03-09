
  angular.module('babble.profile', []).controller('ProfileControl', [
    '$scope', '$http', function($scope, $http) {
      // see: http://stackoverflow.com/a/33825763/4508247
      Array.prototype.getItemByParam = function(paramPair) {
        var key = Object.keys(paramPair)[0];
        return this.find(function(item){return ((item[key] == paramPair[key]) ? true: false)});
      }

      $scope.profile_list = [];

      $scope.select_profile = function(profile){
        console.log(profile);
        $scope.selected_profile = profile;

        //remove other selected profiles style
        $('.fa-circle')
          .removeClass('fa-circle')
          .addClass('fa-circle-o')
          .parents('.card')
            .removeClass('large-6')
            .addClass('large-4');

        //update the style for the selected profile
        $('#' + profile.name + '_select_circle')
          .addClass('fa-circle')
          .removeClass('fa-circle-o');

        $('#' + profile.name + '_box')
          .addClass('large-6')
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
