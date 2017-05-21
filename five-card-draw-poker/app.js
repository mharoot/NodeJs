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


// hand strength test - straight
app.get('/hand-strength-test-straight', function(req, res) {
  // var playerHand = ['1c','2d','3c','4c','5c'];//straight passed
  // var playerHand = ['2d','3c','4c','5c','1c']; // straight passed
  var playerHand = ['3d','4d','2a','6c','5d']; // straight passed
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
                case '9':
                    convertedHand.push(9);
                    break;
                case '8':
                    convertedHand.push(8);
                    break;
                case '7':
                    convertedHand.push(7);
                    break;
                case '6':
                    convertedHand.push(6);
                    break;
                case '5':
                    convertedHand.push(5);
                    break;
                case '4':
                    convertedHand.push(4);
                    break;
                case '3':
                    convertedHand.push(3);
                    break;
                case '2':
                    convertedHand.push(2);
                    break;
                case '1':
                    convertedHand.push(1);
                    break;


            }
        }
        return convertedHand;
    }

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
            var isFlush = false;
            var isStraight = true;
            var isThreeOfAKind = false;
            var isTwoPair = false;
            var isOnePair = false;
            var visited = [false,false,false,false,false];
            var pairs = [];
            //init pairs
            var hand = convertForSort(playerHand);
            for(var i = 0; i < 5; i++) {
              var key = hand[i];
              if(pairs[key] != 1)
              pairs[key] = 1;
            }




            var i = 0;
            for(key in pairs) {
                for(var j = i+1; j < 5; j++) {
                    if( !visited[i] && playerHand[i][0] == playerHand[j][0]) {
                        pairs[key]++;
                        //visited[i] = true;
                    }
                }
                i++;
            }

            var onePairCount = 0;
            i = 0;
            for(key in pairs)  {
                console.log(pairs[key]);
                if (pairs[key] == 2) {
                    onePairCount++;
                    isOnePair = true;
                } else if(pairs[key] == 3) {
                    isThreeOfAKind = true;
                } else if (pairs[key] == 4) {
                    isFourOfAKind = true;
                }
                i++;
            }

            console.log("is three of kind"+isThreeOfAKind)

            if (onePairCount == 2) {
                isTwoPair = true;
            }
            isFullHouse = isOnePair && isThreeOfAKind;

            var key = playerHand[0][1];
            if(key == playerHand[1][1] && key == playerHand[2][1] && key == playerHand[3][1] && key == playerHand[4][1])
                    isFlush = true;


            var hand = convertForSort(playerHand);
            var sortedHand = hand.sort();

            console.log("sorted hand: " +sortedHand);
            var key = sortedHand[0];
            for(var i = 1; i < 5; i++) {
                if (sortedHand[i] == key || sortedHand[i] > key + 1) {
                    isStraight = false;
                    break;
                }
                key = sortedHand[i];
            }


            if (isRoyalFlush)
                res.write('9');
            else if (isStraightFlush)
                res.write('8');
            else if (isFourOfAKind)
                res.write( '7');
            else if (isFullHouse)
                res.write( '6');
            else if (isFlush)
                res.write( '5');
            else if (isStraight)
                res.write( '4');
            else if (isThreeOfAKind)
                res.write( '3');
            else if (isTwoPair)
                res.write( '2');
            else if (isOnePair)
                res.write( '1');
            else
                res.write('0');
            res.end();

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
                newHand.push(deck.splice(0,1)[0]);
            else // push old card back in new hand
                newHand.push(data.userHand[card]);
            i++;
        }
        console.log(newHand);
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
    function mergeSort(arr)
    {
        if (arr.length < 2)
            return arr;
    
        var middle = Math.floor(arr.length / 2);
        var left   = arr.slice(0, middle);
        var right  = arr.slice(middle, arr.length);
    
        return merge(mergeSort(left), mergeSort(right));
    }
    
    function merge(left, right)
    {
        var result = [];
    
        while (left.length && right.length) {
            if (left[0] <= right[0]) {
                result.push(left.shift());
            } else {
                result.push(right.shift());
            }
        }
    
        while (left.length)
            result.push(left.shift());
    
        while (right.length)
            result.push(right.shift());
    
        return result;
    }
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
                case '9':
                    convertedHand.push(9);
                    break;
                case '8':
                    convertedHand.push(8);
                    break;
                case '7':
                    convertedHand.push(7);
                    break;
                case '6':
                    convertedHand.push(6);
                    break;
                case '5':
                    convertedHand.push(5);
                    break;
                case '4':
                    convertedHand.push(4);
                    break;
                case '3':
                    convertedHand.push(3);
                    break;
                case '2':
                    convertedHand.push(2);
                    break;
                case '1':
                    convertedHand.push(1);
                    break;


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
    var isFlush = false;
    var isStraight = true;
    var isThreeOfAKind = false;
    var isTwoPair = false;
    var isOnePair = false;
    var visited = [false,false,false,false,false];
    var pairs = [];
    //init pairs
    var hand = convertForSort(playerHand);
    for(var i = 0; i < 5; i++) {
      var key = hand[i];
      if(pairs[key] != 1)
      pairs[key] = 1;
    }

        


    var i = 0;
    for(key in pairs) {
        for(var j = i+1; j < 5; j++) {
            if( !visited[i] && playerHand[i][0] == playerHand[j][0]) {
                pairs[key]++;
                //visited[i] = true;
            }
        }
        i++;
    }

    var onePairCount = 0;
    i = 0;
    for(key in pairs)  {
        console.log(pairs[key]);
        if (pairs[key] == 2) {
            onePairCount++;
            isOnePair = true;
        } else if(pairs[key] == 3) {
            isThreeOfAKind = true;
        } else if (pairs[key] == 4) {
            isFourOfAKind = true;
        }
        i++;
    }

    console.log("is three of kind"+isThreeOfAKind)

    if (onePairCount == 2) {
        isTwoPair = true;
    }
    isFullHouse = isOnePair && isThreeOfAKind;

    var key = playerHand[0][1];
    if(key == playerHand[1][1] && key == playerHand[2][1] && key == playerHand[3][1] && key == playerHand[4][1]) 
            isFlush = true;


    var hand = convertForSort(playerHand);
    var sortedHand = mergeSort(hand);

    console.log("sorted hand: " +sortedHand);
    var key = sortedHand[0];
    for(var i = 1; i < 5; i++) {
        if (sortedHand[i] == key || sortedHand[i] > key + 1) {
            isStraight = false;
            break;
        }
        key = sortedHand[i];
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
        delete playerTurn[removedSocket[0].id];
        delete playerScore[removedSocket[0].id];
        console.log('Disconnected: %s sockets connected', connections.length);
        if (connections.length < 2) {
            noRoundInProgress = true;
            for(key in playerTurn)
                playerTurn[key] = false;
        }
        console.log(playerTurn);
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