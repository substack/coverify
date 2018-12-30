var test = require('tape');

test('Function instanceof', function (t) {
    t.plan(1);
    function f() {}
    t.ok(f instanceof Function);
});
