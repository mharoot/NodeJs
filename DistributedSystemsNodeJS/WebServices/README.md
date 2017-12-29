# Scalable Web Services
- Node.js comes with support for low-overhead HTTP servers out of the box using the *http* module.  Bu writing services against the low-evel *http* module directly can be a lot of work.  So we will use Express for developing our web services.

## Advantages of Express
- Express is a web application framework for Node modeled after the Ruby project Sinatra.  Express provides a lot of plumbing code that you would otherwise end up writing yourself.  To see why, let us take a look at a basic Node.js server using only the *http* module.
```javascript
// server.js
const 
  http = require('http'),
  server = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World\n');
  });
server.listen(3000, function() {
  console.log('ready captain!');
});
```
- This is quite similar to creating a basic TCP server using the *net* module.  First we bring in the *http* module, call its createServer() method with a callback, and finally use server.listen() to bind a TCP socket for listening.  The callback function uses information from the incoming HTTP request (req) to send an appropriate response (res).
- What is remarkable about this example is not what it does, but rather what it does not do.  There are lots of little jobs a typical web server would take of that this code does not touch.  Here are some examples:
  - Routing based on URL paths
  - Managing sessions via cookies
  - Parsing incoming requests (like form data or JSON)
  - Rejection malformed requests
- The Express framework helps with these and myriad other tasks.

### Serving APIs with Express
- To get started with using Express run:
  - npm install --save express
  - npm install --save morgan
- Hello World Express
  - hello/server.js
- with your package.json including a scripts object with the property named start:
```json
{
  "scripts": {
    "start": "./server.js"
  }
}
```
- You can run *hello/server.js* running the the command line:
  - npm start
- Test REST Endpoint with curl
  - curl -i http://localhost:3000/api/michael
- or navigate to it in your browsers ( port 3000 must be opened if it does not work)
  - http://localhost:3000/api/michael

-------------------------------------------------------------------------------

### Writing Modular Express Services
- RESTful web service with Express for creating and managing book bundles.  These are basically named reading lists.  Our app will be called Better Book Bundle Builder (or b4 for short).
- It will communicate with two databases: the *books* database and the *b4* database.
- To the *b4* application, the *books* database is read-only (we will not add, delete, or overwrite any documents in it).
- The *b4* database will store user data, including the book bundles that users make.

#### Creating the *b4* database
1. Make sure couchdb is running:
  - start couchdb
2. Then use:
  - curl -X PUT http://root:password@localhost:5984/b4
  - {"ok":true} 

-------------------------------------------------------------------------------

# Separating Server Code into Modules
- Just like our Hello World example, the main entry point for the b4 service is the server.js file.  But instead of assigning a handler with app.get() directly, now we specify some configuartion parameters and pull in the API modules.

- Here is the part of *b4/server.js* that differs from the Hello World version:
```javascript
const config = {
  bookdb: 'http://root:password@localhost:5984/books/',
  b4dv: 'http://root:password@localhost:5984/b4/'
};
/*
Each of the three API modules is a function that takes two arguments: our config hash and the Express *app* to add routes to.
*/
require('./lib/book-search.js')(config, app);
require('./lib/field-search.js')(config, app);
require('./lib/bundle.js')(config, app);
```

- Let us run the server and then we will dig into the API modules.  This time, instead of using *npm start*, we will use *nodemon*.  Short for "Node Monitor", *nodemon* runs a Node.js program and then automatically restarts it whenever the source code changes.
- To get *nodemon*, install it globally through npm:
  - sudo npm install -g nodemon
- Run it:
  - nodemon --harmony server.js

### Implementing Search APIs
- To build a book bundle, a user has to be able to discover books to add to it.  So our modular web service will have two search APIs: 
  - field search (for discovering authors and subjects) 
  - book search (for finding books by a given author or subject)
- The field search API helps users to find authors or subjecs based on a starting string. For example, to get a list of subjects that start with *'Croc'*, you would make a request on the command line like this:
  - curl http://localhost:3000/api/search/subject?q=Croc
  - curl http://localhost:3000/api/search/book/by_author?q=Giles,%20Lionel
  - curl http://localhost:3000/api/search/book/by_subject?q=War
  - This API could be employed, for instance, in a user interface so that when a user starts typing a subject, suggestions automatically pop up.
- *b4/lib/field-search.js*

-------------------------------------------------------------------------------

# Restful APIs with Promises
- Promises are another approach to managing asynchronous code beside callbacks and EventEmitters.

