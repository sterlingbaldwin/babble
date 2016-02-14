babble = angular.module('babble', [])
.controller 'BabbleControl',['$scope','$http',($scope, $http) ->

  $scope.init = () ->
    return

  $scope.register_modal_trigger = () ->
    $('#register_modal').foundation 'reveal', 'open'
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
