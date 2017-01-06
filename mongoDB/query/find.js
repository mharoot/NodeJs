// Import mongodb native drivers.
var mongodb     = require('mongodb');  


// MongoClient interface allows connection to a mongodb server.
var MongoClient = mongodb.MongoClient; 


// url = Connection URL.  This is where your mongodb server is running.
var url		    = 'mongodb://localhost:27017/my_database_name';


// Use connect method to connect to the mongodb server.
MongoClient.connect(url, function (err, db) {
	if (err) {
		console.log('Unable to connect to the mongoDB server. ERROR:', err);
	} else {
		console.log("Connection established to %s", url)

		// Finding data on mongoDB server.
		findAllUsers(db);

		db.close(); // Close connection.
	}
});


function findAllUsers(db) {
	// Get the documents collection.  If one does not exist, then it will be created on the first insert.
	var collection = db.collection('users');

	// Find collection of 'users' whos age is 22
    	var query   = { "age": 22 };

	// collection.find(query).toArray(function(err, items){
    	collection.find().toArray(function(err, items) {
          if (err) {
            reject(err);
          } else {
            console.log(items[0]);
          }          
        });
}

