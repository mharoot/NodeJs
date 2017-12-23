
/**
 * zmq-filer-req-loop.js - Trading Synchronicity for Scale
 * *******************************************************
 * There is a catch to using zmq REP/REQ socket pairs with Node.  Each end point of the application operates on only one request or one response at a time.  There is no parallelism.
 * We can see this in action by making a small change to the requester program.  We wrap the code that sends the request in a for loop.
 */
"use strict";
const 
  zmq = require('zmq'),
  filename = process.argv[2],
  // create request endpoint
  requester = zmq.socket('req');
// handle replies from responder
requester.on("message", function(data) {
  let response = JSON.parse(data);
  console.log("Recived response", response);
});
requester.connect("tcp://localhost:5433");
// send request for content
console.log('Sending request for ' + filename);

for (let i=1; i<=3; i++) {
    console.log('Sending request ' + i + ' for ' + filename);
    requester.send(JSON.stringify({
        path: filename
    }));
}
