var express     = require('express');
var app         = express();
var MongoClient = require('mongodb').MongoClient;
var mongodbUrl  = 'mongodb://localhost:27017/my_database_name';
var db_handler  = null; // for a connection pooling approach we will assign a db_handler for reuse.

app.use(express.static('public'));
app.set('view engine', 'ejs');

function appendDataToHtmlTable(req, res) {
    connectToMongoDB();
    var usersCollection = db_handler.collection('users');
    usersCollection.find().toArray(function (err, items) {
        if (err) {
            reject(err);
        } else {
            console.log(items);

            /**
             * creating the html elements using ejs.
             */
            res.render('data_table', {data: items});
        }
    });
}

function connectToMongoDB() {
        MongoClient.connect(mongodbUrl, function (err, database) {
            if (err) throw err;
            db_handler = database;
        });
}

app.get('/', function (req, res) {
    /**
     * Homepage.  Connect by connection pooling to mongodb. In my opinion it makes code more readable.
     * without using a connection pooling approach you should expect to reuse the MongoClient.connect call 
     * every time you need database access.
     */
    connectToMongoDB();
    res.sendFile(__dirname + '/index.html');
});

app.get('/data_table', function (req, res) {
    /** Did not put connection here because it won't work. Also wold not work inside
     * the function below.  There must be a slight delay between connection and the call.
     * Use a none connection pooling approach by making the calls in the scope of MongoClient.connect
     * and then close the database database.close();.
    */
    appendDataToHtmlTable(req, res);
});
app.listen(3000);