$(function () { // setting up the function like this assures that it runs after the page is loaded.
    var socket 	         = io.connect();
    var $data_table	     = $('#data_table');
    var table_headers    = 
             '<th> <strong> id   </strong> </th>'+
             '<th> <strong> name </strong> </th>'+
             '<th> <strong> age  </strong> </th>'+
             '<th> <strong> roles</strong> </th>';
    var table_rows = '';

    socket.emit('get data');		

    socket.on('set data', function (data) {
        if(data.length == 0)
            socket.emit('get data');
        else {
            $data_table.append(table_headers);
            for (var i = 0; i < data.length; i++) {
                table_rows += '<tr> <td>'+data[i]._id +'</td>'
                                  +'<td>'+data[i].name+'</td>'
                                  +'<td>'+data[i].age +'</td>';
                table_rows += '<td><ul>';
                for (var j = 0; j < data[i].roles.length; j++) { // iterate through different roles.
                    table_rows += '<li>'+data[i].roles[j]+'</li>';
                }
                table_rows += '</ul></td> </tr>';
            }

            $data_table.append(table_rows);
        }

    });

});