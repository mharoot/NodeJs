/**
 * This test module exposes one method called testRDFParser(), which uses the rdf-parser module to read and parse pg132.rdf.  It then performs a deep equality check between the recieved object and the expected output as defined in pg132.json.
 */
'use strict';
const 
  rdfParser = require('../lib/rdf-parser.js'),
  expectedValue = require('./pg132.json'); // using require to read contents of a JSON file, Node js does this for your convenience.
exports.testRDFParser = function(test) {
  rdfParser(__dirname + '/pg132.rdf', function(err, book) {
      test.expect(2);
      test.ifError(err);
      test.deepEqual(book.title, expectedValue.title, "book should match expected");
      test.done();
  });
};