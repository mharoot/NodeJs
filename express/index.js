var express     = require('express');
var app         = express();
app.use(express.static('public'));


app.get('/', function (req, res) {
    /**
     * Homepage.
     */
    res.sendFile(__dirname + '/index.html');
});

app.listen(3000);
