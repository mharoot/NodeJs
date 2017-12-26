'use strict';

const 
  async = require('async'),
  dbAdmin = 'root:password@',
  file = require('file'),
  request = require('request'),
  rdfParser = require('./lib/rdf-parser.js'),

  work = async.queue(function(path, done) {
    rdfParser(path, function(err, doc) {
      console.log(doc);
      request({
          method: 'PUT',
          url: 'http://' + dbAdmin + 'localhost:5984/books/' + doc._id,
          json: doc
      }, function(err, res, body) {
        if (err) {
          throw Error(err);
        }
        console.log(res.statusCode, body);
        done();
      });
    });

  }, 1000);

console.log('beginning directory walk, importing data to database books');
file.walk(__dirname + '/cache', function(err, dirPath, dirs, files) {
  files.forEach(function(path) {
    work.push(path);
  });
});