### Creating a Resource through POST with a Promise
- The first thing we will need for our bundle API is a way to create them.  For that, we will create an Express route that handles POST reqests.  Inside the handler, we will use a promise to keep track of the request.
- Whenever a regular JavaScript function starts executing, it will finish in one of two ways:
  - run to completion
  - throw an exception
- Node.js callback use two arguemets to reflect these two cases (e.g., function(err, data){...}), and EventEmitters use different event types.
- A *promise* is an object that  encapsulates these two results for an asynchronous operation.  Once the operation is completed, the promise will either be resolved (success case) or rejected (error case).  You use the *then()* method to attach success and error handlers to a promise.
- Let us see how this works by using a promise with the result of a *request()* to our CouchDB server.  There are many promise libraries available through npm--we will use Kriskowal;s Q module.  *Q* is a full-featured promise library with lots of helper methods for interoperating with different asynchronous code-management approaches.
- *b4/lib/bundle.js*
```javascript
app.post('/api/bundle', function(req, res) {
  // We create a Deferred object.  This class is something specific to the Q module--it provides methods for working with the promise.
  let deferred = Q.defer();
  request.post({
    url: config.b4db,
    json: {type: 'bundle', name: req.query.name, books: {} }
  }, function(err, couchRes, body) {
    // When request is finished, 
    if (err) { // we will either reject the promise, passing forward the error or
      deferred.reject(err);
    } else { // we will resolve the promise, passing along CouchDB response and body
      deferred.resolve([couchRes, body]);
    }
  });

  deferred.promise.then(function(args) {
    let couchRes = args[0], body = args[1];
    res.status(couchRes.StatusCode).json(body);
  }, function(err) {
    res.status(502).json({ error: "bad_gateway", reason: err.code });
  });
});
```
- This code adds a route using app.post() that sends forward a POST to CouchDB and returns its results.  You can try it out with *curl* like so:
  - curl -X POST http://localhost:3000/api/bundle/
- Although there is nothing to stop you from creating Deferred objects in this way, you usually don't have to.  Instead, Q offers shortcut methods that produce promises for you when you are working with familiar paterns like Node callbacks.  Let us see how these work next, as we write an API for retrieving a bundle.

### Retrieving a Resource through GET and nfcall()
- Sill wokring from *b4/lib/bundle.js*, let us see the router for GET requests for a bundle.  Like the POST handler we just looked at, this implementation uses a promise for the request to CouchDB, but it doesn't explicitly create a Deferred object.
```javascript
app.get('api/bundle/:id', function(req, res) {
  Q.nfcall(request.get, config.b4db + '/' + req.params.id)
    .then(function(args) {
      let couchRes = args[0], bundle = JSON.parse(args[1]);
      res.status(couchRes.statusCode).json(bundle);
    }, function(err) {
      res.status(502).json({ error: "bad_gateway", reason: err.code });
    })
    .done();
});
```
- You can call this API with *curl* by passing in the ID of a previously created bundle:
  - curl http://localhost:3000/api/bundle/ID-of-a-previously-created-bundle
- The difference between post and get can be seen here in the second line of this code snippet.  Instead of calling request() directly, we call Q.nfcall(request.get...).
- Q's nfcall() method is short for "Node Function Call."  It takes a function that expects a regular Node.js callback as its last parameter (like request()), incokes the function, and returns a promise.  In effect, it does automatically what our POST handler did explicitly by creating a Deffered.
-  After that, we call the promise's then() method with success and failure handler just as before.  Lastly, we call done() on the promise chain to force any unhandled rejected promise to throw.
- In Node.js, promise have a habit of swallowing errors.  Calling *done()* on a promise chain is *Q's Golden Rule*--whenever you make a promise, you should either return it so someone else can deal with it, or call done.
- Wehn you have only one promise, it is not clear how the abstraction helps with managing asynchrounous code.  The benefits start to become more obvious when you have a chain of asynchrounous operations that you need to manage.

