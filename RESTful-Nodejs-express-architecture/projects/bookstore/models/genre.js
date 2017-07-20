var mongoose = require('mongoose');

// Genre Schema (Schema - is not required for db just for application)
var genreSchema = mongoose.Schema({
    name: {
        type:String,
        required:true,

    },
    create_date: {
        type:Date,
        default:Date.now
    }
});


var Genre = module.exports = mongoose.model( 'Genre', genreSchema );

// Get Genres
module.exports.getGenres = function ( callback, limit ) {
    //find returns all limit limts the number of results returned
    Genre.find( callback ).limit( limit );
}

// Add Genre
module.exports.addGenre = function ( genre, callback ) {
    Genre.create( genre, callback );
}

// Update Genre
module.exports.updateGenre = function ( id, genre, options,callback ) {
    var query  = { _id : id };
    var update = {
        name : genre.name
    };

    Genre.findOneAndUpdate(query, update, options, callback);
}

// Delete Genre
module.exports.removeGenre = function ( id , callback ) {
    var query = { _id : id };
    Genre.remove( query, callback );
}