babble = angular.module('babble', [])
.controller 'BabbleControl',['$scope','$http',($scope, $http) ->

  $scope.init = () ->
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
      username: $('#login-username-field').val()
      password: $('#login-password-field').val
    }
    $http({
      data: data
      url: 'user/login'
      headers: {"Content-Type": "application/json"}
      method: 'POST'
      }).then((res) ->
        console.log 'logged in!'
        console.log res
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
        $('#register_modal').foundation 'reveal', 'open'
        return
      ).catch((response)->
        console.log 'Error registering user'
        return
      )
    return

]