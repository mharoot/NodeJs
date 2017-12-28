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

### Implementing Search APIs
- To build a book bundle, a user has to be able to discover books to add to it.  So our modular web service will have two search APIs: 
  - field search (for discovering authors and subjects) 
  - book search (for finding books by a given author or subject)
- The field search API helps users to find authors or subjecs based on a starting string. For example, to get a list of subjects that start with *'Croc'*, you would make a request on the command line like this:
  - curl http://localhost:3000/api/search/subject?q=Croc
  - This API could be employed, for instance, in a user interface so that when a user starts typing a subject, suggestions automatically pop up.
- *b4/lib/field-search.js*