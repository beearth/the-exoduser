import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';

function module(){
 const path=new URL('../warrior-bat-swing.js',import.meta.url);
 assert.ok(fs.existsSync(path),'dedicated full swing animation exists');
 const c=vm.createContext({});vm.runInContext(fs.readFileSync(path,'utf8'),c);return c.WarriorBatSwing;
}
test('full swing preserves the opposite-shoulder follow-through before lowering the sword',()=>{
 const a=module();
 for(const r of [4,16,40]){
  const poses=[];
  for(let left=5;left>=1;left--)poses.push(a.frame('wSwing',left,10,r));
  for(let left=r;left>=0;left--)poses.push(a.frame('wRecover',left,10,r));
  assert.ok(poses.includes(2),'full cocked pose appears');
  assert.ok(poses.includes(4),'contact pose appears');
  assert.ok(poses.includes(6),'opposite-shoulder finish appears');
  assert.equal(poses.at(-1),8);
  assert.ok(poses.every((f,i)=>f>=0&&f<=8&&(i===0||f>=poses[i-1])));
 }
});
test('E swing traverses all nine new poses, including held coil and finish',()=>{
 const a=module(),poses=[];
 for(let left=20;left>=1;left--)poses.push(a.frame('sBash',left,10,28));
 for(let left=28;left>=0;left--)poses.push(a.frame('sRecover',left,10,28));
 assert.deepEqual([...new Set(poses)],[0,1,2,3,4,5,6,7,8]);
 assert.equal(a.frame('sBash',10,10,28),4);
 assert.ok(poses.filter(x=>x===2).length>=2);
 assert.ok(poses.filter(x=>x===6).length>=5);
});
test('swing playback runs at 85 percent and carries into recovery without restarting',()=>{
 const a=module();assert.equal(a.speed,.85);
 assert.equal(a.frame('wSwing',4,10,16),2);
 assert.equal(a.frame('sBash',12,10,28),2);
 for(const [active,recover,total] of [['wSwing','wRecover',5],['sBash','sRecover',20]]){
  for(const duration of [1,4,16,28]){
   const before=a.frame(active,0,10,duration),after=a.frame(recover,duration,10,duration);
   assert.equal(after,before);
   assert.equal(a.frame(recover,0,10,duration),8);
  }
 }
});
test('atlas merge replaces only warrior attack animations and falls back on load failure',()=>{
 const path=new URL('../warrior-bat-swing.js',import.meta.url);assert.ok(fs.existsSync(path));
 let pending;const calls=[];
 const c=vm.createContext({Image:class{constructor(){pending=this;}},document:{createElement:()=>({getContext:()=>({drawImage:(...args)=>calls.push(args)})})}});
 vm.runInContext(fs.readFileSync(path,'utf8'),c);
 const base={width:1008,height:384},fm={idle_s:[{x:0}],run_s:[{x:48}]};let result;
 c.WarriorBatSwing.apply(base,fm,(...x)=>result=x);pending.onerror();assert.equal(result[0],base);
 c.WarriorBatSwing.apply(base,fm,(...x)=>result=x);pending.naturalWidth=720;pending.naturalHeight=640;pending.onload();
 assert.equal(result[1].idle_s,fm.idle_s);assert.equal(result[1].run_s,fm.run_s);
 assert.equal(result[1].atk2_se.length,9);assert.equal(result[1].atk2_se[8].x,640);
 assert.equal(result[1].atk2_se[0].y,464);assert.equal(fm.atk2_se,undefined);
});
test('packed sheet has clear cell borders and identical neutral endpoints for all directions',async()=>{
 const {data,info}=await sharp(fileURLToPath(new URL('../img/exoduser_warrior/attack-bat-v1.png',import.meta.url))).raw().toBuffer({resolveWithObject:true});
 assert.equal(info.width,720);assert.equal(info.height,640);assert.equal(info.channels,4);
 for(let row=0;row<8;row++)for(let y=0;y<80;y++){
  const first=((row*80+y)*720)*4,last=first+640*4;
  assert.deepEqual(data.subarray(first,first+320),data.subarray(last,last+320));
  for(let f=0;f<9;f++)for(let x=0;x<80;x++)if(x===0||x===79||y===0||y===79)assert.equal(data[((row*80+y)*720+f*80+x)*4+3],0);
 }
});
