// Import mongodb native drivers.
var mongodb     = require('mongodb');  


// MongoClient interface allows connection to a mongodb server.
var MongoClient = mongodb.MongoClient; 


// url = Connection URL.  This is where your mongodb server is running.
var url		= 'mongodb://localhost:27017/my_database_name';


// Use connect method to connect to the mongodb server.
MongoClient.connect(url, function (err, db) {
	if (err) {
		console.log('Unable to connect to the mongoDB server. ERROR:', err);
	} else {
		console.log("Connection established to %s", url)

		// Work with db here.


		db.close(); // Close connection.
	}
});
 
