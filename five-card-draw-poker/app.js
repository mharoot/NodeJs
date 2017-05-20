//main
var express     = require('express');
var app         = express();
var server      = require('http').createServer(app);
var io          = require('socket.io').listen(server);
var connections = []; // holds all user socketed connections
var deck        = []; // holds all cards in a 52 card deck
var nCards      = 52;
var playerScore = []; 
var playerTurn  = []; // holds socket id of player as key and has value
                     // true if they had a turn for the second draw

var noRoundInProgress = true;

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
            'tc','td','th','ts',
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

// start a new game after each round not using for program
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
    deck['tc'] = false; // 10 of clover
    deck['td'] = false; // 10 of diamond
    deck['th'] = false; // 10 of heart
    deck['ts'] = false; // 10 of spade
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

    if(connections.length == 4) { // no more than 4 players allowed on server
        //reject connection
        console.log('too many players trying to get on server');
        return 1;
    }
    connections.push(socket);
    playerScore[socket.id] = 0;
    console.log('Connected: %s sockets connected', connections.length);

    // new hand for user, draw 5 cards from deck for a user
    if(noRoundInProgress && connections.length > 1) {
        newGame();
        noRoundInProgress = false;
        for(i = connections.length; i > 0; i--) {
            var userSocket = connections[connections.length-i];
            userSocket.emit('new hand', {userHand: deck.splice(0,5),
                playerScore: playerScore[userSocket.id]});
            playerTurn[userSocket.id] = false;
        }
    } 
    



    //replace old cards if any are discarded
    socket.on('remove cards', function(data) {
        var roundIsFinished = true;
        //console.log("socket id:"+socket.id);
        if(playerTurn[socket.id]) {return 0;}
        else {playerTurn[socket.id] = true;}

        var nRemovedCards = 0;
        var i = 0;
        var newHand = [];
        for(card in data.userHand) {
            if(data.hand[i]) // push old card back in new hand
                newHand.push(deck.splice(0,1));
            else // push old card back in new hand
                newHand.push(data.userHand[card]);
            i++;
        }
        var handStrength = getHandStrength(newHand);
        playerScore[socket.id] += handStrength;
        socket.emit('new hand', {userHand: newHand, playerScore: playerScore[socket.id]});
        
        

        for(key in playerTurn) 
            if (!playerTurn[key])// a player has not yet had a turn
                roundIsFinished = false;
        
        if (roundIsFinished) {
            // 1. update score of winner if there is one
            // if there is a draw don't update anyones score.
            // 2.start new game happens instantly.
            
            noRoundInProgress = true;
            newGame();
            for(key in playerTurn) 
                playerTurn[key] = false;

            for(i = connections.length; i > 0; i--) {
                var userSocket = connections[connections.length-i];
                userSocket.emit('new hand', {userHand: deck.splice(0,5),
                    playerScore: playerScore[userSocket.id]});
            }
        }
    });



    // util functions

    function convertForSort(playerHand) {
        var convertedHand = [];
        var hand = [playerHand[0][0],playerHand[1][0],playerHand[2][0],playerHand[3][0],playerHand[4][0]]
        for(var i = 0; i < hand.length; i++) {
            switch(hand[i]) {
                case 't': 
                    convertedHand.push(10);
                    break;
                case 'k':
                    convertedHand.push(13);
                    break;
                case 'q':
                    convertedHand.push(12);
                    break;
                case 'j':
                    convertedHand.push(11);
                    break;
                default:
                    convertedHand.push(hand[i][0]);

            }
        }
        return convertedHand;
    }
    function getHandStrength(playerHand) {

    var cKQJ10 = playerHand.indexOf("kc")  > -1
                && playerHand.indexOf("qc")  > -1
                && playerHand.indexOf("jc")  > -1
                && playerHand.indexOf("tc") > -1;
    var dKQJ10 = playerHand.indexOf("kd")  > -1
                && playerHand.indexOf("qd")  > -1
                && playerHand.indexOf("jd")  > -1
                && playerHand.indexOf("td") > -1;
    var hKQJ10 = playerHand.indexOf("kh")  > -1
                && playerHand.indexOf("qh")  > -1
                && playerHand.indexOf("jh")  > -1
                && playerHand.indexOf("th") > -1;
    var sKQJ10 = playerHand.indexOf("ks")  > -1
                && playerHand.indexOf("qs")  > -1
                && playerHand.indexOf("js")  > -1
                && playerHand.indexOf("ts") > -1


    var isRoyalFlush = (playerHand.indexOf("1c")  > -1 && cKQJ10)
                        ||(playerHand.indexOf("1d")  > -1 && dKQJ10)
                        ||(playerHand.indexOf("1h")  > -1 && hKQJ10)
                        ||(playerHand.indexOf("1s")  > -1 && sKQJ10);

    var isStraightFlush = (cKQJ10 && playerHand.indexOf("9c") > -1)
                            ||(playerHand.indexOf("qc")  > -1
                            && playerHand.indexOf("jc")  > -1
                            && playerHand.indexOf("tc") > -1
                            && playerHand.indexOf("9c")  > -1
                            && playerHand.indexOf("8c")  > -1)
                            ||(playerHand.indexOf("jc")  > -1
                            && playerHand.indexOf("tc") > -1
                            && playerHand.indexOf("9c")  > -1
                            && playerHand.indexOf("8c")  > -1
                            && playerHand.indexOf("7c")  > -1)
                            ||(playerHand.indexOf("tc") > -1
                            && playerHand.indexOf("9c")  > -1
                            && playerHand.indexOf("8c")  > -1
                            && playerHand.indexOf("7c")  > -1
                            && playerHand.indexOf("6c")  > -1)
                            ||(playerHand.indexOf("9c")  > -1
                            && playerHand.indexOf("8c")  > -1
                            && playerHand.indexOf("7c")  > -1
                            && playerHand.indexOf("6c")  > -1
                            && playerHand.indexOf("5c") > -1)
                            ||(playerHand.indexOf("8c")  > -1
                            && playerHand.indexOf("7c")  > -1
                            && playerHand.indexOf("6c")  > -1
                            && playerHand.indexOf("5c")  > -1
                            && playerHand.indexOf("4c") > -1)
                            ||(playerHand.indexOf("7c")  > -1
                            && playerHand.indexOf("6c")  > -1
                            && playerHand.indexOf("5c")  > -1
                            && playerHand.indexOf("4c")  > -1
                            && playerHand.indexOf("3c") > -1)
                            ||(playerHand.indexOf("6c")  > -1
                            && playerHand.indexOf("5c")  > -1
                            && playerHand.indexOf("4c")  > -1
                            && playerHand.indexOf("3c")  > -1
                            && playerHand.indexOf("2c") > -1)
                            ||(playerHand.indexOf("5c")  > -1
                            && playerHand.indexOf("4c")  > -1
                            && playerHand.indexOf("3c")  > -1
                            && playerHand.indexOf("2c")  > -1
                            && playerHand.indexOf("1c") > -1)
                            ||(dKQJ10 && playerHand.indexOf("9d") > -1)
                            ||(playerHand.indexOf("qd")  > -1
                            && playerHand.indexOf("jd")  > -1
                            && playerHand.indexOf("td") > -1
                            && playerHand.indexOf("9d")  > -1
                            && playerHand.indexOf("8d")  > -1)
                            ||(playerHand.indexOf("jd")  > -1
                            && playerHand.indexOf("td") > -1
                            && playerHand.indexOf("9d")  > -1
                            && playerHand.indexOf("8d")  > -1
                            && playerHand.indexOf("7d")  > -1)
                            ||(playerHand.indexOf("td") > -1
                            && playerHand.indexOf("9d")  > -1
                            && playerHand.indexOf("8d")  > -1
                            && playerHand.indexOf("7d")  > -1
                            && playerHand.indexOf("6d")  > -1)
                            ||(playerHand.indexOf("9d")  > -1
                            && playerHand.indexOf("8d")  > -1
                            && playerHand.indexOf("7d")  > -1
                            && playerHand.indexOf("6d")  > -1
                            && playerHand.indexOf("5d") > -1)
                            ||(playerHand.indexOf("8d")  > -1
                            && playerHand.indexOf("7d")  > -1
                            && playerHand.indexOf("6d")  > -1
                            && playerHand.indexOf("5d")  > -1
                            && playerHand.indexOf("4d") > -1)
                            ||(playerHand.indexOf("7d")  > -1
                            && playerHand.indexOf("6d")  > -1
                            && playerHand.indexOf("5d")  > -1
                            && playerHand.indexOf("4d")  > -1
                            && playerHand.indexOf("3d") > -1)
                            ||(playerHand.indexOf("6d")  > -1
                            && playerHand.indexOf("5d")  > -1
                            && playerHand.indexOf("4d")  > -1
                            && playerHand.indexOf("3d")  > -1
                            && playerHand.indexOf("2d") > -1)
                            ||(playerHand.indexOf("5d")  > -1
                            && playerHand.indexOf("4d")  > -1
                            && playerHand.indexOf("3d")  > -1
                            && playerHand.indexOf("2d")  > -1
                            && playerHand.indexOf("1d") > -1)
                            ||(hKQJ10 && playerHand.indexOf("9h") > -1)
                            ||(playerHand.indexOf("qh")  > -1
                            && playerHand.indexOf("jh")  > -1
                            && playerHand.indexOf("th") > -1
                            && playerHand.indexOf("9h")  > -1
                            && playerHand.indexOf("8h")  > -1)
                            ||(playerHand.indexOf("jh")  > -1
                            && playerHand.indexOf("th") > -1
                            && playerHand.indexOf("9h")  > -1
                            && playerHand.indexOf("8h")  > -1
                            && playerHand.indexOf("7h")  > -1)
                            ||(playerHand.indexOf("th") > -1
                            && playerHand.indexOf("9h")  > -1
                            && playerHand.indexOf("8h")  > -1
                            && playerHand.indexOf("7h")  > -1
                            && playerHand.indexOf("6h")  > -1)
                            ||(playerHand.indexOf("9h")  > -1
                            && playerHand.indexOf("8h")  > -1
                            && playerHand.indexOf("7h")  > -1
                            && playerHand.indexOf("6h")  > -1
                            && playerHand.indexOf("5h") > -1)
                            ||(playerHand.indexOf("8h")  > -1
                            && playerHand.indexOf("7h")  > -1
                            && playerHand.indexOf("6h")  > -1
                            && playerHand.indexOf("5h")  > -1
                            && playerHand.indexOf("4h") > -1)
                            ||(playerHand.indexOf("7h")  > -1
                            && playerHand.indexOf("6h")  > -1
                            && playerHand.indexOf("5h")  > -1
                            && playerHand.indexOf("4h")  > -1
                            && playerHand.indexOf("3h") > -1)
                            ||(playerHand.indexOf("6h")  > -1
                            && playerHand.indexOf("5h")  > -1
                            && playerHand.indexOf("4h")  > -1
                            && playerHand.indexOf("3h")  > -1
                            && playerHand.indexOf("2h") > -1)
                            ||(playerHand.indexOf("5h")  > -1
                            && playerHand.indexOf("4h")  > -1
                            && playerHand.indexOf("3h")  > -1
                            && playerHand.indexOf("2h")  > -1
                            && playerHand.indexOf("1h") > -1)
                            ||(sKQJ10 && playerHand.indexOf("9s") > -1)
                            ||(playerHand.indexOf("qs")  > -1
                            && playerHand.indexOf("js")  > -1
                            && playerHand.indexOf("ts") > -1
                            && playerHand.indexOf("9s")  > -1
                            && playerHand.indexOf("8s")  > -1)
                            ||(playerHand.indexOf("js")  > -1
                            && playerHand.indexOf("ts") > -1
                            && playerHand.indexOf("9s")  > -1
                            && playerHand.indexOf("8s")  > -1
                            && playerHand.indexOf("7s")  > -1)
                            ||(playerHand.indexOf("ts") > -1
                            && playerHand.indexOf("9s")  > -1
                            && playerHand.indexOf("8s")  > -1
                            && playerHand.indexOf("7s")  > -1
                            && playerHand.indexOf("6s")  > -1)
                            ||(playerHand.indexOf("9s")  > -1
                            && playerHand.indexOf("8s")  > -1
                            && playerHand.indexOf("7s")  > -1
                            && playerHand.indexOf("6s")  > -1
                            && playerHand.indexOf("5s") > -1)
                            ||(playerHand.indexOf("8s")  > -1
                            && playerHand.indexOf("7s")  > -1
                            && playerHand.indexOf("6s")  > -1
                            && playerHand.indexOf("5s")  > -1
                            && playerHand.indexOf("4s") > -1)
                            ||(playerHand.indexOf("7s")  > -1
                            && playerHand.indexOf("6s")  > -1
                            && playerHand.indexOf("5s")  > -1
                            && playerHand.indexOf("4s")  > -1
                            && playerHand.indexOf("3s") > -1)
                            ||(playerHand.indexOf("6s")  > -1
                            && playerHand.indexOf("5s")  > -1
                            && playerHand.indexOf("4s")  > -1
                            && playerHand.indexOf("3s")  > -1
                            && playerHand.indexOf("2s") > -1)
                            ||(playerHand.indexOf("5s")  > -1
                            && playerHand.indexOf("4s")  > -1
                            && playerHand.indexOf("3s")  > -1
                            && playerHand.indexOf("2s")  > -1
                            && playerHand.indexOf("1s") > -1); 
    
    var isFullHouse = false;
    var isFourOfAKind = false;
    var isFlush = true;
    var isStraight = true;
    var isThreeOfAKind = false;
    var isTwoPair = false;
    var isOnePair = false;
    var visited = [false,false,false,false,false];
    var pairs = [];
    //init pairs
    for(var i = 0; i < 5; i++) {
      var key = playerHand[i][0];
      pairs[key] = 1;
    }

    for(var i = 0; i < 5; i++) {
        var key = playerHand[i][0];
        for(var j = i+1; j < 5; j++) {
            if( !visited[i] && key == playerHand[j][0]) {
                pairs[key]++;
                visited[i] = true;
            }
        }
    }

    var onePairCount = 0;
    for(var i = 0; i < 5; i++) {
        if (pairs[i] == 2) {
            onePairCount++;
            isOnePair = true;
        } else if(pairs[i] == 3) {
            isThreeOfAKind = true;
        } else if (pairs[i] == 4) {
            isFourOfAKind = true;
        }
    }

    if (onePairCount == 2) {
        isTwoPair = true;
    }
    isFullHouse = isOnePair && isThreeOfAKind;

    var key = playerHand[0][1];
    for(var i = 1; i < 5; i++) {
        if(key != playerHand[i][1]) {
            isFlush = false;
            break;
        }
        key = playerHand[i][1];
    }

    var hand = convertForSort(playerHand);
    sortedHand = hand.sort();
    console.log(sortedHand);
    var key = sortedHand[0][0];
    for(var i = 1; i < 5; i++) {
        if (sortedHand[i][0] == key || sortedHand[i][0] > key + 1) {
            isStraight = false;
            break;
        }
        key = sortedHand[i][0];
    }

    
    if (isRoyalFlush) 
        return 9;
    if (isStraightFlush)
        return 8;
    if (isFourOfAKind)
        return 7;
    if (isFullHouse)
        return 6;
    if (isFlush)
        return 5;
    if (isStraight)
        return 4;
    if (isThreeOfAKind)
        return 3;
    if (isTwoPair)
        return 2;
    if (isOnePair)
        return 1;
    
    return 0;

}

    function newGame() { // begins new game and shuffles deck
        deck = ['1c','1d','1h','1s',
                '2c','2d','2h','2s',
                '3c','3d','3h','3s',
                '4c','4d','4h','4s',
                '5c','5d','5h','5s',
                '6c','6d','6h','6s',
                '7c','7d','7h','7s',
                '8c','8d','8h','8s',
                '9c','9d','9h','9s',
                'tc','td','th','ts',
                'jc','jd','jh','js',
                'qc','qd','qh','qs',
                'kc','kd','kh','ks'
        ]; // standard 52 card deck no jokers 

        for(i = 0; i < 51; i++) {
            shuffleCard();
        }

    }

    function shuffleCard() { // shuffle one card at a time
        var timeStamp = Math.floor(Date.now() / 1000);
        var a = Math.floor(Math.random()*10000);
        var b = Math.floor(Math.random()*10000);
        var primeNum = 19;
        var randomHashIndex = (((a*timeStamp)+ b)%primeNum)%deck.length;
        var card = deck.splice(randomHashIndex, 1); // remove 1 at random position
        deck.push(card[0]);
    }



















    // Disconnect
    socket.on('disconnect', function (data) {
        var removedSocket = connections.splice(connections.indexOf(socket), 1);
        delete playerTurn[removedSocket.id];
        delete playerScore[removedSocket.id];
        console.log('Disconnected: %s sockets connected', connections.length);
        if (connections.length < 2)
            noRoundInProgress = true;
    });
});

/*
--------------------------------------------------------------------------------
                    END OF SocketIO On Connection
--------------------------------------------------------------------------------
*/
//reference 
/*

// 1.User Sends a Message to server

//client side code
var $message	     = $('#message');
$messageForm.submit(function (e) {
    e.preventDefault();
    socket.emit('send message', $message.val());
    $message.val('');
});
//end of client side code


// 2. Send Message Broadcast

//server side code
socket.on('send message', function (data) {
    io.sockets.emit('new message', {msg: data, user: socket.username} );
});
//end of server side code


// 3. Recieve Message Broadcast
//client side code
socket.on('new message', function (data) {
    $chat.append('<div class="well"><strong>'+data.user+': </strong>' + data.msg + '</div>');
});
//end of client side code

*/






/*
--------------------------------------------------------------------------------
                    Utilities
--------------------------------------------------------------------------------
*/
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