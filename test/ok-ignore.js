var test = require('tape');
var pkg = require('./package.json');

test('ok ok', function (t) {
    t.plan(0);
});

var notRun = function() {
    throw new Error('Shouldn\'t run');
};
