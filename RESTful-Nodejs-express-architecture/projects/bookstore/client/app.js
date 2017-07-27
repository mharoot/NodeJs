var myApp = angular.module('myApp', ['ngRoute']); // param 1: apps name, param2: dependencies put [] if none

myApp.config( function ($routeProvider, $locationProvider) {
    $locationProvider.hashPrefix(''); // prevents a front slash from changing into %2F

    $routeProvider.when('/', {
        controller:'BooksController',
        templateUrl: 'views/books.html'
    })
    .when('/books', {
        controller:'BooksController',
        templateUrl: 'views/books.html'
    })
    .when('/books/details/:id', {
        controller:'BooksController',
        templateUrl: 'views/book_details.html'
    })
    .when('/books/add', {
        controller:'BooksController',
        templateUrl: 'views/add_book.html'
    })
    .when('/books/edit/:id', {
        controller:'BooksController',
        templateUrl: 'views/edit_book.html'
    })
    .otherwise({ // if not any of the above urls, redirect to homepage
        redirectTo: '/'
    })

});