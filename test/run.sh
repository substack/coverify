#!/bin/bash
(browserify test/ok.js | node | bin/cmd.js \
    || (echo FAIL test/ok.js; exit 1)) \
&& (browserify test/fail.js | node | bin/cmd.js \
    && (echo FAIL test/fail.js; exit 1))
exit $?
