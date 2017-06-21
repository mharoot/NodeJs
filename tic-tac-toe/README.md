# Tic-Tac-Toe Client Server Game Using Socket IO


System Design:
--------------------------------------------------------------------------------
1. Two players per a <a href="https://socket.io/docs/rooms-and-namespaces/">Room.</a>


BUGS:
--------------------------------------------------------------------------------
    1. When 3 players connect, and all disconnect.  
    The rooms var is not being cleared.
    