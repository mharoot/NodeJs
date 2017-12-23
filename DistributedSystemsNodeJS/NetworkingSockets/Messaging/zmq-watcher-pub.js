'use strict';
const 
  fs = require('fs'),

  // First, instead of requiring the net module, now we're requiring zmq.
  zmq = require('zmq'),

  // create publish enpoint
  publisher = zmq.socket('pub'),

  filename = process.argv[2];

fs.watch(filename, function(){

    // send message to any subscribers
    // zmq does not do any formatting of messages itself--it is only interested in pushing byes down the wire.  It's our job to serialize and deserialize any messages we send through zmq.
    publisher.send(JSON.stringify({
        type: 'changed',
        file: filename,
        timestamp: Date.now()
    }));

});

// listen on TCP port 5432
publisher.bind('tcp://*:5432', function(err) {
    console.log('Listening for zmq subscribers...');
})