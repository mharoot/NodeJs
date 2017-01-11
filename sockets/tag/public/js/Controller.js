var grid;
var socket;

$(document).ready(function() {
    socket = io.connect();
    grid = new Grid("parent_div",100,100);
    grid.createGrid();

    socket.emit('new player', grid.pos, grid.playerColor);

    socket.on('new player pos', function (pos, color) {
        console.log('player has joined at pos: %s, color: %s',pos,color);
        $('td')[pos].style.backgroundColor = color;
    });

    socket.on('a player moved', function (oldPos, newPos, color) {
        var tds = $('td');
        tds[oldPos].style.backgroundColor = '';
        tds[newPos].style.backgroundColor = color;
    });

    socket.on('change player color', function (color) {
        console.log('changing color to: %s',color);
        grid.playerColor = color;
    });

    socket.on('swap colors', function (oldPos, newPos) {
        var tds = $('td');
        oldPosColor = tds[oldPos].style.backgroundColor;
        newPosColor = tds[newPos].style.backgroundColor;
        tds[oldPos].style.backgroundColor = oldPosColor;
        tds[newPos].style.backgroundColor = newPosColor;
        grid.playerColor = "pink";
    });



}); 

$(document).keydown(function(e)
{
    e.preventDefault();
    if( 36 < e.which && e.which < 41) {
        grid.isMoveLegal($('td'), e.which);
    }
    else {
        log(e.which);
    }
});

function log(keyNum) {
    console.log(keyNum);
}
