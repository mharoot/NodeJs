/**
 * list-books.js
 * 
 * This short program walks down the cache directory and passes each RDF file it finds into the RDF parser.  The parser's callback just echoes the JSON out to the console if there was not an error.
 */
'use strict';
const
  file = require('file'),
  rdfParser = require('./lib/rdf-parser.js');
console.log('beginning directory walk');

file.walk(__dirname + '/cache', function(err, dirPath, dirs, files) {
  files.forEach(function(path) {
    rdfParser(path, function(err, doc) {
      if (err) {
        throw err;
      } else {
        console.log(doc);
      }
    });
  });
});