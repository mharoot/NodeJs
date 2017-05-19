//main
var express = require('express');
var app     = express();
var server  = require('http').createServer(app);
var io      = require('socket.io').listen(server);
var deck = [];
var nCards = 52;
connections = [];
server.listen(process.env.PORT || 3000);

app.use(express.static('public'));







/*
--------------------------------------------------------------------------------
                    testing routing functions
--------------------------------------------------------------------------------
*/
// simple get request using response.send to create text or html
app.get('/test', function (request, response) {
    response.send("<h1>test</h1>");
});

// simple get request using response.write to create text or html
app.get('/test-response-body', function (request, response) {
    response.write('<html>');
    response.write('<body>');
    response.write('<h1>Hello, World!</h1>');
    response.write('</body>');
    response.write('</html>');
    response.end();// end() can take input before ending the response:
                   // response.end('</html>');
                   // we always call end otherwise the browser runs in an
                   // endless loop
});


// passing single parameter get request localhost:3000/test-parameter-id/3
app.get('/test-parameter-id/:id', function (req, res) {
    res.send('id: ' + req.params.id); //outputs id: 3
    //after a send it ends.  you can't use a send after a send.
});

// marks a card as played localhost:3000/card-played/1s
//                                                   1s = ace of spades
app.get('/card-played/:card', function (req, res) {
    var card = req.params.card;
    res.send('card that was played: ' + card);
    deck[card] = true;
});

// prints html list of all cards played marked true, false if otherwise.
app.get('/cards-played', function(req, res) {
    res.write('<html>');
    res.write('<body>');
    res.write('<ul>');
    for (card in deck) {
        res.write('<li>');
        res.write(card + ": " + deck[card]);
        res.write('</li>');
    }
    res.write('</ul>');
    res.write('</body>');
    res.write('</html>');
    res.end();
});


app.get('/shuffle-deck', function (req, res) {
    deck = ['1c','1d','1h','1s',
            '2c','2d','2h','2s',
            '3c','3d','3h','3s',
            '4c','4d','4h','4s',
            '5c','5d','5h','5s',
            '6c','6d','6h','6s',
            '7c','7d','7h','7s',
            '8c','8d','8h','8s',
            '9c','9d','9h','9s',
            '10c','10d','10h','10s',
            'jc','jd','jh','js',
            'qc','qd','qh','qs',
            'kc','kd','kh','ks'
    ]; // 52 card deck

    for(i = 0; i < 51; i++) {
        shuffleCard(res);
    }
    res.write("deck size = "+deck.length);
    res.end();
});

// start a new game after each round
app.get('/new-game-true-false-implementation', function (req, res) {
    nCards = 52;
    deck['1c'] = false; // ace of clover
    deck['1d'] = false; // ace of diamond
    deck['1h'] = false; // ace of heart
    deck['1s'] = false; // ace of spade
    deck['2c'] = false; // 2 of clover
    deck['2d'] = false; // 2 of diamond
    deck['2h'] = false; // 2 of heart
    deck['2s'] = false; // 2 of spade
    deck['3c'] = false; // 3 of clover
    deck['3d'] = false; // 3 of diamond
    deck['3h'] = false; // 3 of heart
    deck['3s'] = false; // 3 of spade
    deck['4c'] = false; // 4 of clover
    deck['4d'] = false; // 4 of diamond
    deck['4h'] = false; // 4 of heart
    deck['4s'] = false; // 4 of spade
    deck['5c'] = false; // 5 of clover
    deck['5d'] = false; // 5 of diamond
    deck['5h'] = false; // 5 of heart
    deck['5s'] = false; // 5 of spade
    deck['6c'] = false; // 6 of clover
    deck['6d'] = false; // 6 of diamond
    deck['6h'] = false; // 6 of heart
    deck['6s'] = false; // 6 of spade
    deck['7c'] = false; // 7 of clover
    deck['7d'] = false; // 7 of diamond
    deck['7h'] = false; // 7 of heart
    deck['7s'] = false; // 7 of spade
    deck['8c'] = false; // 8 of clover
    deck['8d'] = false; // 8 of diamond
    deck['8h'] = false; // 8 of heart
    deck['8s'] = false; // 8 of spade
    deck['9c'] = false; // 9 of clover
    deck['9d'] = false; // 9 of diamond
    deck['9h'] = false; // 9 of heart
    deck['9s'] = false; // 9 of spade
    deck['10c'] = false; // 10 of clover
    deck['10d'] = false; // 10 of diamond
    deck['10h'] = false; // 10 of heart
    deck['10s'] = false; // 10 of spade
    deck['jc'] = false; // jack of clover
    deck['jd'] = false; // jack of diamond
    deck['jh'] = false; // jack of heart
    deck['js'] = false; // jack of spade
    deck['qc'] = false; // queen of clover
    deck['qd'] = false; // queen of diamond
    deck['qh'] = false; // queen of heart
    deck['qs'] = false; // queen of spade
    deck['kc'] = false; // king of clover
    deck['kd'] = false; // king of diamond
    deck['kh'] = false; // king of heart
    deck['ks'] = false; // king of spade
    res.send("new game");
});

