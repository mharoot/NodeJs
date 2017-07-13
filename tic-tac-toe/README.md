# Tic-Tac-Toe Client Server Game Using Socket IO

Requirements:
--------------------------------------------------------------------------------
1. Have the latest version of node js and npm in order to use the <a href="https://github.com/mharoot/NodeJs/blob/master/tic-tac-toe/classes/User.js">User</a> class which uses
the ES6 syntax.
2. If you use earlier versions of node js you may need to use a transpiler.  Take a look at <a href="https://babeljs.io/">Babel.</a>

System Design:
--------------------------------------------------------------------------------
1. server.js
    - Two players per a <a href="https://socket.io/docs/rooms-and-namespaces/">Room.</a>
    - A player is a **User** object found in the **classes** directory.
    - Every player has a unique user id **UUID** that is used as a key.
    - All sockets on connection also fill the **socket._rooms** array with two items.  One item
     is the room number and the other is the unique user id using the UUID in npm.

2. classes/User.js
    - A placeholder for a player using ES6 syntax.
    
BUGS:
--------------------------------------------------------------------------------
    1. When 3 players connect, and all disconnect.  
    The rooms var is not being cleared. (fixed)
    2. Using the roomSocketId was not reliable. (fixed)
    Detail of old system design that caused this bug:
        - All sockets on connection also fill the **socket._rooms** array with two items.  One item
        is the room number and the other is the **room socket id** of the User.  Should a user
        ever join a new room, we have to update the **socket._rooms** array to include the new room
        number and new room id socket.  Readers may be wondering why use socket._rooms in this way.  I saw that
        the array was never being used and decided to use it as a storage compartment for a room number and 
        user room socket id.  This made it easier on disconnection to delete the right player
        from the **players** array.
        - Readers may be wondering why not use **socket.id**?  If your testing this
        system at home then every time you connect a client using any home device 
        the socket.id will remain the same.  However, the  <a href="https://socket.io/docs/rooms-and-namespaces/">room</a> holds two unique socket ids. 
        This may pose a few problems because when a player leaves a room and if another 
        player was in the room then that player will have to wait until
        another client connects or until all the other previous rooms are filled. 
        Should there be another waiting client, we can then join both
        those players into an empty room and assign them new key values, remembering to remove
        the old ones which can be done in O(1) time since we are using key value pairs.
    
FIXED BUGS:
--------------------------------------------------------------------------------
    1. Fix for bug #1 was just a code arrangement issue.  After creating the 
    { function setPlayerTurn() } it was easy to see that the return function was
    ending the code before the execution.
    2. Fix for bug #2 was using the uuid from npm.  Specifically the v1 function
    where it uses a timestamp for the unique users id.  Using the **room socket id**
    was not the correct approach since it changes for a connected player when 
    another player disconnects.
    
    
    