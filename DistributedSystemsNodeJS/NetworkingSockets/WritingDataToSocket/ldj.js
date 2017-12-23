// ldj.js

/**
 * Extending EventEmitter
 * 
 * To relieve the client program from the danger of split JSON messages, we'll
 * implement an LDJ buffering client module.  Then we'll incorporate it into the network-watcher client.
 * 
 * Inheritace in Node
 * 
 * First let's have a look at how Node does inheritance.  The following code sets up LDJClient to inherit 
 * from EventEmitter.
 */
'use strict';
const
  events = require('events'),
  util = require('util'),
  // client constructor
  LDJClient = function(stream) {
    events.EventEmitter.call(this);
    // Buffering Data Events
    /**
     * It appends incomind data chunks to a running buffer string and scans for line endings
     * (which should be JSON message boundaries).
     */
    let 
      self = this, // seting a separate variable (self) gaurentees were refering to correct scope
      buffer = '';
    stream.on('data', function(data) {
      buffer += data;
      let boundary = buffer.indexOf('\n');
      console.log('boundary: ' + boundary);
      while (boundary !== -1) {
          let input = buffer.substr(0, boundary);
          buffer = buffer.substr(boundary + 1);
          self.emit('message', JSON.parse(input));
          boundary = buffer.indexOf('\n');
      }
    });
  };

util.inherits(LDJClient, events.EventEmitter);

// expose module methods
exports.LDJClient = LDJClient;
exports.connect = function(stream){
    return new LDJClient(stream);
}


/**
 * Code to use the LDJ module will look something like this:
 * 
 * const 
 *   ldj = require('./ldj.js'),
 *   client = ldj.connect(networkStream);
 * client.on('message', function(message) {
 *   // take action for this message
 * });
 */


/**
 * Code to use LDJClient might look like this:
 * const client = new LDJClient(networkStream);
 * client.on('message', function(message) {
 *   // take action for this message
 * });
 * 
 * As you can see we can use the on method directly inherited from its prototypal 
 * grandparent, EventEmitter.
 */