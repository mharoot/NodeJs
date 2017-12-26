# Getting Started with CouchDB
### Install on linux Debian/Ubuntu:
1. curl -L https://couchdb.apache.org/repo/bintray-pubkey.asc \ | sudo apt-key add -
2. sudo apt-get update && sudo apt-get install couchdb
3. sudo apt-get install software-properties-common -y
4. sudo add-apt-repository ppa:couchdb/stable -y
5. sudo apt-get update
6. sudo apt-get install curl -y
7. curl localhost:5984
8. curl -X PUT localhost:5984/new_database
9. stop couchdb
  * Note: it fails so the next lines will take care of that.
10. sudo dpkg-divert --local --rename --add /sbin/initctl
11. sudo ln -s /bin/true /sbin/initctl
12. stop couchdb
13. sudo chown -R couchdb:couchdb /usr/share/couchdb /etc/couchdb /usr/bin/couchdb
14. sudo chmod -R 0770 /usr/share/couchdb /etc/couchdb /usr/bin/couchdb
15. start couchdb
16. open your browser and navigate too:
* localhost:5984/_utils/
17. On bottom right you should see Everyone is admin.  Click fix this to set up an admin.

--------------------------------------------------------------------------------

### Creating a Package:
- package.json

```json
{
    "name" : "book-tools",
    "version" : "0.1.0",
    "description" : "Tools for creating an ebook database.",
    "author" : "Michael Harootoonyan <michaelharootoonyan@gmail.com> (https://github.com/mharoot/NodeJS)"
}
```

- When you install a module through npm, you have the choice of saving it as a dependency in the package.json.  You do this with the --save flag:
  - npm install --save request
- Your updated package.json will include a new dependencies section that looks like this:
```json
{
  "dependencies" : {
    "request": "^2.83.0"
  }
}
```
- We will be using the request module to make REST requests to CouchDB

--------------------------------------------------------------------------------

### Making RESTful Requests:
- REST is a set of principes built on top of HTTP.  With REST, each URL path points to a specific *resource*.  
- HTTP itsef is a request/reply protocol where each request is made to a URL with a particular *method*.
- CouchDB is a RESTful datastorage.  CouchDB uses a differnt HTTP method (or verb) for each operation.  You use POST to create, GET to read, PUT to update, and DELETE to delete.

--------------------------------------------------------------------------------

### dbcli.js: - REST from the Command Line
- Since our script starts with the #! directive, it can be executed directly, after making the file executable:
  - sudo chmod +x dbcli.js

--------------------------------------------------------------------------------

### Using the CLI for the CouchDB REST
- A *database* in CouchDB is basically a big collection of documents.  Each database lives at a URL path one level down from the root.  For example, if you had a database called books it would live at /books.  Lets see what happens when we try and GET the as-yet-uncreated books database:
  - ./dbcli.js GET books
  - it outputs: 404 { error: 'not_found', reason: 'no_db_file' }, Sine there is no books database yet.
- To make a database, use the HTTP verb PUT.
  - ./dbcli.js PUT books
  - if you provided the correct credentials for the admin of CouchDB it outputs: 201 { ok: true }
  - 201 Create status code tells us that we successfully created the database.
- To retrive a database, use the HTTP verb GET.
  - ./dbcli.js GET books

--------------------------------------------------------------------------------

### Importing Real Data
- We will use the request module to import tons of data into books database.  We will run into *The Limited-Resource Problem*.

#### Downloading Project Gutenber Data
- 43,000+ books in Resource Description Framework (RDF) format.  RDF is an XML-based format.
- The bz2 version of the catalog is about 13 MB. Fully extracted, it contains more than 500MB of RDF files.
- Download and extract the rdf-files.tar.bz2:
  - curl -O http://www.gutenberg.org/cache/epub/feeds/rdf-files.tar.bz2
  - tar -xvjf rdf-files.tar.bz2
- Ideally, we would like to have all of this information formatted as a JSON document suitable for passing in to CouchDB.  But to get a nice JSON representation, we will have to parse the RDF file.

