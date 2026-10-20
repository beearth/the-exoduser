'use strict';
// QA-only: deliberately unusable console JSON, independently correct UTF-8 file.
const fs = require('node:fs');
const output = process.argv[3], mode = process.argv[2];
const value = {text:'한글 가😀 끝', json:{raw:'{"x":"\\uAC00\\uD83D\\uDE00"}',expected:{x:'가😀'}},nested:[0,false,null,'따옴표"\\\n']};
for (const chunk of ['{"text":','"???"}', '\nnot JSON\n']) process.stdout.write(chunk);
if (mode === 'missing') process.exit(0);
if (mode === 'malformed') fs.writeFileSync(output, '{"text":', {encoding:'utf8',flag:'wx'});
else require('./oracle_json_output.cjs')(value, output);
if (mode === 'failed') process.exitCode = 3;