### Updating a Resource through PUT with chained promise
- We have looked at a couple of GET routes and one POST so far.  Here we will examine the code to update a bundle's *name* property, which uses HTTP PUT.  This code uses promises to manage asynchronous behavior to an even greater extent that previous APIs we have seen.  Here's the code for the PUT route that powers setting a bundle's name:
```javascript
  app.put('/api/bundle/:id/name/:name', function(req, res) {
    Q.nfcall(request.get, config.b4db + '/' + req.params.id)
      .then(function(args) {  
        let couchRes = args[0], bundle = JSON.parse(args[1]);
        
        if (couchRes.statusCode !== 200) {
          return [couchRes, bundle];  
        }
        
        bundle.name = req.params.name;
        return Q.nfcall(request.put, {  
          url: config.b4db + '/' + req.params.id,
          json: bundle
        });
        
      })
      .then(function(args) {  
        let couchRes = args[0], body = args[1];
        res.status(couchRes.statusCode).json(body);
      })
      .catch(function(err) {  
        res.status(502).json( { error: "bad_gateway", reason: err.code });
      });
  });
```
- This enpoint starts off much like the GET bundle API.  It invokes *request.get* through *Q.nfcall()* to make a promise, and proceeds to use the *then()* method to handle the response.
- Now, an important thing to understand about *then()* is that it returns a new promise that will be fulfilled or rejected depending on what happens in *then's* success and failure callbacks.  In other words, when you call *then()* on a promise, you set up a *promise chain*; each promise depends on the one that came before.
- This REST handler has two calls to *then()* and the second one will be called depending on how the first call goes.
- Once we extract the *couchRes* and *bundle* from the args array, we check to see if we got the 200 OK status code we were hoping for.  If not, we return an array with the *couchRes* and *bundle*.  Q interprets this return statement as a successfl resolution of the promise and calls the second *then()* handler function.
- If we get the 200 OK status we are after, then the function continues to overwrite the bundle's *name* field.  We do another *Q.nfcall()* to PUT the bundle document back into CouchDB, and return the promise that this produces.  Q waits for this subpromise to finish, then uses it value to resolve the original promise, at which point the second *then()* handler gets invoked.
- So in either case--wether we return a value directly or another promise--Q knows what to do.
- Lastly, the *catch()* method is a way of capturing exceptions in promise-driven asynchrnous code.
- Promises are a powerful abstraction for working with asynchrounous code, but to use them effectively you really need a firm grasp of how they work.  They offer the possiblity of simplifying your asynchronous workflow, especially when combined with another powerful abstraction: generators.

### Yeilding Control with Generators
- ECMAScript Harmony introduces a new concept called a *generator*  A generator is like a function except that you can suspend its execution and resume later.
- With a generator, you can *yeild* a value without actually finishing execution, and the pick up where you lefft off.

#### Counting Down with a Generator
```javascript
// countdown.js
'use strict';
const
  countdown = function* (count) {
    while (count > 0) {
      yield count;
      count -= 1;
    }
  },

    counter = countdown(5),

    callback = function() {
      let item = counter.next();
      if (!item.done) {
        console.log(item.value);
        setTimeout(callback, 1000);
      }
    };
callback();
```
- run it using:
  - node --harmony countdown.js
- The *countdown()* function is a *generator function*.  The *asterisk(*)* in function*() is what tells the JavaScript engine to treat this function differently.
- When you call countdown with a starting value, what you get back is a generator.  In our case, we call *countdown* with 5 and store the generator to a variable called *counter*.
- The code inside the generator function starts executing the first time you call the generator's *next()* method.  It runs until it hits a *yield*, then sends back that value.
- Our examples calls *counter.next()* inside of a function called *callback*.  This callback function saves the object returned by *counter.next()* into a variable called *item*. This object has two properties of note:
  - done--either true or false; indicates wheter the generator function has run to completion.
  - value--the last value yielded or returned.
- So the callback function checks wheter the generator still has more to do, and if so, logs the yielded value and sets a timeout to check again in one second.

####Generators and Asynchronous Code
- Generators offer a clever way to deal with asynchronous code, given that they have the ability to pause their execution indefinitely.  The *countdown* example does not show it, but inside your generator function, you can grab the value coming in through *yeild*.
- For example, say your generator function contains the following line:
```javascript
let x = yield;
```
- In this case, the value of x would be whatever was passed into *generator.next()* while it was suspended on the *yeild*.  So if you called *generator.next(8)*, then x would be 8.
- When the generator function and the calling code cooperate, you can do some really neat things.  Consider this line from a hypothetical generator function:
```javascript
let data = yield "./my-yext-file.txt";
```
- This line suspends execution after yielding the string "./my-text-file.txt" and expects to continute when it recieves the data from that file.  If the calling code knows to treat the string as a filename, it could do something like *fs.readFile()* and then pass the data back to the generator with *generator.next(data)*.

#### Using Generators with Promises
- Let us return to our Express APIs for working with the book bundles. So far we have ways of creating and retrieving bundles, and we can update the *name* property of a bundle.
- Now we will make an API for adding books to a bundle using the PUT HTTP verb.  This code will have to make several asynchronous calls: one to get the existing bundle, one to get book details, and one to put the bundle data back.  To do all this, we will use promises and generators to flatten and simplify the chain of operations.


##### Using the Put book API
Before we get into the code, let us take a look at how this API works.  That way, when we dive into the code it will be more clear about what it does.

