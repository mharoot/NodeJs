var connections		= [];							// connections[] = Connected sockets.
var db_handler;
var express 		= require('express');					// Import express for static hosting of css,js,etc fies.
var app     		= express();						// Give our app the express properties.
var server  		= require('http').createServer(app);	 		// Create a server object for our app to run.
var io      		= require('socket.io').listen(server); 			// Import sockets to handle multiple incoming requests.
var mongodb     	= require('mongodb');					// Import mongodb native drivers.
var MongoClient 	= mongodb.MongoClient;					// MongoClient interface allows connection to a mongodb server.
var url			= 'mongodb://localhost:27017/my_database_name';		// url = Connection URL.  This is where your mongodb server is running.

app.use(express.static('public')); 						// Enables hosting files statically in folder for our app.

// Initialize connection once
MongoClient.connect(url, function(err, database) {
  if(err) throw err;
  db_handler = database;
  // Start the application after the database connection is ready
  server.listen(process.env.PORT || 3000);
  console.log("Listening on port 3000");
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html')
});

io.sockets.on('connection', function (socket) {					// Client made connection.
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);

	socket.on('get data', 	function () {
		console.log("Connection established to %s", url);
		var collection = db_handler.collection('users'); 
		collection.find().toArray(function(err, items) {
			if (err) {
				reject(err);
			} else {
				console.log(items);
				io.sockets.emit('set data', items);	// Render data table on client end.
			}          
		});
		db_handler.close(); 					// Close connection.
	});

    socket.on('disconnect', function (data) {
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected: %s sockets connected', connections.length);
    });

});

