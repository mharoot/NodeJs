var myApp = angular.module('myApp');

myApp.controller('GenressController', ['$scope', '$http', '$location', '$routeParams', function ( $scope, $http, $location, $routeParams ) {
    console.log("GENRES CONTROLLER LOADED!");
    $scope.getGenres = function () {
        $http.get('/api/genres').then(successCallback, errorCallback);

        function successCallback($response){
            //success code
            $scope.genres = $response;
        }
        function errorCallback($error){
            //error code
            $scope.genres = $error;
        }
    }
}]);