#### Parsing XML Data with Node
- To parse the XML files, we will use cheerio, a jQuery-like library for working with XML documents in Node.
- First, install cheerio through npm and --save the dependency:
  - npm install --save cheerio

#### lib/rdf-parser.js
- LCSH stands for Library of Congress Subject Hedings.  They are a collection of indexing terms for use in bibligoraphic records.  We will use these later to find books on a given subject.
- This code is a little dense, but fortunately it does not have side effects.  That is, this code selects data from a complex schema and reformats it into a simple JavaScript object.
- To test if it works run a one-liner and see that it outputs what we expect:
  - node --harmony -e \ 'require("./lib/rdf-parser.js")("cache/epub/132/pg132.rdf", console.log)'
- This is good for a first pass, but we can do better.  Let us see how to create a unit test for this module.

--------------------------------------------------------------------------------
### Unit Testing with Nodeunit
- Let us create a unit test for our RDF parser module.
- Other popular unit testing tools are mocha and vows.
- Nodeunit supports asynchronous tests and has deep equality checks.
- Many node module are menat to be used as a library, but some modules, like nodeunit, are intended to run as stand-alone programs on the command line, too.  To install such a module global, use -g flag:
  - sudo npm install -g nodeunit
- Confirm nodeunit has been installed:
  - which nodeunit
- run the test:
  - node --harmony $(which nodeunit) test/

--------------------------------------------------------------------------------
### Throttling Node.js
- With our RDF parsing module in place and well tested, let us turn our attention to getting all those thousands of records into the database.
- Before we proceed: the code in this section attempts to demonstrate performance-related problems and their solutions.  The speed of your hardware and the settings of your OS may make it easier or harder to see these effects.
- In order to crawl the *cache* directory, we will use a module called *file*, which is available through npm.
  - npm install --save file
- The *file* module has a convenient method called *walk()* that traverses a directory tree and calls a callback for each file it finds.

#### Naive File Parsing at Scale
- *list-books.js* uses the *walk()* method to find all the RDF files and sends them through our RDF parser.
- run the program:
  - node --harmony list-books.js
- You may or may not get an error:
  - Error: EMFILE, open './cache/epub/12292/pg12292.rdf'
-  The problem here is masked by the innoucous-looking Error: EMFILE.  This kind of error occurs when you have exhausted the number of file descriptors available on the system (typically just over 10,000).
- There are a couple ways to do this, however we will only look at the *work queuing* approach, since it is the most reliable solution.

#### Queuing to Limit Work in Progress
- Rather than immediately sending each file path into the RDF parser, we will queue them as work o be done and let the queue throttle the number of concurrently running tasks.
- For this we will use the *async* module.
  - npm install --save async
- Async offers low-overhead mechanisms for managing asynchronous code.  For example, it has methods for executing a sequence of asynchronous tasks sequentially or in parallel, with a callback to invoke when they're all done.
- We need the ability to run a whole bunch of tasks, but limit the number that are running at any time.  For this we need *async.queue()*.
- *list-books-queued.js*
- node --harmony list-books-queued.js

-------------------------------------------------------------------------------

### Importing Data - Code
- We can take out list-books-queued.js and modify the parser to update the books database:
- inside our *rdfParser()* method:
```javascript
// add the constants too the top
const dbAdmin = 'root:password@',
request = require('request');
// ...
// ...
rdfParser(path, function(err, doc) {
  request({
    method: 'PUT',
    url: 'http://' + dbAdmin + 'localhost:5984/books/' + doc._id,
    json: doc
  }, function(err, res, body) {
    if (err) {
      throw Error(err);
    }
    console.log(res.statusCode, body);
    done();
  });
});
```
- The file is saved as *import-books.js*, time to find out if it works. Run it:
  - node --harmony import-books.js
- after some time you may or may not run into the error:
  - Error: Error: write ECONNRESET
  - If you do reduce the number of concurrent connectoions form 1000 to 10.

