import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
for(const file of ['server.cjs','node-main.js','tools/local-static-server.mjs'])test(file+' declares WebVTT MIME type',()=>{
 const source=fs.readFileSync(file,'utf8'),object=source.match(/const MIME\s*=\s*(\{[\s\S]*?\});/);assert.ok(object);
 const mime=vm.runInNewContext('('+object[1]+')');assert.equal(mime['.vtt'],'text/vtt; charset=utf-8');
});
test('packaged server serves all29 native subtitle tracks with correct headers and complete cues',async()=>{
 let handler;
 const http={createServer(fn){handler=fn;return {listen(){}};}};
 const noWrites={...fs,existsSync:()=>true,appendFileSync(){},mkdirSync(){throw Error('No directories should be created');}};
 vm.runInNewContext(fs.readFileSync('node-main.js','utf8'),{require:name=>name==='http'?http:name==='fs'?noWrites:require(name),__dirname:process.cwd(),process:{env:{APPDATA:path.resolve('tmp/subtitle-serving-profile')}},console,Buffer});
 for(const code of 'ko en zh zht ja es fr de ru ptbr it vi th id tr pl cs hu bg el fi sv da no nl ro uk ar ms'.split(' ')){
  const response=await new Promise((resolve,reject)=>{let status,headers;const res={writeHead(s,h){status=s;headers=h;},end(body){resolve({status,headers,body:String(body)});}};Promise.resolve(handler({url:'/video/subtitles/warrior_story_v23_'+code+'.vtt',method:'GET',headers:{}},res)).catch(reject);});
  assert.equal(response.status,200,code);assert.equal(response.headers['Content-Type'],'text/vtt; charset=utf-8',code);assert.match(response.body,/^WEBVTT/);assert.equal((response.body.match(/ --> /g)||[]).length,22,code);
 }
});
