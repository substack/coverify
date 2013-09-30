var parse = require('../lib/parse.js');

process.stdin.pipe(parse(function (err, sources) {
    if (err) return console.error(err);
    console.log(JSON.stringify(sources, null, 2));
}));
