"use strict";

const User        = require('./classes/User.js');
const express     = require('express');
const app         = express();
const server      = require('http').createServer(app);
const io          = require('socket.io').listen(server);
const uuid        = require('uuid');


let connections = []; // holds all user socket connections
let rooms       = []; // holds all rooms
let players     = []; // holds all of our class User objects, using key value
                      // to achieve a running time of O(1).


server.listen(process.env.PORT || 3000);
app.use(express.static('public'));

/*
--------------------------------------------------------------------------------
                    SocketIO On Connection
--------------------------------------------------------------------------------
*/

// entry point of connection
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html')
});



// on connection
io.sockets.on('connection', function (socket) {
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);


    // New user
    socket.on('new user', function (username, callback) {
        callback(true);
        socket.username =  username;
        updateServer(socket);
    });




    // Disconnect
    socket.on('disconnect', function (data) {
        //console.log(socket._rooms);
        var key           = socket._rooms[1];
        var player        = players[key];
        var room          = getSocketsFromRoom(socket._rooms[0]); // i used rooms to store a room number, lets store the
                                                                  // roomSocketId as well in rooms can be accesed by using
                                                                  // socket._rooms[1]



        //socket.leave(players[key].getRoom);
        //Question: Is it good practice to leave a room before removing a socket?
            // - It doesn't seem like it makes a difference
        var removedSocket = connections.splice(connections.indexOf(socket), 1);
        if (connections.length == 0) {
            console.log('clearing rooms');
            rooms = [];
            //players = [];
        }
        if (room == null) {
            deletePlayer(key);
            console.log('Disconnected: %s sockets connected', connections.length);
            return;
        }

        room.names.splice(room.names.indexOf(socket.username), 1);
        if (room.player1Key === key) {
            room.player1Key = room.player2Key;
            room.player2Key = '';
        }
        
        if (room.names.length == 0) {
            console.log('room has no names')
            room = null;
        }
        deletePlayer(key);



        console.log('Disconnected: %s sockets connected', connections.length);




        setPlayerTurn (0, false, room); // setting player 1's turn to false if they exist.

    });

    function updateServer(socket) {
            // base case 1: if there are no rooms then create one
            var key, player;
            if (rooms.length == 0) {
                player = createRoom('1', socket); // a new User to be returned by this function.
                var users = [];
                users.push(socket.username);
                updateUsernames('1', users);
            } else {
                player = findRoomForUser(socket);
            }

            key = player.getRoomSocketId;
            players[key] = player;
            players[key].toString(); // prints the player
            console.log("logging all players");
            console.log(players);
            console.log("logging room of player");
            console.log(getSocketsFromRoom(player.getRoom));
    }

    function updateUsernames(roomName, users) {
        io.sockets.in(roomName).emit('get users', users);
    }
});























/******************************************************************************
                            UTILITY FUNCTIONS
******************************************************************************/

/**
 * Creates a new room and joins a player socket into a Room object.
 *
 *@param {char} roomName - the number of the room
 *@param {socket} socket - the client socket used to join a room.
 *@return new User('name: ' + roomSocketId, roomSocketId);
 **/

function createRoom(roomName, socket) {
    var key;    // will be the roomSocketId now
    var player; // new User("name: "+key, key);
    var room;   // a Room Object.

    rooms.push(roomName);     // create a new room store in our rooms place holder.
    socket.join(roomName);    // join the socket into the room.


    room = getSocketsFromRoom(roomName);  // returns the room the player was
                                          // just placed in.

    room.names = [];                      // create the names array inside the new room
    room.names.push(socket.username);     // add the first name into the new room

    key = uuid.v1();

    player = new User(socket.username, key); // create the new User based on the
                                            // key = room socket id

    player.setRoom(roomName); // update the room variable in player.

    socket._rooms.push(roomName); // pushing to in a socket so id it at
                                  // disconnect we can id it
    socket._rooms.push(key); // Because ._rooms is an unused array,
                             // I can use it as storage for the roomSocketId
    room.player1Key = key;


    return player;
}

function deletePlayer(key) {
        console.log("Attempting to delete a player");
        var user = players[key];
        console.log(user);
        if (user == null) // undefined
            return;
        var room = user.getRoom;
        var username = user.getName;
        io.sockets.in(room).emit('remove user', username);

        delete players[key];

}

/**
 *
 * Finds a room for a user.
 *
 * @param socket - a user socket to join the client to the room.
 *
 * @return new User('name: ' + roomSocketId, roomSocketId);
 *
 **/
