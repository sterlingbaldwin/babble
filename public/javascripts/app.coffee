babble = angular.module('babble', [])
.controller 'BabbleControl',['$scope','$http',($scope, $http) ->

  $scope.init = () ->
    return

  $scope.register_modal_trigger = () ->
    $('#register_modal').foundation 'reveal', 'open'
    return

  $scope.register = () ->
    data = {
      username: $('#reg-username-field').text()
      password: $('reg-password-field').text()
      email: $('reg-email-field').text()
    }
    $http({
      url: '/user/register'
      method: 'POST'
      data: data
      }).success(()->
        $('#register_modal').foundation 'reveal', 'open'
        return
      ).error(()->
        console.log 'Error registering user'
        return
      )
    return

]
