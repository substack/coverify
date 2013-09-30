var argv = require('optimist').argv;
var parse = require('../lib/parse.js');

process.stdin.pipe(parse(function (err, sources) {
    if (err) return console.error(err);
    else if (argv.json) {
        console.log(JSON.stringify(sources, null, 2));
        return;
    }
    else {
        Object.keys(sources).forEach(function (file) {
            if (sources[file].length === 0) return;
            
            sources[file].forEach(function (m) {
                var parts = [];
                parts.push(m.line.slice(0, m.column[0]));
                parts.push('\x1b[31m\x1b[1m');
                parts.push(m.line.slice(m.column[0], m.column[1]));
                parts.push('\x1b[0m');
                parts.push(m.line.slice(m.column[1]));
                
                var s = parts.join('');
                console.log(
                    '# ' + file
                    + ': line ' + m.lineNum
                    + ', column ' + m.column.join('-')
                    + '\n'
                );
                console.log('  ' + s.trim());
                
                var xxx = m.line.replace(/\S/g, 'x');
                var xparts = [];
                xparts.push(xxx.slice(0, m.column[0] + 1));
                xparts.push(Array(m.column[1] - m.column[0]).join('^'));
                var sx = xparts.join('').trim().replace(/x/g, ' ');
                console.log('  ' + sx + '\n');
            });
        });
    }
}));
