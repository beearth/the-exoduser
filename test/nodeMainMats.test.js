import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { EventEmitter } from 'node:events';

async function createHarness({ appData = 'isolated', writeFile } = {}) {
  let handler;
  const files = new Map();
  const writes = [];
  const fakeFs = {
    appendFileSync(){}, existsSync(p){return files.has(p);}, mkdirSync(){},
    writeFileSync(p,data,encoding){
      writes.push({path:p,data,encoding});
      if (writeFile) return writeFile(p,data,encoding);
      files.set(p,data);
    },
    readFileSync(p){return files.get(p);},
    readdirSync(){return [...files.keys()].map(p=>path.basename(p));},
    readFile(p,cb){cb(new Error('missing'));}
  };
  const modules = {fs:fakeFs,path,url:await import('node:url'),http:{createServer(cb){handler=cb;return {listen(){}};}}};
  vm.runInNewContext(fs.readFileSync('node-main.js','utf8'), {
    require:id=>modules[id], __dirname:'app', process:{env:{APPDATA:appData}}, Buffer, console
  });
  async function request(url,method='GET',body,{rawBody,streamError}={}){
    const req=new EventEmitter();Object.assign(req,{url,method});
    let status,result,headers,headCount=0,endCount=0;
    const done=handler(req,{
      writeHead(s,h){status=s;headers=h;headCount++;},
      end(data){result=data;endCount++;}
    });
    if(streamError) req.emit('error',streamError);
    else if(rawBody!==undefined||body!==undefined){
      req.emit('data',Buffer.from(rawBody??JSON.stringify(body)));req.emit('end');
    }
    await done;
    return {status,data:headers?.['Content-Type']==='application/json'?JSON.parse(result):result,
      headers:{...headers},headCount,endCount};
  }
  return {request,files,writes};
}

function assertJSONReply(reply,status,data) {
  assert.equal(reply.status,status);
  assert.deepEqual(reply.data,data);
  assert.deepEqual(reply.headers,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});
  assert.equal(reply.headCount,1);
  assert.equal(reply.endCount,1);
}

test('shipped server persists shared mats separately from character slots', async () => {
  const {request,writes}=await createHarness();
  assertJSONReply(await request('/api/mats'),200,{ok:true,mats:0});
  assertJSONReply(await request('/api/mats','POST',{mats:42.9}),200,{ok:true,mats:42});
  assert.equal((await request('/api/mats')).data.mats,42);
  assert.deepEqual((await request('/api/slots')).data.slots,[]);
  assertJSONReply(await request('/api/mats','POST',{mats:-3}),200,{ok:true,mats:0});
  assert.equal(writes.length,2);
  assert(writes.every(write=>path.basename(write.path)==='_sharedMats.json'));
  assert(writes.every(write=>write.encoding==='utf8'));
  assert.deepEqual(writes.map(write=>JSON.parse(write.data).mats),[42,0]);
  assert(writes.every(write=>Number.isFinite(JSON.parse(write.data).ts)));
});

test('shared mats malformed JSON ends with one failure response and no write', async () => {
  const {request,writes}=await createHarness();
  const reply=await request('/api/mats','POST',undefined,{rawBody:'{'});
  assertJSONReply(reply,500,{ok:false,error:'Internal Server Error'});
  assert.equal(writes.length,0);
});

test('shared mats request stream rejection ends with one failure response and no write', async () => {
  const {request,writes}=await createHarness();
  const reply=await request('/api/mats','POST',undefined,{streamError:new Error('request body failed')});
  assertJSONReply(reply,500,{ok:false,error:'Internal Server Error'});
  assert.equal(writes.length,0);
});

test('shared mats actual filesystem ENOENT ends with one failure response', async () => {
  // mkdirSync remains a no-op in this harness: the real write targets an absent parent.
  const appData=path.resolve('test',`node-main-mats-missing-parent-${process.pid}`);
  assert.equal(fs.existsSync(appData),false);
  let writeError;
  const {request,writes}=await createHarness({appData,writeFile(p,data,encoding){
    try { fs.writeFileSync(p,data,encoding); }
    catch(error){writeError=error;throw error;}
  }});
  const reply=await request('/api/mats','POST',{mats:123});
  assertJSONReply(reply,500,{ok:false,error:'Internal Server Error'});
  assert.equal(writes.length,1);
  assert.equal(writeError?.code,'ENOENT');
  assert.equal(writeError?.path,writes[0].path);
  assert.equal(fs.existsSync(appData),false);
});
