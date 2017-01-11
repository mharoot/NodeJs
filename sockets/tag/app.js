var express = require('express');
var app     = express();
var server  = require('http').createServer(app);
var io      = require('socket.io').listen(server);
connections = [];
server.listen(process.env.PORT || 3000);

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html')
});

io.sockets.on('connection', function (socket) {
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);

    if (connections.length > 2) {
        connections[connections.length - 1].emit('change player color', "green"); // just one players color change not all so im using socket.
    }
    // Disconnect
    socket.on('disconnect', function (data) {
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected: %s sockets connected', connections.length);
    });


    // Send Player Movement to other clients in the server.
    socket.on('new player', function (pos, color) {
        io.sockets.emit('new player pos', pos , color);
    });

    // updating a player position
    socket.on('update player pos', function (oldPos, newPos, color) {
        io.sockets.emit('a player moved', oldPos, newPos, color);
    });

    socket.on('tag your it', function (oldPos, newPos) {
        io.sockets.emit('swap colors', oldPos, newPos);
    });

});

