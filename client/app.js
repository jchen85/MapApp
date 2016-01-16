var app = angular.module('app', ['signup', 'renderMap', 'renderMapRelational', 'renderMapAnimated', 'ngAnimate', 'ngRoute'])
  .controller('mapsPageController', ['$scope', '$http', function ($scope, $http){
}])

  .config(function ($routeProvider, $httpProvider){
  $routeProvider
  .when('/liveTweets', {
    templateUrl: 'client/views/liveTweets.html',
    controller:'mapsPageController'
  })
  .when('/relational', {
    templateUrl: 'client/views/relational.html',
  })
  .when('/animated', {
    templateUrl: 'client/views/animated.html',
  })



});

