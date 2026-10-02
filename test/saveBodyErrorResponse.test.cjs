// Current source fragments only. Native EventEmitter/Buffer/JSON, memory fs and response doubles.
// No server import/listen, socket, operating saves, process settings, real clock or cleanup.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {EventEmitter}=require('node:events');
const {createHash}=require('node:crypto');
const {parse}=require('acorn');
const root=path.resolve(__dirname,'..');
const sha=b=>createHash('sha256').update(b).digest('hex');
const plain=x=>JSON.parse(JSON.stringify(x));
const input={slot:'영웅/../ A?',data:{player:{lv:9},game:{stage:4},ts:80}};
const SAVE_DIR='/synthetic-save-body';
const file=path.join(SAVE_DIR,'영웅_____A_.json'),matsFile=path.join(SAVE_DIR,'_sharedMats.json');
const oldBytes='{"player":{"lv":7},"game":{"stage":2},"ts":8}',matsBytes='{"mats":4567,"ts":99}';
function walk(node,visit){if(!node||typeof node!=='object')return;if(node.type)visit(node);for(const child of Object.values(node)){if(Array.isArray(child))for(const n of child)walk(n,visit);else if(child&&typeof child==='object')walk(child,visit);}}
function extract(){
  const bytes=fs.readFileSync(path.join(root,'node-main.js')),source=bytes.toString('utf8'),ast=parse(source,{ecmaVersion:'latest'});
  const text=node=>source.slice(node.start,node.end),nodes=[];walk(ast,node=>nodes.push(node));
  const names=['readBody','sendJSON','sanitizeSlot'];
  const funcs=names.map(name=>{const found=nodes.filter(n=>n.type==='FunctionDeclaration'&&n.id?.name===name);assert.equal(found.length,1);return {name,code:text(found[0]),line:source.slice(0,found[0].start).split('\n').length};});
  const routes=nodes.filter(n=>n.type==='IfStatement'&&text(n.test).includes("pathname === '/api/save'")&&text(n.test).includes("req.method === 'POST'"));
  assert.equal(routes.length,1);const node=routes[0],route=text(node),guarded=node.consequent.body.some(n=>n.type==='TryStatement');let control=route;
  if(guarded){
    const statements=node.consequent.body,attempt=statements.find(n=>n.type==='TryStatement');
    assert.equal(attempt.block.body.length,3);assert.equal(attempt.block.body[0].type,'ExpressionStatement');assert.equal(attempt.block.body[1].type,'ExpressionStatement');assert.equal(attempt.block.body[2].type,'IfStatement');
    assert.equal(text(attempt.block.body[2].test),'body.data');
    // Historical memory oracle: only current AST fragments supply read, sanitize, No-data, write and ACK.
    // Remove the try/catch and turn actual assignments back into const declarations in the old order.
    control=source.slice(node.start,node.consequent.start)+'{\n    const '+text(attempt.block.body[0])+'\n    const '+text(attempt.block.body[1])+'\n    '+text(statements.find(n=>n.type==='IfStatement'))+'\n    '+text(attempt.block.body[2].consequent)+'\n    '+text(statements.find(n=>n.type==='ReturnStatement'))+'\n  }';
  }
  console.log('SOURCE_METADATA '+JSON.stringify({source:'node-main.js',sha256:sha(bytes),bytes:bytes.length,guarded,saveLine:source.slice(0,node.start).split('\n').length,saveSHA256:sha(route),controlSHA256:sha(control),fragments:funcs.map(f=>({name:f.name,line:f.line,sha256:sha(f.code)})),memoryControl:'unguarded current route before patch; after patch, current AST assignments/No-data/write/ACK reconstruct the old branch only for reference',doubles:'memory files/write faults and response calls; native EventEmitter/Buffer/path/JSON; no server import or HTTP'}));
  return {funcs,route,control,guarded};
}
const parts=extract();
function fixture({control=false,writeFailure=false,partialWrite=false,closed=false,sendFailure=null}={}){
  const req=Object.assign(new EventEmitter(),{method:'POST'}),files=new Map([[file,oldBytes],[matsFile,matsBytes]]),trace=[],writes=[];
  const requestError=Object.assign(new Error('synthetic body error; internal path must not leak'),{code:'ECONNRESET'});
  const writeError=Object.assign(new Error('synthetic write EIO; internal path must not leak'),{code:'EIO'});
  const responseError=Object.assign(new Error('synthetic response transmission throw'),{code:'ResponseDoubleError'});
  const response={status:null,headers:null,bytes:null,headCount:0,endCount:0,delivered:[],destroyed:closed,writableEnded:closed};
  const record=(op,extra={})=>trace.push({op,...extra});
  const fakeFs={writeFileSync(target,bytes,encoding){const row={path:target,bytes,encoding};writes.push(row);record('write',row);if(partialWrite)files.set(target,bytes.slice(0,11));if(writeFailure)throw writeError;files.set(target,bytes);}};
  const res={get destroyed(){return response.destroyed;},get writableEnded(){return response.writableEnded;},writeHead(status,headers){response.headCount++;response.status=status;response.headers=plain(headers);record('writeHead',{status,headers:plain(headers)});if(sendFailure==='head')throw responseError;},end(bytes){response.endCount++;response.bytes=bytes;record('end',{bytes});if(sendFailure==='end')throw responseError;if(!closed)response.delivered.push(bytes);response.writableEnded=true;}};
  const context=vm.createContext({req,res,fs:fakeFs,path,Buffer,JSON,SAVE_DIR,pathname:'/api/save'});
  vm.runInContext(parts.funcs.map(f=>f.code).join('\n'),context,{timeout:1000});
  const handler=vm.runInContext('(async()=>{'+(control?parts.control:parts.route)+'})()',context,{timeout:1000});
  // Observe the returned handler Promise. This does not catch/respond inside the production route.
  const outcome=handler.then(value=>{record('handlerFulfilled',{returned:value===undefined?'undefined':plain(value)});return {fulfilled:true,value};},error=>{record('handlerRejected',{name:error.name,code:error.code||null});return {fulfilled:false,error};});
  const error=()=>{record('requestError');req.emit('error',requestError);};
  const data=bytes=>{record('requestData',{hex:bytes.toString('hex')});req.emit('data',bytes);};
  const end=()=>{record('requestEnd');req.emit('end');};
  const complete=value=>{const bytes=Buffer.from(JSON.stringify(value));data(bytes.subarray(0,11));data(bytes.subarray(11));end();};
  const report=()=>({response:plain(response),writes:plain(writes),files:[...files],trace:plain(trace),listeners:Object.fromEntries(['data','end','error','aborted','close'].map(name=>[name,req.listenerCount(name)]))});
  return {req,files,trace,writes,response,requestError,writeError,responseError,outcome,error,data,end,complete,report};
}
function assertReply(w,status,body){assert.equal(w.response.status,status);assert.deepEqual(JSON.parse(w.response.bytes),body);assert.deepEqual(w.response.headers,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});assert.equal(w.response.headCount,1);assert.equal(w.response.endCount,1);}
function assertNoWrite(w){assert.equal(w.writes.length,0);assert.equal(w.files.get(file),oldBytes);assert.equal(w.files.get(matsFile),matsBytes);}
async function expectFailure(w,act){act();const result=await w.outcome;assert.equal(result.fulfilled,true);assert.equal(result.value,undefined);assertReply(w,500,{ok:false,error:'Internal Server Error'});return result;}
function boundary(label,w,result){console.log('BOUNDARY '+JSON.stringify({label,guarded:parts.guarded,outcome:result.fulfilled?'fulfilled':'rejected',sameRequestError:result.error===w.requestError,response:w.response,writes:w.writes,trace:w.trace,files:[...w.files],limits:'response calls and memory bytes only; native delivery/disk preservation not established'}));}
test('request error immediately after listener registration ends in one generic500 and write0',async()=>{
  const w=fixture();await expectFailure(w,()=>w.error());assertNoWrite(w);assert.equal(w.response.delivered.length,1);boundary('immediate request error',w,{fulfilled:true});
});
test('request error after a partial body ends in one500 without consuming data or changing previous slot',async()=>{
  const w=fixture();await expectFailure(w,()=>{w.data(Buffer.from('{"slot":"other"'));w.error();});assertNoWrite(w);boundary('partial body error',w,{fulfilled:true});
});
test('malformed JSON body rejection ends in500 rather than the distinct No data400 path',async()=>{
  const w=fixture();await expectFailure(w,()=>{w.data(Buffer.from('{'));w.end();});assertNoWrite(w);boundary('malformed JSON',w,{fulfilled:true});
});
test('valid JSON null shape fails inside the approved save catch and responds500 with write0',async()=>{
  const w=fixture();await expectFailure(w,()=>w.complete(null));assertNoWrite(w);boundary('null JSON body shape',w,{fulfilled:true});
});
test('sanitize failure from actual JSON slot shape is inside the same500 catch and write0',async()=>{
  const w=fixture();await expectFailure(w,()=>w.complete({slot:{toString:1},data:{x:1}}));assertNoWrite(w);
});
test('write exception returns one500 after one attempt; direct-write policy adds no rollback',async()=>{
  for(const partialWrite of [false,true]){const w=fixture({writeFailure:true,partialWrite});await expectFailure(w,()=>w.complete(input));assert.equal(w.writes.length,1);assert.equal(w.files.get(matsFile),matsBytes);assert.equal(w.files.get(file),partialWrite?JSON.stringify(input.data,null,2).slice(0,11):oldBytes);assert.equal(w.response.delivered.length,1);boundary(partialWrite?'injected partial memory write error':'injected pre-mutation write error',w,{fulfilled:true});}
});
test('normal sanitize/pretty UTF8 bytes/write-before200 trace equals historical memory control',async()=>{
  for(const value of [input,{data:{player:{lv:1},unicode:'한글 😀'}},{slot:'한글'+'A'.repeat(60),data:{ok:1}}]){
    const w=fixture(),control=fixture({control:true});for(const f of [w,control]){f.complete(value);const r=await f.outcome;assert.equal(r.fulfilled,true);const slot=String(value.slot||'default').replace(/[^a-zA-Z0-9가-힣_\-]/g,'_').slice(0,50);assertReply(f,200,{ok:true,slot});assert.equal(f.writes.length,1);assert.equal(f.writes[0].bytes,JSON.stringify(value.data,null,2));assert.equal(f.writes[0].encoding,'utf8');assert.equal(f.writes[0].path,path.join(SAVE_DIR,slot+'.json'));assert.ok(f.trace.findIndex(t=>t.op==='write')<f.trace.findIndex(t=>t.op==='writeHead'));}
    assert.deepEqual(w.report(),control.report());console.log('NORMAL_TRACE '+JSON.stringify({label:'normal save',input:value,traceSHA256:sha(JSON.stringify(w.report())),report:w.report(),equal:true}));
  }
});
test('successful JSON with missing/falsy data retains one400 and exactly the historical trace',async()=>{
  for(const value of [{},{data:null},{data:false},{data:0},{data:''}]){
    const w=fixture(),control=fixture({control:true});for(const f of [w,control]){f.complete(value);const r=await f.outcome;assert.equal(r.fulfilled,true);assertReply(f,400,{ok:false,error:'No data'});assertNoWrite(f);}
    assert.deepEqual(w.report(),control.report());console.log('NORMAL_TRACE '+JSON.stringify({label:'No data400',input:value,traceSHA256:sha(JSON.stringify(w.report())),equal:true}));
  }
});
test('historical memory control leaves request/parse/null/write failure rejected with response0',async()=>{
  for(const kind of ['request','parse','null','write']){
    const w=fixture({control:true,writeFailure:kind==='write'});if(kind==='request')w.error();else if(kind==='parse'){w.data(Buffer.from('{'));w.end();}else w.complete(kind==='null'?null:input);
    const r=await w.outcome;assert.equal(r.fulfilled,false);if(kind==='request')assert.equal(r.error,w.requestError);if(kind==='write')assert.equal(r.error,w.writeError);assert.equal(w.response.headCount,0);assert.equal(w.response.endCount,0);assert.equal(w.writes.length,kind==='write'?1:0);boundary('old memory '+kind,w,r);
  }
});
test('closed response double sees one500 attempt and no write; native wire delivery remains unknown',async()=>{
  const w=fixture({closed:true});await expectFailure(w,()=>w.error());assertNoWrite(w);assert.equal(w.response.delivered.length,0);boundary('closed response double',w,{fulfilled:true});
});
test('500 sendJSON writeHead/end throw is propagated once and not hidden by another response attempt',async()=>{
  for(const sendFailure of ['head','end']){const w=fixture({sendFailure});w.error();const r=await w.outcome;assert.equal(r.fulfilled,false);assert.equal(r.error,w.responseError);assert.equal(w.response.status,500);assert.equal(w.response.headCount,1);assert.equal(w.response.endCount,sendFailure==='end'?1:0);assertNoWrite(w);boundary('500 '+sendFailure+' response throw',w,r);}
});
test('success200 and No data400 send exceptions stay outside catch and match historical control',async()=>{
  for(const value of [input,{}])for(const sendFailure of ['head','end']){
    const w=fixture({sendFailure}),control=fixture({sendFailure,control:true});for(const f of [w,control]){f.complete(value);const r=await f.outcome;assert.equal(r.fulfilled,false);assert.equal(r.error,f.responseError);assert.equal(f.response.status,value.data?200:400);assert.equal(f.response.headCount,1);assert.equal(f.response.endCount,sendFailure==='end'?1:0);assert.equal(f.writes.length,value.data?1:0);}
    assert.deepEqual(w.report(),control.report());
  }
});
