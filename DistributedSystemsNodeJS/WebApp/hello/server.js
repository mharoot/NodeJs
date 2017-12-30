#!/usr/bin/node --harmony
'use strict';
const
  express = require('express'),
  session = require('express-session'),
  // START:require-redis
  cookieParser = require('cookie-parser'),
  redisClient = require('redis').createClient(),
  RedisStore = require('connect-redis')(session),
  // END:require-redis
  app = express();

//app.use(express.logger('dev'));
// START:use-session
app.use(cookieParser());
app.use(session({
  secret: 'unguessable',
  store: new RedisStore({
    client: redisClient
  }),
  resave: false,
  saveUninitialized:true
}));
// START:use-session

app.get('/api/:name', function(req, res) {
  res.status(200).json({ "hello": req.params.name });
});

app.listen(3000, function(){
  console.log("ready captain.");
});
