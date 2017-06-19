"use strict";
class User {
/**
 * User class.
 *
 * @constructor
 * @param {String} name - The name of the user.
 */
	constructor(name) {
		this.name = name;
	}

  get getName() {
    return this.name;
  }

}

module.exports = User;