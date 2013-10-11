var test = require('tape');

test('not covered', function (t) {
    t.plan(3);
    
    [ 10, 5, 24 ].forEach(function (n) {
        var sum = 0;
        for (var i = 0; i <= n; i++) {
            if (i > 30) unreachable();
            sum += i;
        }
        t.equal(sum, (n * (n+1)) / 2);
    });
});
