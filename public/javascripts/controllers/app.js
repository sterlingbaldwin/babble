// Generated by CoffeeScript 1.3.3
(function() {
  var babble;

  babble = angular.module('babble', ['babble.profile', 'babble.profile_view', 'babble.group_view', 'ngSanitize']).factory('socket', function($rootScope) {
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
    '$scope', '$http', 'socket', function($scope, $http, socket) {
      $scope.profile = {};
      $scope.socket = socket;
      $scope.group_list = [];
      $scope.selected_group = null;
      $scope.selected_discussion = null;
      $scope.message_list = [];
      socket.on('connect', function(args) {
        console.log('Socket connected');
      });
      socket.on('user_connected', function(args) {
        console.log("user connected");
        console.log(args);
      });
      socket.on('userID', function(args) {
        console.log("got a userId");
        console.log(args);
        return $scope.userID = args;
      });
      socket.on('message:new', function(data){
        $scope.message_list.push(data);
      })
      socket.on('message:list', function(data){
        $scope.message_list = data.message_list;
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
        return console.log(data);
        for(i in $scope.group_list){
          if($scope.group_list[i].id == data.group){

          }
        }
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
      };
      $scope.login_modal_trigger = function() {
        $('#register_modal').foundation('reveal', 'close');
        $('#login_modal').foundation('reveal', 'open');
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
          console.log('Error registering user');
        });
      };
    }
  ]);

  babble.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('{[{');
    return $interpolateProvider.endSymbol('}]}');
  });

}).call(this);
