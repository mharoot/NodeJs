# Web Apps
By now, you have mastered seveal approaches to handling asynchronous JavaScript code.  You know how to use and write RESTful web services.  You understand messaging patterns, and how to use Express.  With all of that knowledge and experience, we are now in position to develop a web application.  This will take us through the following Node.js aspects:
-------------------------------------------------------------------------------

- Architecture and Core
  - At this stage you have moved past the Node.js core in many respects.  Node is the underlying technology that is letting you reach beyond.

- Patterns
  - You will dive deeper into Express middleware, using it to implement a custom authentication handler.  We will use passport--an Express plug-in--so that users of our application can log in with their Google accounts.  The client-side code uses model-view-controller(MVC) to separate concerns.

- JavaScriptisms
  - You'll learn some differences between ECMAScript 5 and 6 as we code JavaScript for the browser.  You will also use jQuery to perform a variety of client-side operations.

- Supporting Code
  - Just like npm makes it esy to pull in Node modules, *Bower* is used to manage client-side dependencies.  We will use bower to pull in jQuery, Bootstrap, Handlebars, and others.  We will also use Redis, a fast key-value store, for managing session data.

# Storing Express Sessions in Redis
- A *session* is data that is attached to a particular user.  As the user browses pages on the site or uses the web application, the server keeps track of the user through a *session cookie*.  On each request, the server reads the cookie, retrieves the session data, then uses it when generating a response.
- Exactly where you store this session data is up to you.  By default, Express will keep the data in memory, but this does not readily scale.  Once you have more than one Node.js process, the session data should really be stored to be in a shared place.  That way, no matter which process services a user's request, it will have the correct inforation.

### Enabling Sessions in Express
- To enable sessions, add the *cookieParser* and *session* middleware to your *app*:
```javascript
app.use(express.cookieParser());
app.use(express.session({ secret: 'unguessable' }));
```
- The *cookieParser* middleware is responsible for parsing incoming cookies from the client, and the *session* middleware stores the session data attached to the cookie.  The *secret* parameter is necessary to prevent cookie tampering and spoofing--set it to something unique to your application.  Express session cookies are signed with this secret string.

### Using Redis to Store Session Data
- *Redis* is an extremely fast key/value store with tunable durability.  This means you can keep it fast but risk losing data if the server were to crash, or you can sacrifice speed for greater durabily gaurantees.
- By default, Redis keeps data in memory and then periodically writes it to disk.  This makes it blazingly fast, but disaster-prone since a process crash would mean lost data.
- Its speed makes Redis an ideal database for storing session data.  If the server tips over, then the sessions might be lost, but at worst this menas that your users will have to log in again.
- To use Redis with you Node/Express app, first you will have to install it.  Installing Redis differs by platform, but once you have it installed, starting it up is a single command:
  - redis-server

#### Installing Redis on Linux
- wget http://download.redis.io/redis-stable.tar.gz
- tar xvzf redis-stable.tar.gz
- cd redis-stable
- make
- sudo cp src/redis-server /usr/local/bin/
- sudo cp src/redis-cli /usr/local/bin/
- https://redis.io/topics/quickstart

### Using Redis with Express
- npm install --save redis
- npm install --save connect-redis
- npm install --save nodemon
- npm install --save express
- npm install --save express-session
- npm install --save cookie-parser

```javascript
// constructs a client for the Redis database.  This will immediately open a TCP socket to your Redis server.  The second line produces a class you can use to instantiate a Redis-based backing store for sessions.

redisClient = require('redis').createClient(),
RedisStore = require('connect-redis')(express),

// The middleware section of your server.js file
app.use(express.cookieParser()); // use the cookie middleware with Redis

app.use(express.session({ // use the session middleware with Redis
  secret: 'unguessable',
  store: new RedisStore({
    client: redisClient
  })
}));

app.get('/api/:name', function(req, res) {
  res.status(200).json({ "hello": req.params.name });
});

app.listen(3000, function(){
  console.log('ready captain.');
});
```

- In a second terminal, let us check out the HTTP headers with curl"
  - curl -i -X HEAD http://localhost:3000/api/test
- You can confirm that the data has been saved in Redis with the following command:
  - redis-cli KEYS 'sess:*'
- Let us return now to the b4 application, which will use Redis for session storage in just this way.  With Redis running, we can build a stateful web application on top our RESTful services.

# Creating a Single-Page Web Application
- A single-page web application consists of an HTML page, CSS to style it, and JavaScript to perform the application logic.  All of these things can be delivered as static files, meaning they do not require any special server-side processing.  You can just serve them up from the file system.

### Serving Static Content with Express
- Express comes with a convenient way to server static files.  All you have to do is use the *express.static* middleware and provide a directory.  For example, these lines appear in the b4 server:
```javascript
app.use(express.static(__dirname + '/static'));
app.use(express.static(__dirname + '/bower_components'));
```
- These two lines tell Express to serve static content out of the *static/* and *bower_components/* directories of the project.  This means that if Express can not find a particular route, it will fall back to serving the static content, checking these directories one at a time.
- The static middleware is special in this regard.  Most of the time, middleware has its effect in the middle of the request processing, but static appends its effect to the end of the chain (even after the route handlers have run).
- For instance, the project's *static/* directory contains three files: *index.html, app.css,* and *app.js*.  These contain the HTML, CSS, and client-side JavaScript for the b4 application, respectively.
- With the server running, when you request http://localhost:3000/index.html, Express will serve up *static/index.html* because we do not have an explicit route for it.

### Installing Bower Components
- Bower is a package manager for front-end code, like JavaScript libraries. You install Bower components in much the same way you install npm modules.
- Here is the *bower.json* file from the b4 application:
```json
{
  "name": "b4",
  "version": "0.0.1",
  "dependencies": {
    "jquery": "^3.2.1",
    "bootstrap": "^3.3.7",
    "typeahead.js": "^0.11.1",
    "typeahead.js-bootstrap.css": "*",
    "handlebars": "^4.0.11"
  }
}
```
- To install these packages, first install Bower through npm (if you have not already):
  - npm install -g bower
- Then install Bower components:
  - bower install

### Structuring a Single-Page App
- With the server ready to serve the static content, and Bower compoinents in place, we can put together the main entry point of our single-page app: the *index.html* file.
```html
<!DOCTYPE HTML>
<html>
<head>
  <meta charset="utf-8">
  <title>b4 - The Better Book Bundle Builder</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="bootstrap/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="bootstrap/dist/css/bootstrap-theme.min.css">
  <link rel="stylesheet" href="typeahead.js-boostrap.css/typeahead.js-bootstrap.css">
  <link rel="stylesheet" href="app.css">
</head>
</body class="container">
```
- The first line tells the browser that this is an HTML5 document.  Then we enter the document's head section, which contains the title, some meta tags, and a bunch of style sheets.

- Next, let us check out the bottom of *index.html*:
```html
  <script src="jquery/jquery.min.js"></script>
  <script src="bootstrap/dist/js/bootstrap.min.js"></script>
  <script src="typeahead.js/dist/typeahead.min.js"></script>
  <script src="handlebars/handlebars.js"></script>
  <script src="app.js"></script>
  </body>
  </html>
  ```
  - Like the head, this is where we bring in a bunch of dependencies and our own code.  *app.js* is last so we can use all the other libraries in our application logic.

  # Authenticating with Passport
  - Passport is an Express plug-in that provides middleware for a variety of third-party logins.
  - Documentation coming soon.