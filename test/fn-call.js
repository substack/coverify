var test = require('tape');
var pkg = require('./package.json');
var call = Function.prototype.call;

test('Function.prototype.call', function (t) {
    t.plan(1);
    var res = call([1,2,3],Array.prototype.map,function (x) {
        return x * 100;
    });
    t.deepEqual(res, [100,200,300]);
});
