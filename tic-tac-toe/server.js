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


    // Player marked grid.
    socket.on('grid marked', function(id) {
        var roomNum   = socket._rooms[0];
        var playerKey = socket._rooms[1];
        var room      = getRoom(roomNum);
        var mark      = '';
        var isPlayersTurn = players[playerKey].isPlayerTurn == true;

        //player turn lock
        console.log(isPlayersTurn)
        if (isPlayersTurn)
            console.log('Grid Marked: %s', id);
        else {
            console.log("not players turn");
            return;
        }

        if(room.grid == null)
            room.grid = [];


        //back end Lock for existing marks
        if (room.grid[id] != null) {
            console.log("grid taken by player already");
        } else if (room.grid[id] == null) {
            room.grid[id] = playerKey;
            console.log("room.grid[id]: %s",room.grid[id])
            
        }

        




        if (room.player1Key == playerKey) {
            mark = 'X';
            players[room.player2Key].setTurn(true);
            players[room.player1Key].setTurn(false);
            io.sockets.in(roomNum).emit('player turn', players[room.player2Key].getName);

        }
        else if (room.player2Key == playerKey) {
            mark = 'O';
            players[room.player2Key].setTurn(false);
            players[room.player1Key].setTurn(true);
            io.sockets.in(roomNum).emit('player turn', players[room.player1Key].getName);

        }
        else
            mark = "ERROR OCCURED in socket.on(\'grid marked\')";

        io.sockets.in(roomNum).emit('mark grid',id, mark);
        var winner = checkForWinner(room, playerKey);

        if (winner != null) {
            io.sockets.in(roomNum).emit('winner!', winner.getName);

            setTimeout(function () {
                room.grid = [];
                io.sockets.in(roomNum).emit('clear grid');

                //if no players have left within these 3 seconds we can run this function to end.
                if (players[room.player2Key] == null || players[room.player1Key] == null)
                    return;

                if (players[room.player2Key].isPlayerTurn)
                    io.sockets.in(roomNum).emit('player turn', players[room.player2Key].getName);
                else if (players[room.player1Key].isPlayerTurn)
                    io.sockets.in(roomNum).emit('player turn', players[room.player1Key].getName);

            }, 3000);
        }

    });


    // Disconnect
    socket.on('disconnect', function (data) {
        var key           = socket._rooms[1]; // uuid
        var player        = players[key];
        var roomNum       = socket._rooms[0];
        var room          = getRoom(roomNum); 

        connections.splice(connections.indexOf(socket), 1); // remove socket from connections

        if (connections.length == 0) // note for some reason when last connection disconnects the length is sometimes 1 or 0
            rooms = [];              // further research i have discovered that this happens on a refresh
                                     // doing a refresh crashes the application if there is only 1 player on the server

        deletePlayer(key); // delete player from players array
        console.log('Disconnected: %s sockets connected', connections.length);

        if (room == null) 
            return;
        
        room.grid = [];
        io.sockets.in(roomNum).emit('clear grid');

        room.names.splice(room.names.indexOf(socket.username), 1);

        if (room.player1Key === key) { // player 1 left
            room.player1Key = room.player2Key;
            room.player2Key = '';
        } else if (room.player2Key === key) { // player 2 left
            players[room.player1Key].setTurn(false);
        }
        
        if (room.names.length == 0) {
            // this fires on refresh page error
            console.log('room has no names')
            room = null;
        }





        setPlayerTurn (0, false, room); // setting player 1's turn to false if they exist.

    });

    function updateServer(socket) {
            var key, player;

            // *base case: if there are no rooms then create one
            if (rooms.length == 0) {
                player = createRoom('1', socket); // a new User object to be returned by this function.
                var users = [];
                users.push(socket.username);
                io.sockets.in('1').emit('get users', users);
            } else 
                player = findRoomForUser(socket);

            key = player.getUUID;
            players[key] = player;
    }


});




/******************************************************************************
                            UTILITY FUNCTIONS
******************************************************************************/

