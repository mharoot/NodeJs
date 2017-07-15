    // main function
$( function () {
    var socket 	           = io.connect();
    var $playerTurnDisplay = $('#playerTurnDisplay');
    var $grid              = $('table#tic-tac-toe-grid td');

    $grid.on( "mouseover", function() {
        $( this ).css( "background-color", "red" );

        $( this ).on("mouseout", function() {
            $( this ).css( "background-color", "blanchedalmond" );
        });

        $( this ).on("click", function() {
            $( this ).css("background-color", "blue");
                socket.emit("grid marked", this.id);

        });
    });

    socket.on('player turn', function (username) {
        $playerTurnDisplay.append('<div class="well"><strong>'+username+' </strong> \'s turn to go!</div>');
    });

    socket.on('player left', function () {
        $playerTurnDisplay.html('');
    });

    var $messageArea     = $('#messageArea');
    var $userController  = $('#userController');
    var $userForm        = $('#userForm');
    var $userFormArea    = $('#userFormArea');
    var $username        = $('#username');
    var $users           = $('#users');

    $userForm.submit( function (e) {
        e.preventDefault();
        socket.emit('new user', $username.val(), function (data) {
            if (data) {
                $userFormArea.hide();
                $messageArea.show();
                $userController.show();
            }
        });
        $username.val('');
    });

    socket.on('get users', function (data) {
        var html = '';
        for (i = 0; i < data.length; i++) {
            html += '<li class="list-group-item">'+data[i]+'</li>';
        }

        $users.html(html);
    });

    socket.on('remove user', function (name) {
        var listGroup = document.getElementsByClassName("list-group-item");
        for (var i = 0; i < listGroup.length; i++) {
            if (listGroup[i].innerHTML === name) {
                alert(name + " has left the game.  Please wait for next game to load...");
                listGroup[i].parentElement.removeChild(listGroup[i]);
            }
        }
    });
});