var test = require('tape');
var template = require('./ignore-transform.hbs');

test('covered', function (t) {
  var result = template({name: 'substack'});
  t.equal(result, 'Hi substack!');
});
