const
  fs = require('fs'),
  bufferedData = fs.readFileSync('target.txt');
  process.stdout.write(bufferedData.toString());