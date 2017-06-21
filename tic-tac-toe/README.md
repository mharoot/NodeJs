# Tic-Tac-Toe Client Server Game Using Socket IO


System Design:
--------------------------------------------------------------------------------
1. Two players per a <a href="https://socket.io/docs/rooms-and-namespaces/">Room.</a>


BUGS:
--------------------------------------------------------------------------------
    1. When 3 players connect, and all disconnect.  
    The rooms var is not being cleared. (fixed)
    
FIXED BUGS:
--------------------------------------------------------------------------------
    1. Fix for bug #1 was just a code arrangement issue.  After creating the 
    { function setPlayerTurn() } it was easy to see that the return function was
    ending the code before the execution.