1. To use the PUT book API, we need a bundle, so make one with the POST API through *curl*
  - curl -X POST http://localhost:3000/api/bundle?name=War%20Books
  ```json
  {"ok":true,"id":"5155969a0714e262097d3c81b8000071","rev":"1-d90a9d2a08880d9f29e6fa4515702d50"}
  ```

2. Request the bundle with GET to see what is in it so far (your bundle ID may be different):
  - curl http://localhost:3000/api/bundle/5155969a0714e262097d3c81b8000071
  ```json
  {"_id":"5155969a0714e262097d3c81b8000071","_rev":"1-d90a9d2a08880d9f29e6fa4515702d50","type":"bundle","name":"War Books","books":{}}
  ```
3. Then, let us add Sunzi's *The Art of War* (Project Gutenberg ID 132):
  - curl -X PUT http://localhost:3000/api/bundle/5155969a0714e262097d3c81b8000071/book/132
  ```json
  {"ok":true,"id":"5155969a0714e262097d3c81b8000071","rev":"2-58aad9ea25605877e3f4dc562a368fce"}
  ```
4. Finally, let us see what was added to the bundle:
  - curl http://localhost:3000/api/bundle/5155969a0714e262097d3c81b8000071
  ```json
  {
    "_id":"5155969a0714e262097d3c81b8000071",
    "_rev":"2-58aad9ea25605877e3f4dc562a368fce",
    "type":"bundle",
    "name":"War Books",
    "books":{
      "132":"The Art of War"
    }
  }
  ```
5. Great success!  The "War Books" bundle now contains *The Art of War*.

### Yielding Promises With Q.async
- Let us take a look at the PUT handler that made this happen.  This will be the last, but most complex code block in *b4/lib/bundle.js*.
- Here is the section that implements adding a book to a bundle with PUT:
```javascript
  app.put('/api/bundle/:id/book/:pgid', function(req, res) {
    
    let
      get = Q.denodeify(request.get), 
      put = Q.denodeify(request.put);
    
    Q.async(function* (){  
      
      let args, couchRes, bundle, book;
      
      // grab the bundle from the b4 database
      args = yield get(config.b4db + req.params.id); 
      couchRes = args[0];
      bundle = JSON.parse(args[1]);
      
      // fail fast if we couldn't retrieve the bundle
      if (couchRes.statusCode !== 200) {
        res.status(couchRes.statusCode).json(bundle);
        return;
      }
      
      // look up the book by its Project Gutenberg ID
      args = yield get(config.bookdb + req.params.pgid); 
      couchRes = args[0];
      book = JSON.parse(args[1]);
      
      // fail fast if we couldn't retrieve the book
      if (couchRes.statusCode !== 200) {
        res.status(couchRes.statusCode).json(book);
        return;
      }
      
      // add the book to the bundle and put it back in CouchDB
      bundle.books[book._id] = book.title;
      args = yield put({url: config.b4db + bundle._id, json: bundle});
      res.status(args[0].statusCode).json(args[1]);
      
    })()  
    .catch(function(err) {  
      res.status(502).json( { error: "bad_gateway", reason: err.code });
    });
  });
```
- Notice *Q.denodeify* for *request.get* & *reqest.put*.  The *denodeify()* method takes a Node.js-style function (one that expects a callback) and returns a new promise-producing function from it.  Using denodeify is a convenient way to avoid calling Q.nfcall() all over the place.  Instead, you just denodeify the functions you plan to use, and call them later knowing they will produce promises.
- We call *Q.async()* with a generator function. Q's *async* method returns a new promise-producing function that will start running the generator when you invoke it.  We invoke this function right away.
- Inside the generator, any time we *yeild* a promise, Q will wait for the promise to resolve, then resume execution with the resolved value.  For example, we yeild a promise for *get* call to CouchDB.  When the request finishes, the promise is resolved and Q gives us back the value, which we assigned to *args*.  This is much like the calls to then(function(args){...}) we saw earlier, but written in a more linear style.
- If the http status code form CouchDB was something other than the 200 OK, we send it back to the requester verbatim and return early. Otherwise, we move on to the second asynchronous call.  Again we yield a promise for a *get* call to CouchDB, and again we check that everything was OK when it comes back.
- Finally, We add the book to the bundle and yield again--this time wait on a *put*.  When the put is finished, we send the results back to the requester.  If anything went wrong we catch it in the catch block.
- This API makes three asynchronous requests, but does it in only one function thanks to Q.async and generator functions.  On the plus side, writing code in this way has the potential to make it look like synchronous, linear code.  But reaping this benefit means working deeply with promises and relying on some seemingly magical coordination logic.
