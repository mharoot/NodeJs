// zmq-filer-rep.js - Implementing a Responder
'use strict';
const 
  fs = require('fs'),
  zmq = require('zmq'),
  // socket to reply to client requests
  responder = zmq.socket('rep');

// handle incoming requests
responder.on('message', function(data) {
  // parse incoming message
  let request = JSON.parse(data);
  console.log('Recived request to get: ' + request.path);

  // read file and reply with content
  fs.readFile(request.path, function(err, content) {
    console.log('Sending responst content');
    responder.send(JSON.stringify({
        content: content.toString(),
        timestamp: Date.now(),
        pid: process.pid
    }));
  });

});

// listen on TCP port 5433, This makes the responder the stable endpoint of the REP/REQ pair
responder.bind('tcp://127.0.0.1:5433', function(err) {
    console.log('Listening for zmq requesters...');
});

// close the responder when the Node process ends (Ctrl-C)
process.on('SIGINT', function() { // on signal interrupt = SIGINT
    console.log('Shutting down...');
    responder.close();
});