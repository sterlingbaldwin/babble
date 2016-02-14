babble = angular.module('babble', [])
.controller 'BabbleControl',['$scope','$http',($scope, $http) ->

  $scope.init = () ->
    console.log('working!')
    return

  $scope.register_modal = () ->
    $('#register_modal').foundation 'reveal', 'open'

]
