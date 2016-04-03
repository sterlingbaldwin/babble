angular.module('babble.profile_view', []).controller('ProfileViewControl', [
  '$scope', '$http', 'socket', function($scope, $http, socket) {


    socket.on('connect', function(){

      // socket.emit('discussion:new', {
      //   blar: 'blarblar'
      // });

    });

    $scope.init = function(){
      $scope.profile = window.location.href.split('/')[4];
      $scope.selected_tab = 'home';
      $scope.selected_friends = [];
      $scope.group_list = [];
      $scope.friend_list = [];
      $scope.public_group_list = [];
      $scope.selected_group = undefined;
      $scope.selected_group_obj = null;
    }

    $scope.post_new_discussion = function(){
      var title = $('#new-discussion-name-field').val();
      var desc = $('#new-discussion-description-field').val();
      data = {
        title: title,
        desc: desc,
        text: $scope.codeMirror.getValue(),
        group: $scope.selected_group,
        profile: $scope.profile
      }
      // $http({
      //   url: '/group/new_discussion',
      //   method: 'POST',
      //   data: data
      // }).then(function(res){
      //   console.log(res);
      // }).catch(function(res){
      //   console.log(res);
      // });
      try {
        socket.emit('discusson:new', {
          data: data
        }, function(data){
          console.log('hit discussion:new callback');
          console.log(data);
        });
      } catch (e) {
        console.log(e);
      } finally {

      }

    }

    $scope.new_discussion_modal_trigger = function(group){
      $('#new_discussion_modal').foundation('reveal', 'open');
      $scope.codeMirror = CodeMirror(
        $('#discussion-post-field')[0],
        {
          mode: 'twilight',
          lineNumbers: true,
          viewportMargin: Infinity
        }
      );
      //$('.CodeMirror').addClass('CodeMirror-focused');
      //$scope.codeMirror.setValue('\n\n\n\n\n\n\n\n\n\n');
      // $scope.codeMirror.setCursor(1);
    }

    $scope.create_group_trigger = function(){
      $("#group_create_modal").foundation("reveal", "open");
    }

    $scope.select_discussion = function(discussion){
      console.log(discussion);
    }

    $scope.select_group = function(group){
      if(group._id == $scope.selected_group){
        return;
      }
      console.log(group);
      $scope.selected_group = group._id;
      $scope.selected_group_obj = group;

      $('.selected').addClass('unselected');
      $('.selected').removeClass('custom-width-2');
      $('.group_card').removeClass('custom-offset-2');
      $('.group_card').addClass('custom-offset-1');
      $('.group_card').addClass('custom-width-1');
      $('.selected').removeClass('selected');
      // $('.selected').removeClass('large-offset-2');
      $('#group_' + group._id).addClass('selected');
      $('#group_' + group._id).addClass('custom-width-2');
      $('#group_' + group._id).removeClass('unselected');
      $scope.group_keys = Object.keys(group);
      $http({
        url: '/group/' + group._id + '/get_discussion_list',
        method: 'GET'
      }).then(function(res){
        console.log(res);
        group.discussion_list = res.data;
        $('html, body').animate({
            scrollTop: $("#group_" + group._id).offset().top - 50
        }, 1000);
        $('.discussion-wrapper').fadeIn()
        .css({
          top:1000,position:'absolute'
        })
        .animate({
            top:$("#group_" + group._id).offset().top - 20
          }, 800, function() {
            //callback
        });

      }).catch(function(res){
        console.log(res);
      });
    }

    $scope.group_compare = function(a,b) {
      if (a.name < b.name)
        return -1;
      else if (a.name > b.name)
        return 1;
      else
        return 0;
    }

    $scope.create_group = function(){
      $scope.selected_friends.push($scope.profile);
      data = {
        privacy: $('#create_group_privacy_box').is(':checked'),
        sub_names: $scope.selected_friends,
        group_name: $('#new_group_name').val(),
        group_description: $('#new_group_desc').val()
      };
      $http({
        url: '/group/create',
        method: 'POST',
        data: data
      }).then(function(res){
        console.log(res);
        $scope.group_list.push(res.data);
        $scope.group_list.sort($scope.group_compare);
        $('#group_create_modal').foundation('reveal', 'close');
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

    $scope.public_group_search = function(){
      $('#public_group_search_modal').foundation('reveal', 'open');
      $http({
        url: '/groups/public_group_search',
        method: 'GET'
      }).then(function(res){
        console.log(res);
        $scope.public_group_list = res.data;
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
        $scope.group_list.sort($scope.group_compare);
        console.log(res);
      }).catch(function(res){
        console.log(res);
      });
    }

  }
]);
