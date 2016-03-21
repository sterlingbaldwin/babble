babble = angular.module('babble',[
  'babble.profile',
  'babble.profile_view',
  'babble.group_view',
  'ngSanitize'
  ])
.factory('socket', ($rootScope) ->
  socket = io.connect()
  return {
    on: (eventName, callback) ->
      socket.on(eventName, () ->
        args = arguments
        $rootScope.$apply( () ->
          callback.apply(socket, args)
        )
      )
    emit: (eventName, data, callback) ->
      socket.emit(eventName, data, () ->
        args = arguments
        $rootScope.$apply( () ->
          callback.apply(socket, args)
        )
      )
    }
  )
.controller 'BabbleControl',['$scope', '$http', 'socket', ($scope, $http, socket) ->

  socket.on('init', (data) ->
    console.log data
  )

  $scope.data = {
    'status': 'loggedout'
  }

  $scope.init = () ->
    $http({
      url: '/status',
      method: 'GET'
      }).then((res) ->
        console.log 'got status'
        console.log res
        $scope.data.status = res.data.status
        return
      ).catch((res) ->
        console.log 'some issue'
        return
      )
    return

  $scope.logout = () ->
    $http({
      url: '/user/logout',
      method: 'GET'
    }).then((res) ->
      $scope.data.status = 'loggedout'
      window.location.href = '/'
    ).catch((res) ->
      console.log 'error logging out'
      console.log res
    )
    return

  $scope.register_modal_trigger = () ->
    $('#register_modal').foundation 'reveal', 'open'
    return

  $scope.login_modal_trigger = () ->
    $('#register_modal').foundation 'reveal', 'close'
    $('#login_modal').foundation 'reveal', 'open'
    return

  $scope.login = () ->
    data = {
      email: $('#login-username-field').val()
      password: $('#login-password-field').val()
    }
    $http({
      data: data
      url: '/user/login'
      headers: {"Content-Type": "application/json"}
      method: 'POST'
      }).then((res) ->
        console.log 'logged in!'
        console.log res
        window.location.href = '/profile'
      ).catch((res) ->
        console.log 'error logging in'
        console.log res
      )
    return

  $scope.register = () ->
    data = {
      username: $('#reg-username-field').val()
      password: $('#reg-password-field').val()
      email: $('#reg-email-field').val()
    }
    $http({
      url: '/user/register'
      method: 'POST'
      data: data
      headers: {"Content-Type": "application/json"}
      }).then((response)->
        $('#register_modal').foundation 'reveal', 'close'
        return
      ).catch((response)->
        console.log 'Error registering user'
        return
      )
    return

]

babble.config(($interpolateProvider) ->
  $interpolateProvider.startSymbol('{[{')
  $interpolateProvider.endSymbol('}]}')
)
