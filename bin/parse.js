var split = require('split');
var through = require('through');
var fs = require('fs');

var files = {};
var original = {};

process.stdin.pipe(split()).pipe(through(write, end));

function write (line) {
    var m;
    if (m = /^COVERAGE\s+("[^"]+"|\S+)\s+(\S+)/.exec(line)) {
        var file = m[1], ranges = m[2];
        if (/^"/.test(file) && /"$/.test(file)) file = JSON.parse(file);
        files[file] = JSON.parse(ranges);
        original[file] = JSON.parse(ranges);
    }
    else if (m = /^COVERED\s+("[^"]+"|\S+)\s+(\S+)/.exec(line)) {
        var file = m[1], index = m[2];
        if (/^"/.test(file) && /"$/.test(file)) file = JSON.parse(file);
        delete files[file][index];
    }
}
function end () {
    var missed = Object.keys(files).reduce(function (acc, file) {
        acc[file] = files[file].filter(Boolean);
        return acc;
    }, {});
    
    var sources = {};
    var pending = 0;
    Object.keys(missed).forEach(function (file) {
        pending ++;
        sources[file] = missed[file];
        
        fs.readFile(file, 'utf8', function (err, src) {
            if (err) return next();
            
            sources[file].forEach(function (range) {
                range.push(src.slice(range[0], range[1]));
            });
            next();
        });
    });
    
    function next () {
        if (--pending === 0) {
            console.log(JSON.stringify(sources, null, 2));
        }
    }
}
