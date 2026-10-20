'use strict';
// Test oracle transport only. Optional output path bypasses Windows console decoding.
const fs = require('node:fs');
module.exports = function writeOracleJSON(value, output = process.argv[3]) {
  const json = JSON.stringify(value) + '\n';
  if (output) fs.writeFileSync(output, json, {encoding: 'utf8', flag: 'wx'});
  else process.stdout.write(json);
};
