#!/usr/bin/node --harmony
'user strict';
const 
  async = require('async'),
  dbAdmin = 'root:password@',
  request = require('request'),
  views = require('./lib/views.js');

  async.waterfall([
    // get the existing design doc (if present)
    function(next) {
      request.get('http://' + dbAdmin + 'localhost:5984/books/_design/books', next);
    },

    // create a new design doc or use existing
    function(res, body, next) {
      if (res.statusCode === 200) {
        next(null, JSON.parse(body));
      } else if (res.statusCode === 404) {
        next(null, { views: {} });
      }
    },

    // add views to document and submit
    function(doc, next) {
      Object.keys(views).forEach(function(name) {
        doc.views[name] = views[name];
      });
      request({
        method:'PUT',
        url:'http://' + dbAdmin + 'localhost:5984/books/_design/books',
        json: doc
      }, next);
    }
  ], function(err, res, body) {
    if (err) { throw err; }
    console.log(res.statusCode, body);
  });