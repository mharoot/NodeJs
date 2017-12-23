// net-watcher-json-client.js - client program to recieve JSON messages from our net-watcher-json-service program.  
'use strict';
const
  net = require('net'),
  ldj = require('./ldj.js'), // Importing a Custom Node Module to solve Message-Boundary Problem
  netClient = net.connect({port:5432}),
  ldjClient = ldj.connect(netClient);

ldjClient.on('message', function(message) {
  // Message-Bounday Problem Solved!
  // let message = JSON.parse(data); // naive assumption data will come all at once
  
  if (message.type === 'watching') {
      console.log("Now watching: " + message.file);
  } else if (message.type === 'changed') {
      let date = new Date(message.timestamp);
      console.log("File '" + message.file + "' changed at " + date);
  } else {
      throw Error("Unrecognized message type: " + message.type);
  }
});

