var express     = require('express');
var app         = express();
var server      = require('http').createServer(app);
var io          = require('socket.io').listen(server);
var users       = []; // holds all user names
var connections = []; // holds all user socketed connections
var rooms       = []; // holds all room names and is to be implemented like a stack
server.listen(process.env.PORT || 3000);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html')
});

io.sockets.on('connection', function (socket) {
    var nConnections   = connections.length + 1;
    var noRoomsCreated = rooms.length == 0; 
    var roomIsFull     = nConnections % 5 == 0 && nConnections > 4;


    if (noRoomsCreated) 
        rooms.push(0); // push room 0
    else if (roomIsFull)
        rooms.splice(0,0,rooms.length); // add a new room
    
    var roomName = rooms[0]; // using splice to add the rest of the rooms 
                             // allows me to peek like this.

    socket.join(roomName);    // join the socket into the room called #
    connections.push(socket); // pushing socket after the joining to room.


    // Disconnect
    socket.on('disconnect', function (data) {
        users.splice(users.indexOf(socket.username));
        connections.splice(connections.indexOf(socket), 1);
        updateUsernames();
        console.log('Disconnected: %s sockets connected', nConnections);
    });


    // Send Message
    socket.on('send message', function (data) {
        //io.sockets.emit('new message', {msg: data, user: socket.username} );
        io.sockets.in(roomName).emit('new message', {msg: data, user: socket.username} );
    });

    // New user
    socket.on('new user', function (data, callback) {
        callback(true);
        socket.username = data;
        users.push(socket.username);
        updateUsernames();
    });


    // note this  function only works for the last subset for each and 
    // every new room.
    function updateUsernames() {
        //io.sockets.emit('get users', users);

        if (nConnections > 4) {
            
            var nUsersInRoom      = nConnections%4;
            var startPos          = nConnections - nUsersInRoom;
            var tempUsers         = users;
            var subsetOfUsers = tempUsers.splice(startPos, nUsersInRoom);
            io.sockets.in(roomName).emit('get users', subsetOfUsers);
            newRoomFull = false;
            
        } else
            io.sockets.in(roomName).emit('get users', users);
    }
});

