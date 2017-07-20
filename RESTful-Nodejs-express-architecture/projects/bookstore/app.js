const express    = require('express');
const app        = express();
const bodyParser = require('body-parser');
const mongoose   = require('mongoose');
app.use(bodyParser.json());

Genre            = require('./models/genre');
Book             = require('./models/book');
// Connect to Mongoose
mongoose.connect('mongodb://localhost/bookstore', {
    useMongoClient: true,
});
const database   = mongoose.connection;


// GETS

app.get('/', function (req, res) {
    res.send('Please use /api/books or /api/genres updated using nodemon app so we can save and not have to cancel on command line and rerun using node');
});

app.get('/api/genres', function (req, res) {
    Genre.getGenres( function(err, genres) {
        if (err) throw err;
        res.json(genres);
    });
});

app.get('/api/books', function (req, res) {
    Book.getBooks( function(err, books) {
        if (err) throw err;
        res.json(books);
    });
});

app.get('/api/books/:_id', function (req, res) {
    Book.getBookById( req.params._id, function(err, book) {
        if (err) throw err;
        res.json(book);
    });
});





// POSTS

app.post('/api/genres', function (req, res) {
    var genre = req.body; //thanks to body-parser everything in a form comes through here.
    Genre.addGenre( genre, function ( err, genre ) {
        if (err) throw err;
        res.json(genre);
    });
});

app.post('/api/books', function (req, res) {
    var book = req.body;
    Book.addBook( book, function ( err, book ) {
        if (err) throw err;
        res.json(book);
    });
});





// PUTS

app.put('/api/genres/:_id', function (req, res) {
    var id = req.params._id;
    var genre = req.body;
    // {} options are left blank we still need it though
    Genre.updateGenre( id, genre, {}, function ( err, genre ) {
        if (err) throw err;
        res.json(genre);
    });
});

app.put('/api/books/:_id', function (req, res) {
    var id = req.params._id;
    var book = req.body;
    // {} options are left blank we still need it though
    Book.updateBook( id, book, {}, function ( err, book ) {
        if (err) throw err;
        res.json(book);
    });
});





// DELETE

app.delete('/api/genres/:_id', function (req, res) {
    var id = req.params._id;
    var genre = req.body;
    // {} options are left blank we still need it though
    Genre.removeGenre( id, function ( err, genre ) {
        if (err) throw err;
        res.json(genre);
    });
});

app.delete('/api/books/:_id', function (req, res) {
    var id = req.params._id;
    var book = req.body;
    // {} options are left blank we still need it though
    Book.removeBook( id, function ( err, book ) {
        if (err) throw err;
        res.json(book);
    });
});


app.listen(3000);
console.log('Running on port 3000');