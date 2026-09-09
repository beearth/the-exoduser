import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { EventEmitter } from 'node:events';

test('shipped server persists shared mats separately from character slots', async () => {
  let handler;
  const files = new Map();
  const fakeFs = {
    appendFileSync(){}, existsSync(p){return files.has(p);}, mkdirSync(){},
    writeFileSync(p,data){files.set(p,data);},
    readFileSync(p){return files.get(p);},
    readdirSync(){return [...files.keys()].map(p=>path.basename(p));},
    readFile(p,cb){cb(new Error('missing'));}
  };
  const modules = {fs:fakeFs,path,url:await import('node:url'),http:{createServer(cb){handler=cb;return {listen(){}};}}};
  vm.runInNewContext(fs.readFileSync('node-main.js','utf8'), {
    require:id=>modules[id], __dirname:'app', process:{env:{APPDATA:'isolated'}}, Buffer, console
  });
  async function request(url,method='GET',body){
    const req=new EventEmitter();Object.assign(req,{url,method});
    let status,result;
    const done=handler(req,{writeHead(s){status=s;},end(data){result=data;}});
    if(body){req.emit('data',Buffer.from(JSON.stringify(body)));req.emit('end');}
    await done;return {status,data:status===200?JSON.parse(result):result};
  }
  assert.deepEqual(await request('/api/mats'),{status:200,data:{ok:true,mats:0}});
  assert.deepEqual(await request('/api/mats','POST',{mats:42.9}),{status:200,data:{ok:true,mats:42}});
  assert.equal((await request('/api/mats')).data.mats,42);
  assert.deepEqual((await request('/api/slots')).data.slots,[]);
  assert.equal((await request('/api/mats','POST',{mats:-3})).data.mats,0);
});
