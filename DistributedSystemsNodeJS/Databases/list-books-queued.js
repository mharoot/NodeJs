'use strict';
const 
  async = require('async'),
  file = require('file'),
  rdfParser = require('./lib/rdf-parser.js'),
  // we create a work object by passing async.queue() a worker function and a concurrency limit of 1,000.
  work = async.queue(function(path, done) {
    // path = path to an RDF file discovered by walking
    // done = callback that our worker function has to call to signal to the work queue that it is free to dequeue the next path.
    rdfParser(path, function(err, doc) {
      console.log(doc);
      done();
    });
  }, 1000);

console.log('beginning directory walk');
file.walk(__dirname + '/cache', function(err, dirPath, dirs, files) {
  files.forEach(function(path) {
    // the work object has a push() method that we use to add more paths for processing.
    work.push(path);
  });
});

/**
 * Convention:
 * Naming the variable done or next signals that this is a callback that takes no arguments and should be called exactly once when you are finished doing what it is that you are doing.
 * By contrast, callback functions named callback often take one or more arguments, starting with an err argument.
 */