/*
name: GridGenerator.js
Code Convention: http://javascript.crockford.com/code.html
Programmer: Michael Harootoonyan
*/


function Grid(parentID,height,width) {
  this.height   = height;   // height = number of rows in the html table
  this.parentID = parentID; // create a html table within the id of a placeholder
  this.width    = width;    // width  = number of columns in the html table
  this.pos      = 0;        // player position
  this.player   = null;     // player is a td element colored
  this.playerColor = "red";
  this.socket = io.connect();


  this.createGrid = function () {
    var table   = document.createElement("table");
    var tr;
    var td;
    var parent  = document.getElementById(parentID);
    var id = 0;
    for (var i = 0; i < width; i++) {
        tr = document.createElement("tr");
        for (var j = 0; j < height; j++) {
            td = document.createElement("td");
            td.setAttribute("id", id);
            tr.appendChild(td);
            id++;
        }
        table.appendChild(tr);
    }

    parent.appendChild(table);

    var td_elements = $('td');
    while( this.pos < td_elements.length ) {
        if( td_elements[this.pos].style.backgroundColor === '') {
            td_elements[this.pos].style.backgroundColor = this.playerColor;
            this.player = td_elements[this.pos];
            break;
        }
        this.pos++;
    }        
  }

  this.isMoveLegal = function (td_elements, key_pressed) { // if move will be within boundry then check if spot is open by examining
                                                           // a td elements backgroundColor.
    switch(key_pressed)
    {
        case 37:
              var left        = this.pos - 1;
              if ( ( this.pos % this.width ) != 0 ) { 
                  this.isSpotOpen(td_elements, left);
              }
              break;

        case 38:
              var top         = this.pos - this.width;
              if ( this.pos > this.width ) {
                  this.isSpotOpen(td_elements, top);
              }
              break;

        case 39:
              var right       = this.pos + 1;
              if ( ( this.pos % ( this.width ) ) != ( this.width-1 ) ) {
                  this.isSpotOpen(td_elements, right);
              }
              break;
 
        case 40:
              var bottom      = this.pos + this.width;
              if ( this.pos <= ( this.width * ( this.height - 1 ) ) ) {
                  this.isSpotOpen(td_elements, bottom);
              }
              break;

        default:
                console.log("Grid.js: Error during key_presed inside isMoveLegal().");
    }

        
  }

  this.isSpotOpen = function (td_elements, newPos) { // if spot is open then the player is placed there.
    if ( td_elements[newPos].style.backgroundColor === '') { 
        td_elements[newPos].style.backgroundColor = this.playerColor;
        this.player.style.backgroundColor = '';
        this.player = td_elements[newPos];
        socket.emit('update player pos', this.pos, newPos, this.playerColor);
        this.pos    = newPos;
    } else {
        socket.emit('tag your it', this.pos, newPos, this.playerColor);
    }
  }


}