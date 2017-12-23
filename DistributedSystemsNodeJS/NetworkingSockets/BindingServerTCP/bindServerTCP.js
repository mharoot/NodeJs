'use strict';
let connections = [];
const 
  port = 5432,
  net = require('net'),
  server = net.createServer(function (connection) {
    // use connection object for data transfer
    connections.push(connection);
    console.log("Client connected. Total clients: " + connections.length );
    
    connection.on('end', () => {
        console.log('client disconnected');
        connections.splice(connections.indexOf(connection), 1);
        console.log("Client disconnected. Total clients: " + connections.length );

    });

    connection.write('hello\r\n');

    connection.pipe(connection);

    

  });

server.on('error', (err) => {
  throw err;
});

server.listen(port, () => {
    console.log("server bound to TCP Port Number: " + port);
});
