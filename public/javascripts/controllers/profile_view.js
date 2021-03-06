angular.module('babble.profile_view', ['ngSanitize', 'ngAnimate']).controller('ProfileViewControl', [
  '$scope', '$http', 'socket', '$sce', function($scope, $http, socket, $sce) {


    $scope.init = function(){
      $scope.profile = window.location.href.split('/')[4];
      $scope.selected_tab = 'home';
      $scope.selected_friends = [];
      $scope.friends_list = [];
      $scope.public_group_list = [];
      $scope.$parent.send_profile($scope.profile);
      $scope.selected_discussion = false;
      $scope.profile_edit = false;
      $http({
        url: '/profile/' + $scope.profile + '/get_profile_text',
        method: 'GET'
      })
      .then(function(res){
        $scope.profile_text = res.data;
      })
      .catch(function(res){
        console.log('error getting profile_text');
        if(res) console.log(res);
      });
      $http({
        url: '/profile/' + $scope.profile + '/friends_list',
        method: 'GET'
      })
      .then(function(res){
        console.log('Got friend list');
        console.log(res);
        $scope.friends_list = res.data;
      })
      .catch(function(res){

      });
    }

    $scope.profile_modal_trigger = function(by){
      $scope.selected_profile = by;
      $http({
        url: '/profile/' + by + '/get_profile_text',
        method: 'GET'
      })
      .then(function(res){
        $scope.selected_profile_text = res.data;
        $('#profile_modal').foundation('reveal', 'open');
      })
      .catch(function(res){
        console.log('error getting profile_text');
        if(res) console.log(res);
      });
      if(!$scope.friends_list || typeof $scope.friends_list === "undefined"){
        $http({
          url: '/profile/' + $scope.profile + '/friends_list',
          method: 'GET'
        }).then(function(res){
          $scope.inList = false;
          for(i in res.data){
            if(res.data[i] === by){
              $scope.inList = true;
            }
          }
        }).catch();
      } else {
        $scope.inList = false;
        for(i in $scope.friends_list){
          if($scope.friends_list[i] === by){
            $scope.inList = true;
          }
        }
      }

    }

    $scope.profile_edit_send = function(){
      $scope.profile_edit = false;
      $http({
        url: '/profile/' + $scope.profile + '/set_profile_text',
        method: 'POST',
        data: {
          profile_text: $('#profile_text_edit').val()
        }
      })
      .then(function(res){
        $scope.profile_text = res.data;
      })
      .catch(function(res){
        console.log('error getting profile_text');
        if(res) console.log(res);
      });
    }

    $scope.post_new_discussion = function(){
      var title = $('#new-discussion-name-field').val();
      var desc = $('#new-discussion-description-field').val();
      $('#new-discussion-name-field').val('');
      $('#new-discussion-description-field').val('');
      //$scope.codeMirror = undefined;
      $('#new_discussion_modal').foundation('reveal', 'close');
      data = {
        title: title,
        desc: desc,
        text: $scope.codeMirror.getValue(),
        group: $scope.$parent.selected_group,
        profile: $scope.profile
      }
      $('#discussion-post-field').empty();
      $scope.$parent.send_message('discussion:new', data);
    }

    $scope.new_discussion_modal_trigger = function(group){
      $('#new_discussion_modal').foundation('reveal', 'open');
      $('#discussion-post-field').empty();
      $scope.codeMirror = CodeMirror(
        $('#discussion-post-field')[0],
        {
          mode: 'twilight',
          lineNumbers: true,
          viewportMargin: Infinity
        }
      );
      $scope.codeMirror.setValue('\n\n\n\n\n\n\n\n\n');
      $scope.codeMirror.setCursor({line:0, ch:0});
      //$scope.codeMirror.setValue('');
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
      $scope.codeMirror.setValue('');
    }

    $scope.select_discussion = function(discussion){
      console.log(discussion);

      $('#discussion_' + discussion._id)
      .removeClass('cyan')
      .removeClass('accent-4');

      if(!$('.unselected_discussion').hasClass('cyan')){
        $('.group_border').css({
          'border-color': '#fff'
        });
      }
      if(typeof $scope.unseen_messages !== 'undefined'){
        for(m in $scope.unseen_messages){
          if($scope.unseen_messages[m].discussion == discussion._id){
            delete $scope.unseen_messages[m];
          }
        }
      }

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
        $('#discussion_back')
        .fadeIn()
        .css({
          top: $('#discussion_' + discussion._id).offset().top - 30,
          // left: $('.left-off-canvas-menu').width(),
          'border-radius': '5px',
          'height': $('.unselected_discussion').height() - 50,
          position:'absolute',
          opacity: 1
        },300);

      } else {
        $scope.page_scroll = $('body').scrollTop();
        $scope.discussion_wrapper_top = $('#discussion-wrapper').css('top');
        // $('#group-wrapper')
        // .animate({
        //   left:-1000
        // }, 400);
        $('#group-wrapper').css('opacity', '0');


        var discussionOffset = $('#discussion-wrapper').offset();
        $('#discussion-wrapper')
        .animate({
          left: -1*(discussionOffset.left - $('.left-off-canvas-menu').width() - 50),
          top: -5
        }, 400, function(){
          $('html, body')
            .animate({
              scrollTop: $('#discussion_' + discussion._id).offset().top - 50
          }, 500);

          $('#chat-wrapper')
          .fadeIn()
          .css({
            top:1000,
            position:'absolute'
          })
          .animate({
              top: $("#discussion_" + discussion._id).offset().top - 30,
              left: 0
            }, 300, function() {
              //callback
          });

          $('#discussion_back')
          .fadeIn()
          .css({
            top: $('#discussion_' + discussion._id).offset().top - 30,
            // left: $('.left-off-canvas-menu').width(),
            'border-radius': '5px',
            'height': $('.unselected_discussion').height() - 50,
            position:'absolute',
            opacity: 1
          },300);
        })
        .removeClass('custom-width-3')
        .addClass('custom-width-1')
        .css("height", "100%")
        .css("overflow-y", "hidden");

        $('#discussion_' + discussion._id)
        .addClass('indigo darken-2');

        $scope.codeMirror = CodeMirror(
          $('#chat-field')[0],
          {
            mode: 'twilight',
            lineNumbers: true,
            viewportMargin: Infinity
          }
        );
      }
      $scope.selected_discussion = discussion;
      $scope.$parent.send_message('discussion:get_messages', {
        discussion: discussion
      });
    }

    $scope.discussion_back = function(){

      $('#chat-field').empty();
      $scope.codeMirror = undefined;

      $('#discussion_back')
      .css({
        top: 1000,
        opacity: 0
      },300);

      $scope.selected_discussion = false;
      $('.indigo').removeClass('indigo');
      $('#group-wrapper').css('opacity', '1');
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

      $scope.$parent.send_message('discussion:clear', {});

    }

    //send the friend name to the server requesting
    //they are added as a friend
    $scope.add_friend = function(){
      console.log('Attempting to add' + $scope.selected_profile + ' to friends_list');
      $http({
        url:'/profile/' + $scope.profile + '/add_friend/' + $scope.selected_profile,
        method:'POST'
      })
      .then(function(req){
        console.log('Successfully added', $scope.selected_profile, 'as a friend to', $scope.profile);
        $scope.inList = true;
        if(typeof $scope.friends_list === "undefined"){
          $scope.friends_list = [];
        }
        $scope.friends_list.push($scope.selected_profile);
      })
      .catch(function(req){
        console.log('Error adding friend');
        if(req)console.log(req);
        $scope.inList = false;
      });
    }

    $scope.remove_friend = function(){
      $http({
        url: '/profile/' + $scope.profile + '/remove_friend/' + $scope.selected_profile,
        method: 'POST'
      }).then(function(res){
        $scope.inList = false;
        $scope.friends_list.splice($scope.friends_list.indexOf($scope.selected_profile), 1);
      }).catch(function(res){});
    }

    $scope.select_group = function(group){
      if(group._id == $scope.$parent.selected_group){
        return;
      }
      console.log(group);
      $('.discussion-wrapper').css('opacity', '1');
      $scope.$parent.selected_group = group._id;
      $scope.$parent.selected_group_obj = group;

      $('#discussion-wrapper')
      .mCustomScrollbar({
        theme: 'rounded-dots'
      });

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

      $('#add-group-card')
      .addClass('custom-offset-1')
      .removeClass('custom-offset-2');

      $http({
        url: '/group/' + group._id + '/get_discussion_list',
        method: 'GET'
      }).then(function(res){
        console.log(res);
        group.discussion_list = res.data;
        for(d in group.discussion_list){
          if(!group.discussion_list[d] || typeof group.discussion_list[d] === "undefined" || typeof group.discussion_list[d].posted === "undefined"){
            continue;
          }
          var d = new Date(group.discussion_list[d].posted);
          group.discussion_list[d].posted = d.toString();
        }
        group.discussion_list.sort(function(a, b){
          if(!a || !b || typeof a === "undefined" || typeof b === "undefined"){
            return 0;
          }
          return new Date(b.posted) - new Date(a.posted);
        });
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
            top:$("#group_" + group._id).offset().top - 50
          }, 800, function() {
            //callback
        });

      }).catch(function(res){
        console.log(res);
      });
    }

    $scope.group_compare = function(a,b) {
      if(!a || !b){
        return 0;
      }
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
        $scope.friends_list = res.data;
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
        $scope.$parent.selected_group = null;
        $('.group_card')
        .addClass('custom-offset-2')
        .removeClass('custom-offset-1');

        $('#add-group-card')
        .addClass('custom-offset-2')
        .removeClass('custom-offset-1');

        $('#group-wrapper')
        .mCustomScrollbar({
          theme: 'rounded-dots'
        });
      }).catch(function(res){
        console.log(res);
      });
    }

    $scope.select_config_click = function(){
      $scope.reset();
      $scope.selected_tab = "config"
    }
    $scope.select_home_click = function(){
      $scope.reset();
      $scope.selected_tab = "home";
    }
    $scope.select_group_click = function(){
      $scope.reset();
      $scope.selected_tab = "group";
      $scope.get_groups();
    }
    $scope.select_discussion_click = function(){
      $scope.selected_tab = "discussions"
    }

    $scope.reset = function(){
      $scope.init();
      $scope.$parent.selected_group = null;
      $scope.$parent.selected_discussion = null;
      $scope.discussion_back();
      $('.discussion-wrapper').css('opacity', '0');

      $('#add-group-card')
      .addClass('custom-offset-2')
      .removeClass('custom-offset-1');
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
