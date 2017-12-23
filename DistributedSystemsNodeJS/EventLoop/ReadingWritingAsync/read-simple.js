// read-simple.js - Reading Files Asynchronously simple whole-file-at-once approach:

const fs = require('fs');
fs.readFile('target.txt', function (err, data) {
    if (err) {
        throw err;
    }
    console.log(data.toString());
});