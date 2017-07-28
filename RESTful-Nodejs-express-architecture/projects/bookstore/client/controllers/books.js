var myApp = angular.module('myApp');

myApp.controller('BooksController', ['$scope', '$http', '$location', '$routeParams', function ( $scope, $http, $location, $routeParams ) {
    console.log("BOOKS CONTROLLER LOADED!");

    $scope.getBooks = function () {

        // $http.get('/api/books').success( function ( response ) {
        //     $scope.books = response;
        // });
        
        $http.get('/api/books').then(getBooksSuccessCallback, errorCallback);
    }

    $scope.getBook = function () {
        var id = $routeParams.id;
        $http.get('/api/books/'+id).then(getBookSuccessCallback, errorCallback);
    }

    $scope.addBook = function () {
        $http.post('/api/books/', $scope.book).then(redirectBooksSuccessCallback, errorCallback);
    }

    $scope.updateBook  = function () {
        var id = $routeParams.id;
        $http.put('/api/books/'+id,  $scope.book).then(redirectBooksSuccessCallback, errorCallback);
    }

    $scope.removeBook  = function (id) {
        $http.delete('/api/books/'+id).then(redirectBooksSuccessCallback, errorCallback);
    }


    function getBookSuccessCallback(response){
        //success code
        $scope.book = response.data;
        console.log($scope.book);
    }


    function getBooksSuccessCallback(response){
        //success code
        $scope.books = response;
    }


    function redirectBooksSuccessCallback(response) {
        window.location.href="#/books";
    }

    function errorCallback(error){
        console.log("ERROR!");
        //error code
        $scope.books = error;
    }

}]);
