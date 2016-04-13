angular.module('babble.profile_view', ['ngSanitize']).controller('ProfileViewControl', [
  '$scope', '$http', 'socket', function($scope, $http, socket) {


    $scope.init = function(){
      $scope.profile = window.location.href.split('/')[4];
      $scope.selected_tab = 'home';
      $scope.selected_friends = [];
      $scope.friend_list = [];
      $scope.public_group_list = [];
      $scope.$parent.send_profile($scope.profile);
      $scope.selected_discussion = false;
    }

    $scope.post_new_discussion = function(){
      var title = $('#new-discussion-name-field').val();
      var desc = $('#new-discussion-description-field').val();
      data = {
        title: title,
        desc: desc,
        text: $scope.codeMirror.getValue(),
        group: $scope.$parent.selected_group,
        profile: $scope.profile
      }

      $scope.$parent.send_message('discussion:new', data);
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

    $scope.send_message = function(){
      $scope.$parent.send_message('chat:new', {
        text: $scope.codeMirror.getValue(),
        discussion: $scope.selected_discussion,
        group: $scope.selected_group
      });
    }

    $scope.select_discussion = function(discussion){
      console.log(discussion);
      if($scope.selected_discussion){
        $('html, body')
          .animate({
            scrollTop: $('#discussion_' + discussion._id).offset().top - 30
        }, 500);
        $('.indigo').removeClass('indigo');
        $('#discussion_' + discussion._id)
        .addClass('indigo darken-2');

        $('#chat-wrapper')
        .animate({
            top: $("#discussion_" + discussion._id).offset().top - 30,
            left: 0
          }, 300, function() {
            //callback
        });

        $scope.codeMirror.setValue('');
      } else {
        $scope.page_scroll = $('body').scrollTop();
        $scope.discussion_wrapper_top = $('#discussion-wrapper').css('top');
        $('#group-wrapper')
        .animate({
          left:-1000
        }, 400);

        $('#discussion-wrapper')
        .animate({
          left: -550,
          top: -5
        }, 400, function(){
          $('html, body')
            .animate({
              scrollTop: $('#discussion_' + discussion._id).offset().top - 30
          }, 500);

          $('#chat-wrapper')
          .fadeIn()
          .css({
            top:1000,position:'absolute'
          })
          .animate({
              top: $("#discussion_" + discussion._id).offset().top - 30,
              left: 0
            }, 300, function() {
              //callback
          });
        })
        .removeClass('custom-width-3')
        .addClass('custom-width-1')
        .css("height", "100%")
        .css("overflow-y", "hidden");

        $('#discussion_' + discussion._id)
        .addClass('indigo darken-2');

        $scope.selected_discussion = discussion;

        $scope.codeMirror = CodeMirror(
          $('#chat-field')[0],
          {
            mode: 'twilight',
            lineNumbers: true,
            viewportMargin: Infinity
          }
        );
      }
      $scope.$parent.send_message('discussion:get_messages', {
        discussion: discussion
      });
    }

    $scope.discussion_back = function(){
      $scope.selected_discussion = false;
      $('.indigo').removeClass('indigo');

      $('#group-wrapper')
      .animate({
        left: 0
      }, 500);

      $('#chat-wrapper')
      .animate({
        top: 1000
      }, 300);

      $('#discussion-wrapper')
      .animate({
        left: 0,
        top: $scope.discussion_wrapper_top
      }, 500)
      .addClass('custom-width-3')
      .removeClass('custom-width-1')
      .css("height", "100%")
      .css("overflow-y", "scroll");

      window.scrollTo(0, $scope.page_scroll);

    }

    $scope.select_group = function(group){
      if(group._id == $scope.$parent.selected_group){
        return;
      }
      console.log(group);
      $scope.$parent.selected_group = group._id;
      $scope.$parent.selected_group_obj = group;

      // var index = 0;
      // for(i in $scope.$parent.group_list){
      //   if($scope.$parent.group_list[i] && $scope.$parent.group_list[i].id == $scope.$parent.selected_group){
      //     index = i;
      //     break;
      //   }
      // }

      $('.selected')
      .addClass('unselected')
      .removeClass('custom-width-2');

      $('.group_card')
      .removeClass('custom-offset-2')
      .addClass('custom-offset-1')
      .addClass('custom-width-1');

      $('.selected')
      .removeClass('selected');

      $('#group_' + group._id)
      .addClass('selected')
      .addClass('custom-width-2')
      .removeClass('unselected');

      //$scope.group_keys = Object.keys(group);
      $http({
        url: '/group/' + group._id + '/get_discussion_list',
        method: 'GET'
      }).then(function(res){
        console.log(res);
        group.discussion_list = res.data;
        $('html, body')
        .animate({
            scrollTop: $("#group_" + group._id).offset().top - 50
        }, 1000);

        $('.discussion-wrapper')
        .fadeIn()
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
        $scope.$parent.group_list.push(res.data);
        $scope.$parent.group_list.sort($scope.group_compare);
        if($scope.$parent.selected_group){
          $('#group_' + res.data.id).addClass('custom-offset-1');
          $('#group_' + res.data.id).addClass('custom-width-1');
          $('#group_' + res.data.id).removeClass('custom-offset-2');
        }
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
        for(i in $scope.public_group_list){
          for(j in $scope.$parent.group_list){
            if($scope.public_group_list[i] && $scope.$parent.group_list[j]){
              if($scope.public_group_list[i]._id == $scope.$parent.group_list[j]._id){
                $scope.public_group_list.splice(i, 1);
              }
            }
          }
        }
      }).catch(function(res){
        console.log(res);
      });
    }

    $scope.select_public_group = function(group){
      $scope.public_group_selected = group._id;
    }

    $scope.group_subscribe = function(group){
      console.log('got a group subscription request');
      console.log(group);
      var data = {
        profile: $scope.profile
      }
      $http({
        url:'/group/' + group.name + '/subscribe',
        method: 'POST',
        data: data
      })
      .then(function(res){
        console.log(res);
        $('#public_group_search_modal').foundation('reveal', 'close');
        $scope.get_groups();
      })
      .catch(function(res){
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
        $scope.$parent.group_list = res.data;
        $scope.$parent.group_list.sort($scope.group_compare);
        console.log(res);
      }).catch(function(res){
        console.log(res);
      });
    }

    $scope.select_config_click = function(){
      $scope.init();
      $scope.selected_tab = "config"
    }
    $scope.select_home_click = function(){
      $scope.init();
    }
    $scope.select_group_click = function(){
      $scope.init();
      $scope.selected_tab = "group"
      $scope.get_groups();
    }
    $scope.select_discussion_click = function(){
      $scope.init();
      $scope.selected_tab = "discussions"
    }

    $scope.move = function(array, from, to) {
      if( to === from ) return;

      var target = array[from];
      var increment = to < from ? -1 : 1;

      for(var k = from; k != to; k += increment){
        array[k] = array[k + increment];
      }
      array[to] = target;
    }


  }
]);
