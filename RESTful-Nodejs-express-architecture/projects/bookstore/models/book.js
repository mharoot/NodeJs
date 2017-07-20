var mongoose = require('mongoose');

// Books Schema (Schema - is not required for db just for application)
var genreSchema = mongoose.Schema({
    title: {
        type:String,
        required:true,
    },
    genre:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:false,
    },
    author: {
        type:String,
        required:true,
    },
    create_date: {
        type:Date,
        default:Date.now
    }
});


var Book = module.exports = mongoose.model( 'Book', genreSchema );

// Get Books
module.exports.getBooks = function ( callback, limit ) {
    //find returns all limit limts the number of results returned
    Book.find(callback).limit(limit);
}

// Get Book By ID
module.exports.getBookById = function ( id, callback ) {
    //find returns all limit limts the number of results returned
    Book.findById( id, callback );
}

// Add Book
module.exports.addBook = function ( book, callback ) {
    //find returns all limit limts the number of results returned
    Book.create( book, callback );
}

// Update Book
module.exports.updateBook = function ( id, book, options,callback ) {
    var query  = { _id : id };
    var update = {
        title : book.title,
        description : book.description,
        author : book.author,
        genre : book.genre
    };

    Book.findOneAndUpdate(query, update, options, callback);
}

// Delete Book
module.exports.removeBook = function ( id , callback ) {
    var query = { _id : id };
    Book.remove( query, callback );
}