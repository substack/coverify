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
    return through(write, end);
    
    function write (buf) { chunks.push(buf) }
    
    function end () {
        var body = Buffer.concat(chunks).toString('utf8');
        var src = falafel(body.toString('utf8'), walk) + '';
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
            + 'var __coverageWrap = function (index, value) {'
            + 'if (__coverage[index]) ' + outputFn
                + '("COVERED " + ' + sfile
                + ' + " " + index);'
            + 'delete __coverage[index];'
            + 'return value'
            + '};\n'
        );
        
        this.queue(src);
        this.queue(null);
    }
    
    function walk (node) {
        var index = expected.length;
        if (/Expression$/.test(node.type)
        && node.parent.type !== 'AssignmentExpression'
        && (node.type !== 'MemberExpression'
            || node.parent.type !== 'CallExpression'
        )) {
            expected.push(node.range);
            node.update('__coverageWrap(' + index + ',' + node.source() + ')');
        }
        else if (node.type === 'ExpressionStatement'
        || node.type === 'VariableDeclaration') {
            node.update('{ __coverageWrap(' + index + ');' + node.source() + '};');
            expected.push(node.range);
        }
    }
};
