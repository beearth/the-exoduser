import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { Readable, Writable } from 'node:stream';

test('shipped media supports byte ranges required for cinematic seeking', async () => {
  let handler;
  const media=Buffer.from('0123456789');
  const fakeFs={appendFileSync(){},existsSync(){return true;},stat(p,cb){cb(null,{size:media.length,isFile:()=>true});},
    readFile(p,cb){cb(null,media);},
    createReadStream(p,{start=0,end=media.length-1}={}){return Readable.from(media.subarray(start,end+1));}};
  const modules={fs:fakeFs,path,url:await import('node:url'),http:{createServer(cb){handler=cb;return{listen(){}};}}};
  vm.runInNewContext(fs.readFileSync('node-main.js','utf8'),{require:id=>modules[id],__dirname:'app',process:{env:{APPDATA:'isolated'}},Buffer,console});
  async function request(range){
    const chunks=[];let status,headers;
    const res=new Writable({write(chunk,encoding,done){chunks.push(chunk);done();}});
    res.writeHead=(s,h)=>{status=s;headers=h;};
    const finished=new Promise(resolve=>res.on('finish',resolve));
    await handler({url:'/video/movie.mp4',method:'GET',headers:{range}},res);await finished;
    return{status,headers,body:Buffer.concat(chunks).toString()};
  }
  const partial=await request('bytes=2-5');
  assert.equal(partial.status,206);assert.equal(partial.body,'2345');
  assert.equal(partial.headers['Content-Range'],'bytes 2-5/10');
  assert.equal((await request('bytes=-3')).body,'789');
  assert.equal((await request('bytes=99-')).status,416);
});
