"use strict";
class User {
/**
 * User class.
 *
 * @constructor
 * @param {String} name     - The name of the user.
 * @param {String} roomSocketId - The socket id of the user.
 */
	constructor(name, roomSocketId) {
		this.name  = name;
		this.playingGame = false;
		this.room  = '';    // By default a player is not placed into a room
		                    // until another player is available to vs them.
		this.score = 0;     // By default a player has a score of 0.
		this.roomSocketId = roomSocketId;
		this.turn  = false; // By default a player can not take a turn.
	}


/******************************************************************************
                             GETTER METHODS
******************************************************************************/
  /**
   * Get player name.
   *
   * @return {String} name - users name.
   */
  get getName() {
    return this.name;
  }

  /**
   * Get player score.
   *
   * @return {Number} score - users score.
   */
  get getScore() { // prototype function
      return this.score;
  }

  /**
   * Get player's socket id.
   *
   * @return {String} roomSocketId - users socket id key.
   */
  get getRoomSocketId() {
    return this.roomSocketId;
  }


  /**
   * Get player's room id
   *
   * @return {String} room - users room id.
   */
  get getRoom() {
    return this.room;
  }

  /**
   * Get playingGame variable to determine if a player is playing in a game.
   *
   * @return {String} playingGame - true if player is playing.
   */
  get isPlayingGame() {
    return this.playingGame;
  }

  /**
   * Get player's turn.
   *
   * @return {String} turn - true if a player is allowed to make a move.
   */
  get isPlayerTurn() {
    return this.turn;
  }



/******************************************************************************
                              SETTER METHODS
******************************************************************************/

  /**
   * Set player status to determing whether a player is playing a round or not.
   *
   * @param {bool} status - true for playing.
   */
  setPlayingStatus(status) {
      this.playingGame = status;
  }

  /**
   * Set player room.
   *
   * @param {Number} - room
   */
  setRoom(room) {
      this.room = room;
  }

  /**
   * Set player score.
   *
   * @param {Number} points - users points scored during round
   */
  setScore(points) {
      this.score += points;
  }

  /**
   * Set player turn.
   *
   * @param {bool} status - true when it's a users turn to go.
   */
   setTurn(status) {
      this.turn = status;
   }



/******************************************************************************
                               UTILITY METHODS
******************************************************************************/

  toString() {
    console.log(
      "name: " + this.name
    + ", roomSocketId: " + this.roomSocketId
    + ", score: " + this.score
    + ", room: " + this.room
    + ", turn: "+this.turn
    + ", playing game: "+this.playingGame
    );
  }

}




module.exports = User; // gives our server.js access to this Class.