    // main function
$( function () {
    var socket 	           = io.connect();
    var $playerTurnDisplay = $('#playerTurnDisplay');
    var $grid              = $('table#tic-tac-toe-grid td');
    var $messageArea       = $('#messageArea');
    var $userController    = $('#userController');
    var $userForm          = $('#userForm');
    var $userFormArea      = $('#userFormArea');
    var $username          = $('#username');
    var $users             = $('#users');

    var notMobileDevice = detectmob() == false;
    if (notMobileDevice) {
        var page = document.getElementById('page');
        page.setAttribute("id", "");
    }


    // GRID FUNCTIONS
    $grid.on( "mouseover", function() {
        $( this ).css( "background-color", "red" );

        $( this ).on("mouseout", function() {
            $( this ).css( "background-color", "blanchedalmond" );
        });
    });

    $grid.on("click", function() {
        // front end lock.
        var mark = $(this).children();
        if (mark.length > 0)
            return;

        $( this ).css("background-color", "blue");
        socket.emit("grid marked", this.id);        //to do: mark for both player sockets in a room
    });


    // SOCKET FUNCTIONS
    socket.on('get users', function (data) {
        var html = '';
        for (i = 0; i < data.length; i++) {
            html += '<li class="list-group-item">'+data[i]+'</li>';
        }

        $users.html(html);
    });

    socket.on('player turn', function (username) {
        $playerTurnDisplay.append('<div class="well"><strong>'+username+' </strong> \'s turn to go!</div>');
    });

    socket.on('player left', function () {
        $playerTurnDisplay.html('');
    });

    socket.on('mark grid', function (id, mark) {
        console.log("id:%s, mark:%s",id,mark);
        var td               = document.getElementById(id);
        var background       = document.createElement('H1');
        background.className = 'gridMark';
        var mark            = document.createTextNode(mark);
        background.appendChild(mark);
        td.appendChild(background);
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


    // FORM FUNCTIONS
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

});

// detects if user is on a mobile device
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