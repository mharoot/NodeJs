# Binding a Server to a TCP Port
- TCP scoket connections consits of two endpoints.  One binds to a numbered port while the other connects to a port.
- This is a lot like a telephone system.  One phone binds a given phone number for a long time.  A second phone places a call--it connects to the bound number.  Once the call is answered, information (sound) can travel both ways.
- In Node.js, the bind and connect operations are provided by the net module.
-------------------------------------------------------------------------------

# bindServerTCP.js
- open port 5432 before running: sudo iptables -I INPUT -p tcp --dport 5432 -j ACCEPT
- install telenet
- node --harmony bindServerTCP.js
- open another terminal and run: telnet localhost:5432
