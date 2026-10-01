import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {parse} from 'acorn';
import {applyCandidate} from '../BUILD/conditional-range-candidate.mjs';
const prefix='outputs/team-review-20261002/conditional-integration/conditional-',startedAt=new Date().toISOString(),source=fs.readFileSync('outputs/team-review-20261002/conditional-integration/conditional-before.cjs','utf8'),candidate=fs.readFileSync('server.cjs','utf8'),hash=value=>createHash('sha256').update(value).digest('hex');
if(hash(source)!=='6a7c1083ac10b105cca3624c8fd0e919d14a59b32774612ff0a00cb881be8538')throw Error('TASK_SOURCE_CHANGED');
function extract(value){const begin=value.indexOf('      const _rangeMatch'),newBegin=value.indexOf("      const _isHtml = ext === '.html';");let branch;function walk(node){if(!node||typeof node!=='object')return;if(node.type==='IfStatement'&&node.test.type==='Identifier'&&node.test.name==='range')branch=node;for(const child of Object.values(node)){if(Array.isArray(child))child.forEach(walk);else if(child&&typeof child==='object')walk(child);}}walk(parse(value,{ecmaVersion:'latest'}));return value.slice(value===source?begin:newBegin,branch.end);}
async function run(value,input){const calls=[],res={headersSent:false,status:null,headers:{},writeHead(status,headers){this.status=status;this.headers=headers??{};this.headersSent=true;},end(body){calls.push({endBytes:body?.length??0});},on(){}};const stream=()=>({on(){return this;},destroy(){},pipe(target){calls.push('pipe');return target;}});const context={req:{method:input.method??'GET',headers:input.headers??{}},stat:{size:input.size??10000,mtimeMs:1},ext:input.ext??'.mp4',mime:'fixture/mime',filePath:'fixture',res,fs:{createReadStream(file,options){calls.push({stream:options??null});return stream();}},COMPRESSIBLE:new Set(['.html','.js']),gzipHtmlCached:async()=>Buffer.from('compressed'),zlib:{createGzip:stream},console:{error(){}}};await vm.runInNewContext('(async()=>{'+extract(value)+'})()',context);return JSON.parse(JSON.stringify({status:res.status,headers:res.headers,calls}));}
const cases=[
 ['INM-before-range',{headers:{range:'bytes=0-9','if-none-match':'"2710-1"'}},304],
 ['INM-before-unsatisfiable',{headers:{range:'bytes=20000-','if-none-match':'"2710-1"'}},304],
 ['IfRange-mismatch',{headers:{range:'bytes=0-9','if-range':'"other"'}},200],
 ['IfRange-same-conservative',{headers:{range:'bytes=0-9','if-range':'"2710-1"'}},200],
 ['IfRange-weak',{headers:{range:'bytes=0-9','if-range':'W/"2710-1"'}},200],
 ['IfRange-date',{headers:{range:'bytes=0-9','if-range':'Thu, 01 Jan 1970 00:00:00 GMT'}},200],
 ['IfRange-invalid',{headers:{range:'bytes=0-9','if-range':'invalid'}},200],
 ['IfRange-empty',{headers:{range:'bytes=0-9','if-range':''}},200],
 ['INM-precedes-IfRange',{headers:{range:'bytes=0-9','if-range':'"other"','if-none-match':'"2710-1"'}},304]
];
const red=[];for(const [name,input,status] of cases){const original=await run(source,input),fixed=await run(candidate,input);assert.equal(fixed.status,status,name);if(status===304)assert(!fixed.calls.some(call=>call.stream));if(status===200)assert.equal(fixed.headers['Content-Range'],undefined);red.push({name,input,expected:status,original,candidate:fixed});}
const ranges=['bytes=0-9','bytes=9500-','bytes=-500','bytes=-20000','bytes=9000-20000','bytes=-0','bytes=20000-','bytes=4-2','bytes=999999999999999999999-','bytes=-999999999999999999999','bytes=0-999999999999999999999','items=0-9','bytes=1x-9','bytes=0-1,8-9','bytes=-'];
const preserved=[];for(const range of ranges){const input={headers:{range}},original=await run(source,input),fixed=await run(candidate,input);assert.deepEqual(fixed,original,range);preserved.push({input,result:fixed});}
for(const input of [{headers:{}},{headers:{range:'bytes=-500'},size:0},{headers:{range:'bytes=0-9'},method:'HEAD'},{headers:{'if-none-match':'"2710-1"'}},{headers:{'accept-encoding':'gzip'},ext:'.html'},{headers:{'accept-encoding':'gzip'},ext:'.js'}]){assert.deepEqual(await run(candidate,input),await run(source,input));preserved.push({input,result:await run(candidate,input)});}
const outsideBefore=source.slice(0,source.indexOf('      const _rangeMatch')),outsideAfter=candidate.slice(0,candidate.indexOf("      const _isHtml = ext === '.html';"));assert.equal(outsideBefore,outsideAfter);
const limitations=await Promise.all([{'if-none-match':'W/"2710-1"'},{'if-none-match':'*'},{'if-none-match':'"other", "2710-1"'},{'if-modified-since':'Thu, 01 Jan 1970 00:00:01 GMT'}].map(async headers=>({input:{headers:{...headers,range:'bytes=0-9'}},result:await run(candidate,{headers:{...headers,range:'bytes=0-9'}})})));
assert.equal(hash(fs.readFileSync('server.cjs')),hash(candidate));parse(candidate,{ecmaVersion:'latest'});
fs.writeFileSync(prefix+'red.json',JSON.stringify({sourceSHA:hash(source),red},null,2)+'\n');fs.writeFileSync(prefix+'candidate-server.cjs',candidate);
const result={startedAt,completedAt:new Date().toISOString(),sourceSHA:hash(source),candidateSHA:hash(candidate),originalExtractSHA:hash(extract(source)),candidateExtractSHA:hash(extract(candidate)),tests:red.length+preserved.length+1,red,preserved,saveAndRoutePrefixUnchanged:true,prefixSHA:hash(outsideBefore),limitations,limits:'validator 강도가 보장되지 않아 모든 If-Range는 전체200 폴백; HTTP 전체 적합성 아닌 좁은 후보'};
fs.writeFileSync(prefix+'evidence.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({tests:result.tests,red:red.map(entry=>({name:entry.name,original:entry.original.status,candidate:entry.candidate.status})),completedAt:result.completedAt,sourceSHA:result.sourceSHA,limitations}));
