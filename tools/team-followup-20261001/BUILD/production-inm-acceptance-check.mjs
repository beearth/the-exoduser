import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {parse} from 'acorn';
import {applyCandidate,matchesIfNoneMatch} from './inm-matching-candidate.mjs';
const prefix='tools/team-followup-20261001/BUILD/production-inm-acceptance-',startedAt=new Date().toISOString(),source=fs.readFileSync('server.cjs','utf8'),hash=value=>createHash('sha256').update(value).digest('hex');
const root=JSON.parse(fs.readFileSync('outputs/team-review-20261002/four-candidate-acceptance/server-production-acceptance.json'));
const before=fs.readFileSync('outputs/team-review-20261002/four-candidate-acceptance/server.cjs.before','utf8');
const ast=parse(source,{ecmaVersion:'latest'});const helper=ast.body.find(node=>node.type==='FunctionDeclaration'&&node.id.name==='matchesIfNoneMatch');assert(helper);
const helperSource=source.slice(helper.start,helper.end);assert.equal(helperSource,matchesIfNoneMatch.toString());assert.equal(hash(source),root.current);assert.equal(hash(before),root.before);assert.equal(applyCandidate(before),source);
const functions=[];let staticNode;function walk(node){if(!node||typeof node!=='object')return;if(node.type==='IfStatement'&&source.slice(node.test.start,node.test.end).includes('fs.existsSync(filePath) && fs.statSync(filePath).isFile()'))staticNode=node;for(const child of Object.values(node)){if(Array.isArray(child))child.forEach(walk);else if(child&&typeof child==='object')walk(child);}}walk(ast);assert(staticNode);
const staticSource=source.slice(staticNode.start,staticNode.end);
async function run(input){const calls=[],res={headersSent:false,status:null,headers:{},writeHead(status,headers){this.status=status;this.headers=headers??{};this.headersSent=true;},end(){calls.push('end');},on(){}};const stream={on(){return this;},pipe(target){calls.push('pipe');return target;},destroy(){}};
  const context={req:{method:input.method??'GET',headers:input.headers??{}},res,filePath:input.ext==='.html'?'fixture.html':'fixture.mp4',fs:{existsSync:()=>true,statSync:()=>({size:4096,mtimeMs:256.8,isFile:()=>true}),createReadStream(file,options){calls.push({stream:options??null});return stream;}},path:{extname:value=>value.endsWith('.html')?'.html':'.mp4'},MIME:{'.mp4':'video/mp4','.html':'text/html'},COMPRESSIBLE:new Set(['.html']),gzipHtmlCached:async()=>Buffer.from('fake gzip'),zlib:{createGzip:()=>stream},console:{error(){}}};await vm.runInNewContext(helperSource+'\n(async()=>{'+staticSource+'})()',context);return JSON.parse(JSON.stringify({status:res.status,headers:res.headers,calls}));}
const cases=[
 {name:'생산stat값 weak + out-of-range보다304우선',headers:{'if-none-match':'W/"1000-100"',range:'bytes=4096-'},expected:304},
 {name:'HEAD wildcard + IfRange불일치보다304',method:'HEAD',headers:{'if-none-match':'*','if-range':'"stale"',range:'bytes=0-1'},expected:304},
 {name:'opaque 쉼표를현재tag로오인하지않음',headers:{'if-none-match':'"1000-100,other"',range:'bytes=-17'},expected:206,range:'bytes 4079-4095/4096'},
 {name:'인용쉼표목록뒤weak매치',headers:{'if-none-match':'"x,y", W/"1000-100"',range:'bytes=0-1'},expected:304},
 {name:'matching앞부분+malformed끝은304금지',headers:{'if-none-match':'"1000-100", garbage',range:'bytes=0-1'},expected:206,range:'bytes 0-1/4096'},
 {name:'불일치INM+sameIfRange는보수적전체',headers:{'if-none-match':'"miss"','if-range':'"1000-100"',range:'bytes=-17'},expected:200},
 {name:'HTML wildcard는기존정책과gzip보존',ext:'.html',headers:{'if-none-match':'*',range:'items=0-2','accept-encoding':'gzip'},expected:200},
 {name:'POST INM wildcard가정적304를만들지않음',method:'POST',headers:{'if-none-match':'*',range:'bytes=0-1'},expected:200},
 {name:'HEAD 불일치는full200',method:'HEAD',headers:{'if-none-match':'W/"miss"',range:'bytes=0-1'},expected:200}
];const results=[];for(const input of cases){const result=await run(input);assert.equal(result.status,input.expected,input.name);if(input.range)assert.equal(result.headers['Content-Range'],input.range);if(input.expected===304){assert(!result.calls.some(call=>call.stream));assert.equal(result.headers.ETag,'"1000-100"');}if(input.ext==='.html')assert.equal(result.headers['Content-Encoding'],'gzip');results.push({input,result});}
const tests=results.length+4;assert.equal(hash(fs.readFileSync('server.cjs')),hash(source));
const evidence={startedAt,completedAt:new Date().toISOString(),sourceSHA:hash(source),beforeSHA:hash(before),helperSHA:hash(helperSource),staticBranchSHA:hash(staticSource),candidateExact:true,outsideTwoChangesPreserved:true,root84ObservedAt:root.at,tests,results,limits:'실제정적존재/stat/MIME/INM/Range분기대역;서버전체실행/실HTTP/실UI/strongvalidator검수0'};
fs.writeFileSync(prefix+'evidence.json',JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify({tests,sourceSHA:evidence.sourceSHA,candidateExact:true,completedAt:evidence.completedAt}));
