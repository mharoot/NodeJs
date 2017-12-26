#!/usr/bin/node --harmony
const 
  dbAdmin = 'root:password@';
  request = require('request'),
  options = {
    method: process.argv[2] || 'GET',
    url: 'http://' + dbAdmin + 'localhost:5984/' + (process.argv[3] || '')
  };
request(options, function(err, res, body) {
  if (err) {
      throw Error(err);
  } else {
      console.log(res.statusCode, JSON.parse(body));
  }
});