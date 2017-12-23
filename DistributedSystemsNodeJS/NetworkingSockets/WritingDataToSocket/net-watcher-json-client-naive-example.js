// net-watcher-json-client.js - client program to recieve JSON messages from our net-watcher-json-service program.  We'll start with a naive implementation, and then improve upon it.

'use strict';
const
  net = require('net'),
  clientSocket = net.connect({port:5432});
clientSocket.on('data',function(data) {
  // Understanding the Message-Bounday Problem
  let message = JSON.parse(data); // naive assumption data will come all at once
  if (message.type === 'watching') {
      console.log("Now watching: " + message.file);
  } else if (message.type === 'changed') {
      let data = new Date(message.timestamp);
      console.log("File '" + message.file + "' chaned at " + data);
  } else {
      throw Error("Unregonized message type: " + message.type);
  }
});

