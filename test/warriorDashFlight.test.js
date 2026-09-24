import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';

function load(){
 const path=new URL('../warrior-dash-flight.js',import.meta.url);
 assert.ok(fs.existsSync(path),'dedicated leap / flight / landing module exists');
 let pending;
 const c=vm.createContext({Image:class{constructor(){pending=this;}},document:{createElement:()=>({getContext:()=>({drawImage(){}})})}});
 vm.runInContext(fs.readFileSync(path,'utf8'),c);
 return {api:c.WarriorDashFlight,pending:()=>pending};
}
test('dash atlas adds all eight directions without replacing attacks or locomotion',()=>{
 const {api,pending}=load();
 const base={width:1008,height:1024},fm={idle_s:[{}],atk1_s:[{}],run_s:[{}]};let result;
 api.apply(base,fm,(...args)=>result=args);
 Object.assign(pending(),{naturalWidth:384,naturalHeight:512});pending().onload();
 for(const dir of ['s','se','e','ne','n','nw','w','sw']){
  assert.equal(result[1]['dash_start_'+dir].length,2);
  assert.equal(result[1]['dash_fly_'+dir].length,2);
  assert.equal(result[1]['dash_land_'+dir].length,2);
 }
 for(const key of ['idle_s','atk1_s','run_s'])assert.equal(result[1][key],fm[key]);
 assert.equal(fm.dash_fly_s,undefined);
});
test('missing or malformed dash image retains the working base atlas',()=>{
 const {api,pending}=load(),base={},fm={};let result;
 api.apply(base,fm,(...args)=>result=args);pending().onerror();assert.equal(result[0],base);
 api.apply(base,fm,(...args)=>result=args);Object.assign(pending(),{naturalWidth:2,naturalHeight:2});pending().onload();assert.equal(result[0],base);
});
test('flight faces travel direction and landing pose yields immediately to movement or attacks',()=>{
 const {api}=load();
 assert.equal(api.direction(true,false,0,0,4,1,0,2),Math.PI/2);
 assert.equal(api.direction(false,true,0,0,4,1,0,2),0);
 assert.equal(api.direction(false,false,30,0,4,1,0,2),Math.PI/2);
 assert.equal(api.direction(false,false,0,0,0,0,0,2),2);
 assert.equal(api.landing(true,'idle',false),true);
 assert.equal(api.landing(true,'idle',true),false);
 assert.equal(api.landing(true,'wSwing',false),false);
});

test('packed flight poses are nonempty, distinct, transparent and cannot bleed across cells',async()=>{
 const {data,info}=await sharp(fileURLToPath(new URL('../img/exoduser_warrior/dash-flight-v1.png',import.meta.url))).raw().toBuffer({resolveWithObject:true});
 assert.deepEqual([info.width,info.height,info.channels],[384,512,4]);
 for(let row=0;row<8;row++){
  const cells=[];
  for(let col=0;col<6;col++){
   const bytes=[];let visible=0;
   for(let y=0;y<64;y++)for(let x=0;x<64;x++){
    const i=((row*64+y)*384+col*64+x)*4,a=data[i+3];
    if(x===0||x===63||y===0||y===63)assert.equal(a,0);
    if(a>128){visible++;assert.ok(!(data[i+1]>120&&data[i+1]>data[i]*1.35&&data[i+1]>data[i+2]*1.35),'no green key fringe');}
    bytes.push(...data.subarray(i,i+4));
   }
   assert.ok(visible>100);cells.push(Buffer.from(bytes));
  }
  assert.notDeepEqual(cells[0],cells[2]);assert.notDeepEqual(cells[2],cells[4]);
 }
});
