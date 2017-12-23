// net-watcher-json-test-servive.js - A JSON message split into two data events

"use strict";
const
  net = require('net'),
  server = net.createServer(function(connection) {
    console.log('Subscriber connected');

    // send the first chunk immediately data event 1
    connection.write(
      '{"type":"changed","file":"targ'
    );

    // after a one second delay, send the other chunk data event 2
    let timer = setTimeout(function(){
      connection.write('et.txt","timestamp":1358175758495}' + "\n");
      connection.end();
    }, 1000);

    // clear timer when the connection ends
    connection.on('end', function(){
      clearTimeout(timer);
      console.log('Suscriber disconnected');
    });

  });

  server.listen(5432, function() {
      console.log('Test server listening for subscribers...');
  });


  /*
The error Unexpected end of input tells us that the messge was not complete and valid JSON.  
Our cliet attempted to send half a message to JSON.parse(), which expects only whole,
properly formatted JSON strings as input.

  undefined:1
{"type":"changed","file":"targ
                              

SyntaxError: Unexpected end of input
    at Object.parse (native)
    at Socket.<anonymous> (./net-watcher-json-client.js:9:22)
    at Socket.emit (events.js:169:7)
    at TCP.onread (net.js:523:20)

  */