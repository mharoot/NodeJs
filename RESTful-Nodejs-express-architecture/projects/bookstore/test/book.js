"use strict";

//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
/*
Mongoose: mpromise (mongoose's default promise library) is deprecated, plug in 
your own promise library instead: http://mongoosejs.com/docs/promises.html
*/
mongoose.Promise = global.Promise;


let Book = require('../models/book');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../app');
let should = chai.should();
// let expect = chai.expect(); not working for some reason.. need to use chai.expect(object) everytime.

var err = new ReferenceError('This is a bad function.'); 
var fn = function () { throw err; } 
// expect(fn).to.throw(ReferenceError);
// expect(fn).to.throw(Error);
chai.expect(fn).to.throw(ReferenceError);
// expect(fn).to.throw(err);

chai.use(chaiHttp);
//Our parent block
describe('Books', () => {

    /*
     * Before each test we empty the database.
     */
    beforeEach((done) => { 
        Book.remove({}, (err) => { 
           done();         
        });     
    });



    /*
     * Test the /GET route
     */
    describe('/GET /api/books', () => {
        it('it should GET all the books', (done) => {
            chai.request(app)
                .get('/api/books')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(0);
                done();
                });
        });
    });



    /*
     * Test the /GET/:id book route
     */
    describe('/GET /api/books/:id', () => {
        it('it should GET a book by the given id', (done) => {
            let book = new Book({
                title: "The Lord of the Rings",
                author: "J.R.R. Tolkien",
                genre:  "Adventure",
                description: "Adventure through lord of the rings."
            });

            book.save((err, book) => {
                chai.request(app)
                    .get('/api/books/' + book.id)
                    .send(book)
                    .end((err, res) => {
                        res.should.have.status(200);

                        //properties, types, and requirements
                        res.body.should.have.property('_id');
                        res.body._id.should.be.a('string');

                        res.body.should.have.property('author');
                        res.body.author.should.be.a('string');

                        res.body.should.have.property('title');
                        res.body.title.should.be.a('string');


                        res.body.should.have.property('genre');
                        res.body.genre.should.be.a('string');
                        //res.body.genre.should.not.be.selected; // doesn't do anything
                        //res.body.genre.should.be.selected; // doesn't do anything

                        res.body.should.have.property('description');
                        res.body.description.should.be.a('string');
                        done();
                    });
            });
        });

    });



    /*
     *  Test the /Post route
     */
    describe('/POST /api/books', () => {
        it('it should POST a book', (done) => {
            let book = {
                title: "The Lord of the Rings",
                author: "J.R.R. Tolkien",
                genre:  "Adventure",
                description: "Adventure through lord of the rings."
            }
            chai.request(app)
                .post('/api/books')
                .send(book)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });

        it('it should not POST a book without the author field', () => {
            let book = {
                title: "The Lord of the Rings",
                //author: "J.R.R. Tolkien",
                genre:  "Adventure",
                description: "Adventure through lord of the rings."
            }

            const postBook = post => new Promise( (resolve, reject) => {
                chai.request(app)
                    .post('/api/books')
                    .send(book)
                    .end((err, res) => {
                        if (err) { reject(err); }
                        res.should.have.status(200);
                        resolve(res);
                    });
            });
        });
        it('it should POST a book without the description field', (done) => {
            let book = {
                title: "The Lord of the Rings",
                author: "J.R.R. Tolkien",
                genre:  "Adventure"//,
                //description: "Adventure through lord of the rings."
            }
            chai.request(app)
                .post('/api/books')
                .send(book)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
    });

    /*
     *  Test the /Put route
     */
    describe('/PUT /api/books', () => {
        it('it should UPDATE a book by the given id', (done) => {
            let book = new Book({
                title: "The Lord of the Rings",
                author: "J.R.R. Tolkien",
                genre:  "Adventure",
                description: "Adventure through lord of the rings."
            })
            book.save( (err, book) => {
                let updatedBook = {
                title: "The Lord of the Rings",
                author: "J.R.R. Tolkien",
                genre:  "Action",
                description: "Lord of the rings is the best book ever!"
            };
                chai.request(app)
                    .put('/api/books/' + book.id)
                    .send(updatedBook)
                    .end( (err, res) => {
                        res.should.have.status(200);
                        // res.body.should.have.property('genre');
                        // res.body.genre.should.be.a('string');
                        // //res.body.genre.should.not.be.selected;
                        // res.body.genre.should.be.selected;
                        done();
                    });
            });
        });
    });



    /*
     * Test the /DELETE/:id route
     */
    describe('/DELETE/:id book', () => {
        it('it should DELETE a book by the given id', (done) => {
            let book = new Book({
                title: "The Lord of the Rings",
                author: "J.R.R. Tolkien",
                genre:  "Adventure",
                description: "Adventure through lord of the rings."
            });
            book.save( (err, book) => {
                chai.request(app)
                    .delete('/api/books/' + book.id)
                    .end( (err, res) => {

                        // there should be nothing wrong with the url we went to
                        res.should.have.status(200);

                        // since we have an html page, the resulting body should be a object
                        res.body.should.be.a('object');

                        // the length of the body of the html page should not equal 0
                        chai.expect(res.body.length).not.equal(0);

                        done();
                    })
            });
        });
    });

});