function shuffleCard(res, shuffleDeck) {
    var timeStamp = Math.floor(Date.now() / 1000);
    var a = Math.floor(Math.random()*10000);
    var b = Math.floor(Math.random()*10000);
    var primeNum = 19;
    var randomHashIndex = (((a*timeStamp)+ b)%primeNum)%deck.length;
    var card = deck.splice(randomHashIndex, 1); // remove 1 at random position
    deck.push(card[0]);
    res.write("timestamp: " + timeStamp+", random hash index: "+randomHashIndex+", card: "+card[0]);

}


// randomized dealing of cards using a timestamp and hash to replicate true
// randomization
app.get('/deal-cards', function(req, res) {
    var nPlayers = 4; // get from connections array length
    var p1Hand = [], p2Hand = [], p3Hand = [], p4Hand = [];

    for(i = 0; i < 5; i++) { // deal 5 cards per player

        // start game if enough players
        if(nPlayers > 1) {
            p1Hand.push(deck.pop());
            p2Hand.push(deck.pop());
        }

        if(nPlayers > 2)
            p3Hand.push(deck.pop());
        if(nPlayers > 3)
            p4Hand.push(deck.pop());
    }
    res.write("<html>");
    res.write("p1Hand: ["+p1Hand[0]+", "+p1Hand[1]+", "+p1Hand[2]+", "+p1Hand[3]+", "+p1Hand[4]+"]</br>");
    res.write("p2Hand: ["+p2Hand[0]+", "+p2Hand[1]+", "+p2Hand[2]+", "+p2Hand[3]+", "+p2Hand[4]+"]</br>");
    res.write("p3Hand: ["+p3Hand[0]+", "+p3Hand[1]+", "+p3Hand[2]+", "+p3Hand[3]+", "+p3Hand[4]+"]</br>");
    res.write("p4Hand: ["+p4Hand[0]+", "+p4Hand[1]+", "+p4Hand[2]+", "+p4Hand[3]+", "+p4Hand[4]+"]</br>");
    res.end("</html>");

});


/*
--------------------------------------------------------------------------------
                    END OF testing routing functions
--------------------------------------------------------------------------------
*/







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

    if (connections.length === 2) {
        io.sockets.emit('new game', function () { //when using io.sockets.emit its broadcasting.

        });
        connections[0].emit('new hand' function)
    } else if (connections.length === 3) {
         io.sockets.emit('new game', function () {

         });
     } else if (connections.length === 4) {
        io.sockets.emit('new game', function () {

        });
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

/*
--------------------------------------------------------------------------------
                    END OF SocketIO On Connection
--------------------------------------------------------------------------------
*/