function findRoomForUser(socket) {
    var player; 
    var room;               
    var roomNotFound = true;
    var roomNum = '';

    for (let roomName of rooms) { // Searching for a room to put the player in.
        room = getSocketsFromRoom(roomName);
        console.log(room);
        if (room == null) 
            break;

        if(room.length < 2) {
            roomNotFound = false;
            roomNum = roomName;
            break;
        }
    }

    if (roomNotFound) { // Then Create a new room and put the user in it.
        player = createRoom((rooms.length+1).toString(), socket);
        var userNames = getSocketsFromRoom(player.getRoom).names;
        io.sockets.in(player.getRoom).emit('get users', userNames);
    } else {
        // note: sometimes i have empty room nums laying around

        socket.join(roomNum); // Join the 'player' or socket into the room.

        let room = getSocketsFromRoom(roomNum); // Room object.

        if (room.length === 2) { // if we have two players

            // todo : Then allow player1 to make a move.
            var player1Key = room.player1Key;
            players[player1Key].setTurn(true); // allow player1 to take a turn


            // Creating second player.
            var player2Key = uuid.v1();
            room.player2Key = player2Key;
            player = new User(socket.username, player2Key);
            room.names.push(socket.username);
            console.log("log of room names");
            console.log(room.names);
            console.log("log of room collection");
            console.log(room);
            io.sockets.in(roomNum).emit('get users', room.names);


        } else console.log("error on line 243!");
         /*
        this shouldn't even run it was a mistake!'
        else if (room.length === 1) { // else if we only have 1 player then
               // get the player1Key and create the first player Use object.
               // due to the earlier note

             var player1Key = getRoomSocketIdOfUser(room, 0); // Returns roomSocketId
             player = new User(socket.username, player1Key);
             var users = [];
             users.push(socket.username);
             updateUsernames(roomNum, users);

        }*/

        
        player.setRoom(roomNum);     // setting room number of newly joined player.

        socket._rooms.push(roomNum); // pushing to in a socket so at disconnect we can id it easily

        // todo: change the .getRoomSocketId to getUUID in the user class.
        socket._rooms.push(player.getRoomSocketId); // Because ._rooms is an
                                                    // unused array, I can use
                                                    // it as storage for the
                                                    // roomSocketId

    }

    return player;


}

/**
 * @return a collection {} containing a collection {} of sockets, and an int
 *         length.
 *
 * @return example
 *   Room {
 *       sockets: { V0Pz3cQd3eSXJt_yAAAA: true, b2llVDEsXyZjAfjpAAAB: true },
 *       length: 2
 *   }
 **/
function getSocketsFromRoom(roomName) {
    return io.nsps['/'].adapter.rooms[roomName];
}


/**
 * @param {Room}   room   - a room filled with at most 2 players
 * @param {number} player - a param of 0 return's roomSocketId of first player.
 * @param {number} player - a param of 1 return's roomSocketId of second player.
 *
 **/
function getRoomSocketIdOfUser(room, player) {
    return Object.keys(room.sockets)[player];
}

/**
 * Set player turn.
 *
 * @param {number} player - 0 for player 1, 1 for player 2
 * @param {bool}   turn   - false for no turn, true for player's turn to go
 * @room  {Room}   room   - the room containing the player sockets
 **/
function setPlayerTurn (player, turn, room) {
    if (room === undefined)
                return;

    if(room.length === 2) {
        var player1 = getRoomSocketIdOfUser(room, 0); // This gets the room socket id of 1st player.
        players[player1].setTurn(false);
    }
}

/******************************************************************************
                         END OF UTILITY FUNCTIONS
******************************************************************************/








































































































/******************************************************************************
                                  CLASS TESTS
******************************************************************************/
app.get('/test-user-class', function (req, res) {
    // Instantiate User:
    let players = [
    new User('Michael Harootoonyan', 'socket id goes here'),
    new User('Marvin Harootoonyan', 'socket id goes here')
    ];
    players[0].toString();
    players[1].toString();
    res.end('check command console for toString() test');
});

app.get('/json', function (req, res) {
var x;
let myObj = [  {
                nsp:
                  {
                   name: '/',
                   server: [Object],
                   sockets: [Object],
                   connected: [Object],
                   fns: [],
                   ids: 0,
                   rooms: [],
                   flags: {},
                   adapter: [Object],
                   _events: [Object],
                   _eventsCount: 1 },
                server:
                  {
                   nsps: [Object],
                   _path: '/socket.io',
                   _serveClient: true,
                   parser: [Object],
                   encoder: {},
                   _adapter: [],
                   _origins: '*:*',
                   sockets: [Object],
                   eio: [Object],
                   httpServer: [Object],
                   engine: [Object] },
                adapter:
                  {
                   nsp: [Object],
                   rooms: [Object],
                   sids: [Object],
                   encoder: {} },
                id: 'jLrGTjLRigoy7Cb5AAAA',
                client:
                  {
                   server: [Object],
                   conn: [Object],
                   encoder:  {},
                   decoder: [Object],
                   id: 'jLrGTjLRigoy7Cb5AAAA',
                   request: [Object],
                   onclose: [ ],
                   ondata: [ ],
                   onerror: [ ],
                   ondecoded: [ ],
                   sockets: [Object],
                   nsps: [Object],
                   connectBuffer: [] },
                conn:
                  {
                   id: 'jLrGTjLRigoy7Cb5AAAA',
                   server: [Object],
                   upgrading: false,
                   upgraded: false,
                   readyState: 'open',
                   writeBuffer: [],
                   packetsFn: [],
                   sentCallbackFn: [],
                   cleanupFn: [Object],
                   request: [Object],
                   remoteAddress: '::1',
                   checkIntervalTimer: null,
                   upgradeTimeoutTimer: null,
                   pingTimeoutTimer: [Object],
                   transport: [Object],
                   _events: [Object],
                   _eventsCount: 3 },
                rooms: {},
                acks: {},
                connected: true,
                disconnected: false,
                handshake:
                 { headers: [Object],
                   time: 'Mon Jun 19 2017 15:43:33 GMT-0700 (PDT)',
                   address: '::1',
                   xdomain: false,
                   secure: false,
                   issued: 1497912213173,
                   url: '/socket.io/?EIO=3&transport=polling&t=Lp2Xds8',
                   query: [Object] },
                fns: [],
                flags: {},
                _rooms: [] } ];

x = myObj;
console.log('the client id is: ' + x[0].client.id);
console.log(x[0].socket);
res.end(x);
});

/******************************************************************************
                                END OF CLASS TESTS
******************************************************************************/



