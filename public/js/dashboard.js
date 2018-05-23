var app = angular.module('app',[]);
app.controller('dashboard',['$scope','$http', function($scope,$http){
  $http.post('/dashboard').then(function(res){
    var out = res.data;
    $scope.items = out;
  },function(err){
    console.log(err);
  })
}])
