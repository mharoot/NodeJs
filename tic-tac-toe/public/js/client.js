    // main function
$( function () {
    var notMobileDevice = detectmob() == false;
    if (notMobileDevice) {
        var page = document.getElementById('page');
        page.setAttribute("id", "");
    }
    var socket 	           = io.connect();
    var $playerTurnDisplay = $('#playerTurnDisplay');
    var $grid              = $('table#tic-tac-toe-grid td');

    $grid.on( "mouseover", function() {
        $( this ).css( "background-color", "red" );

        $( this ).on("mouseout", function() {
            $( this ).css( "background-color", "blanchedalmond" );
        });
    });

    $grid.on("click", function() {
        $( this ).css("background-color", "blue");
            socket.emit("grid marked", this.id);
            var background       = document.createElement('H1');
            background.className = 'gridMark';
            var mark            = document.createTextNode('X');
            background.appendChild(mark);
            this.appendChild(background);
            //this.style.padding = "0px 0px 0px 0px";

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

function detectmob() {
 if( navigator.userAgent.match(/Android/i)
 || navigator.userAgent.match(/webOS/i)
 || navigator.userAgent.match(/iPhone/i)
 || navigator.userAgent.match(/iPad/i)
 || navigator.userAgent.match(/iPod/i)
 || navigator.userAgent.match(/BlackBerry/i)
 || navigator.userAgent.match(/Windows Phone/i)
 ){
    return true;
  }
 else {
    return false;
  }
}