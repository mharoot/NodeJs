#!/usr/bin/node --harmony
//linux user using the first line, mac users use /usr/bin/env node --harmony
require('fs').createReadStream(process.argv[2]).pipe(process.stdout);