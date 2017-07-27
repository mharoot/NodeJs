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
        $http.post('/api/books/', $scope.book).then(addBookSuccessCallback, errorCallback);
    }

    $scope.updateBook  = function () {
        var id = $routeParams.id;
        $http.put('/api/books/'+id,  $scope.book).then(updateBookSuccessCallback, errorCallback);
    }

    $scope.removeBook  = function (id) {
        $http.delete('/api/books/'+id).then(removeBookSuccessCallback, errorCallback);
    }

    function addBookSuccessCallback() {
        window.location.href="#/books";
    }
    function getBookSuccessCallback(response){
        //success code
        if (response.data._id == '59711bf53bf39ddca19bf171') {
            //murder house
            response.data.image_url = 'https://images-na.ssl-images-amazon.com/images/I/51PLGSRsv4L._SX273_BO1,204,203,200_.jpg';
        } else {
            response.data.image_url = 'https://ewedit.files.wordpress.com/2016/09/hpsorcstone.jpg?w=405';
        }

        $scope.book = response.data;


        console.log("logging book now...");
        console.log($scope.book);
    }

    function getBooksSuccessCallback(response){
        //success code
        console.log("Response put in books!");
        response.data[0].image_url = 'https://images-na.ssl-images-amazon.com/images/I/51PLGSRsv4L._SX273_BO1,204,203,200_.jpg';
        response.data[1].image_url = 'https://ewedit.files.wordpress.com/2016/09/hpsorcstone.jpg?w=405';
        $scope.books = response;
        console.log($scope.books.data);
    }


    function removeBookSuccessCallback(response) {
        window.location.href="#/books";
    }

    function updateBookSuccessCallback(response) {
        window.location.href="#/books";
    }


    function errorCallback(error){
        console.log("ERROR!");
        //error code
        $scope.books = error;
    }

}]);
