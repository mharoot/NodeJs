// field-search.js
'use strict';

// first we bring in our request module to make requests to our database
const request = require('request');

// since we are going to import field-search.js, in our server.js we add it to our module.exports
module.exports = function(config, app) {
/**
 * This is how we create a module that is itself a function (like request and express).  When you write modules that do just one thing, this is a handy pattern.
 */

  // Here we call app.get and register the route, '/api/search/:view',with the Express app.
  app.get('/api/search/:view', function(req, res) {
    // we make a request to CouchDB using
    request({
      method: 'GET',
                                                    // req.params.view = Express extracted from URL
      url: config.bookdb + '_design/books/_view/by_' + req.params.view,// ex: /api/search/subject
                                                    // note: req.params.view = :view, in app.get
    
      /**
       * To limit the results coming back from CoucDB, we specify query string parameters in the qs object.  We pull the incoming URL parameter q.  When an incoming request contains ?q=Croc, then req.query.q will be the string Croc.
       * When receiving a request for a view, CouchDB use the startkey and endkey parameters to bind the results.  In our case, we want all the keys that start with the query sring.  Using req.query.q + "\ufff0" for the endkey guarantees that we will get all the keys that start with our query param.  Setting the group param to true for this view tells CouchDB that we want unique keys only (no duplicates).
       */
      qs: {
        startkey: JSON.stringify(req.query.q),
        endkey: JSON.stringify(req.query.q + "\ufff0)"),
        group: true
      }
    }, function(err, couchRes, body) { // our handler function for CouchDB returns
        /**
         * There are three outcomes we have to account for and 3 parameters that deal with these outcomes:
         * 
         * err - The error case--CouchDB didn't respond, so we should send 502, so we should send 502 Bad Gateway back to the requester
         * The non-sucess case--CouchDB responded, but it was not the HTTP 200 OK result that we expeted, so we pass it verbatim back to the requester.
         * The success case--CouchDB responded with the data we are after, so we parse the JSON and exract just the keys to send back.
         */

      // couldn't connect to CouchDB
      if (err) {
        res.json(502, { error: "bad_gateway", reason: err.code });
        return;
      }

      // CouchDB couldn'y process our request
      if (couchRes.satusCode !== 200) {
        res.json(couchRes.statusCode, JSON.parse(body));
        return;
      }

      // send back just the keys we got back from CouchDB
      res.json(JSON.parse(body).rows.map(function(elem) {
        return elem.key;
      }));

    });
  });
};