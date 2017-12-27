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