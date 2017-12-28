#!/usr/bin/node --harmony
'use strict';
const
  express = require('express'),
  morgan = require('morgan'),
  app = express();

app.use(morgan('dev'));

// START:modular
const config = {
  bookdb: 'http://root:password@localhost:5984/books/',
  b4db: 'http://root:password@localhost:5984/b4/'
};

require('./lib/book-search.js')(config, app);
require('./lib/field-search.js')(config, app);
require('./lib/bundle.js')(config, app);
// END:modular

app.listen(3000, function(){
  console.log("ready captain.");
});