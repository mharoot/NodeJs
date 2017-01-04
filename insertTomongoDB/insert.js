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

		// Inserting Data using mongoDB server.
		createSomeUsers(db);

		db.close(); // Close connection.
	}
});


function createSomeUsers(db) {
	// Get the documents collection.  If one does not exist, then it will be created on the first insert.
	var collection = db.collection('users');


	var users = [ // Create some users. 
		 {name: 'modulus admin', age:42, roles:['admin', 'moderator', 'user']}
		,{name: 'modulus user', age:22, roles:['user']}
		,{name: 'modulus super admin', age:92, roles:['super-admin', 'admin', 'moderator', 'user']}
	];


	// Insert some users.
	collection.insert([users[0], users[1], users[2]], function (err, result) {
		if (err) {
			console.log(err);
		} else {
			console.log('Inserted %d documents into the "users" collection.  The documents inserted with "_id" are: ', result.length, result);
		}
	});

}
