'use strict';
const 
  zmq = require('zmq'),

  // create subscriber endpoint
  subscriber = zmq.socket('sub');

// subscribe to all messages
subscriber.subscribe("");

// handle messages from publisher
subscriber.on("message", function(data) { // note it inherits from EventEmitter the on function
  let 
    message = JSON.parse(data),
    date = new Date(message.timestamp);
  console.log("File '" + message.file + "' changed at " + date);
});

subscriber.connect("tcp://localhost:5432");