var connections		= [];							// connections[] = Connected sockets.
var express 		= require('express');					// Import express for static hosting of css,js,etc fies.
var app     		= express();						// Give our app the express properties.
var server  		= require('http').createServer(app);	 		// Create a server object for our app to run.
var io      		= require('socket.io').listen(server); 			// Import sockets to handle multiple incoming requests.
var mongodb     	= require('mongodb');					// Import mongodb native drivers.
var MongoClient 	= mongodb.MongoClient;					// MongoClient interface allows connection to a mongodb server.
var url			= 'mongodb://localhost:27017/my_database_name';		// url = Connection URL.  This is where your mongodb server is running.													

server.listen(process.env.PORT || 3000);					// begin listening to the server

app.use(express.static('public')); 						// Enables hosting files statically in folder for our app.

app.get('/', function (req, res) {						// Begin hosting our app at index.php.
    res.sendFile(__dirname + '/index.html')
});

io.sockets.on('connection', function (socket) {					// Client made connection.
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);

	socket.on('get data', 	function () {
			MongoClient.connect(url, function (err, db) {			// Use connect method to connect to the mongodb server.
				if (err) {
					console.log('ERROR:', err);
				} else {
					console.log("Connection established to %s", url);
					var collection = db.collection('users'); 
					collection.find().toArray(function(err, items) {
						if (err) {
							reject(err);
						} else {
							console.log(items);
							io.sockets.emit('set data', items);	// Render data table on client end.

						}          
					});
					db.close(); 					// Close connection.
				}
			});
		}
	);						// Send data to client.

    socket.on('disconnect', function (data) {					// Client disconnected.
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected: %s sockets connected', connections.length);
    });

});

