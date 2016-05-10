(function() {
  var babble;

  babble = angular.module('babble', ['babble.profile', 'babble.profile_view', 'babble.group_view', 'ngSanitize', 'ngAnimate']).factory('socket', function($rootScope) {
    var socket;
    socket = io.connect("http://localhost:8080");
    return {
      on: function(eventName, callback) {
        return socket.on(eventName, function() {
          var args;
          args = arguments;
          return $rootScope.$apply(function() {
            return callback.apply(socket, args);
          });
        });
      },
      emit: function(eventName, data, callback) {
        return socket.emit(eventName, data, function() {
          var args;
          args = arguments;
          return $rootScope.$apply(function() {
            return callback.apply(socket, args);
          });
        });
      }
    };
  })
  .filter('reverse', function() {
    return function(items) {
      return items.slice().reverse();
    };
  })
  .controller('BabbleControl', [
    '$scope', '$http', 'socket', '$sce', function($scope, $http, socket, $sce) {
      $scope.profile = {};
      $scope.socket = socket;
      $scope.group_list = [];
      $scope.selected_group = null;
      $scope.selected_discussion = null;
      $scope.message_list = [];
      $scope.unseen_messages = [];
      socket.on('connect', function(args) {
        console.log('Socket connected');
      });
      socket.on('user_connected', function(args) {
        console.log("user connected");
        console.log(args);
      });
      socket.on('group:new_message', function(data){
        $scope.unseen_messages.push(data);
        console.log('group:new_message');
        console.log(data);
        console.log($scope.group_list);
        $('#group_' + data.group + "_border")
        .css({
          'border-color': '#00e5ff'
        });

        $('#discussion_' + data.discussion)
        .addClass('cyan accent-4');
      })
      socket.on('userID', function(args) {
        console.log("got a userId");
        console.log(args);
        return $scope.userID = args;
      });
      socket.on('message:new', function(data){
        data.by = data.parent_profile;
        console.log('message:new');
        var d = new Date(data.posted);
        data.posted = d.toString();
        $scope.message_list.push(data);
      })
      socket.on('message:list', function(data){
        console.log('message:list');
        $scope.message_list = data.message_list.sort(function(a,b){
          // Turn your strings into dates, and then subtract them
          // to get a value that is either negative, positive, or zero.
          return new Date(a.posted) - new Date(b.posted);
        });
        for(m in $scope.message_list){
          var d = new Date($scope.message_list[m].posted);
          $scope.message_list[m].posted = d.toString();
        }
      })
      $scope.send_message = function(destination, message) {
        message.userID = $scope.userID;
        console.log('sending');
        console.log(message);
        console.log('to ', destination);
        return socket.emit(destination, message);
      };
      $scope.send_profile = function(profile) {
        return socket.emit('init', {
          profile: profile,
          status: $scope.data.status
        });
      };
      socket.on('discussion:new', function(data) {
        console.log('Got a new discussion!');
        console.log(data);
        var d = new Date(data.posted);
        data.posted = d.toString();
        for(d in $scope.selected_group_obj.discussion_list){
          if($scope.selected_group_obj.discussion_list[d]._id == data._id){
            console.log('this is a duplicate');
            return;
          }
        }
        $scope.selected_group_obj.discussion_list = [data].concat($scope.selected_group_obj.discussion_list);

        setTimeout(function(){
          $('#discussion_' + data._id)
          .addClass('cyan')
          .addClass('accent-4');
        }, 200);

        //back button
        //and chat window
        //and scroll
        //all need to move down to match the new values of the selected discussion
      });

      socket.on('message', function(data) {
        return console.log(data);
      });

      $scope.data = {
        'status': 'loggedout'
      };
      $scope.init = function() {
        $http({
          url: '/status',
          method: 'GET'
        }).then(function(res) {
          console.log('got status');
          console.log(res);
          $scope.data.status = res.data.status;
        })["catch"](function(res) {
          console.log('some issue');
        });
      };
      $scope.logout = function() {
        $http({
          url: '/user/logout',
          method: 'GET'
        }).then(function(res) {
          $scope.data.status = 'loggedout';
          return window.location.href = '/';
        })["catch"](function(res) {
          console.log('error logging out');
          return console.log(res);
        });
      };
      $scope.register_modal_trigger = function() {
        $('#register_modal').foundation('reveal', 'open');
        var go = document.getElementById("register-button");
        var txt = document.getElementById("reg-password-field");

        txt.addEventListener("keypress", function(event) {
            if (event.keyCode == 13){
              event.preventDefault();
              go.click();
            }
        });
      };
      $scope.login_modal_trigger = function() {
        $('#register_modal').foundation('reveal', 'close');
        $('#login_modal').foundation('reveal', 'open');
        var go = document.getElementById("login-button");
        var txt = document.getElementById("login-password-field");

        txt.addEventListener("keypress", function(event) {
            if (event.keyCode == 13){
              event.preventDefault();
              go.click();
            }
        });
      };
      $scope.login = function() {
        var data;
        data = {
          email: $('#login-username-field').val(),
          password: $('#login-password-field').val()
        };
        $http({
          data: data,
          url: '/user/login',
          headers: {
            "Content-Type": "application/json"
          },
          method: 'POST'
        }).then(function(res) {
          console.log('logged in!');
          console.log(res);
          return window.location.href = '/profile';
        })["catch"](function(res) {
          console.log('error logging in');
          $('#login-username-label')
          .text("Invalid username or login")
          .addClass("red")
          .css({
            color: 'black'
          });

          return console.log(res);
        });
      };
      return $scope.register = function() {
        var data;
        data = {
          username: $('#reg-username-field').val(),
          password: $('#reg-password-field').val(),
          email: $('#reg-email-field').val()
        };
        $http({
          url: '/user/register',
          method: 'POST',
          data: data,
          headers: {
            "Content-Type": "application/json"
          }
        }).then(function(response) {
          $('#register_modal').foundation('reveal', 'close');
        })["catch"](function(response) {
          $('#register-username-label')
          .text("Username already taken")
          .addClass("red")
          .css({
            color: 'black'
          });
          console.log('Error registering user');
        });
      };
    }
  ]);

  babble.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('{[{');
    return $interpolateProvider.endSymbol('}]}');
  });

  babble.config(['$compileProvider', function ($compileProvider) {
    $compileProvider.debugInfoEnabled(false);
  }]);

}).call(this);
