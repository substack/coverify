var foo = require('./foo.js');

foo(function (err, x) {
    if (err) deadCode();
    console.log(x * 5);
});
