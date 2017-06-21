# Tic-Tac-Toe Client Server Game Using Socket IO

Requirements:
--------------------------------------------------------------------------------
1. Have the latest version of node js and npm in order to use User class which uses
the ES6 syntax.
2. If you use earlier versions of node js you may want to use a transpiler.  Take a look at <a href="https://babeljs.io/">Babel.</a>

System Design:
--------------------------------------------------------------------------------
1. server.js
    - Two players per a <a href="https://socket.io/docs/rooms-and-namespaces/">Room.</a>
    - A player is a **User** object found in the **classes** directiory.
    - Every player has a unique **roomSocketId** that is used as a key.
    - Readers may be wondering why not use **socket.id**?  If your testing this
    system at home then every time you connect a client using any home device 
    the socket.id will remain the same.  However, the  <a href="https://socket.io/docs/rooms-and-namespaces/">room</a> holds two unique socket ids. 
    This may pose a few problems because when a player leaves a room and if another 
    player was in the room then that player will have to wait until
    another client connects or until all the other previous rooms are filled. 
    Should there be another waiting client, we can then join both
    those players into an empty room and assign them new key values, remembering to remove
    the old ones which can be done in O(1) time since we are using key value pairs.
    
2. classes/User.js
    - A placeholder for a player using ES6 syntax.
    
BUGS:
--------------------------------------------------------------------------------
    1. When 3 players connect, and all disconnect.  
    The rooms var is not being cleared. (fixed)
    
FIXED BUGS:
--------------------------------------------------------------------------------
    1. Fix for bug #1 was just a code arrangement issue.  After creating the 
    { function setPlayerTurn() } it was easy to see that the return function was
    ending the code before the execution.
    
    
    