// Read-only generic entry point around the current approved source analyzer.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const input=process.argv[2];
if(!input){console.error('Usage: node analyze-normal-capture.mjs raw.json [analysis.json]');process.exit(2);}
const file=path.resolve(input),rawBytes=fs.readFileSync(file),raw=JSON.parse(rawBytes);
const analyzerFile=path.join(root,'tools/team-followup-20261001/QA/analyze-support-normal.mjs');
const source=fs.readFileSync(analyzerFile,'utf8');
const begin=source.indexOf('function analyze(raw){'),end=source.indexOf('const result=analyze(raw);');
if(begin<0||end<begin)throw Error('Approved analyzer extraction boundary drifted');
const analyze=vm.runInNewContext(source.slice(begin,end)+';analyze',{}, {timeout:1000});
const result=analyze(raw);
// These archived prose statements depend on the old capture, not the algorithm.
if(result.limits)result.limits=result.limits.filter(x=>!x.includes('batch contains two kills')&&!x.includes('post-run screenshot'));
result.provenance={rawFile:file,rawSha256:crypto.createHash('sha256').update(rawBytes).digest('hex'),
  analyzerFile,analyzerSha256:crypto.createHash('sha256').update(source).digest('hex'),
  analyzedAt:new Date().toISOString(),newMeasurement:false,
  note:'Running this CLI only analyzes supplied JSON. Its run is not gameplay, runtime verification, or a new sample.'};
const output=JSON.stringify(result,null,2)+'\n';
if(process.argv[3])fs.writeFileSync(path.resolve(process.argv[3]),output);else process.stdout.write(output);
process.exitCode=result.eligible===true?0:1;
