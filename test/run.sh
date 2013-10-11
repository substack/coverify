#!/bin/bash
browserify -t . test/for.js | node
