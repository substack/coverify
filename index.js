var falafel = require('falafel');
var concat = require('concat-stream');
var combine = require('stream-combiner');
var Readable = require('stream').Readable;

module.exports = function (file, opts) {
    if (typeof file === 'object') {
        opts = file;
        file = undefined;
    }
    if (!opts) opts = {};
    var outputFn = opts.output || 'console.log';
    
    var output = new Readable;
    output._read = function () {};
    var expected = [];
    
    return combine(concat(all), output);
    
    function all (body) {
        var src = falafel(body.toString('utf8'), walk) + '';
        var sfile = JSON.stringify(JSON.stringify(file));
        
        output.push(
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
        
        output.push(src);
        output.push(null);
    }
    
    function walk (node) {
        var index = expected.length;
        if (/Expression$/.test(node.type)) {
            expected.push(node.range);
            node.update('__coverageWrap(' + index + ',' + node.source() + ')');
        }
        else if (node.type === 'ExpressionStatement'
        || node.type === 'VariableDeclaration') {
            node.update('__coverageWrap(' + index + ');' + node.source());
            expected.push(node.range);
        }
    }
};
