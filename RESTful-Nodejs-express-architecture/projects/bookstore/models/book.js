"use strict";
let mongoose = require('mongoose');

// Books Schema (Schema - is not required for db just for application)
let bookSchema = mongoose.Schema({

    author:{
        type:String,
        required:true,
        maxlength:200
    },
    buy_link: {
        type:String,
        required:false,
        maxlength:500
    },
    create_date: {
        type:Date,
        default:Date.now
    },
    description:{
        type:String,
        required:false,
        maxlength:2000
    },
    genre:{
        type:String,
        required:true,
        maxlength:50
    },
    image_url:{
        type:String,
        required:false,
        maxlength:500
    },
    pages:{
        type:Number,
        required:true,
        maxlength:5
    },
    publisher:{
        type:String,
        required:false,
        maxlength:200
    },
    title: {
        type:String,
        required:true,
        maxlength:200
    }
});


let Book = module.exports = mongoose.model( 'Book', bookSchema );

// Get Books
module.exports.getBooks = function ( callback, limit ) {
    //find():  returns all 
    //limit(): limits the number of results returned
    Book.find(callback).limit(limit);
}

// Get Book By ID
module.exports.getBookById = function ( id, callback ) {
    Book.findById( id, callback );
}

// Add Book
module.exports.addBook = function ( book, callback ) {
    Book.create( book, callback );
}

// Update Book
module.exports.updateBook = function ( id, book, options,callback ) {
    var query  = { _id : id };
    var update = {
        author      : book.author,
        buy_link    : book.buy_link,
        description : book.description,
        genre       : book.genre,
        image_url   : book.image_url,
        pages       : book.pages,
        publisher   : book.publisher,
        title       : book.title
    };

    Book.findOneAndUpdate(query, update, options, callback);
}

// Delete Book
module.exports.removeBook = function ( id , callback ) {
    var query = { _id : id };
    Book.remove( query, callback );
}