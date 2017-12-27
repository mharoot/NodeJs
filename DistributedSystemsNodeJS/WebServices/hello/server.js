#!/usr/bin/node --harmony
'use strict';
/**
 * Express is like the request module we worked with in Databases directory.
 * The express module is itself a function.  When you call this function, Express creates an application context for you.  By convention, we name this variable app.
 */
const 
  express = require('express'), // brings in the express module
  morgan = require('morgan'),
  app = express();              // creates an app

/**
 * Express functionality is provided through something called middleware, which are asynchronous functions that manipulate the request and response objects.  To specify middleware for your app, you call app.use(), passing in the middleware you want, as done below.
 */
app.use(morgan('dev')); // In our case, we are using the morgan middleware set to dev mode, which will log to the console all requests coming in.

/**
 * Next we use app.get() to tell Express how we want to handle HTTP GET requests to the /api/:name path.  The :name chunk in the path is called a named route parameter.  When the API is hit, Express will grab that part of the URL and make it available in req.params.
 * In addition to get(), Express has put(), post(), and del() to register handlers for PUT, POST, and DELETE requests, respectively.  In our case, we tell the response object, res, to send back as JSON an object whose hello key is set to the name parameter.
 */
app.get('/api/:name', function(req, res) {
  //res.json(status, obj) deprecated use res.status(status).json(obj) instead
  //res.json(200, { "hello": req.params.name });
  res.status(200).json({ "hello": req.params.name });
});

/**
 * Finally, this program listens on TCP port 3000 for incoming HTTP requests, and logs a message to the console when it is ready to recieve connections.
 */
app.listen(3000, function() {
  console.log("ready captain.");
});