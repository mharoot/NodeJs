# net-watcher.js
- install telenet
- node --harmony net-watcher.js target.txt
- open another terminal and run: telnet localhost:5432

-------------------------------------------------------------------------------

# net-watcher-json-client.js
- node --harmony net-watcher-json-client.js

-------------------------------------------------------------------------------

# net-watcher-json-test-service.js
- node --harmony --net-watcher-json-test-service.js
- node --harmony net-watcher-json-client.js
- This program is a good example that shows the danger of split JSON messages.

-------------------------------------------------------------------------------

# ldj.js
- node --harmony --ldj.js
- This program shows how to buffer inputs to handle multiple data events for a JSON message.
- ldj will be a custom Node module.  It will handle the input-buffering piece so that the main program can reliably get full messages.