# ZeroMQ
- endpoints automatically reconnect if they become unhitched for any reason--like if there is a hicup in the network or if a process restarts.
- delivers only whole messages, so you don't have to create buffers to deal with chunked data.
- low-overhead protocol takes care of many routing details, like sending responses back to the correct clients.

--------------------------------------------------------------------------------

# Getting Started
- Install ZeroMQ Base Library: sudo apt-get install libzmq3-dev
- Use npm to pull down ZeroMQ: npm install zmq
- Test that the mondule was installed successfully, run: node --harmony -p -e 'require("zmq")'
- the -e flag tells Node to evaluate the provided string, and the -p flag tells it to print that output to the terminal.

--------------------------------------------------------------------------------

# Messaging Patterns
- PUB/SUB
- REQ/REP
- PUSH/PULL

# zmq-watcher-pub.js - Publishing Messages over TCP part PUB
- Demonstrates the publish/subscribe pattern (PUB/SUB) in networking.
- zmq deals with the message boundary problem, how to handle network interupts, or server restarts.
- node --harmony zmq-watcher-pub.js target.txt

--------------------------------------------------------------------------------

# zmq-watcher-sub.js - Publishing Messages over TCP part SUB
- Demonstrates the publish/subscribe pattern (PUB/SUB) in networking.
- zmq deals with the message boundary problem, how to handle network interupts, or server restarts.
- node --harmony zmq-watcher-sub.js target.txt
- run the pub and sub together then kill the publisher in its terminal via Ctrl-C.  Switch back to sub terminal. You will notice it has not halted.  It continutes to wait for messages from pub.  From zmq's perspective, it doesn't mattter which enpoint starts up first and it automatically reestablishes the connection when an enpoint comes back online.  These characteristics add up to a robust platform that gives you stability without a lot of work on your part.

--------------------------------------------------------------------------------

# zmq-filer-rep.js - Request/Reply messaging pattern part REP
- node --harmony zmq-filer-rep.js
- The responder binds to TCP port 5433 of the loopback interface(IP 127.0.0.1) to wait for connections.
- This makes the responder the stable endpoint of the REP/REQ pair.

--------------------------------------------------------------------------------

# zmq-filer-req.js - Request/Reply messaging pattern part REQ
- first run: node --harmony zmq-filer-rep.js
- node --harmony zmq-filer-req.js target.txt

------------------------------------------------------------------------------

 # zmq-filer-req-loop.js - Trading Synchronicity for Scale
 - There is a catch to using zmq REP/REQ socket pairs with Node.  Each end point of the application operates on only one request or one response at a time.  There is no parallelism.
 - We can see this in action by making a small change to the requester program.  We wrap the code that sends the request in a for loop.
 - run it: node --harmony zmq-filer-req-loop.js target.txt

