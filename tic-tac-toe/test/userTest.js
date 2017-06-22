//appTest.js
"use strict";

// constant variables
const User         = require('../classes/User.js');
const assert       = require('chai').assert;

// result variables
let userResult         = new User('michael', '5JphyuT5G7lnA9RRAAAD');


describe('User class unit testing.', function () {

/*

				this.roomSocketId = roomSocketId;
		this.score = 0;     // By default a player has a score of 0.
*/
    // getName test

    it('should return type string for userResult.getName', function () {
        assert.typeOf(userResult.getName, 'string');
    });

    it('should return michael for userResult.getName', function () {
        assert.equal(userResult.getName, 'michael');
    });

    // getRoom test
    it('should return type string for userResult.getRoom', function() {
        assert.typeOf(userResult.getRoom, 'string');
    });

    it('should not have a room for userResult.getRoom for a newly created player', function() {
        assert.equal(userResult.getRoom, '');
    });

    // getRoomSocketId test
    it('should return type string for userResult.getRoomSocketId', function() {
        assert.typeOf(userResult.getRoomSocketId, 'string');
    });

    it('should equal 5JphyuT5G7lnA9RRAAAD for userResult.getRoomSocketId', function() {
        assert.equal(userResult.getRoomSocketId, '5JphyuT5G7lnA9RRAAAD');
    });

    // isPlayingGame test

    it('should return type boolean for userResult.isPlayingGame', function() {
        assert.typeOf(userResult.isPlayingGame, 'boolean');
    });

    it('should return false for a newly created player in the isPlayingGame', function() {
        assert.equal(userResult.isPlayingGame, false);
    });




    // isPlayerTurn test

    it('should return boolean for userResult.isPlayerTurn', function () {
        assert.typeOf(userResult.isPlayerTurn, 'boolean');
    });

    it('should return false for a newly created player', function () {
        assert.equal(userResult.isPlayerTurn, false);
    });


});