function checkForWinner(room, playerKey) {
    var grid = room.grid;

    var row1 = grid[1] == grid[2] && grid[2] == grid[3] && grid[3] != null;
    var row2 = grid[4] == grid[5] && grid[5] == grid[6] && grid[6] != null;
    var row3 = grid[7] == grid[8] && grid[8] == grid[9] && grid[9] != null;

    var col1 = grid[1] == grid[4] && grid[4] == grid[7] && grid[7] != null;
    var col2 = grid[2] == grid[5] && grid[5] == grid[8] && grid[8] != null;
    var col3 = grid[3] == grid[6] && grid[6] == grid[9] && grid[9] != null;

    var diagonal1 = grid[1] == grid[5] && grid[5] == grid[9] && grid[9] != null;
    var diagonal2 = grid[3] == grid[5] && grid[5] == grid[7] && grid[7] != null;

    if (row1 == true || row2 == true || row3 == true ||
        col1 == true || col1 == true || col1 == true ||
        diagonal1 == true || diagonal2 == true
    )
        return players[playerKey];
    else
        return null;

}

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


    room = getRoom(roomName);  // returns the room the player was
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


/**
 * Deletes a player from the players array and updates the client side list of users.
 * @param {string} key - the uuid of the player.
 */
function deletePlayer(key) {
        console.log("Attempting to delete a player");
        var user = players[key];
        console.log(user);
        if (user == null) // undefined
            return;
        var roomNum = user.getRoomNum;
        var username = user.getName;
        io.sockets.in(roomNum).emit('remove user', username);
        io.sockets.in(roomNum).emit('player left');

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
    var room;               // Room object.
    var roomNotFound = true;
    var roomNum = '';


    for (let roomName of rooms) { // Searching for a room to put the player in.
        room = getRoom(roomName);
        if (room == null) 
            break;

        if(room.length < 2) {
            roomNotFound = false;
            roomNum = roomName;
            break;
        }
    }


    if (roomNotFound) { 
        // Then Create a new room and put the user in it.
        player = createRoom((rooms.length+1).toString(), socket);
        var userNames = getRoom(player.getRoomNum).names;
        updateUsernames(player.getRoomNum, userNames)
    } else {
        // find a room for the user.
        // note: sometimes i have empty room nums laying around but this does not affect the system.

        socket.join(roomNum); // Join the 'player' or socket into the room.

        room = getRoom(roomNum);

        // If we have two players
        if (room.length === 2) { 

            // then allow player1 to take a turn,
            var player1Key = room.player1Key;
            players[player1Key].setTurn(true);
            players[player1Key].setPlayingStatus(true);
            
            //notify the clients its player1's turn to go in the room,
            io.sockets.in(roomNum).emit('player turn', players[player1Key].getName);

            // and create the second player.
            var player2Key = uuid.v1();
            room.player2Key = player2Key;
            player = new User(socket.username, player2Key);
            room.names.push(socket.username);
            updateUsernames(roomNum, room.names);
            player.setPlayingStatus(true);


        } else console.log("error on line 225!");


        // setting room number of newly joined player.
        player.setRoom(roomNum);


        // unused storage component ._rooms, at disconnect we can id which player left (._rooms[1]) 
        // and from what room (._rooms[0]).
        socket._rooms.push(roomNum);
        socket._rooms.push(player.getUUID);

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
function getRoom(roomName) {
    return io.nsps['/'].adapter.rooms[roomName];
}


/**
 * Set player turn.
 *
 * @param {number} player - 0 for player 1, 1 for player 2
 * @param {bool}   turn   - false for no turn, true for player's turn to go
 * @room  {Room}   room   - the room containing the player sockets
 **/
function setPlayerTurn (player, turn, room) {
    if (room == null)
                return;

    var playerKey;
    if (player == 0) 
        playerKey = room.player1Key;
    else if (player == 1) 
        playerKey = room.player2Key;
    
    players[playerKey].setTurn(true);

}


/**
 * Updates usernames in the client end.
 * 
 * @param {string} roomNum - the room number the users are in.
 * @param {string[]} users - the user names from a room.
 */
function updateUsernames(roomNum, users) {
    io.sockets.in(roomNum).emit('get users', users);
}



/******************************************************************************
                         END OF UTILITY FUNCTIONS
******************************************************************************/