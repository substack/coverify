#!/bin/bash
browserify -t . test/ok.js | node | bin/cmd.js \
    || (echo FAIL test/ok.js; exit 1)
browserify -t . test/fail.js | node | bin/cmd.js \
    && (echo FAIL test/fail.js; exit 1)
echo OK
exit 0
