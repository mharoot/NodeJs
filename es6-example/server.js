// server.js
"use strict";

const User        = require('./classes/User.js');
const express     = require('express');
const app         = express();

app.use(express.static('public'));

// Instantiate User:
let players = [new User('Michael Harootoonyan'), new User('Marvin Harootoonyan')];

app.get('/', function (req, res) {
    /**
     * Homepage.
     */
    var player1Name = players[0].getName;
    console.log(player1Name);
    res.end(player1Name + " vs "+ players[1].getName);
    //res.sendFile(__dirname + '/index.html');
});


app.get('/test-get-user-name', function (req, res) {
    // test the classes

});

app.listen(3000);
