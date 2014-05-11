var falafel = require('falafel');
var through = require('through');

module.exports = function (file, opts) {
    if (typeof file === 'object') {
        opts = file;
        file = undefined;
    }
    if (!opts) opts = {};
    var outputFn = opts.output || 'console.log';
    
    var output = through();
    var expected = [];
    
    var chunks = [];
    var stream = through(write, end);
    return stream;
    
    function write (buf) { chunks.push(buf) }
    
    function end () {
        var body = Buffer.concat(chunks)
            .toString('utf8')
            .replace(/^#!/, '//#!')
        ;

        if (file.match(/\.json$/)) {
            this.queue('module.exports=' + body);
            this.queue(null);
            return;
        }

        try { var src = falafel(body, walk) + '' }
        catch (err) { return onerror(err, file,body) }
        var sfile = JSON.stringify(JSON.stringify(file));
        
        this.queue(
            outputFn + '("COVERAGE " + ' + sfile + ' + " " + '
                + JSON.stringify(JSON.stringify(expected))
            + ');'
            + 'var __coverage = '
            + JSON.stringify(expected.reduce(function (acc, x, ix) {
                acc[ix] = x;
                return acc;
            }, {})) + ';'
            + 'var __coverageWrap = function (index) {'
            + 'if (__coverage[index]) ' + outputFn
                + '("COVERED " + ' + sfile
                + ' + " " + index);'
            + 'delete __coverage[index];'
            + 'return function (x) { return x }'
            + '};\n'
        );
        
        this.queue(src);
        this.queue(null);
    }
    
    function walk (node) {
        var index = expected.length;
        if (node.type === 'VariableDeclarator' && node.init) {
            expected.push(node.init.range);
            node.init.update(
                '(__coverageWrap(' + index + ')('
                + node.init.source() + '))'
            );
        }
        else if (/Expression$/.test(node.type)
        && node.parent.type !== 'UnaryExpression'
        && node.parent.type !== 'AssignmentExpression'
        && node.parent.type !== 'UpdateExpression'
        && (node.type !== 'MemberExpression'
            || node.parent.type !== 'CallExpression'
        )) {
            expected.push(node.range);
            node.update('(__coverageWrap(' + index + ')(' + node.source() + '))');
        }
        else if ((node.type === 'ExpressionStatement'
        || node.type === 'VariableDeclaration')
        && node.parent.type !== 'ForStatement'
        && node.parent.type !== 'ForInStatement') {
            var s = '{ __coverageWrap(' + index + ');' + node.source() + '}';
            if (node.parent.type === 'IfStatement') {
                node.update(s);
            }
            else node.update(s + ';');
            expected.push(node.range);
        }
        else if (node.type === 'ReturnStatement') {
            node.update('return __coverageWrap(' + index + ')(function () {'
                + node.source() + '}).apply(this, [].slice.call(arguments));');
            expected.push(node.range);
        }
    }
    
    function onerror (err, file, body) {
        if (err && err.lineNumber !== undefined) {
            var lines = body.split('\n');
            var line = lines[err.lineNumber-1];
            
            var msg = err.description + '\n\n'
                + file + ':' + err.lineNumber + '\n'
                + line + '\n'
                + Array(err.column).join(' ') + '^'
            ;
            var e = new Error(msg);
            e.lineNumber = err.lineNumber;
            e.column = err.column;
            e.line = line;
            stream.emit('error', e);
        }
        else stream.emit('error', err);
    }
};
