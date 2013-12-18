#!/usr/bin/env node

var fs = require('fs');
var through = require('through');

var minimist = require('minimist');
var argv = minimist(process.argv.slice(2), {
    boolean: ['q', 'stdout'],
    alias: { o: 'output', q: 'quiet' },
    default: { q: false }
});
var vargv = minimist(process.argv.slice(2));

if (argv.h || argv.help) {
    fs.createReadStream(__dirname + '/usage.txt').pipe(process.stdout);
    return;
}

var parse = require('../parse.js');

var output = process.stderr;
if (argv.o === '-' || argv.o === '@1') {
    output = process.stdout;
}
else if (argv.o && argv.o !== '@2') {
    output = fs.createWriteStream(argv.o);
}

var covered = true;
process.on('exit', function (code) {
    if (!covered) process.exit(1);
});

var parser = parse(function (err, sources) {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    else if (argv.json) {
        return output.write(JSON.stringify(sources, null, 2) + '\n');
    }
    else {
        Object.keys(sources).forEach(function (file) {
            if (sources[file].length === 0) return;
            
            sources[file].forEach(function (m) {
                covered = false;
                
                var parts = [];
                parts.push(m.line.slice(0, m.column[0]));
                parts.push('\x1b[31m\x1b[1m');
                parts.push(m.line.slice(m.column[0], m.column[1]));
                parts.push('\x1b[0m');
                parts.push(m.line.slice(m.column[1]));
                
                var s = parts.join('');
                output.write(
                    '# ' + file
                    + ': line ' + m.lineNum
                    + ', column ' + m.column.join('-')
                    + '\n\n'
                );
                output.write('  ' + s.trim() + '\n');
                
                var xxx = m.line.replace(/\S/g, 'x');
                var xparts = [];
                xparts.push(xxx.slice(0, m.column[0] + 1));
                xparts.push(Array(m.column[1] - m.column[0]).join('^'));
                var sx = xparts.join('').trim().replace(/x/g, ' ');
                output.write('  ' + sx + '\n\n');
                
                if (argv.q) {
                    
                }
            });
        });
    }
});

if (argv.stdout || !argv.q || (vargv.q === undefined && argv.json)) {
    parser.pipe(process.stdout);
}
process.stdin.pipe(parser);