------------------------------------------------------------------------------

 # Routing and Dealing Messages
 - The REQ/REP socket pair we explored makes request/reply logic easy to code by operating sequentially.  A given requester or responder will only ever be aware of one message at a time.  For parallel message processing, zmq includes the more advanced socket types ROUTER and DEALER.

 ------------------------------------------------------------------------------

 # Routing Messages
 - You can think of a ROUTER socket as a parallel REP socket.  Rather than replying to only one message at a time, a ROUTER socket can handle many requests simulatenously.  It remembers which connection each request came from and will route reply messages accordingly.
 
 ------------------------------------------------------------------------------
 # Router Example
 const 
   zmq = require('zmq'),
   router = zmq.socket('router');
 
 router.on('mesage', function() {
     let frames = Array.prototype.slice.call(null, arguments);
     // ...
 })

 - previously our message handlers would take a data parameter, but notice how this handler function does not take any.  The zmq module actually passes all the frames for a message to the handler as arguments to the handler function.  It can do this because JavaScript functions are variadic--they can recieve any number of arguments when called.

 - The arguments object inside a function is an array-like object that contains all the arguments that were passed in.  Using Array.prototype.slice.call(null, arguements) returns a real JavaScript Array instance with the same contents.

 ------------------------------------------------------------------------------

 # Dealing Messages
 - A DEALER is a parallel REQ.  It can send multiple requests in parallel.
 - Dealer and router working together in Node code sample:
  ```javascript
 const 
   zmq = require('zmq'),
   router = require('router'),
   dealer = require('dealer'),

 router.on('message', function() {
   let frames = Array.prototype.slice.call(null, arguments);
   dealer.send(frames);
 });

 dealer.on('message', function() {
     let frames = Array.prototype.slice.call(null, arguements);
     router.send(frames);
 });
 ```

 - Here we create both ROUTER and DEALER sockets.  Whenever either recieves a message, it strips out the frames and sends them to the other socket.

 ------------------------------------------------------------------------------

 # Clustering Node.js Processes
 - In multithreaded systems, doing more work in parallel means spinning up more threads.  But Node.js uses a single-trheaded event loop, so to take advantage of multiple cores or multiple processors on the same computer, you have to psin up more Node processes.
 - This is called clustering and it is what Node's built-in cluster module does.  Clustering is a useful technique for scaling up your Node application when there's unused CPU capacity available.  Scaling a Node application is a big topic with lots of choices based on your particular scenario, but no matter how you end up doing it, you'll probably start with clustering.
 - To explore how the cluster module works, we'll build up a program that manages a pool of worker processes to respond to zmq requests.  This will be a drop-in replacement for our previous responder program.  It will use ROUTER, DEALER, and REP sockets to distribute requests to workers.
 - In all, we'll end up with a short and powerful program that combines cluster-based, multiprocess work distribution and load-balanced message-passing to boot.

 ------------------------------------------------------------------------------

 # Forking Worker Processes in a Cluster
 - Each time you call the cluster module's fork() method, it creates a worker process running the same script as the original.
 - Code Snippet below show the basic framework for a clustered Node application:
  ```javascript
 const cluser = require('cluster');

 if (cluster.isMaster) {
     // fork some worker processes
     for (let i = 0; i < 10; i++) {
         cluster.fork();
     }
 } else {
     // this is a worker process, do some work
 }
 ```

 ------------------------------------------------------------------------------

 # Building a Cluster
 - We'll build a program that distributes requests to a pool of worker processes.
 - Our master Node process will create ROUTER and DEALER sockets and spin up the workers.  Each worker will create a REP socet that connects beack to the DEALER.

 ------------------------------------------------------------------------------

 # zmq-filer-rep-cluster.js
 - Notice that the ROUTER listens for incoming TCP connections on port 5433 on line 11.  This allows the cluster to act as a drop-in replacement for the zmq-filer-rep.js program we developed earlier.
 - On line 12, the DEALER socket binds an interporcess connection (IPC) endpoint.  
 - By convntion, zmq IPC files should end in the file extension .ipc.  In this case, the file-dealer.ipc file will be created in the current working directory that the cluster was launced from (if it doesn't exist already).
 - run it: node --harmony zmq-filer-rep-cluster.js

 ------------------------------------------------------------------------------

 #  Messaging Pattern PUSH/PULL - Pushing Jobs to Workers
 - The PUSH and PULL socket types are useful when you have a queue of jobs that oyu want to faily assign among a poool of available workers.
 - Recall that with a PUB/SUB pair, each subscriber will recieve all messages sent by the publisher.  In a PUSH/PULL setup, only one puller will recieve each message sent by the pusher.
 - So PUSH will round-robin-distribute messages to connected sockets, just like the DEALER.  But unlike the DEALER/ROUTER flow, there is no backchanne.  A message traveling from a PUSH socket to a PULL socket is one-way; the puller can not send a response back through the same socket.
 - Here's a quick example showing how to set up a PUSH socket and distribute 100 jobs.  Note the example is incomplete--it does not call bind() or connect()--but it does demonstrate the concept.
 ```javascript
 const 
   zmq = require('zmq'),
   pusher = zmq.socket('push');
 // wait until pullers are connected and read, then send 100 jobs ...
 for (let i = 0; i < 100; i++) {
     pusher.send(JSON.stringify({
         details: "details about this job."
     }));
 }
 ```
 - Here's an associated PULL socket.
  ```javascript
 const 
   zmq = require('zmq'),
   puller = zmq.socket('pull');
 // connect to the pusher, announce readiness to work, then wait for work...
 puller.on('message', function(data) {
     let job = JSON.parse(data.toString());

     // do the work described in the job
 });
 ```

 - Like with zmq sokcets, either end of a PUSH/PULL pair can bind or connect--the choice comes down to which is the stabe part of the architecture.

 ------------------------------------------------------------------------------

 # PUSH/PULL - Avoiding Common Pitfalls
 - First-joiner problem
 - limited-resource problem
 
 ------------------------------------------------------------------------------
 
 # PUSH/PULL - First-joiner Problem
 - Since it takes time to establish a connection, the first puller to successfully connect will pull many or all of the available messages before the second joiner even has a chance to get into the rotation.
 - Fix: The pusher needs to wait until all of the pullers are ready to recieve messages before pushing any.  Let us consider a real-world scenario and how we'd solve it.
 - Say you have a Node cluster, and the master process plans to PUSH a bunch of jobs to three worker processes.  Before the master can start pushing, the workers need a way to signal back to the master that they're ready to start pulling jobs.  They also need a way to communicate the results of the jobs that they'll eventually complete.
 - Note, however, that this is just one solution to the first-joiner problem.  You could choose to use a different messaging pattern for the backchannel, like request/reply.

 ------------------------------------------------------------------------------
 # PUSH/PULL - Limited-Resource Problem
 - Node.js is at the mercy of the operating system with respect to the number of resources it can access at the same time.
 - Whenever your Node program opens a file or a TCP connection, it uses one of its available file descriptors.  When there are not left, Node will start failing to connect to resources when asked.  This is an extremely common problem for Node.js developers.  
 - This problem is not limited to the PUSH/PULL scenario, but it is very likely to happen there, and here is why.  Since Node.js is asynchronous, the puller process can start working on many jobs simultaneously.  Every time a message event comes in, the Node process invokes teh handler and starts working on the job.  If these jobs require accesing system resources--and they almost certainly will--you are liable to exhaust the pool of file descriptors.  The jobs will quicky start failing.
 