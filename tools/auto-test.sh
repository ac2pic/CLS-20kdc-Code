#!/bin/sh
# Feel free to write a BAT version, I'm busy.
node to-cjs.js < patch-steps-es6.js > patch-steps-lib.js
cd tests
node ../difftool.js diff 1a.json 1b.json > test-temp.json
node ../difftool.js patch 1c.json test-temp.json > test-temp-2.json
diff -u 1d.json test-temp-2.json # OUTPUT HERE: FAIL
rm test-temp.json test-temp-2.json

node ../difftool.js patch 2a.json 2b.json > test-temp.json
diff -u 2c.json test-temp.json # OUTPUT HERE: FAIL
rm test-temp.json
