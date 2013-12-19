var test = require('tape');

test('ok ok', function (t) {
    t.plan(3);
    
    forEach([ 10, 5, 24 ], function (n) {
        var sum = 0;
        for (var i = 0; i <= n; i++) {
            sum += i;
        }
        t.equal(sum, (n * (n+1)) / 2);
    });
});

function forEach (xs, f) {
    if (xs.forEach) return xs.forEach(f);
    for (var i = 0; i < xs.length; i++) {
        f(xs[i], i);
    }
}
